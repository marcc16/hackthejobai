"use client";

import { useRouter } from "next/navigation";  // 14.2k (gzipped: 3k)

function Document({
  id,
  
}: {
  id: string;
  name: string;
  size: number;
  downloadUrl: string;
}) {
  const router = useRouter();
const handleClick = () => {
    router.push(`/dashboard/files/${id}`);
};

return (
    <div
        onClick={handleClick}
        className="flex flex-col w-64 h-80 rounded-xl bg-white drop-shadow-md justify-between p-4 transition-all transform hover:scale-105 hover:bg-blue-600 hover:text-white cursor-pointer group"
    >
        Document
    </div>
);
}

export default Document;