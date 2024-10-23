// types.ts

export interface Message {
  id: string;
  role: 'user' | 'ai' ;
  message: string;
  createdAt: Date;
}

export interface AudioMessage extends Message {
  transcription?: string;
  context?: string;
}

export interface VoiceRecorderProps {
  id: string;
}

export interface ChatProps {
  id: string;
}


export interface AskQuestionResponse {

  success: boolean;

  message: string | null;

  context?: string | null;

}