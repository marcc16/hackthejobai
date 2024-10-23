"use client";

import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Mic, Square, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { useUser } from '@clerk/nextjs';

interface InterviewControlsProps {
  id: string;
  isCompleted: boolean;
  isInterviewStarted: boolean;
  setIsInterviewStarted: React.Dispatch<React.SetStateAction<boolean>>;
  timeRemaining: number;
  setTimeRemaining: React.Dispatch<React.SetStateAction<number>>;
  setTranscription: React.Dispatch<React.SetStateAction<string | null>>;
  endInterview: () => Promise<void>;
}

const InterviewControls: React.FC<InterviewControlsProps> = ({
  id,
  isCompleted,
  isInterviewStarted,
  setIsInterviewStarted,
  timeRemaining,
  setTranscription,
  endInterview
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { user } = useUser();

  const startInterview = () => {
    if (isCompleted) {
      toast.error('This interview has already been completed');
      return;
    }
    setIsInterviewStarted(true);
    setIsDialogOpen(false);
    toast.success('Interview started');
  };

  const confirmEndInterview = () => {
    setIsDialogOpen(false);
    endInterview();
  };

  const startRecording = async () => {
    setIsRecording(true);
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.start();
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current || !user?.id) return;
  
    setIsRecording(false);
    setIsProcessing(true);
  
    mediaRecorderRef.current.stop();
    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      try {
        const transcribeResponse = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData,
        });

        if (!transcribeResponse.ok) {
          const errorData = await transcribeResponse.json();
          throw new Error(errorData.error || 'Transcription failed');
        }
        
        const transcribeData = await transcribeResponse.json();
        setTranscription(transcribeData.text);

        // Guardar la transcripción del usuario en Firestore
        await addDoc(collection(db, 'users', user.id, 'files', id, 'chat'), {
          message: transcribeData.text,
          createdAt: serverTimestamp(),
          role: 'user'
        });

        const processResponse = await fetch('/api/processMessage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: transcribeData.text, docId: id }),
        });

        if (!processResponse.ok) {
          const errorData = await processResponse.json();
          throw new Error(errorData.error || 'AI processing failed');
        }
        
        const processData = await processResponse.json();

        // Guardar la respuesta de la IA en Firestore
        

        console.log('Transcription:', transcribeData.text);
        console.log('AI Response:', processData.reply);
        toast.success('Recording processed successfully');
      } catch (error) {
        console.error('Error processing recording:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to process recording');
      } finally {
        setIsProcessing(false);
      }
    };
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeRemaining > 5 * 60) return 'text-green-600';
    if (timeRemaining > 60) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10 flex items-center space-x-4">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            disabled={isCompleted}
            variant={isInterviewStarted ? "destructive" : "default"}
          >
            {isInterviewStarted ? "End Interview" : "Start Interview"}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isInterviewStarted ? "End Interview" : "Start Interview"}</DialogTitle>
            <DialogDescription>
              {isInterviewStarted 
                ? "Are you sure you want to end the interview? This action cannot be undone."
                : "Are you ready to start the interview? The 20-minute countdown will begin."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={isInterviewStarted ? confirmEndInterview : startInterview}>
              {isInterviewStarted ? "End Interview" : "Start Interview"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {isInterviewStarted && (
        <div className={`font-bold ${getTimerColor()}`}>
          {formatTime(timeRemaining)}
        </div>
      )}
      <Button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing || !isInterviewStarted || isCompleted}
        variant="outline"
        size="icon"
        className="ml-auto"
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