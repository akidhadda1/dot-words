import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

// Sanitize key for Firestore document ID (no slashes)
function docKey(key) {
  return key.replace(/[/:]/g, "_");
}

/**
 * Get a value from storage.
 * shared=true  -> Firestore (visible to all players)
 * shared=false -> localStorage (this device only)
 */
export async function sGet(key, shared) {
  if (shared) {
    try {
      const snap = await getDoc(doc(db, "dotwords", docKey(key)));
      return snap.exists() ? snap.data().value : null;
    } catch (e) {
      console.warn("Firestore read failed, falling back to localStorage:", e);
      return localStorage.getItem(key) ?? null;
    }
  } else {
    return localStorage.getItem(key) ?? null;
  }
}

/**
 * Set a value in storage.
 * shared=true  -> Firestore
 * shared=false -> localStorage
 */
export async function sSet(key, value, shared) {
  if (shared) {
    try {
      await setDoc(doc(db, "dotwords", docKey(key)), { value, updatedAt: Date.now() });
    } catch (e) {
      console.warn("Firestore write failed, falling back to localStorage:", e);
      localStorage.setItem(key, value);
    }
  } else {
    localStorage.setItem(key, value);
  }
}
