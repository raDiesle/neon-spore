import type { FirebaseOptions } from "@firebase/app";

/**
 * The Firebase project the game signs in against — pasted by the owner on
 * 13 September 2026 from the console (Project settings → Your apps → SDK
 * setup and configuration).
 *
 * `null` would be a checkout with no project: the sign-in rows stay off the
 * settings page, every name claim is anonymous, and nothing else changes.
 * What goes with the config lives elsewhere: **Google** and **Email link**
 * enabled under Authentication → Sign-in method, the game's domain under
 * Authorized domains, and `FIREBASE_PROJECT` in `wrangler.jsonc` set to the
 * same `projectId` — that is what lets the Worker trust the tokens
 * (`apps/server/src/sign-in.ts`).
 *
 * None of this is secret. A Firebase web config identifies a project the way
 * a URL does; what a token proves is proved by Google's signature.
 */
export const SIGN_IN: FirebaseOptions | null = {
  apiKey: "AIzaSyAV_IDEvZPyFZPAcJxLRf5nNxkd02-OYH4",
  authDomain: "neon-spore.firebaseapp.com",
  projectId: "neon-spore",
  storageBucket: "neon-spore.firebasestorage.app",
  messagingSenderId: "902281501359",
  appId: "1:902281501359:web:10659b3860bc089a7b525a",
  measurementId: "G-GLFLN479F1",
};
