import { useEffect, RefObject } from 'react';
import { Message } from '@/types';

interface UseMessageScrollProps {
  messages: Message[];
  isInterviewActive: boolean;
  messagesContainerRef: RefObject<HTMLDivElement>;
  lastMessageRef: RefObject<HTMLDivElement>;
  isCompleted?: boolean; // Añadimos esta prop para diferenciar entre componentes
}

export const useMessageScroll = ({ 
  messages, 
  isInterviewActive,
  messagesContainerRef,
  lastMessageRef,
  isCompleted = false
}: UseMessageScrollProps) => {
  useEffect(() => {
    if (
      !isCompleted && // Solo si no está completada la entrevista
      isInterviewActive && 
      messages.length > 1 && 
      lastMessageRef.current &&
      messagesContainerRef.current
    ) {
      const lastMessage = lastMessageRef.current;
      const container = messagesContainerRef.current;
      
      // Ajustamos los márgenes para mostrar la fecha y el contenedor anterior
      const containerPadding = 16;
      const visibilityMargin = 64;
      const scrollPosition = lastMessage.offsetTop - containerPadding - visibilityMargin;
      
      requestAnimationFrame(() => {
        container.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        });
      });
    }
  }, [messages, isInterviewActive, isCompleted]);
};