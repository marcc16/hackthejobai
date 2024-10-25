"use client";
import React, { useRef, useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Message, ChatProps } from '@/types';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';
import { useUser } from '@clerk/nextjs';
import ChatMessage from './ChatMessage';
import { useInterview } from './Interview-context';
import { useMessageScroll } from '@/hooks/useMessageScroll';

interface ExtendedChatProps extends ChatProps {
  isCompleted: boolean;
  isGenerating: boolean;
  messages?: Message[]; // Nuevo prop para recibir mensajes en caché
  addMessage?: (message: Message) => void; // Nuevo prop para añadir mensajes
}

const ChatView: React.FC<ExtendedChatProps> = ({ 
  id, 
  isCompleted, 
  isGenerating,
  messages: cachedMessages = [], // Mensajes en caché desde el padre
  addMessage // Función para añadir mensajes desde el padre
}) => {
  const { user } = useUser();
  const [storedMessages, setStoredMessages] = useState<Message[]>([]);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const { isInterviewActive } = useInterview();

  useMessageScroll({
    messages: isCompleted ? storedMessages : cachedMessages,
    isInterviewActive,
    messagesContainerRef,
    lastMessageRef
  });

  // Solo cargar mensajes de Firebase si la entrevista está completada
  useEffect(() => {
    if (isCompleted && user?.id) {
      const q = query(
        collection(db, 'users', user.id, 'files', id, 'chat'),
        orderBy('createdAt', 'asc')
      );
  
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newMessages = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          } as Message))
          .filter(msg => msg.role === 'ai' || msg.role === 'user')
          // Eliminar duplicados basados en el contenido del mensaje y el rol
          .filter((message, index, self) => 
            index === self.findIndex((m) => 
              m.message === message.message && m.role === message.role
            )
          );
  
        setStoredMessages(newMessages);
      });
  
      return () => unsubscribe();
    }
  }, [isCompleted, user?.id, id]);

  const displayMessages = isCompleted ? storedMessages : cachedMessages;

  return (
    <div 
      ref={messagesContainerRef}
      className="h-full overflow-y-auto bg-gradient-to-br from-blue-400 via-blue-600 to-blue-900 rounded-lg"
    >
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-lg text-white">Interview Copilot™ & You</h2>
          <Badge className={`bg-white text-blue-500 bg-opacity-80 ${isGenerating ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}>
            AI Generating
          </Badge>
        </div>
        {displayMessages.length === 0 ? (
          <p className="text-white text-center">Las respuestas del co-pilot aparecerán aquí</p>
        ) : (
          displayMessages.map((message: Message, index: number) => (
            <div 
              key={message.id}
              ref={index === displayMessages.length - 1 ? lastMessageRef : null}
              className="pt-2"
            >
              <ChatMessage message={message} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatView;