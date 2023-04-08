import styles from "../../styles/Admin.module.css";
import AuthCheck from "@/components/AuthCheck";
import PostFeed from "@/components/PostFeed";
import { UserContext } from "@/lib/context";
import { auth, firestore } from "@/lib/firebase";
import {
  collection,
  doc,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import kebabCase from "lodash.kebabcase";
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import { toast } from "react-hot-toast";

export default function AdminPostsPage(props) {
  return (
    <main>
      <AuthCheck>
        <PostList />
      </AuthCheck>
    </main>
  );
}

function PostList() {
  const ref = collection(firestore, "users", auth.currentUser.uid, "posts");
  const q = query(ref, orderBy("createdAt"));
  const [querySnapshot] = useCollection(ref);

  const posts = querySnapshot?.docs.map((doc) => doc.data());

  console.log(posts);
  return (
    <>
      <h1>Manage your Posts</h1>
      <PostFeed posts={posts} admin />
      <CreateNewPost />
    </>
  );
}

function CreateNewPost() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const { username } = useContext(UserContext);

  const slug = encodeURI(kebabCase(title));

  const isValid = title.length > 3 && title.length < 100;

  async function createPost(e) {
    e.preventDefault();
    const uid = auth.currentUser.uid;
    const docRef = doc(firestore, "users", uid, "posts", slug);

    const data = {
      title,
      slug,
      uid,
      username,
      published: false,
      content: "# hello world",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      heartCount: 0,
    };

    await setDoc(docRef, data);

    toast.success("Post created!");

    router.push(`/admin/${slug}`);
  }

  return (
    <form onSubmit={createPost}>
      <input
        onChange={(e) => setTitle(e.target.value)}
        type="text"
        value={title}
      ></input>
      <p>
        <b>Slug:</b>
        {slug}
      </p>
      <button type="submit" disabled={!isValid} className="btn-green">
        Create
      </button>
    </form>
  );
}
