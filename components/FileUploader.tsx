"use client";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { CircleArrowDown, RocketIcon } from "lucide-react";

interface FileUploaderProps {
  onFileUploaded: (file: File) => void;
}

function FileUploader({ onFileUploaded }: FileUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      onFileUploaded(file);
    }
  }, [onFileUploaded]);

  const { getRootProps, getInputProps, isDragActive, isFocused, isDragAccept } = useDropzone({
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
      className={`p-10 border-2 border-dashed mt-10 w-full border-blue-600 text-blue-600 rounded-lg h-48 flex items-center justify-center ${
        isFocused || isDragAccept ? "bg-blue-300" : "bg-blue-100"
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center">
        {isDragActive ? (
          <>
            <RocketIcon className="h-12 w-12 animate-ping" />
            <p>Suelta el archivo aquí ...</p>
          </>
        ) : (
          <>
            <CircleArrowDown className="h-12 w-12 animate-bounce" />
            <p>Arrastra o haz clic aquí para subir tu CV</p>
          </>
        )}
      </div>
    </div>
  );
}

export default FileUploader;