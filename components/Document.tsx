"use client";

import { useRouter } from "next/navigation";
import { FaBuilding, FaBriefcase } from 'react-icons/fa';
import Image from "next/image";
import { getRandomJobImage } from "@/lib/jobImages";
import type { JobPosition } from "@/lib/jobImages";

interface DocumentProps {
  id: string;
  name: string;
  size: number;
  downloadUrl: string;
  jobPosition?: JobPosition;
  companyName?: string;
}

function Document({
  id,
  name,
  
  jobPosition,
  companyName,
}: DocumentProps) {
  const router = useRouter();
  const handleClick = () => {
    router.push(`/dashboard/files/${id}`);
  };

  const imagePath = jobPosition ? getRandomJobImage(jobPosition) : null;

  return (
    <div
      onClick={handleClick}
      className="flex flex-col w-64 h-80 rounded-xl bg-white drop-shadow-md overflow-hidden transition-all transform hover:scale-105 cursor-pointer group"
    >
      {/* Imagen de fondo */}
      <div className="relative h-40 w-full">
        {imagePath ? (
          <Image
            src={imagePath}
            alt={jobPosition || "Job position"}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600" />
        )}
        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Contenido */}
      <div className="flex flex-col flex-grow p-4 relative">
        {companyName && (
          <h3 className="font-bold text-lg mb-1 truncate flex items-center">
            <FaBuilding className="inline mr-2 flex-shrink-0 text-blue-500" />
            <span>{companyName}</span>
          </h3>
        )}
        
        {jobPosition && (
          <p className="text-sm text-gray-600 mb-2 flex items-center">
            <FaBriefcase className="mr-2 flex-shrink-0 text-blue-500" />
            <span className="truncate">{jobPosition}</span>
          </p>
        )}

        <div className="mt-auto">
          <p className="text-sm text-gray-600 truncate mb-1">
            {name}
          </p>
          <p className="text-xs text-gray-400">
            {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Document;