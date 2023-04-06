import { UserContext } from "@/lib/context";
import { auth, firestore, googleProvider } from "@/lib/firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, writeBatch } from "firebase/firestore";
import { useCallback, useContext, useEffect, useState } from "react";
import debounce from "lodash.debounce";

export default function Enter({}) {
  const { user, username } = useContext(UserContext);

  function UsernameForm() {
    const [formValue, setFormValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [isValid, setIsValid] = useState(false);

    const onSubmit = async (e) => {
      e.preventDefault();

      const userDocRef = doc(firestore, `users/${user.uid}`);
      const usernameDocRef = doc(firestore, `usernames/${formValue}`);

      const batch = writeBatch(firestore);

      batch.set(userDocRef, {
        displayName: user.displayName,
        photoURL: user.photoURL,
        username: formValue,
      });
      batch.set(usernameDocRef, { uid: user.uid });

      try {
        await batch.commit();
      } catch (error) {
        console.log(error);
      }
    };

    const onChange = (e) => {
      const val = e.target.value.toLowerCase();
      const re = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/;

      if (val.length < 3) {
        setFormValue(val);
        setLoading(false);
        setIsValid(false);
      }

      if (re.test(val)) {
        setFormValue(val);
        setLoading(true);
        setIsValid(false);
      }
    };

    useEffect(() => {
      checkUsername(formValue);
    }, [formValue]);

    const checkUsername = useCallback(
      debounce(async (username) => {
        if (username.length >= 3) {
          const ref = doc(firestore, `usernames/${username}`);
          const docSnap = await getDoc(ref);
          const exists = docSnap.exists();
          console.log("Firestore read executed");
          setIsValid(!exists);
          setLoading(false);
        }
      }, 500),
      []
    );

    return (
      <section>
        <form onSubmit={onSubmit}>
          <input
            name="username"
            placeholder="myname"
            value={formValue}
            onChange={onChange}
          ></input>
          <UsernameMessage
            username={formValue}
            isValid={isValid}
            loading={loading}
          />
          <button type="submit" className="btn-green" disabled={!isValid}>
            Submit
          </button>
          <h3> Debug state</h3>
          <div>
            Username: {formValue}
            <br />
            Loading: {loading.toString()}
            <br />
            Username valid: {isValid.toString()}
          </div>
        </form>
      </section>
    );
  }

  return (
    <main>
      {user ? (
        !username ? (
          <UsernameForm />
        ) : (
          <SignOutButton />
        )
      ) : (
        <SignInButton />
      )}
    </main>
  );
}

function SignInButton() {
  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  return (
    <button className="btn-google" onClick={signInWithGoogle}>
      <img src="/google.png" />
      Sign in with Google
    </button>
  );
}

function SignOutButton() {
  return (
    <button
      className="btn-blue"
      onClick={async () => {
        await signOut(auth);
      }}
    >
      Sign Out
    </button>
  );
}

function UsernameMessage({ username, isValid, loading }) {
  if (loading) {
    return <p>Checking...</p>;
  } else if (isValid) {
    return <p className="text-success">{username} is available!</p>;
  } else if (username && !isValid) {
    return <p className="text-danger">That username is taken!</p>;
  } else {
    return <p></p>;
  }
}
