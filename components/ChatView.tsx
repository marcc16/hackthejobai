"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Message, ChatProps } from '@/types';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';
import { useUser } from '@clerk/nextjs';

const ChatView: React.FC<ChatProps> = ({ id }) => {
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
  
      setMessages(newMessages.filter(msg => msg.role === 'ai'));
    });
  
    return () => unsubscribe();
  }, [user?.id, id]);

  return (
    <div className="h-full overflow-y-auto p-4">
      <h2 className="text-lg font-semibold mb-4">Respuestas del co-pilot</h2>
      {messages.length === 0 ? (
        <p className="text-gray-500 text-center">Las respuestas del co-pilot aparecerán aquí</p>
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

export default ChatView;