import { Message, AskQuestionResponse } from "@/types";
import { adminDb } from "@/firebaseAdmin";
import { generateLangchainCompletion } from "@/lib/langchain";
import { auth } from "@clerk/nextjs/server";
import { ChatOpenAI } from "@langchain/openai";
import { AIMessage } from "@langchain/core/messages";

const refineModel = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-4",
  temperature: 0.7,
});

const REFINE_PROMPT = `Eres un asistente experto en entrevistas de trabajo. Tu tarea es refinar y mejorar la siguiente respuesta para una entrevista. 
Asegúrate de que la respuesta sea:

1. Concisa y directa, sin perder información importante.
2. Profesional y positiva.
3. Relevante para la pregunta y el contexto de la entrevista.
4. Estructurada de manera clara y fácil de seguir.
5. Enfocada en destacar las fortalezas y logros del candidato.

Pregunta original: {question}

Respuesta inicial: {initial_response}

Por favor, proporciona una versión mejorada y refinada de esta respuesta:`;

export async function askQuestion(id: string, question: string): Promise<AskQuestionResponse> {
  try {
    auth().protect();
    const { userId } = await auth();

    if (!userId) {
      return { success: false, message: "User not authenticated" };
    }

    const chatRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("files")
      .doc(id)
      .collection("chat");

    // Generate initial AI Response using Langchain
    const initialReply = await generateLangchainCompletion(id, question);

    // Refine the response
    const refinedResponse = await refineModel.invoke(
      REFINE_PROMPT.replace("{question}", question).replace("{initial_response}", initialReply)
    );

    let refinedContent: string;
    if (refinedResponse instanceof AIMessage) {
      refinedContent = refinedResponse.content as string;
    } else if (typeof refinedResponse.content === 'string') {
      refinedContent = refinedResponse.content;
    } else if (Array.isArray(refinedResponse.content)) {
      refinedContent = refinedResponse.content.map(item => 
        typeof item === 'string' ? item : JSON.stringify(item)
      ).join(' ');
    } else {
      refinedContent = JSON.stringify(refinedResponse.content);
    }

    const aiMessage: Message = {
      role: "ai",
      message: refinedContent,
      createdAt: new Date(),
      id //esta mal, esta hardcodeado para que no de error
    };

    await chatRef.add(aiMessage);

    return { success: true, message: refinedContent };
  } catch (error) {
    console.error("Error in askQuestion:", error);
    return { success: false, message: "An error occurred while processing your question" };
  }
}