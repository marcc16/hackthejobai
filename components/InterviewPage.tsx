/* eslint-disable prefer-const */
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  doc, 
  updateDoc, 
  onSnapshot, 
  collection, 
  addDoc, 
  serverTimestamp, 
  increment,
  writeBatch 
} from 'firebase/firestore';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';

// Components
import VoiceRecorderView from './VoiceRecorderView';
import ChatView from './ChatView';
import InterviewControls from './InterviewControls';

// Context & Hooks
import { useInterview } from './Interview-context';
import useSubscription from '@/hooks/useSuscription';

// Firebase
import { db } from '@/firebase';

// Types
import { Message } from '@/types';

// Constants
const INTERVIEW_DURATION = 20 * 60; // 20 minutes in seconds
const FIREBASE_UPDATE_INTERVAL = 30000; // 30 seconds
const MIN_TIME_WARNING = 5 * 60; // 5 minutes warning
const CRITICAL_TIME_WARNING = 60; // 1 minute warning

interface InterviewPageProps {
  id: string;
  isCompleted: boolean;
}

const InterviewPage: React.FC<InterviewPageProps> = ({ id, isCompleted: initialIsCompleted }) => {
  // State
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(initialIsCompleted);
  const [timeRemaining, setTimeRemaining] = useState(INTERVIEW_DURATION);
  const [transcriptions, setTranscriptions] = useState<Message[]>([]);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Hooks
  const router = useRouter();
  const { userId } = useAuth();
  const { setIsInterviewActive } = useInterview();
  const subscription = useSubscription();

  // Handlers
  const addTranscription = useCallback((text: string) => {
    setTranscriptions(prev => [...prev, {
      id: Date.now().toString(),
      message: text,
      createdAt: new Date(),
      role: 'interviewer'
    }]);
  }, []);

  const addChatMessage = useCallback((message: Message) => {
    setChatMessages(prev => [...prev, {
      ...message,
      id: Date.now().toString(),
      createdAt: new Date()
    }]);
  }, []);

  const endInterview = useCallback(async () => {
    if (!userId) {
      toast.error('Error: Usuario no autenticado');
      return;
    }

    try {
      setIsInterviewStarted(false);
      setIsCompleted(true);
      setIsInterviewActive(false);

      // Batch updates for better consistency
      const batch = writeBatch(db);
      const userRef = doc(db, 'users', userId);
      const interviewRef = doc(db, 'users', userId, 'files', id);
      const chatCollection = collection(db, 'users', userId, 'files', id, 'chat');

      // Update interview status
      batch.update(interviewRef, { 
        isCompleted: true,
        timeRemaining: 0,
        lastUpdated: serverTimestamp()
      });

      // Decrease available interviews and update total completed
      batch.update(userRef, {
        availableInterviews: increment(-1),
        totalCompletedInterviews: increment(1)
      });

      // Commit the batch
      await batch.commit();

      // Save chat history
      const savePromises = [
        ...transcriptions.map(transcription => 
          addDoc(chatCollection, {
            ...transcription,
            createdAt: serverTimestamp()
          })
        ),
        ...chatMessages.map(message => 
          addDoc(chatCollection, {
            ...message,
            createdAt: serverTimestamp()
          })
        )
      ];

      await Promise.all(savePromises);
      
      toast.success('Entrevista finalizada correctamente');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error ending interview:', error);
      toast.error('Error al finalizar la entrevista');
      // Revertir estados en caso de error
      setIsInterviewStarted(true);
      setIsCompleted(false);
      setIsInterviewActive(true);
    }
  }, [userId, id, router, transcriptions, chatMessages, setIsInterviewActive]);

  // Verify subscription
  const verifySubscription = useCallback(() => {
    if (!subscription || subscription.availableInterviews <= 0) {
      toast.error('No tienes entrevistas disponibles');
      router.push('/dashboard/upgrade');
      return false;
    }
    return true;
  }, [subscription, router]);

  // Effects
  useEffect(() => {
    setIsInterviewActive(isInterviewStarted && !isCompleted);
    return () => setIsInterviewActive(false);
  }, [isInterviewStarted, isCompleted, setIsInterviewActive]);

  // Firebase listeners
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

  // Timer logic
  useEffect(() => {
    if (!isInterviewStarted || timeRemaining <= 0) return;

    let timer: NodeJS.Timeout;
    timer = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          void endInterview();
          return 0;
        }

        // Time warnings
        if (prevTime === MIN_TIME_WARNING) {
          toast.warning('¡Quedan 5 minutos de entrevista!');
        } else if (prevTime === CRITICAL_TIME_WARNING) {
          toast.error('¡Último minuto de entrevista!');
        }

        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isInterviewStarted, timeRemaining, endInterview]);

  // Firebase time update
  useEffect(() => {
    if (!userId || !isInterviewStarted || isCompleted) return;

    const updateTimeRemaining = async () => {
      try {
        const interviewRef = doc(db, 'users', userId, 'files', id);
        await updateDoc(interviewRef, { 
          timeRemaining,
          lastUpdated: serverTimestamp()
        });
      } catch (error) {
        console.error('Error updating time:', error);
        toast.error('Error al actualizar el tiempo');
      }
    };

    const interval = setInterval(updateTimeRemaining, FIREBASE_UPDATE_INTERVAL);
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
            verifySubscription={verifySubscription}
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
        <div className="md:w-2/3 flex-shrink-0 md:order-2 order-1 md:h-full h-[65vh] md:pr-4">
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