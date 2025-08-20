import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

interface RealtimeVoiceInterfaceProps {
  sessionId?: string;
  childId: string;
  bookId?: string;
  onSpeakingChange: (speaking: boolean) => void;
  onTranscriptUpdate: (transcript: string) => void;
}

export class AudioRecorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  constructor(private onAudioData: (audioData: Float32Array) => void) {}

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      this.audioContext = new AudioContext({
        sampleRate: 24000,
      });
      
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        this.onAudioData(new Float32Array(inputData));
      };
      
      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }

  stop() {
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export class AudioQueue {
  private queue: Uint8Array[] = [];
  private isPlaying = false;

  constructor(private audioContext: AudioContext) {}

  async addToQueue(audioData: Uint8Array) {
    this.queue.push(audioData);
    if (!this.isPlaying) {
      await this.playNext();
    }
  }

  private async playNext() {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    const audioData = this.queue.shift()!;

    try {
      const wavData = this.createWavFromPCM(audioData);
      const audioBuffer = await this.audioContext.decodeAudioData(wavData.buffer);
      
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      
      source.onended = () => this.playNext();
      source.start(0);
    } catch (error) {
      console.error('Error playing audio:', error);
      this.playNext();
    }
  }

  private createWavFromPCM(pcmData: Uint8Array): Uint8Array {
    const int16Data = new Int16Array(pcmData.length / 2);
    for (let i = 0; i < pcmData.length; i += 2) {
      int16Data[i / 2] = (pcmData[i + 1] << 8) | pcmData[i];
    }
    
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);
    
    const writeString = (view: DataView, offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    const sampleRate = 24000;
    const numChannels = 1;
    const bitsPerSample = 16;
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const byteRate = sampleRate * blockAlign;

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + int16Data.byteLength, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(view, 36, 'data');
    view.setUint32(40, int16Data.byteLength, true);

    const wavArray = new Uint8Array(wavHeader.byteLength + int16Data.byteLength);
    wavArray.set(new Uint8Array(wavHeader), 0);
    wavArray.set(new Uint8Array(int16Data.buffer), wavHeader.byteLength);
    
    return wavArray;
  }
}

const encodeAudioForAPI = (float32Array: Float32Array): string => {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  
  const uint8Array = new Uint8Array(int16Array.buffer);
  let binary = '';
  const chunkSize = 0x8000;
  
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  
  return btoa(binary);
};

const RealtimeVoiceInterface: React.FC<RealtimeVoiceInterfaceProps> = ({
  sessionId,
  childId,
  bookId,
  onSpeakingChange,
  onTranscriptUpdate
}) => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioQueueRef = useRef<AudioQueue | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const initializeAudio = async () => {
    try {
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      audioQueueRef.current = new AudioQueue(audioContextRef.current);
      
      recorderRef.current = new AudioRecorder((audioData) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: encodeAudioForAPI(audioData)
          }));
        }
      });
      
      console.log('Audio system initialized');
    } catch (error) {
      console.error('Error initializing audio:', error);
      toast({
        title: "Audio Error",
        description: "Failed to initialize audio system",
        variant: "destructive",
      });
    }
  };

  const startConversation = async () => {
    try {
      await initializeAudio();
      
      // Connect to our Nova realtime chat WebSocket
      const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host.replace(/:[0-9]+/, '')}.functions.supabase.co/functions/v1/nova-realtime-chat`;
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('Connected to Nova realtime chat');
        setIsConnected(true);
        
        // Initialize session
        wsRef.current?.send(JSON.stringify({
          type: 'init_session',
          sessionId: sessionId,
          childId: childId,
          bookId: bookId
        }));
        
        toast({
          title: "Connected",
          description: "Nova is ready to help with your reading!",
        });
      };

      wsRef.current.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received message:', data.type);
          
          if (data.type === 'session_initialized') {
            console.log('Session initialized, starting audio recording');
            await recorderRef.current?.start();
            setIsListening(true);
          } else if (data.type === 'response.audio.delta') {
            // Play audio
            const binaryString = atob(data.delta);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            await audioQueueRef.current?.addToQueue(bytes);
            setIsSpeaking(true);
            onSpeakingChange(true);
          } else if (data.type === 'response.audio.done') {
            setIsSpeaking(false);
            onSpeakingChange(false);
          } else if (data.type === 'response.audio_transcript.delta') {
            const newTranscript = transcript + (data.delta || '');
            setTranscript(newTranscript);
            onTranscriptUpdate(newTranscript);
          } else if (data.type === 'conversation.item.input_audio_transcription.completed') {
            console.log('User said:', data.transcript);
          } else if (data.type === 'error') {
            throw new Error(data.message);
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to Nova",
          variant: "destructive",
        });
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket closed');
        setIsConnected(false);
        setIsListening(false);
        setIsSpeaking(false);
      };
      
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to start conversation',
        variant: "destructive",
      });
    }
  };

  const endConversation = () => {
    recorderRef.current?.stop();
    wsRef.current?.close();
    audioContextRef.current?.close();
    
    setIsConnected(false);
    setIsListening(false);
    setIsSpeaking(false);
    setTranscript('');
    onSpeakingChange(false);
    onTranscriptUpdate('');
  };

  useEffect(() => {
    return () => {
      endConversation();
    };
  }, []);

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Volume2 className="h-4 w-4" />
          Nova Voice Coach
        </h3>
        
        {isConnected && (
          <div className="flex items-center gap-2 text-sm">
            {isListening && (
              <div className="flex items-center gap-1 text-green-600">
                <Mic className="h-3 w-3" />
                <span>Listening</span>
              </div>
            )}
            {isSpeaking && (
              <div className="flex items-center gap-1 text-blue-600">
                <Volume2 className="h-3 w-3 animate-pulse" />
                <span>Speaking</span>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="flex justify-center">
        {!isConnected ? (
          <Button 
            onClick={startConversation}
            className="bg-primary hover:bg-primary/90"
          >
            <Mic className="h-4 w-4 mr-2" />
            Start Voice Chat
          </Button>
        ) : (
          <Button 
            onClick={endConversation}
            variant="secondary"
          >
            <MicOff className="h-4 w-4 mr-2" />
            End Voice Chat
          </Button>
        )}
      </div>
      
      {transcript && (
        <div className="p-3 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Nova says:</h4>
          <p className="text-sm">{transcript}</p>
        </div>
      )}
      
      <div className="text-xs text-muted-foreground text-center">
        Nova can help explain words, answer questions about the story, and award reading points!
      </div>
    </Card>
  );
};

export default RealtimeVoiceInterface;