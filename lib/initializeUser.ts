import { adminDb } from "@/firebaseAdmin";

export async function initializeUser(userId: string, email?: string) {
  try {
    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({
        userId,
        email,
        availableInterviews: 0,
        totalInterviews: 0,
        completedInterviews: 0,
        createdAt: new Date(),
      });
    }

    return userDoc;
  } catch (error) {
    console.error("Error initializing user:", error);
    throw error;
  }
}