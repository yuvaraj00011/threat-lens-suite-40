import { useState, useRef, useCallback } from 'react';
import { Mic, MicOff, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface VoiceInputProps {
  onTranscription: (text: string) => void;
  isListening: boolean;
  onToggleListening: () => void;
}

export function VoiceInput({ onTranscription, isListening, onToggleListening }: VoiceInputProps) {
  const { toast } = useToast();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        await processAudio(audioBlob);
        
        // Stop the stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      onToggleListening();
      
      toast({
        title: "Recording Started",
        description: "Speak clearly to report your case...",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  }, [onToggleListening, toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      onToggleListening();
      
      toast({
        title: "Recording Stopped",
        description: "Processing your voice report...",
      });
    }
  }, [onToggleListening, toast]);

  const processAudio = async (audioBlob: Blob) => {
    try {
      // Using Web Speech API for demonstration
      // In production, you'd use a more robust service like OpenAI Whisper
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onTranscription(transcript);
        
        toast({
          title: "Voice Report Processed",
          description: "Your report has been transcribed and analyzed.",
        });
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: "Transcription Error",
          description: "Could not process voice input. Please try typing instead.",
          variant: "destructive"
        });
      };

      // For demo purposes, we'll simulate transcription
      // In a real implementation, you'd send the audio to a transcription service
      setTimeout(() => {
        const simulatedTranscript = "Officer reporting a break-in at 123 Main Street. Suspect fled on foot, heading north. No injuries reported. Evidence includes broken window and disturbed items.";
        onTranscription(simulatedTranscript);
        
        toast({
          title: "Voice Report Processed",
          description: "Your report has been transcribed and analyzed.",
        });
      }, 2000);
      
    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        title: "Processing Error",
        description: "Could not process voice input.",
        variant: "destructive"
      });
    }
  };

  const handleToggle = () => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <Button
      onClick={handleToggle}
      variant={isListening ? "destructive" : "cyber"}
      size="icon"
      className={`${isListening ? 'animate-pulse shadow-red-500/50' : 'shadow-cyber'} transition-all duration-300`}
    >
      {isListening ? (
        <Square className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  );
}