"use client";

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface InterviewLayoutProps {
  children: ReactNode;
  isInterviewActive: boolean;
}

const InterviewLayout: React.FC<InterviewLayoutProps> = ({ children, isInterviewActive }) => {
  const pathname = usePathname();
  const isInterviewPage = pathname.includes('/interview/');
  
  // Si no estamos en una página de entrevista, mostramos el header normalmente
  if (!isInterviewPage) {
    return (
      <>
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          {/* Tu header actual aquí */}
        </header>
        {children}
      </>
    );
  }

  // Si estamos en una página de entrevista
  return (
    <>
      {!isInterviewActive && (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          {/* Tu header actual aquí */}
        </header>
      )}
      {children}
    </>
  );
};

export default InterviewLayout;