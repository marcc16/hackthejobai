"use client";

import React, { useState, useRef, useCallback } from 'react';

import { toast } from 'sonner';
import { Mic, Square, Loader2 } from 'lucide-react';

// Components
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Types
import { Message } from '@/types';

interface InterviewControlsProps {
  id: string;
  isCompleted: boolean;
  isInterviewStarted: boolean;
  setIsInterviewStarted: React.Dispatch<React.SetStateAction<boolean>>;
  timeRemaining: number;
  setTimeRemaining: React.Dispatch<React.SetStateAction<number>>;
  addTranscription: (text: string) => void;
  addChatMessage: (message: Message) => void;
  endInterview: () => Promise<void>;
  setIsTranscribing: React.Dispatch<React.SetStateAction<boolean>>;
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>;
  verifySubscription: () => boolean;
}

const InterviewControls: React.FC<InterviewControlsProps> = ({
  id,
  isCompleted,
  isInterviewStarted,
  setIsInterviewStarted,
  timeRemaining,
  addTranscription,
  addChatMessage,
  endInterview,
  setIsTranscribing,
  setIsGenerating,
  verifySubscription
}) => {
  // State
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Handlers
  const startInterview = useCallback(() => {
    if (isCompleted) {
      toast.error('Esta entrevista ya ha sido completada');
      return;
    }

    if (!verifySubscription()) {
      return;
    }

    setIsInterviewStarted(true);
    setIsDialogOpen(false);
    toast.success('Entrevista iniciada');
  }, [isCompleted, verifySubscription, setIsInterviewStarted]);

  const confirmEndInterview = useCallback(() => {
    setIsDialogOpen(false);
    endInterview();
  }, [endInterview]);

  const startRecording = useCallback(async () => {
    setIsRecording(true);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorderRef.current.start();
      toast.success('Grabación iniciada');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Error al iniciar la grabación');
      setIsRecording(false);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current) {
      toast.error('No hay grabación activa');
      return;
    }

    setIsRecording(false);
    setIsProcessing(true);
    setIsTranscribing(true);

    mediaRecorderRef.current.stop();
    mediaRecorderRef.current.onstop = async () => {
      try {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');

        // Transcribe audio
        const transcribeResponse = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData,
        });

        if (!transcribeResponse.ok) {
          throw new Error('Error en la transcripción');
        }

        const transcribeData = await transcribeResponse.json();
        console.log('Transcripción:', transcribeData.text);

        setIsTranscribing(false);
        setIsGenerating(true);
        addTranscription(transcribeData.text);

        // Process with AI
        const processResponse = await fetch('/api/processMessage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: transcribeData.text, docId: id }),
        });

        if (!processResponse.ok) {
          throw new Error('Error en el procesamiento de IA');
        }

        const processData = await processResponse.json();

        if (!isCompleted) {
          addChatMessage({
            id: Date.now().toString(),
            message: processData.reply,
            createdAt: new Date(),
            role: 'ai'
          });
        }

        toast.success('Grabación procesada correctamente');
      } catch (error) {
        console.error('Error processing recording:', error);
        toast.error(error instanceof Error ? error.message : 'Error al procesar la grabación');
      } finally {
        setIsProcessing(false);
        setIsTranscribing(false);
        setIsGenerating(false);
        
        // Cleanup media stream
        mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [id, isCompleted, addTranscription, addChatMessage, setIsTranscribing, setIsGenerating]);

  // Utility functions
  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  const getTimerColor = useCallback((timeRemaining: number) => {
    if (timeRemaining > 5 * 60) return 'text-green-600';
    if (timeRemaining > 60) return 'text-orange-500';
    return 'text-red-500';
  }, []);

  return (
    <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10 flex items-center space-x-4">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            disabled={isCompleted}
            variant={isInterviewStarted ? "destructive" : "default"}
          >
            {isInterviewStarted ? "Finalizar Entrevista" : "Iniciar Entrevista"}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isInterviewStarted ? "Finalizar Entrevista" : "Iniciar Entrevista"}
            </DialogTitle>
            <DialogDescription>
              {isInterviewStarted 
                ? "¿Estás seguro de que quieres finalizar la entrevista? Esta acción no se puede deshacer."
                : timeRemaining < 20 * 60
                  ? "¿Quieres reanudar la entrevista? Se utilizará el tiempo restante."
                  : "¿Estás listo para comenzar la entrevista? El contador de 20 minutos comenzará."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={isInterviewStarted ? confirmEndInterview : startInterview}
            >
              {isInterviewStarted ? "Finalizar" : "Comenzar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {isInterviewStarted && (
        <div className={`font-bold ${getTimerColor(timeRemaining)}`}>
          {formatTime(timeRemaining)}
        </div>
      )}

      <Button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing || !isInterviewStarted || isCompleted}
        variant="outline"
        size="icon"
        className="ml-auto"
        title={isRecording ? "Detener grabación" : "Iniciar grabación"}
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isRecording ? (
          <Square className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

export default InterviewControls;