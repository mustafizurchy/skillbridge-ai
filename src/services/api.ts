import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
const configured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID,
);
const auth = configured
  ? getAuth(
      initializeApp({
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      }),
    )
  : null;
let csrf = "";
export const setCsrf = (value: string) => {
  csrf = value;
};
const ready = auth
  ? new Promise<void>((resolve) => {
      const stop = onAuthStateChanged(auth, () => {
        stop();
        resolve();
      });
    })
  : Promise.resolve();
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function api<T>(
  url: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  await ready;
  const token = await auth?.currentUser?.getIdToken();
  const response = await fetch(`/api${url}`, {
    method,
    signal: AbortSignal.timeout(25000),
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : { "X-CSRF-Token": csrf }),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result)
    throw new ApiError(
      response.status,
      result?.error?.message ?? "Request failed. Please retry.",
    );
  return result.data as T;
}
export async function login() {
  if (!auth)
    throw new Error(
      "Google Sign-In needs Firebase configuration. You can explore the judge demo now.",
    );
  await signInWithPopup(auth, new GoogleAuthProvider());
}
export async function logout() {
  await api("/session/logout", "POST", {});
  if (auth) await signOut(auth);
}
export async function demo() {
  if (auth?.currentUser) await signOut(auth);
  await api("/demo/session", "POST", {});
}
