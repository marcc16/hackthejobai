"use client";

import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore'; // Eliminamos query ya que no se usa
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import Document from "./Document";
import PlaceholderDocument from "./PlaceholderDocument";
import type { JobPosition } from "@/lib/jobImages";

interface DocumentData {
  id: string;
  name: string;
  downloadUrl: string;
  size: number;
  jobPosition: JobPosition;
  companyName: string;
}

function DocumentsClient() {
  const { user } = useUser();
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDocuments() {
      if (!user?.id) return;

      try {
        const documentsRef = collection(db, "users", user.id, "files");
        const documentsSnapshot = await getDocs(documentsRef);
        
        const docs = documentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as DocumentData[];

        setDocuments(docs);
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDocuments();
  }, [user?.id, setLoading]); // Añadimos setLoading a las dependencias

  if (loading) {
    return (
      <div className="flex flex-wrap p-5 bg-white justify-center lg:justify-start rounded-sm gap-5 max-w-7xl mx-auto">
        <PlaceholderDocument />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap p-5 bg-white justify-center lg:justify-start rounded-sm gap-5 max-w-7xl mx-auto">
      <PlaceholderDocument />
      {documents.map((doc) => (
        <Document
          key={doc.id}
          id={doc.id}
          name={doc.name}
          size={doc.size}
          downloadUrl={doc.downloadUrl}
          jobPosition={doc.jobPosition}
          companyName={doc.companyName}
        />
      ))}
    </div>
  );
}

export default DocumentsClient;