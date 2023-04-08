import { useState } from "react";
import styles from "../../styles/Admin.module.css";
import AuthCheck from "@/components/AuthCheck";
import { useRouter } from "next/router";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, firestore } from "@/lib/firebase";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import Link from "next/link";
import ImageUploader from "@/components/ImageUploader";

export default function AdminPostEdit(props) {
  return (
    <AuthCheck>
      <PostManager />
    </AuthCheck>
  );
}

function PostManager() {
  const [preview, setPreview] = useState(false);

  const router = useRouter();
  const { slug } = router.query;

  const postRef = doc(firestore, "users", auth.currentUser.uid, "posts", slug);
  const [post] = useDocumentData(postRef);

  return (
    <main className={styles.container}>
      {post && (
        <>
          <section>
            <h1>{post.title}</h1>
            <p>ID: {post.slug}</p>
            <ImageUploader />
            <PostForm
              postRef={postRef}
              defaultValues={post}
              preview={preview}
            />
          </section>

          <aside>
            <h3>Tools</h3>
            <button
              onClick={() => {
                setPreview(!preview);
              }}
            >
              {preview ? "Edit" : "Preview"}
            </button>
            <Link
              className="box-center"
              href={`/${post.username}/${post.slug}`}
            >
              <button className="btn-blue">Live View</button>
            </Link>
          </aside>
        </>
      )}
    </main>
  );
}

function PostForm({ postRef, defaultValues, preview }) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty, isValid },
  } = useForm({
    defaultValues,
    mode: "onChange",
  });

  const updatePost = async ({ content, published }) => {
    await updateDoc(postRef, {
      content,
      published,
      updatedAt: serverTimestamp(),
    });
    reset({ content, published });

    toast.success("Succesfully updated post!");
  };

  return (
    <form onSubmit={handleSubmit(updatePost)}>
      {preview && (
        <div className="card">
          <ReactMarkdown>{watch("content")}</ReactMarkdown>
        </div>
      )}

      <div className={preview ? styles.hidden : styles.controls}>
        <textarea
          {...register("content", {
            maxLength: { value: 20000, message: "Content is too long" },
            minLength: { value: 10, message: "Content is too short" },
            required: { value: true, message: "Content is required" },
          })}
        ></textarea>

        {errors.content && (
          <p className="text-danger">{errors.content.message}</p>
        )}

        <fieldset>
          <input
            className={styles.checkbox}
            type="checkbox"
            {...register("published")}
          />
          <label>Published</label>
        </fieldset>
        <button
          type="submit"
          className="btn-green"
          disabled={!isValid || !isDirty}
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}
