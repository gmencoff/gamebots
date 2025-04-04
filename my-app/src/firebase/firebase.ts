// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDma23sqTWmwWz4aK7NLOMa1NKPggv_FWA",
  authDomain: "game-bot-f6c53.firebaseapp.com",
  projectId: "game-bot-f6c53",
  storageBucket: "game-bot-f6c53.firebasestorage.app",
  messagingSenderId: "478147115998",
  appId: "1:478147115998:web:c8e69bbc7a79080786bb4f",
  measurementId: "G-CE9PJV5WQM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

export { app, auth, firestore };