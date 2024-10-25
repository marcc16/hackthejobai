import { adminDb } from "@/firebaseAdmin";
import PlaceholderDocument from "./PlaceholderDocument";
import { auth } from "@clerk/nextjs/server";
import Document from "./Document";
import type { JobPosition } from "@/lib/jobImages";

async function Documents() {
  auth().protect();

  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not found");
  }

  const documentsSnapshot = await adminDb
    .collection("users")
    .doc(userId)
    .collection("files")
    .get();

  return (
    <div className="flex flex-wrap p-5 bg-white justify-center lg:justify-start rounded-sm gap-5 max-w-7xl mx-auto">
      <PlaceholderDocument /> 
      {documentsSnapshot.docs.map((doc) => {
        const { name, downloadUrl, size, jobPosition, companyName } = doc.data();

        return (
          <Document
            key={doc.id}
            id={doc.id}
            name={name}
            size={size}
            downloadUrl={downloadUrl}
            jobPosition={jobPosition as JobPosition}
            companyName={companyName}
          />
        );
      })}
    </div>
  );
}

export default Documents;