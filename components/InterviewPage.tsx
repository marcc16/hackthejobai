"use client";

import React, { useState, useEffect, useCallback } from 'react';
import VoiceRecorderView from './VoiceRecorderView';
import ChatView from './ChatView';
import InterviewControls from './InterviewControls';
import { useRouter } from 'next/navigation';
import { doc, updateDoc, onSnapshot, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@clerk/nextjs';
import { Message } from '@/types';

interface InterviewPageProps {
  id: string;
  isCompleted: boolean;
}

const InterviewPage: React.FC<InterviewPageProps> = ({ id, isCompleted: initialIsCompleted }) => {
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(initialIsCompleted);
  const [timeRemaining, setTimeRemaining] = useState(20 * 60);
  const [transcriptions, setTranscriptions] = useState<Message[]>([]);
  const router = useRouter();
  const { userId } = useAuth();

  const addTranscription = (text: string) => {
    setTranscriptions(prev => [...prev, {
      id: Date.now().toString(),
      message: text,
      createdAt: new Date(),
      role: 'interviewer'
    }]);
  };

  const endInterview = useCallback(async () => {
    setIsInterviewStarted(false);
    setIsCompleted(true);
    if (userId) {
      const interviewRef = doc(db, 'users', userId, 'files', id);
      await updateDoc(interviewRef, { isCompleted: true });

      // Guardar todas las transcripciones en Firebase
      const chatCollection = collection(db, 'users', userId, 'files', id, 'chat');
      for (const transcription of transcriptions) {
        await addDoc(chatCollection, {
          ...transcription,
          createdAt: serverTimestamp()
        });
      }
    }
    router.push('/dashboard');
  }, [userId, id, router, transcriptions]);

  useEffect(() => {
    if (!userId) return;

    const interviewRef = doc(db, 'users', userId, 'files', id);
    const unsubscribe = onSnapshot(interviewRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setIsCompleted(data.isCompleted || false);
      }
    });

    return () => unsubscribe();
  }, [userId, id]);

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
        addTranscription={addTranscription}
        endInterview={endInterview}
      />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/3 border-r border-gray-200">
          <VoiceRecorderView
            id={id}
            isInterviewStarted={isInterviewStarted}
            transcriptions={transcriptions}
            isCompleted={isCompleted}
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