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
  UPLOADED = "Archivo subido",
  SAVING = "Guardando información",
  GENERATING = "Generando embeddings",
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
          setProgress(percent);
        },
        (error) => {
          console.error("Error uploading file:", error);
          reject(error);
        },
        async () => {
          setStatus(StatusText.UPLOADED);
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          setStatus(StatusText.SAVING);
          await setDoc(doc(db, "users", user.id, 'files', fileId), {
            name: file.name,
            size: file.size,
            type: file.type,
            downloadURL: downloadURL,
            ref: uploadTask.snapshot.ref.fullPath,
            createdAt: new Date() 
          });

          resolve(fileId);
        }
      );
    });
  };

  const generateEmbeddings = async (fileId: string) => {
    setStatus(StatusText.GENERATING);
    setProgress(0);
    await generateEmbeddingsAction(fileId);
    setProgress(100);
  };

  return { progress, status, handleUpload, generateEmbeddings };
}

export default useUpload;