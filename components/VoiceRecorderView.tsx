import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Message } from '@/types';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';
import { useUser } from '@clerk/nextjs';

interface VoiceRecorderProps {
  id: string;
  isInterviewStarted: boolean;
  transcription: string | null;
}

const VoiceRecorderView: React.FC<VoiceRecorderProps> = ({ id, isInterviewStarted }) => {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!user?.id) return;
  
    const q = query(
      collection(db, 'users', user.id, 'files', id, 'chat'),
      orderBy('createdAt', 'asc')
    );
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Message[];
  
      setMessages(newMessages.filter(msg => msg.role === 'user'));
    });
  
    return () => unsubscribe();
  }, [user?.id, id]);

  return (
    <div className="h-full overflow-y-auto p-4">
      <h2 className="text-lg font-semibold mb-4">Preguntas del entrevistador</h2>
      {messages.length === 0 ? (
        <p className="text-gray-500 text-center">
          {isInterviewStarted
            ? "Questions will appear here. Start recording to ask a question."
            : "Start the interview to begin asking questions."}
        </p>
      ) : (
        messages.map((message) => (
          <Card key={message.id} className="mb-4">
            <CardContent className="p-4">
              <p className="text-sm text-gray-800">{message.message}</p>
              <span className="text-xs text-gray-500">
                {message.createdAt.toLocaleTimeString()}
              </span>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default VoiceRecorderView;