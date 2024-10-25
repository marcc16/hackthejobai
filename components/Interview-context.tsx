"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface InterviewContextType {
  isInterviewActive: boolean;
  setIsInterviewActive: (active: boolean) => void;
}

const InterviewContext = createContext<InterviewContextType | undefined>(undefined);

export function InterviewProvider({ children }: { children: ReactNode }) {
  const [isInterviewActive, setIsInterviewActive] = useState(false);

  return (
    <InterviewContext.Provider value={{ isInterviewActive, setIsInterviewActive }}>
      {children}
    </InterviewContext.Provider>
  );
}

export function useInterview() {
  const context = useContext(InterviewContext);
  if (context === undefined) {
    throw new Error('useInterview must be used within an InterviewProvider');
  }
  return context;
}