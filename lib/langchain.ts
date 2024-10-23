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
  modelName: "gpt-4o-mini",
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
  const candidatePrompt = ChatPromptTemplate.fromMessages([
    ["system", `Eres un candidato para el puesto de ${jobPosition} en ${companyName}. 
    Responde a las preguntas de la entrevista de manera profesional y entusiasta. 
    Usa la información de tu CV y experiencia previa para proporcionar respuestas detalladas y convincentes.
    Asegúrate de que tu respuesta sea:
    1. Concisa y directa, sin perder información importante.
    2. Profesional y positiva.
    3. Relevante para la pregunta y el puesto de ${jobPosition} en ${companyName}.
    4. Estructurada de manera clara y fácil de seguir.
    5. Enfocada en destacar tus fortalezas y logros más relevantes para el puesto.
    Habla en primera persona y mantén un tono conversacional pero profesional.

    Contexto del CV: {context}`],
    ...chatHistory,
    ["human", "El entrevistador pregunta: {input}"],
    ["human", "Basándote en tu CV y experiencia, responde a la pregunta del entrevistador:"],
  ]);

  console.log("--- Creando una cadena de recuperación consciente del historial... ---");
  const historyAwareRetrieverChain = await createHistoryAwareRetriever({
    llm: model,
    retriever,
    rephrasePrompt: candidatePrompt,
  });

  console.log("--- Creando una cadena de combinación de documentos... ---");
  const combineDocsChain = await createStuffDocumentsChain({
    llm: model,
    prompt: candidatePrompt,
  });

  console.log("--- Creando la cadena principal de recuperación... ---");
  const conversationalRetrievalChain = await createRetrievalChain({
    retriever: historyAwareRetrieverChain,
    combineDocsChain,
  });

  console.log("--- Ejecutando la cadena con la conversación de muestra... ---");
  const documents = await retriever.getRelevantDocuments(question);
  const context = documents.map(doc => doc.pageContent).join("\n\n");

  const response = await conversationalRetrievalChain.invoke({
    chat_history: chatHistory,
    input: question,
    context: context,
  });

  console.log("Respuesta del candidato (IA):", response.answer);
  return response.answer;
}

export { model };