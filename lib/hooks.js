import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firestore } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";

export function useUserData() {
  const [user] = useAuthState(auth);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    let unsubscribe;
    if (user) {
      const docRef = doc(firestore, `/users/${user.uid}`);
      unsubscribe = onSnapshot(docRef, (docSnap) => {
        setUsername(docSnap.get("username"));
      });
    } else {
      setUsername(null);
    }

    return unsubscribe;
  }, [user]);

  return { user, username };
}
