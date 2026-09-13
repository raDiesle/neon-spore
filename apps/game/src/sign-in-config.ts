import type { FirebaseOptions } from "@firebase/app";

/**
 * The Firebase project the game signs in against — the owner's to paste.
 *
 * `null` is a checkout with no project: the sign-in rows stay off the
 * settings page, every name claim is anonymous, and nothing else changes.
 * To turn sign-in on, paste the web app's config from the Firebase console
 * (Project settings → Your apps → SDK setup and configuration) here, enable
 * **Google** and **Email link** under Authentication → Sign-in method, add the
 * game's domain under Authorized domains, and set `FIREBASE_PROJECT` in
 * `wrangler.jsonc` to the same `projectId` — that is what lets the Worker
 * trust the tokens (`apps/server/src/sign-in.ts`).
 *
 * None of this is secret. A Firebase web config identifies a project the way
 * a URL does; what a token proves is proved by Google's signature.
 */
export const SIGN_IN: FirebaseOptions | null = null;
