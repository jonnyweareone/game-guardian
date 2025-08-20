import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { AudioRecorder, encodeAudioForAPI } from '@/utils/AudioRecorder';
import { playAudioData, clearAudioQueue } from '@/utils/AudioPlayer';

interface VoiceInterfaceProps {
  onSpeakingChange: (speaking: boolean) => void;
  onTranscriptUpdate: (transcript: string) => void;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ 
  onSpeakingChange, 
  onTranscriptUpdate 
}) => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [transcript, setTranscript] = useState('');
  
  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const initializeAudio = async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Initialize audio context
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      
      console.log('Audio initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing audio:', error);
      toast({
        title: "Audio Access Required",
        description: "Please allow microphone access to use voice features",
        variant: "destructive",
      });
      return false;
    }
  };

  const startConversation = async () => {
    try {
      // Initialize audio first
      const audioReady = await initializeAudio();
      if (!audioReady) return;

      // Connect to WebSocket
      const wsUrl = `wss://xzxjwuzwltoapifcyzww.functions.supabase.co/realtime-chat`;
      console.log('Connecting to:', wsUrl);
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        toast({
          title: "Voice Assistant Ready",
          description: "You can now speak with Nova!",
        });
      };

      wsRef.current.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received message type:', data.type);

          if (data.type === 'response.audio.delta' && audioEnabled) {
            // Play audio response
            const binaryString = atob(data.delta);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            
            if (audioContextRef.current) {
              await playAudioData(audioContextRef.current, bytes);
            }
          } else if (data.type === 'response.audio_transcript.delta') {
            // Update transcript
            setTranscript(prev => prev + data.delta);
            onTranscriptUpdate(transcript + data.delta);
          } else if (data.type === 'response.audio.done') {
            onSpeakingChange(false);
            console.log('AI finished speaking');
          } else if (data.type === 'response.created') {
            onSpeakingChange(true);
            console.log('AI started responding');
          } else if (data.type === 'input_audio_buffer.speech_started') {
            console.log('User started speaking');
          } else if (data.type === 'input_audio_buffer.speech_stopped') {
            console.log('User stopped speaking');
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to voice assistant",
          variant: "destructive",
        });
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket closed');
        setIsConnected(false);
        setIsRecording(false);
        onSpeakingChange(false);
      };

      // Start recording
      await startRecording();

    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to start conversation',
        variant: "destructive",
      });
    }
  };

  const startRecording = async () => {
    if (!audioContextRef.current || !wsRef.current) return;

    try {
      recorderRef.current = new AudioRecorder((audioData) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const encodedAudio = encodeAudioForAPI(audioData);
          wsRef.current.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: encodedAudio
          }));
        }
      });

      await recorderRef.current.start();
      setIsRecording(true);
      console.log('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const endConversation = () => {
    console.log('Ending conversation');
    
    if (recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    clearAudioQueue();
    setIsConnected(false);
    setIsRecording(false);
    setTranscript('');
    onSpeakingChange(false);
    onTranscriptUpdate('');
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    if (!audioEnabled) {
      clearAudioQueue();
    }
  };

  useEffect(() => {
    return () => {
      endConversation();
    };
  }, []);

  return (
    <Card className="p-4 bg-background/95 backdrop-blur-sm border-primary/20">
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full animate-pulse bg-primary"></div>
          <span className="text-sm font-medium">Nova Voice Assistant</span>
        </div>

        {transcript && (
          <div className="text-xs text-muted-foreground bg-muted p-2 rounded max-w-sm text-center">
            {transcript}
          </div>
        )}

        <div className="flex items-center space-x-2">
          {!isConnected ? (
            <Button 
              onClick={startConversation}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              size="sm"
            >
              <Mic className="w-4 h-4 mr-2" />
              Start Voice Chat
            </Button>
          ) : (
            <>
              <Button 
                onClick={endConversation}
                variant="outline"
                size="sm"
              >
                <MicOff className="w-4 h-4 mr-2" />
                End Chat
              </Button>
              
              <Button 
                onClick={toggleAudio}
                variant="ghost"
                size="sm"
                className={audioEnabled ? '' : 'text-muted-foreground'}
              >
                {audioEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </Button>
            </>
          )}
        </div>

        {isConnected && (
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            {isRecording && (
              <>
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span>Listening...</span>
              </>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default VoiceInterface;