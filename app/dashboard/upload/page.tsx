"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import FileUploader from '@/components/FileUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { db } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useUser } from '@clerk/nextjs';
import useUpload from '@/hooks/useUpload';
import AnimatedCircularProgressBar from '@/components/ui/animated-circular-progress-bar';

const jobPositions = [
  "Software Developer",
  "Data Scientist",
  "UX/UI Designer",
  "Product Manager",
  "Digital Marketing Specialist"
];

function UploadPage() {
  const [companyName, setCompanyName] = useState('');
  const [jobPosition, setJobPosition] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useUser();
  const router = useRouter();
  const { progress, status, handleUpload, generateEmbeddings } = useUpload();

  const handleFileUploaded = (file: File) => {
    setUploadedFile(file);
  };

  const handleCancel = () => {
    router.push('/dashboard');
  };

  const handleAccept = async () => {
    if (!uploadedFile || !companyName || !jobPosition || !user) {
      alert('Please fill all fields and upload a file');
      return;
    }

    setIsProcessing(true);
    try {
      const uploadedFileId = await handleUpload(uploadedFile);
      if (uploadedFileId) {
        await setDoc(doc(db, 'users', user.id, 'files', uploadedFileId), {
          companyName,
          jobPosition,
          createdAt: new Date(),
          status: 'pending'
        }, { merge: true });

        await generateEmbeddings(uploadedFileId);
        router.push(`/dashboard/files/${uploadedFileId}`);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      alert('An error occurred while processing the file');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <AnimatedCircularProgressBar
          max={100}
          value={progress || 0}
          min={0}
          gaugePrimaryColor="#4F46E5"
          gaugeSecondaryColor="#E0E7FF"
          className="text-blue-600"
        />
        <p className="text-blue-600 animate-pulse mt-4">{status.toString()}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Entrena a la IA</h1>
      
      <Input
        placeholder="Company Name"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
      />

      <Select onValueChange={setJobPosition}>
        <SelectTrigger>
          <SelectValue placeholder="Select Job Position" />
        </SelectTrigger>
        <SelectContent>
          {jobPositions.map((position) => (
            <SelectItem key={position} value={position}>
              {position}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <FileUploader onFileUploaded={handleFileUploaded} />

      {uploadedFile && (
        <p>Uploaded file: {uploadedFile.name}</p>
      )}

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleAccept} disabled={!uploadedFile || !companyName || !jobPosition}>Accept</Button>
      </div>
    </div>
  );
}

export default UploadPage;