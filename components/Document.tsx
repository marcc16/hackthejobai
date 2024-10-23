"use client";

import { useRouter } from "next/navigation";
import { FaBuilding, FaBriefcase, FaFileAlt } from 'react-icons/fa';

function Document({
  id,
  name,
  size,
  downloadUrl,
  jobPosition,
  companyName,
}: {
  id: string;
  name: string;
  size: number;
  downloadUrl: string;
  jobPosition?: string;
  companyName?: string;
}) {
  const router = useRouter();
  const handleClick = () => {
    router.push(`/dashboard/files/${id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="flex flex-col w-64 h-80 rounded-xl bg-white drop-shadow-md justify-between p-4 transition-all transform hover:scale-105 hover:bg-blue-500 hover:text-white cursor-pointer group"
    >
      <div>
        {companyName && (
          <h3 className="font-bold text-lg mb-2 group-hover:text-white truncate">
            <FaBuilding className="inline mr-2" /> {companyName}
          </h3>
        )}
        {jobPosition && (
          <p className="text-md text-gray-700 group-hover:text-white flex items-center mb-2">
            <FaBriefcase className="mr-2 flex-shrink-0" /> 
            <span className="truncate">{jobPosition}</span>
          </p>
        )}
      </div>
      
      <div className="flex-grow flex items-center justify-center">
        <FaFileAlt className="text-5xl text-gray-300 group-hover:text-white" />
      </div>
      
      <div>
        <p className="text-sm text-gray-600 group-hover:text-white truncate mb-1">
          {name}
        </p>
        <p className="text-xs text-gray-400 group-hover:text-white">
          {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

export default Document;