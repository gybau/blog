import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import {
  collection,
  getDocs,
  getFirestore,
  limit,
  query,
  where,
} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBieIlIZHdtGKJtswAkfzMLEYjog1sx3as",
  authDomain: "blog-67b57.firebaseapp.com",
  projectId: "blog-67b57",
  storageBucket: "blog-67b57.appspot.com",
  messagingSenderId: "1060439879465",
  appId: "1:1060439879465:web:1abbdbd7e3db059abad138",
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

/**
 *
 * @param {string} username
 */
export async function getUserWithUsername(username) {
  const userCollectionRef = collection(firestore, "users");
  const q = query(
    userCollectionRef,
    where("username", "==", username),
    limit(1)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs[0];
}

/**
 *
 * @param {DocumentSnapshot} doc
 */

export function postToJSON(doc) {
  const data = doc.data();

  return {
    ...data,
    createdAt: data.createdAt.toMillis(),
    updatedAt: data.updatedAt.toMillis(),
  };
}
