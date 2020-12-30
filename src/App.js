import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useRef, useState } from 'react';

import googleIcon from './google.png';
import githubIcon from './github.png';

firebase.initializeApp({
 
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  const signIn = async (event) => {
    event.preventDefault();
    try {
      await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
      alert('Erro ao realizar login')
    }

  }

  return (
    <div className="login">
      {/* <form>
        <input className="form-input" placeholder="E-mail" type="email" onChange={e => setEmail(e.target.value)} />
        <input className="form-input" placeholder="Senha" type="password" onChange={e => setPassword(e.target.value)} />
        <button onClick={signIn}>Sign in</button>
      </form> */}
      <h1>Chat with Firebase</h1>
      <button className="signInWith" onClick={signInWithGoogle}>
        Sign in with Google
        <img height={30} src={googleIcon} />
      </button>
      <button className="signInWith" disabled>
        Sign in with GitHub
        <img height={30} src={githubIcon} />
      </button>
    </div>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button className="signOut" onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="container">
      <SignOut />
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />
        <button type="submit" disabled={!formValue}>🕊️</button>
      </form>
    </div>
  )
}

function ChatMessage(props) {

  const { text, uid, photoURL } = props.message;

  const messageClass = uid == auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} />
      <p>{text}</p>
    </div>
  )
}

export default App;
