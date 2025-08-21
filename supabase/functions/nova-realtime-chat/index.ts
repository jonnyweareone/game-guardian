import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  let openAISocket: WebSocket | null = null;
  let sessionActive = false;
  let currentChildId = '';
  let currentBookId = '';
  let currentSessionId = '';

  socket.onopen = () => {
    console.log("Nova realtime chat WebSocket opened");
  };

  socket.onmessage = async (event) => {
    try {
      const message = JSON.parse(event.data);
      console.log("Received message:", message.type);

      if (message.type === 'init_session') {
        currentChildId = message.childId;
        currentBookId = message.bookId;
        currentSessionId = message.sessionId;
        
        // Initialize OpenAI Realtime connection
        openAISocket = new WebSocket("wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01");
        
        openAISocket.onopen = () => {
          console.log("Connected to OpenAI Realtime API");
          sessionActive = true;
          
          // Send session configuration
          openAISocket?.send(JSON.stringify({
            type: "session.update",
            session: {
              modalities: ["text", "audio"],
              instructions: `You are Nova, a friendly AI reading coach for children. You help kids understand books, learn new words, and develop reading skills. You're patient, encouraging, and speak in a child-friendly way. The child is currently reading a book. Answer their questions about the story, explain difficult words, and provide gentle guidance to improve their reading comprehension.`,
              voice: "shimmer", // Child-friendly voice
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
                  description: "Explain a difficult word with definition, phonetics, and example",
                  parameters: {
                    type: "object",
                    properties: {
                      word: { type: "string" },
                      context: { type: "string" }
                    },
                    required: ["word"]
                  }
                },
                {
                  type: "function", 
                  name: "award_reading_points",
                  description: "Award points to the child for good reading progress",
                  parameters: {
                    type: "object",
                    properties: {
                      points: { type: "number" },
                      reason: { type: "string" }
                    },
                    required: ["points", "reason"]
                  }
                }
              ],
              tool_choice: "auto",
              temperature: 0.8,
              max_response_output_tokens: "inf"
            }
          }));
        };

        openAISocket.onmessage = async (openaiEvent) => {
          const data = JSON.parse(openaiEvent.data);
          
          // Handle function calls
          if (data.type === 'response.function_call_arguments.done') {
            const args = JSON.parse(data.arguments);
            
            if (data.name === 'explain_word') {
              // Store problem word in database
              await supabase.from('nova_problem_words').insert({
                session_id: currentSessionId,
                child_id: currentChildId,
                book_id: currentBookId,
                word: args.word,
                context: args.context || '',
                difficulty_level: 2,
                created_at: new Date().toISOString()
              });
            } else if (data.name === 'award_reading_points') {
              // Award coins to child
              await supabase.rpc('award_coins', {
                p_child: currentChildId,
                p_delta: args.points
              });
              
              // Log the achievement
              await supabase.from('nova_insights').insert({
                session_id: currentSessionId,
                child_id: currentChildId,
                book_id: currentBookId,
                scope: 'session',
                ai_summary: `Earned ${args.points} coins: ${args.reason}`,
                key_points: [args.reason],
                comprehension_questions: [],
                difficulty_level: 'easy',
                created_at: new Date().toISOString()
              });
            }
          }
          
          // Forward all OpenAI messages to client
          socket.send(JSON.stringify(data));
        };

        openAISocket.onerror = (error) => {
          console.error("OpenAI WebSocket error:", error);
          socket.send(JSON.stringify({ type: 'error', message: 'Connection to AI failed' }));
        };

        openAISocket.onclose = () => {
          console.log("OpenAI WebSocket closed");
          sessionActive = false;
        };

        socket.send(JSON.stringify({ type: 'session_initialized' }));
      } else if (sessionActive && openAISocket) {
        // Forward client messages to OpenAI
        openAISocket.send(event.data);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      socket.send(JSON.stringify({ type: 'error', message: error.message }));
    }
  };

  socket.onclose = () => {
    console.log("Client WebSocket closed");
    openAISocket?.close();
    sessionActive = false;
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
    openAISocket?.close();
    sessionActive = false;
  };

  return response;
});