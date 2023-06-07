import React, { useEffect, useRef, useState } from "react";
import "./App.css";

import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

firebase.initializeApp({
  apiKey: "AIzaSyA9N72liY0tkJX2_S6Acc5v7H3YiI0cvu0",
  authDomain: "cool-chat-a6d35.firebaseapp.com",
  projectId: "cool-chat-a6d35",
  storageBucket: "cool-chat-a6d35.appspot.com",
  messagingSenderId: "749064420129",
  appId: "1:749064420129:web:f0cb0bc445b947a2395c60",
  measurementId: "G-6ZBTN5S12R",
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>Cool Chat!</h1>
          <a href="https://krishwu.com" target="_blank" rel="noopener noreferrer">
            <h2>by Krish Wu</h2>
          </a>
        <SignOut />
      </header>

      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return <button onClick={signInWithGoogle}>Sign in with Google</button>;
}

function SignOut() {
  return (
    auth.currentUser && <button onClick={() => auth.signOut()}>Sign Out</button>
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt");

  const [messages] = useCollectionData(query, { idField: "id" });

  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL, displayName } = auth.currentUser;

    if (formValue !== "") {
      await messagesRef.add({
        text: formValue,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid,
        photoURL,
        displayName,
      });

      setFormValue("");
      dummy.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* <div className="mainContainer"> */}
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}

        <span ref={dummy}></span>
      </main>
      {/* </div> */}

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="CoolChat"
        />

        {/* <button type="submit" disabled={!formValue}>🕊️</button> */}
      </form>
    </>
  );
}

const ReceivedMessage = (props) => {
  const { text, uid, photoURL, displayName } = props.message;

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <>
      <div className={`message ${messageClass}`}>
        <div className="left">
          <img
            src={
              photoURL ||
              "https://api.adorable.io/avatars/23/abott@adorable.png"
            }
          />
        </div>
        <div className="right">
          <p className="userName">{displayName}</p>
          <p className="textContent">{text}</p>
        </div>
      </div>
    </>
  );
};

const SentMessage = (props) => {
  const { text, uid, photoURL, displayName } = props.message;

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <>
      <div className={`message ${messageClass}`}>
        <div className="right">
          <p className="textContent bubbleSent">{text}</p>
        </div>
      </div>
    </>
  );
};

function ChatMessage(props) {
  const { uid } = props.message;
  // messages.scrollTop = messages.scrollHeight

  if (uid === auth.currentUser.uid) {
    return <SentMessage message={props.message} />;
  } else {
    return <ReceivedMessage message={props.message} />;
  }
}

export default App;
