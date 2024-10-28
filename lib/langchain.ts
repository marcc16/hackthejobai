import { ChatOpenAI } from "@langchain/openai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import pineconeClient from "./pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { Index, RecordMetadata } from "@pinecone-database/pinecone";
import { adminDb } from "../firebaseAdmin";
import { auth } from "@clerk/nextjs/server";
import { Document } from "langchain/document";
import { PromptTemplate } from "@langchain/core/prompts";

const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-4o-mini",
  temperature: 0.7,
});

export const indexName = "hackthejobai";


async function processCVOnUpload(docs: Document[]): Promise<string> {
  const cvAnalysisPrompt = PromptTemplate.fromTemplate(`
    Analiza el siguiente CV y genera un resumen estructurado que incluya:
    1. Experiencia laboral relevante
    2. Habilidades principales
    3. Logros destacados
    4. Educación
    5. Proyectos relevantes

    CV: {text}

    Proporciona un resumen conciso pero informativo que pueda usarse como contexto para responder preguntas de entrevista.
  `);

  const chain = cvAnalysisPrompt.pipe(model);
  const cvText = docs.map(doc => doc.pageContent).join("\n");
  
  const response = await chain.invoke({ text: cvText });
  // Asegurarnos de que obtenemos un string
  return typeof response === 'string' ? response : response.content.toString();
}

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

  const splitDocs = await generateDocs(docId);

  // Inicializar Pinecone
  const pinecone = pineconeClient;
  const pineconeIndex = pinecone.Index(indexName);

  // Verificar si el namespace ya existe
  const exists = await namespaceExists(pineconeIndex, docId);
  if (!exists) {
    console.log("--- Creando embeddings y almacenándolos en Pinecone... ---");
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    await PineconeStore.fromDocuments(splitDocs, embeddings, {
      pineconeIndex,
      namespace: docId,
    });
  }
  
  // Generar y guardar el resumen del CV
  const cvSummary = await processCVOnUpload(splitDocs);
  await adminDb
    .collection("users")
    .doc(userId)
    .collection("files")
    .doc(docId)
    .update({
      cvSummary: cvSummary,
    });

  return { completed: true };
}

export async function generateLangchainCompletion(
  docId: string,
  question: string,
  companyName: string,
  jobPosition: string
): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("Usuario no encontrado");

  // Obtener el resumen del CV
  const docRef = await adminDb
    .collection("users")
    .doc(userId)
    .collection("files")
    .doc(docId)
    .get();

  const cvSummary = docRef.data()?.cvSummary;
  if (!cvSummary) throw new Error("Resumen del CV no encontrado");

  const chatHistory = await fetchMessagesFromDB(docId);

  console.log("--- Definiendo una plantilla de prompt... ---");
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", `Eres un candidato para el puesto de ${jobPosition} en ${companyName}. 
    Responde a las preguntas de la entrevista de manera profesional y entusiasta. 
    Usa la siguiente información de tu CV para proporcionar respuestas detalladas y convincentes:

    ${cvSummary}

    Asegúrate de que tu respuesta sea:
    1. Concisa y directa, sin perder información importante.
    2. Profesional y positiva.
    3. Relevante para la pregunta y el puesto de ${jobPosition} en ${companyName}.
    4. Estructurada de manera clara y fácil de seguir.
    5. Enfocada en destacar tus fortalezas y logros más relevantes para el puesto.
    Habla en primera persona y mantén un tono conversacional pero profesional.`],
    ...chatHistory,
    ["human", "El entrevistador pregunta: {input}"],
    ["human", "Basándote en tu CV y experiencia, responde a la pregunta del entrevistador:"],
  ]);

    console.log("--- Generando respuesta... ---");
  const chain = prompt.pipe(model);
  const response = await chain.invoke({
    input: question,
  });

  // Manejar diferentes tipos de respuesta posibles
  if (typeof response === 'string') {
    return response;
  } else if (typeof response.content === 'string') {
    return response.content;
  } else if (Array.isArray(response.content)) {
    // Si el contenido es un array, lo unimos en un string
    return response.content.map(item => 
      typeof item === 'string' ? item : JSON.stringify(item)
    ).join(' ');
  }

  // Fallback en caso de que ninguno de los casos anteriores funcione
  return JSON.stringify(response);
}

export { model };