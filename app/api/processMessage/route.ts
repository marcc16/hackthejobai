import { NextResponse } from 'next/server';
import { db } from '@/firebase';
import { getDoc, doc } from 'firebase/firestore';
import { auth } from '@clerk/nextjs/server';
import { askQuestion } from '@/actions/askQuestion';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, docId } = await req.json();

    if (!message || !docId) {
      return NextResponse.json({ error: 'Invalid message or docId' }, { status: 400 });
    }

    // Obtener información de la empresa y el puesto de trabajo
    const fileRef = doc(db, 'users', userId, 'files', docId);
    const fileDoc = await getDoc(fileRef);
    const { companyName, jobPosition } = fileDoc.data() || {};

    if (!companyName || !jobPosition) {
      return NextResponse.json({ error: 'Company or job information not found' }, { status: 400 });
    }

    // Generar respuesta de la IA usando askQuestion
    const response = await askQuestion(docId, message, companyName, jobPosition);

    if (!response.success) {
      return NextResponse.json({ error: response.message }, { status: 500 });
    }

    return NextResponse.json({ reply: response.message });
  } catch (error) {
    console.error('Error processing message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}