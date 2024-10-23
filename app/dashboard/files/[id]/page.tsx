import InterviewPage from "@/components/InterviewPage";
import { adminDb } from "@/firebaseAdmin";
import { auth } from "@clerk/nextjs/server";

export default async function ChatToFilePage({
  params: { id },
}: {
  params: {
    id: string;
  };
}) {
  auth().protect();
  const { userId } = await auth();

  const ref = await adminDb
    .collection("users")
    .doc(userId!)
    .collection("files")
    .doc(id)
    .get();

  const isCompleted = ref.data()?.isCompleted || false;

  return <InterviewPage id={id} isCompleted={isCompleted} />;
}