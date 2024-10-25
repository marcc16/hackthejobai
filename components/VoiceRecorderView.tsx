import React, { useState, useEffect, useRef } from 'react';
import { Badge } from "@/components/ui/badge";
import { Sun, User } from "lucide-react";
import { Message } from '@/types';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';
import { useUser } from '@clerk/nextjs';
import { useMessageScroll } from '@/hooks/useMessageScroll';
import { useInterview } from './Interview-context';

interface VoiceRecorderViewProps {
  id: string;
  isInterviewStarted: boolean;
  transcriptions: Message[];
  isCompleted: boolean;
  isTranscribing: boolean;
}

const VoiceRecorderView: React.FC<VoiceRecorderViewProps> = ({ 
  id, 
  isInterviewStarted, 
  transcriptions, 
  isCompleted,
  isTranscribing
}) => {
  const [storedTranscriptions, setStoredTranscriptions] = useState<Message[]>([]);
  const { user } = useUser();
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const { isInterviewActive } = useInterview();

  useEffect(() => {
    if (isCompleted && user?.id) {
      const q = query(
        collection(db, 'users', user.id, 'files', id, 'chat'),
        orderBy('createdAt', 'asc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newTranscriptions = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          } as Message))
          .filter(msg => msg.role === 'interviewer');

        setStoredTranscriptions(newTranscriptions);
      });

      return () => unsubscribe();
    }
  }, [isCompleted, user?.id, id]);

  const displayTranscriptions = isCompleted ? storedTranscriptions : transcriptions;

  useMessageScroll({
    messages: displayTranscriptions,
    isInterviewActive,
    messagesContainerRef: containerRef,
    lastMessageRef,
    isCompleted
  });

  function formatMessage(text: string) {
    const paragraphs = text.split('\n').filter(p => p.trim() !== '');
    return paragraphs.map((paragraph, index) => {
      if (paragraph.startsWith('- ')) {
        return <li key={index} className="ml-4">{paragraph.slice(2)}</li>;
      } else if (paragraph.startsWith('#')) {
        const level = paragraph.match(/^#+/)?.[0].length || 0;
        const HeaderTag = `h${Math.min(level + 1, 6)}` as keyof JSX.IntrinsicElements;
        return <HeaderTag key={index} className="font-bold mt-2 mb-1">{paragraph.slice(level + 1)}</HeaderTag>;
      } else {
        return <p key={index} className="mb-2">{paragraph}</p>;
      }
    });
  }

  return (
    <div className="h-full flex flex-col bg-blue-50 rounded-lg">
      <div className="md:flex items-center p-4 hidden">
        <div className="flex h-12 w-12 mr-3 bg-blue-100 rounded-full items-center justify-center flex-shrink-0">
          <User className="h-6 w-6 text-blue-500" />
        </div>
        <div className="flex flex-col justify-center h-12">
          <h2 className="font-semibold text-lg leading-none">Entrevistador</h2>
          <Badge 
            variant="outline" 
            className={`text-blue-500 bg-blue-100 border-blue-200 ${isTranscribing ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200 mt-1`}
          >
            <Sun className="w-3 h-3 mr-1" />
            Transcribing
          </Badge>
        </div>
      </div>
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4"
      >
        {displayTranscriptions.length === 0 ? (
          <p className="text-gray-500 text-center">
            {isInterviewStarted
              ? "Questions will appear here. Start recording to ask a question."
              : isCompleted
              ? "No questions were asked during this interview."
              : "Start the interview to begin asking questions."}
          </p>
        ) : (
          displayTranscriptions.map((transcription, index) => (
            <div 
              key={transcription.id} 
              ref={index === displayTranscriptions.length - 1 ? lastMessageRef : null}
              className={index > 0 ? 'mt-4' : ''}
            >
              <p className="text-sm text-gray-500">{transcription.createdAt.toLocaleTimeString()}</p>
              <div className="mt-1">{formatMessage(transcription.message)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VoiceRecorderView;