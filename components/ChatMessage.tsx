'use client';

import { Message } from '@/types';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  if (!message?.message || !message?.createdAt) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex w-full items-center space-x-2 p-4 rounded-lg',
        message.role === 'user' 
          ? 'bg-blue-100 justify-end' 
          : 'bg-gray-100'
      )}
    >
      <div className="flex flex-col space-y-1 max-w-[80%]">
        <p className="text-sm text-gray-800">{message.message}</p>
        <span className="text-xs text-gray-500">
          {message.createdAt.toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;