// =============================================
// auth.js — Email & Google Authentication
// =============================================
import { auth, googleProvider } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ── Auth State Observer ──────────────────────
export function watchAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

// ── Register with Email ──────────────────────
export async function registerWithEmail(name, email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  return cred.user;
}

// ── Login with Email ─────────────────────────
export async function loginWithEmail(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

// ── Login with Google ────────────────────────
export async function loginWithGoogle() {
  const cred = await signInWithPopup(auth, googleProvider);
  return cred.user;
}

// ── Sign Out ─────────────────────────────────
export async function logout() {
  await signOut(auth);
  window.location.href = "auth.html";
}

// ── Guard: redirect if not logged in ─────────
export function requireAuth() {
  onAuthStateChanged(auth, (user) => {
    if (!user) window.location.href = "auth.html";
  });
}

// ── Guard: redirect if already logged in ─────
export function redirectIfAuth(dest = "products.html") {
  onAuthStateChanged(auth, (user) => {
    if (user) window.location.href = dest;
  });
}
