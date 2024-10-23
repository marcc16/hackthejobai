import { NextResponse } from 'next/server';
import { db } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from '@clerk/nextjs/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    // Generar respuesta de la IA
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant conducting a job interview." },
        { role: "user", content: message }
      ],
    });

    const aiReply = completion.choices[0].message.content;

    // Guardar la respuesta de la IA en Firestore
    const chatRef = collection(db, 'users', userId, 'files', docId, 'chat');
    await addDoc(chatRef, {
      message: aiReply,
      role: 'ai',
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({ reply: aiReply });
  } catch (error) {
    console.error('Error processing message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}