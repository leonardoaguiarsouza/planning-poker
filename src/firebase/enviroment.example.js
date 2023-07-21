import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// adicionar os dados do seu projeto do firebase
const firebaseConfig = {
  apiKey: "xxxxxxxxxxx",
  authDomain: "xxxxxxxxxxx",
  projectId: "xxxxxxxxxxx",
  storageBucket: "xxxxxxxxxxx",
  messagingSenderId: "xxxxxxxxxxx",
  appId: "xxxxxxxxxxx"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {
  db
}