import React from 'react';
import { Message } from '@/types';
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  console.log("Rendering message:", message);
  return (
    <div className={cn(
      'bg-blue-100 bg-opacity-90 p-4 rounded-lg',
      message.role === 'user' ? 'bg-blue-200' : 'bg-blue-100'
    )}>
      <p className="text-sm text-blue-800">{message.createdAt.toLocaleTimeString()}</p>
      <div className="mt-1 text-blue-900">{formatMessage(message.message)}</div>
    </div>
  );
};

function formatMessage(text: string) {
  const paragraphs = text.split('\n').filter(p => p.trim() !== '');
  return paragraphs.map((paragraph, index) => {
    if (paragraph.startsWith('- ')) {
      return <li key={index} className="ml-4">{paragraph.slice(2).trim()}</li>;
    } else if (paragraph.startsWith('#')) {
      const level = paragraph.match(/^#+/)?.[0].length || 0;
      const HeaderTag = `h${Math.min(level + 1, 6)}` as keyof JSX.IntrinsicElements;
      return <HeaderTag key={index} className="font-bold mt-2 mb-1">{paragraph.slice(level + 1).trim()}</HeaderTag>;
    } else {
      return <p key={index} className="mb-2">{paragraph.trim()}</p>;
    }
  });
}

export default ChatMessage;