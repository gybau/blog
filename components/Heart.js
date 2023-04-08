import { auth, firestore } from "@/lib/firebase";
import { doc, increment, writeBatch } from "firebase/firestore";
import { useDocument } from "react-firebase-hooks/firestore";

export default function HeartButton({ postRef }) {
  const heartRef = doc(postRef, "hearts", auth.currentUser.uid);
  const [heartDoc] = useDocument(heartRef);

  const addHeart = async () => {
    const uid = auth.currentUser.uid;
    const batch = writeBatch(firestore);
    batch.set(heartRef, { uid });
    batch.update(postRef, { heartCount: increment(1) });

    await batch.commit();
  };

  const removeHeart = async () => {
    const batch = writeBatch(firestore);
    batch.delete(heartRef);
    batch.update(postRef, { heartCount: increment(-1) });

    await batch.commit();
  };
  return heartDoc?.exists() ? (
    <button onClick={removeHeart}>💔 Unheart</button>
  ) : (
    <button onClick={addHeart}>💗 Heart</button>
  );
}
