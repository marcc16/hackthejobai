"use client";
import { generateEmbeddings as generateEmbeddingsAction } from "@/actions/generateEmbeddings";
import { db, storage } from "@/firebase";
import { useUser } from "@clerk/nextjs";
import { doc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export enum StatusText {
  UPLOADING = "Subiendo el archivo",
  PROCESSING = "Procesando el archivo",
  GENERATING = "Entrenando a la IA",
  COMPLETED = "Proceso completado"
}

export type Status = StatusText[keyof StatusText];

function useUpload() {
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<Status>(StatusText.UPLOADING);
  const { user } = useUser();

  const handleUpload = async (file: File): Promise<string | null> => {
    if (!file || !user) return null;
    
    const fileId = uuidv4();
    const storageRef = ref(storage, `users/${user.id}/files/${fileId}`);

    const uploadTask = uploadBytesResumable(storageRef, file);
    
    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const percent = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setStatus(StatusText.UPLOADING);
          setProgress(percent * 0.5); // File upload is 50% of the total progress
        },
        (error) => {
          console.error("Error uploading file:", error);
          reject(error);
        },
        async () => {
          setStatus(StatusText.PROCESSING);
          setProgress(55);
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          setProgress(60);
          await setDoc(doc(db, "users", user.id, 'files', fileId), {
            name: file.name,
            size: file.size,
            type: file.type,
            downloadURL: downloadURL,
            ref: uploadTask.snapshot.ref.fullPath,
            createdAt: new Date() 
          });

          setProgress(65);
          resolve(fileId);
        }
      );
    });
  };

  const generateEmbeddings = async (fileId: string) => {
    setStatus(StatusText.GENERATING);
    setProgress(70);

    try {
      // Simulate progress during embedding generation
      const simulateProgress = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 95) {
            clearInterval(simulateProgress);
            return prevProgress;
          }
          return prevProgress + 1;
        });
      }, 1000);

      const response = await generateEmbeddingsAction(fileId);
      
      clearInterval(simulateProgress);

      if (response.completed) {
        setStatus(StatusText.COMPLETED);
        setProgress(100);
      }
    } catch (error) {
      console.error("Error generating embeddings:", error);
      setStatus(StatusText.COMPLETED);
      setProgress(100);
    }

    return fileId;
  };

  return { progress, status, handleUpload, generateEmbeddings };
}

export default useUpload;