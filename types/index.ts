// types.ts
import { JobPosition } from '@/lib/jobImages';

export interface Message {
  id: string;
  role: 'interviewer' | 'candidate' | 'user' | 'ai';
  message: string;
  createdAt: Date;
}

export interface AudioMessage extends Message {
  transcription?: string;
  context?: string;
}

export interface VoiceRecorderProps {
  id: string;
  isInterviewStarted: boolean;
  transcriptions: Message[];
}

export interface ChatProps {
  id: string;
}

export interface AskQuestionResponse {
  success: boolean;
  message: string | null;
  context?: string | null;
}

export interface Document {
  id: string;
  companyName: string;
  jobPosition: JobPosition;
  createdAt: Date;
  isCompleted: boolean;
}

export interface UserSubscription {
  stripeCustomerId?: string;
  availableInterviews: number;
  totalInterviews: number;
  completedInterviews: number;
}

export interface Document {
  id: string;
  companyName: string;
  jobPosition: JobPosition;
  createdAt: Date;
  isCompleted: boolean;
  endedAt?: Date;  // Nueva propiedad para tracking
}