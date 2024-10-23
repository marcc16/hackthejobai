import { ChatOpenAI } from "@langchain/openai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import pineconeClient from "./pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { Index, RecordMetadata } from "@pinecone-database/pinecone";
import { adminDb } from "../firebaseAdmin";
import { auth } from "@clerk/nextjs/server";

const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-4",
  temperature: 0.7,
});

export const indexName = "hackthejobai";

async function fetchMessagesFromDB(docId: string): Promise<(HumanMessage | AIMessage)[]> {
  const { userId } = await auth();
  if (!userId) throw new Error("Usuario no encontrado");

  console.log("--- Obteniendo historial de chat de la base de datos Firestore... ---");
  const chats = await adminDb
    .collection(`users`)
    .doc(userId)
    .collection("files")
    .doc(docId)
    .collection("chat")
    .orderBy("createdAt", "desc")
    .limit(10)
    .get();

  const chatHistory = chats.docs.map((doc) =>
    doc.data().role === "human"
      ? new HumanMessage(doc.data().message)
      : new AIMessage(doc.data().message)
  ).reverse();

  console.log(`--- Se obtuvieron los últimos ${chatHistory.length} mensajes con éxito ---`);
  return chatHistory;
}

async function generateDocs(docId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Usuario no encontrado");

  console.log("--- Obteniendo la URL de descarga de Firebase... ---");
  const firebaseRef = await adminDb
    .collection("users")
    .doc(userId)
    .collection("files")
    .doc(docId)
    .get();

  const downloadUrl = firebaseRef.data()?.downloadURL;
  if (!downloadUrl) throw new Error("URL de descarga no encontrada");

  console.log(`--- URL de descarga obtenida con éxito: ${downloadUrl} ---`);

  const response = await fetch(downloadUrl);
  const data = await response.blob();

  console.log("--- Cargando documento PDF... ---");
  const loader = new PDFLoader(data);
  const docs = await loader.load();

  console.log("--- Dividiendo el documento en partes más pequeñas... ---");
  const splitter = new RecursiveCharacterTextSplitter();
  const splitDocs = await splitter.splitDocuments(docs);
  console.log(`--- Dividido en ${splitDocs.length} partes ---`);

  return splitDocs;
}

async function namespaceExists(index: Index<RecordMetadata>, namespace: string): Promise<boolean> {
  if (!namespace) throw new Error("No se proporcionó valor de namespace.");
  const { namespaces } = await index.describeIndexStats();
  return namespaces?.[namespace] !== undefined;
}

export async function generateEmbeddingsInPineconeVectorStore(docId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Usuario no encontrado");

  console.log("--- Generando embeddings... ---");
  const embeddings = new OpenAIEmbeddings();

  const index = await pineconeClient.index(indexName);
  const namespaceAlreadyExists = await namespaceExists(index, docId);

  if (namespaceAlreadyExists) {
    console.log(`--- El namespace ${docId} ya existe, reutilizando embeddings existentes... ---`);
    return await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
      namespace: docId,
    });
  } else {
    const splitDocs = await generateDocs(docId);
    console.log(`--- Almacenando los embeddings en el namespace ${docId} en el almacén de vectores Pinecone ${indexName}... ---`);
    return await PineconeStore.fromDocuments(splitDocs, embeddings, {
      pineconeIndex: index,
      namespace: docId,
    });
  }
}

export async function generateLangchainCompletion(
  docId: string,
  question: string,
  companyName: string,
  jobPosition: string
): Promise<string> {
  const pineconeVectorStore = await generateEmbeddingsInPineconeVectorStore(docId);
  if (!pineconeVectorStore) throw new Error("Almacén de vectores Pinecone no encontrado");

  console.log("--- Creando un recuperador... ---");
  const retriever = pineconeVectorStore.asRetriever();

  const chatHistory = await fetchMessagesFromDB(docId);

  console.log("--- Definiendo una plantilla de prompt... ---");
  const historyAwarePrompt = ChatPromptTemplate.fromMessages([
    ["system", `Eres un asistente de IA conduciendo una entrevista de trabajo para ${companyName}, para el puesto de ${jobPosition}. 
    Tu objetivo es hacer preguntas relevantes y proporcionar retroalimentación perspicaz basada en el CV del candidato y sus respuestas. 
    Utiliza el contexto proporcionado para adaptar tus respuestas a la empresa y el puesto específicos.`],
    ...chatHistory,
    ["human", "{input}"],
    ["human", "Basándote en la conversación anterior y el contexto de esta entrevista de trabajo, genera una consulta de búsqueda para encontrar información relevante del CV del candidato."],
  ]);

  console.log("--- Creando una cadena de recuperación consciente del historial... ---");
  const historyAwareRetrieverChain = await createHistoryAwareRetriever({
    llm: model,
    retriever,
    rephrasePrompt: historyAwarePrompt,
  });

  console.log("--- Definiendo una plantilla de prompt para responder preguntas... ---");
  const interviewPrompt = ChatPromptTemplate.fromMessages([
    ["system", `Eres un entrevistador de IA para ${companyName}, entrevistando a un candidato para el puesto de ${jobPosition}. 
    Utiliza el siguiente contexto del CV del candidato y las respuestas previas para proporcionar una respuesta detallada y profesional. 
    Tu objetivo es evaluar la idoneidad del candidato para el puesto y proporcionar retroalimentación constructiva.

    Directrices:
    1. Sé profesional y cortés en todo momento.
    2. Haz preguntas de seguimiento cuando sea apropiado para profundizar en la experiencia del candidato.
    3. Proporciona retroalimentación específica relacionada con el puesto de ${jobPosition} en ${companyName}.
    4. Si la respuesta del candidato es vaga o insuficiente, pide más detalles o ejemplos.
    5. Destaca fortalezas y áreas de mejora basadas en los requisitos del puesto de ${jobPosition}.
    6. Mantén un tono conversacional mientras mantienes la entrevista enfocada y productiva.

    Contexto del CV y respuestas previas: {context}`],
    ...chatHistory,
    ["human", "{input}"],
  ]);

  console.log("--- Creando una cadena de combinación de documentos... ---");
  const combineDocsChain = await createStuffDocumentsChain({
    llm: model,
    prompt: interviewPrompt,
  });

  console.log("--- Creando la cadena principal de recuperación... ---");
  const conversationalRetrievalChain = await createRetrievalChain({
    retriever: historyAwareRetrieverChain,
    combineDocsChain,
  });

  console.log("--- Ejecutando la cadena con la conversación de muestra... ---");
  const response = await conversationalRetrievalChain.invoke({
    chat_history: chatHistory,
    input: question,
  });

  console.log("Respuesta de la IA:", response.answer);
  return response.answer;
}

export { model };