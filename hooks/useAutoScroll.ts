import { useEffect, RefObject } from 'react';
import { Message } from '@/types';

export const useAutoScroll = (
  ref: RefObject<HTMLDivElement>,
  messages: Message[]
) => {
  useEffect(() => {
    const scrollToBottom = () => {
      ref.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, ref]);
};