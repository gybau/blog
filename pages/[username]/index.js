import UserProfile from "@/components/UserProfile";
import PostFeed from "@/components/PostFeed";
import { firestore, getUserWithUsername, postToJSON } from "@/lib/firebase";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  where,
  query,
} from "firebase/firestore";

export async function getServerSideProps(props) {
  const { username } = props.query;

  let user = null;
  let posts = null;

  let userRef = await getUserWithUsername(username);

  if (!userRef) {
    return {
      notFound: true,
    };
  }

  if (userRef) {
    user = userRef.data();

    const postsRef = collection(userRef.ref, "posts");
    const q = query(
      postsRef,
      where("published", "==", true),
      orderBy("createdAt", "desc"),
      limit(5)
    );
    const querySnapshot = await getDocs(q);

    posts = querySnapshot.docs.map(postToJSON);
  }

  return {
    props: { user, posts },
  };
}

export default function UserProfilePage({ user = {}, posts = {} }) {
  return (
    <main>
      <UserProfile user={user} />
      <PostFeed posts={posts} />
    </main>
  );
}
