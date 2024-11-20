import { useUser } from "@clerk/nextjs";
import { db } from "@/firebase";
import { useEffect, useState } from "react";
import { UserSubscription } from "@/types";
import { doc, onSnapshot, DocumentSnapshot } from "firebase/firestore";

export default function useSubscription() {
  const { user } = useUser();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const userRef = doc(db, "users", user.id);
    
    const unsubscribe = onSnapshot(userRef, 
      (snapshot: DocumentSnapshot) => {
        if (snapshot.exists()) {
          setSubscription(snapshot.data() as UserSubscription);
        }
      }
    );

    return () => unsubscribe();
  }, [user]);

  return subscription;
}