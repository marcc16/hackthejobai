"use client";

import React, { useState, useEffect, useCallback } from 'react';
import VoiceRecorderView from './VoiceRecorderView';
import ChatView from './ChatView';
import InterviewControls from './InterviewControls';
import { useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@clerk/nextjs';

interface InterviewPageProps {
  id: string;
  isCompleted: boolean;
}

const InterviewPage: React.FC<InterviewPageProps> = ({ id, isCompleted: initialIsCompleted }) => {
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(initialIsCompleted);
  const [timeRemaining, setTimeRemaining] = useState(20 * 60);
  const [transcription, setTranscription] = useState<string | null>(null);
  const router = useRouter();
  const { userId } = useAuth();

  const endInterview = useCallback(async () => {
    setIsInterviewStarted(false);
    setIsCompleted(true);
    if (userId) {
      const interviewRef = doc(db, 'users', userId, 'files', id);
      await updateDoc(interviewRef, { isCompleted: true });
    }
    router.push('/dashboard');
  }, [userId, id, router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isInterviewStarted && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            endInterview();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (timeRemaining === 0 && isInterviewStarted) {
      endInterview();
    }
    return () => clearInterval(timer);
  }, [isInterviewStarted, timeRemaining, endInterview]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <InterviewControls
        id={id}
        isCompleted={isCompleted}
        isInterviewStarted={isInterviewStarted}
        setIsInterviewStarted={setIsInterviewStarted}
        timeRemaining={timeRemaining}
        setTimeRemaining={setTimeRemaining}
        setTranscription={setTranscription}
        endInterview={endInterview}
      />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/3 border-r border-gray-200">
          <VoiceRecorderView
            id={id}
            isInterviewStarted={isInterviewStarted}
            transcription={transcription}
          />
        </div>
        <div className="w-2/3">
          <ChatView id={id} />
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;