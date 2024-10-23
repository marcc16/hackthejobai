import { Message, AskQuestionResponse } from "@/types";
import { adminDb } from "@/firebaseAdmin";
import { generateLangchainCompletion } from "@/lib/langchain";
import { auth } from "@clerk/nextjs/server";

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

    const reply = await generateLangchainCompletion(id, question, companyName, jobPosition);

    const aiMessage: Message = {
      role: "ai",
      message: reply,
      createdAt: new Date(),
      id: chatRef.doc().id
    };

    await chatRef.add(aiMessage);

    return { success: true, message: reply };
  } catch (error) {
    console.error("Error en askQuestion:", error);
    return { success: false, message: "Ocurrió un error al procesar tu pregunta" };
  }
}