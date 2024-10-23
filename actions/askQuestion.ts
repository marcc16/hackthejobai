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

const REFINE_PROMPT = `Eres un asistente experto en entrevistas de trabajo para {company_name}, específicamente para el puesto de {job_position}. Tu tarea es refinar y mejorar la siguiente respuesta para una entrevista, basándote en la información del CV del candidato y el contexto de la empresa y el puesto.

Asegúrate de que la respuesta sea:

1. Concisa y directa, sin perder información importante.
2. Profesional y positiva.
3. Relevante para la pregunta, el puesto de {job_position} y el contexto de {company_name}.
4. Estructurada de manera clara y fácil de seguir.
5. Enfocada en destacar las fortalezas y logros del candidato que sean más relevantes para {company_name} y el puesto de {job_position}.

Pregunta original: {question}

Respuesta inicial: {initial_response}

Por favor, proporciona una versión mejorada y refinada de esta respuesta:`;

export async function askQuestion(id: string, question: string, companyName: string, jobPosition: string): Promise<AskQuestionResponse> {
  try {
    auth().protect();
    const { userId } = await auth();

    if (!userId) {
      return { success: false, message: "Usuario no autenticado" };
    }

    const chatRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("files")
      .doc(id)
      .collection("chat");

    const initialReply = await generateLangchainCompletion(id, question, companyName, jobPosition);

    const refinedResponse = await refineModel.invoke(
      REFINE_PROMPT.replace("{company_name}", companyName)
                   .replace("{job_position}", jobPosition)
                   .replace("{question}", question)
                   .replace("{initial_response}", initialReply)
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
      id: chatRef.doc().id
    };

    await chatRef.add(aiMessage);

    return { success: true, message: refinedContent };
  } catch (error) {
    console.error("Error en askQuestion:", error);
    return { success: false, message: "Ocurrió un error al procesar tu pregunta" };
  }
}