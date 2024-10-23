import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Message } from '@/types';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';
import { useUser } from '@clerk/nextjs';

interface VoiceRecorderViewProps {
  id: string;
  isInterviewStarted: boolean;
  transcriptions: Message[];
  isCompleted: boolean;
}

const VoiceRecorderView: React.FC<VoiceRecorderViewProps> = ({ id, isInterviewStarted, transcriptions, isCompleted }) => {
  const [storedTranscriptions, setStoredTranscriptions] = useState<Message[]>([]);
  const { user } = useUser();

  useEffect(() => {
    if (isCompleted && user?.id) {
      const q = query(
        collection(db, 'users', user.id, 'files', id, 'chat'),
        orderBy('createdAt', 'asc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newTranscriptions = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          } as Message))
          .filter(msg => msg.role === 'interviewer');

        setStoredTranscriptions(newTranscriptions);
      });

      return () => unsubscribe();
    }
  }, [isCompleted, user?.id, id]);

  const displayTranscriptions = isCompleted ? storedTranscriptions : transcriptions;

  return (
    <div className="h-full overflow-y-auto p-4">
      <h2 className="text-lg font-semibold mb-4">Preguntas del entrevistador</h2>
      {displayTranscriptions.length === 0 ? (
        <p className="text-gray-500 text-center">
          {isInterviewStarted
            ? "Questions will appear here. Start recording to ask a question."
            : isCompleted
            ? "No questions were asked during this interview."
            : "Start the interview to begin asking questions."}
        </p>
      ) : (
        displayTranscriptions.map((transcription) => (
          <Card key={transcription.id} className="mb-4">
            <CardContent className="p-4">
              <p className="text-sm text-gray-800">{transcription.message}</p>
              <span className="text-xs text-gray-500">
                {transcription.createdAt.toLocaleTimeString()}
              </span>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default VoiceRecorderView;