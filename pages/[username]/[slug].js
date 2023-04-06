import { firestore, getUserWithUsername, postToJSON } from "@/lib/firebase";
import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { useDocumentData } from "react-firebase-hooks/firestore";

// import styles from "../../styles/Post.module.css";

export async function getStaticProps({ params }) {
  const { username, slug } = params;
  const userDoc = await getUserWithUsername(username);

  let post;
  let path;

  if (userDoc) {
    const postRef = doc(collection(userDoc.ref, "posts"), slug);

    const docSnap = await getDoc(postRef);

    if (!docSnap.data()) {
      return {
        notFound: true,
      };
    }

    post = postToJSON(docSnap);

    path = postRef.path;
  }

  return {
    props: { post, path },
    revalidate: 5000,
  };
}

export async function getStaticPaths() {
  const snapshot = getDocs(collectionGroup(firestore, "posts"));

  const paths = (await snapshot).docs.map((doc) => {
    const { slug, username } = doc.data();
    return { params: { username, slug } };
  });

  return {
    paths,
    fallback: "blocking",
  };
}

export default function Post(props) {
  const postRef = doc(firestore, props.path);
  const [realtimePost] = useDocumentData(postRef);

  const post = realtimePost || props.post;

  return (
    <main>
      <section>
        <PostContent post={post} />
      </section>

      <aside className="card">
        <p>
          <strong>{post.heartCount || 0} 🤍</strong>
        </p>
      </aside>
    </main>
  );
}

function PostContent({ post }) {
  const createdAt =
    typeof post?.createdAt === "number"
      ? new Date(post.createdAt)
      : post.createdAt.toDate();

  return (
    <div className="card">
      <h1>{post?.title}</h1>
      <span className="text-sm">
        Written by
        <Link href={`/${post.username}`}>
          <p className="text-info">@{post.username}</p>
        </Link>
        on
        {createdAt.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </span>
      <br />
      <ReactMarkdown>{post?.content}</ReactMarkdown>
    </div>
  );
}
