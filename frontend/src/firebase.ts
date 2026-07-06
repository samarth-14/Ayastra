import { initializeApp, FirebaseError } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, deleteUser } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Fail loud if the .env wasn't loaded (missing/undefined values cause
// auth/invalid-api-key at call time, which is easy to misdiagnose). If you see
// this, check frontend/.env for VITE_FIREBASE_* and RESTART the Vite dev server.
const missingConfig = Object.entries(firebaseConfig)
  .filter(([, v]) => !v)
  .map(([k]) => k);
if (missingConfig.length) {
  console.error(
    "[Firebase] Missing config values:", missingConfig,
    "\nCheck frontend/.env (VITE_FIREBASE_*) and restart `vite` — env vars are read at startup.",
  );
} else {
  console.info(
    "[Firebase] Initialised project:", firebaseConfig.projectId,
    "authDomain:", firebaseConfig.authDomain,
  );
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

/* ── Firebase Auth error handling ──────────────────────────────────────────
   Firebase throws `FirebaseError` with `.code` (e.g. "auth/operation-not-allowed")
   and `.message` — it has NO `error.response.data.detail` (that is an axios /
   backend shape). Always branch on `error.code` for Firebase failures. */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/email-already-in-use": "An account with this email already exists — try signing in instead.",
  "auth/invalid-email": "That email address is not valid.",
  "auth/missing-password": "Please enter a password.",
  "auth/weak-password": "Password is too weak — use at least 6 characters.",
  "auth/operation-not-allowed": "Email/Password sign-up is disabled for this Firebase project. Enable it in Firebase Console → Authentication → Sign-in method → Email/Password.",
  "auth/invalid-api-key": "Firebase API key is invalid or missing. Check the VITE_FIREBASE_* values in frontend/.env and restart the dev server.",
  "auth/api-key-not-valid": "Firebase API key is invalid or missing. Check the VITE_FIREBASE_* values in frontend/.env and restart the dev server.",
  "auth/network-request-failed": "Could not reach Firebase. Check your internet connection, VPN, ad-blocker or firewall.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
  "auth/internal-error": "Firebase returned an internal error. Please try again.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/user-not-found": "No account found with those credentials.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/invalid-credential": "Incorrect email or password.",
};

/**
 * Describe any Firebase Auth error. Returns null when `error` is NOT a
 * FirebaseError, so callers can fall back to backend/axios handling.
 * Also logs the full error object plus `code` and `message` for diagnosis.
 */
export function describeFirebaseAuthError(
  error: unknown,
  context = "firebase-auth",
): { code: string; message: string; userMessage: string } | null {
  if (error instanceof FirebaseError) {
    // Full diagnostic dump — the real code the previous handler was hiding.
    console.error(`[${context}] Firebase error (full object):`, error);
    console.error(`[${context}] error.code:`, error.code);
    console.error(`[${context}] error.message:`, error.message);
    return {
      code: error.code,
      message: error.message,
      userMessage: AUTH_ERROR_MESSAGES[error.code] ?? `Authentication failed (${error.code}). ${error.message}`,
    };
  }
  return null;
}

export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export const signInWithEmail = async (email: string, password: string) => {
  const cleanEmail = email.trim();
  // Verify the exact values being sent to Firebase (never log the raw password).
  console.debug("[Firebase] signInWithEmailAndPassword →", { email: cleanEmail, passwordLength: password.length });
  const result = await signInWithEmailAndPassword(auth, cleanEmail, password);
  return result.user;
};

export const signUpWithEmail = async (email: string, password: string) => {
  const cleanEmail = email.trim();
  // Verify the exact values being sent to Firebase (never log the raw password).
  console.debug("[Firebase] createUserWithEmailAndPassword →", { email: cleanEmail, passwordLength: password.length });
  const result = await createUserWithEmailAndPassword(auth, cleanEmail, password);
  return result.user;
};

export const firebaseSignOut = async () => {
  await signOut(auth);
  localStorage.clear();
};

/**
 * Roll back a just-created Firebase user. Signup is a two-phase write
 * (Firebase, then our backend); if the backend phase fails we must delete the
 * orphaned Firebase account, otherwise the next attempt throws
 * auth/email-already-in-use even though no real account exists. Best-effort:
 * never throws, so it can't mask the original backend error.
 */
export const deleteCurrentFirebaseUser = async () => {
  const user = auth.currentUser;
  if (!user) return;
  try {
    await deleteUser(user);
    console.warn("[Firebase] Rolled back orphaned user after backend failure:", user.email);
  } catch (e) {
    // deleteUser can require recent login; fall back to signOut so at least the
    // client session is cleared. Surface it for manual cleanup.
    console.error("[Firebase] Rollback delete failed — orphaned user may remain:", user.email, e);
    try { await signOut(auth); } catch { /* ignore */ }
  }
};