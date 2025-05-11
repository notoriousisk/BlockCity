import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAMU74e30_HpfUrE9jMwQflGbif_b2NlmQ",
  authDomain: "gamified-defi.firebaseapp.com",
  projectId: "gamified-defi",
  storageBucket: "gamified-defi.firebasestorage.app",
  messagingSenderId: "257874942655",
  appId: "1:257874942655:web:8fbdb9858ea5f540ac840a",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
