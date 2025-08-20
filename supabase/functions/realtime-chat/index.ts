import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Realtime chat function called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { 
      status: 400,
      headers: corsHeaders 
    });
  }

  try {
    const { socket, response } = Deno.upgradeWebSocket(req);
    
    console.log('WebSocket connection established');
    
    // Connect to OpenAI Realtime API
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY not found');
      socket.close(1008, 'API key not configured');
      return response;
    }

    const openAISocket = new WebSocket("wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01", {
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "OpenAI-Beta": "realtime=v1"
      }
    });

    let sessionCreated = false;

    // Handle OpenAI connection
    openAISocket.onopen = () => {
      console.log('Connected to OpenAI Realtime API');
    };

    openAISocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('OpenAI message type:', data.type);

        // Send session update after session is created
        if (data.type === 'session.created' && !sessionCreated) {
          sessionCreated = true;
          console.log('Session created, sending session update');
          
          const sessionUpdate = {
            type: "session.update",
            session: {
              modalities: ["text", "audio"],
              instructions: `You are Nova, an AI reading coach helping children understand and enjoy books. You are currently helping a child read a book. Be encouraging, patient, and explain difficult words or concepts in simple terms. Keep responses conversational and age-appropriate.`,
              voice: "alloy",
              input_audio_format: "pcm16",
              output_audio_format: "pcm16",
              input_audio_transcription: {
                model: "whisper-1"
              },
              turn_detection: {
                type: "server_vad",
                threshold: 0.5,
                prefix_padding_ms: 300,
                silence_duration_ms: 1000
              },
              tools: [
                {
                  type: "function",
                  name: "explain_word",
                  description: "Explain a difficult word from the book in simple terms",
                  parameters: {
                    type: "object",
                    properties: {
                      word: { type: "string" },
                      context: { type: "string" }
                    },
                    required: ["word"]
                  }
                }
              ],
              tool_choice: "auto",
              temperature: 0.8,
              max_response_output_tokens: "inf"
            }
          };
          
          openAISocket.send(JSON.stringify(sessionUpdate));
        }

        // Forward all messages to client
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(event.data);
        }
      } catch (error) {
        console.error('Error processing OpenAI message:', error);
      }
    };

    openAISocket.onerror = (error) => {
      console.error('OpenAI WebSocket error:', error);
      if (socket.readyState === WebSocket.OPEN) {
        socket.close(1011, 'OpenAI connection error');
      }
    };

    openAISocket.onclose = (event) => {
      console.log('OpenAI WebSocket closed:', event.code, event.reason);
      if (socket.readyState === WebSocket.OPEN) {
        socket.close(event.code, event.reason);
      }
    };

    // Handle client messages
    socket.onmessage = (event) => {
      try {
        console.log('Client message received');
        if (openAISocket.readyState === WebSocket.OPEN) {
          openAISocket.send(event.data);
        }
      } catch (error) {
        console.error('Error forwarding client message:', error);
      }
    };

    socket.onclose = () => {
      console.log('Client WebSocket closed');
      if (openAISocket.readyState === WebSocket.OPEN) {
        openAISocket.close();
      }
    };

    socket.onerror = (error) => {
      console.error('Client WebSocket error:', error);
      if (openAISocket.readyState === WebSocket.OPEN) {
        openAISocket.close();
      }
    };

    return response;
    
  } catch (error) {
    console.error('Error in realtime-chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});