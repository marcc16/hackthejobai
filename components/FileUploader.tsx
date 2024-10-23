"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { CircleArrowDown, FileIcon, X } from "lucide-react";

interface FileUploaderProps {
  onFileUploaded: (file: File | null) => void;
}

function FileUploader({ onFileUploaded }: FileUploaderProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      onFileUploaded(file);
    }
  }, [onFileUploaded]);

  const removeFile = () => {
    setUploadedFile(null);
    onFileUploaded(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 1024 * 1024, // 1 MB in bytes
    accept: {
      "application/pdf": [".pdf"],
    }
  });

  return (
    <div
      {...getRootProps()}
      className={`p-10 border-2 border-dashed mt-10 w-full border-blue-600 text-blue-600 rounded-lg h-48 flex items-center justify-center relative ${
        isDragActive ? "bg-blue-100" : "bg-white"
      }`}
    >
      <input {...getInputProps()} />
      {uploadedFile ? (
        <div className="flex flex-col items-center">
          <FileIcon className="h-12 w-12 mb-2" />
          <p className="text-center">{uploadedFile.name}</p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeFile();
            }}
            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center">
          {isDragActive ? (
            <>
              <CircleArrowDown className="h-12 w-12 animate-bounce" />
              <p>Suelta el archivo aquí ...</p>
            </>
          ) : (
            <>
              <CircleArrowDown className="h-12 w-12 animate-bounce" />
              <p>Arrastra o haz clic aquí para subir tu CV</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default FileUploader;