"use client";

import { useCallback } from "react"; // 4.2k (gzipped: 1.9k)
import { useDropzone } from "react-dropzone"; // 23.9k (gzipped: 7.8k)
import {
  CheckCircleIcon,
  CircleArrowDown,
  HammerIcon,
  RocketIcon,
  SaveIcon,
} from "lucide-react"; // 2.5k (gzipped: 1.3k)

function FileUploader() {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Do something with the files
  }, []);

  const { getRootProps, getInputProps, isDragActive, isFocused, isDragAccept } = useDropzone({
    onDrop,
  });

  return (
    <div className="flex flex-col gap-4 items-center max-w-7xl mx-auto">
      {/* Loading... tomorrow! */}
      <div
        {...getRootProps()}
        className={`p-10 border-2 border-dashed mt-10 w-[90%] 
          border-indigo-600 text-indigo-600 rounded-lg h-96 flex 
          items-center justify-center ${
            isFocused || isDragAccept ? "bg-indigo-300" : "bg-indigo-100"
          }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center">
          {isDragActive ? (
            <>
              <RocketIcon className="h-20 w-20 animate-ping" />
              <p>Ya casi lo tienes...</p>
            </>
          ) : (
            <>
              <CircleArrowDown className="h-20 w-20 animate-bounce" />
              <p>Arrastra o haz click aquí para subir tu CV</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default FileUploader;