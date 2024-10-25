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
import { useInterview } from './Interview-context';

interface InterviewPageProps {
  id: string;
  isCompleted: boolean;
}

const InterviewPage: React.FC<InterviewPageProps> = ({ id, isCompleted: initialIsCompleted }) => {
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(initialIsCompleted);
  const [timeRemaining, setTimeRemaining] = useState(20 * 60);
  const [transcriptions, setTranscriptions] = useState<Message[]>([]);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();
  const { userId } = useAuth();
  const { setIsInterviewActive } = useInterview();

  useEffect(() => {
    setIsInterviewActive(isInterviewStarted && !isCompleted);
    return () => setIsInterviewActive(false);
  }, [isInterviewStarted, isCompleted, setIsInterviewActive]);

  const addTranscription = (text: string) => {
    setTranscriptions(prev => [...prev, {
      id: Date.now().toString(),
      message: text,
      createdAt: new Date(),
      role: 'interviewer'
    }]);
  };

  const addChatMessage = (message: Message) => {
    setChatMessages(prev => [...prev, {
      ...message,
      id: Date.now().toString(),
      createdAt: new Date()
    }]);
  };

  const endInterview = useCallback(async () => {
    setIsInterviewStarted(false);
    setIsCompleted(true);
    setIsInterviewActive(false);
    
    if (userId) {
      const interviewRef = doc(db, 'users', userId, 'files', id);
      await updateDoc(interviewRef, { 
        isCompleted: true,
        timeRemaining: 0,
        lastUpdated: serverTimestamp()
      });

      const chatCollection = collection(db, 'users', userId, 'files', id, 'chat');
      
      // Guardar transcripciones
      for (const transcription of transcriptions) {
        await addDoc(chatCollection, {
          ...transcription,
          createdAt: serverTimestamp()
        });
      }

      // Guardar mensajes del chat
      for (const message of chatMessages) {
        await addDoc(chatCollection, {
          ...message,
          createdAt: serverTimestamp()
        });
      }
    }
    router.push('/dashboard');
  }, [userId, id, router, transcriptions, chatMessages, setIsInterviewActive]);

  useEffect(() => {
    if (!userId) return;

    const interviewRef = doc(db, 'users', userId, 'files', id);
    const unsubscribe = onSnapshot(interviewRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setIsCompleted(data.isCompleted || false);
        if (data.timeRemaining !== undefined) {
          setTimeRemaining(data.timeRemaining);
        }
      }
    });

    return () => {
      unsubscribe();
      setIsInterviewActive(false);
    };
  }, [userId, id, setIsInterviewActive]);

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

  // Actualizar el tiempo restante en Firebase periódicamente
  useEffect(() => {
    if (!userId || !isInterviewStarted || isCompleted) return;

    const updateTimeRemaining = async () => {
      const interviewRef = doc(db, 'users', userId, 'files', id);
      await updateDoc(interviewRef, { 
        timeRemaining,
        lastUpdated: serverTimestamp()
      });
    };

    const interval = setInterval(updateTimeRemaining, 30000); // Actualizar cada 30 segundos

    return () => clearInterval(interval);
  }, [userId, id, timeRemaining, isInterviewStarted, isCompleted]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {!isCompleted && (
        <div className="sticky top-0 z-10 bg-white shadow-md">
          <InterviewControls
            id={id}
            isCompleted={isCompleted}
            isInterviewStarted={isInterviewStarted}
            setIsInterviewStarted={setIsInterviewStarted}
            timeRemaining={timeRemaining}
            setTimeRemaining={setTimeRemaining}
            addTranscription={addTranscription}
            addChatMessage={addChatMessage}
            endInterview={endInterview}
            setIsTranscribing={setIsTranscribing}
            setIsGenerating={setIsGenerating}
          />
        </div>
      )}
      <div className="flex flex-col md:flex-row flex-1 gap-4 overflow-hidden p-4">
        <div className="md:w-1/3 flex-shrink-0 md:order-1 order-2 md:h-full h-[35vh]">
          <VoiceRecorderView
            id={id}
            isInterviewStarted={isInterviewStarted}
            transcriptions={transcriptions}
            isCompleted={isCompleted}
            isTranscribing={isTranscribing}
          />
        </div>
        <div className="md:w-2/3 flex-shrink-0 md:order-2 order-1 md:h-full h-[65vh] md:pr-4"> {/* Añadido md:pr-4 */}
          <ChatView 
            id={id} 
            isCompleted={isCompleted} 
            isGenerating={isGenerating}
            messages={chatMessages}
            addMessage={addChatMessage}
          />
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;