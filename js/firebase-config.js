// =============================================
// firebase-config.js — Initialize Firebase
// =============================================
// 🔴 REPLACE these values with your own Firebase project config
// Get them from: https://console.firebase.google.com → Project Settings → Your Apps

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCi_tKLEdqsDwoY53uS4JbH6ElWKp9L8CY",
  authDomain: "shopfire-ca22f.firebaseapp.com",
  projectId: "shopfire-ca22f",
  storageBucket: "shopfire-ca22f.firebasestorage.app",
  messagingSenderId: "398658950913",
  appId: "1:398658950913:web:3aa487855dbcb8a8bbad00",
  measurementId: "G-YYQMS3EEXV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();