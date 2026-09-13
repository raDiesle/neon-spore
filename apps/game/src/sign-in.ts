import { initializeApp } from "@firebase/app";
import {
  type Auth,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  getAuth,
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithPopup,
} from "@firebase/auth";
import { SIGN_IN } from "./sign-in-config.js";

/**
 * Who is holding this phone, proved by Google or by an email link.
 *
 * The game does not need a sign-in to be played: a name is claimed by the
 * device's own token (`nickname.ts`) and that is enough for the other phone
 * to say who is in the other seat. What a sign-in buys is that the name
 * survives the phone — a new handset, cleared site data, a stolen one — and
 * so it is offered *after* the name, on the settings page, and never stands
 * in front of the field. Decided by the owner on 13 September 2026: Firebase
 * Auth, Google and an email link now, Apple later, anonymous first.
 *
 * **This file is the only one that knows Firebase.** The rest of the app asks
 * three things of it: whether somebody is signed in and as what, the ID
 * token to send with a name claim, and a way to be told when that changes.
 * The registry (`apps/server/src/names.ts`) binds a name to the token's
 * `sub`; nothing here talks to the Worker.
 *
 * **Nothing happens on a checkout without a project.** `SIGN_IN` is `null`
 * until the owner pastes the config, and every function here answers as if
 * nobody could sign in — which is the truth.
 */

/** The email the link was sent to, kept until the link is opened. */
export const EMAIL_KEY = "neon-spore.email";

let auth: Auth | null = null;
const listeners = new Set<() => void>();

/** Whether this build can sign anybody in at all. */
export function signInConfigured(): boolean {
  return SIGN_IN !== null;
}

/**
 * The Firebase client, made on first use.
 *
 * The first use is the menu drawing the PLAY page, which is also the moment
 * a link in the mail is finished: the page the link opens is this one, and
 * its address says whether it was reached by a link.
 */
function ready(): Auth | null {
  if (auth || !SIGN_IN) return auth;
  auth = getAuth(initializeApp(SIGN_IN));
  onAuthStateChanged(auth, () => {
    for (const cb of listeners) cb();
  });
  void finishEmailLink(auth);
  return auth;
}

/** Be told whenever who is signed in changes. */
export function onSignIn(cb: () => void): void {
  listeners.add(cb);
  ready();
}

/** Whether somebody is signed in. */
export function signedIn(): boolean {
  return ready()?.currentUser != null;
}

/** What to call the sign-in: the email, or GOOGLE when there is none to show. */
export function signedInAs(): string {
  const user = ready()?.currentUser;
  if (!user) return "";
  return user.email ?? "Google";
}

/** The token that proves it to the registry, or "" when nobody is signed in. */
export async function idToken(): Promise<string> {
  const user = ready()?.currentUser;
  if (!user) return "";
  try {
    return await user.getIdToken();
  } catch {
    return "";
  }
}

/** Google's own chooser, in a popup, from a press on our own button. */
export async function signInWithGoogle(): Promise<string> {
  const a = ready();
  if (!a) return "This build has no sign-in.";
  try {
    await signInWithPopup(a, new GoogleAuthProvider());
    return "";
  } catch {
    return "Google did not sign you in. Try again.";
  }
}

/**
 * A link to this page, sent to `email` by Firebase — no mail sender of our
 * own. The address is kept so the link can be finished without asking for it
 * again; a link opened on another device asks (`finishEmailLink`).
 */
export async function sendEmailLink(email: string): Promise<string> {
  const a = ready();
  if (!a) return "This build has no sign-in.";
  const to = email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to))
    return "An email address, so the link has somewhere to go.";
  try {
    await sendSignInLinkToEmail(a, to, {
      url: `${location.origin}${location.pathname}`,
      handleCodeInApp: true,
    });
    keepEmail(to);
    return "";
  } catch {
    return "The link could not be sent. Try again in a moment.";
  }
}

/** Whether this page was opened by a link in the mail, still unfinished. */
export function linkPending(): boolean {
  const a = ready();
  return a != null && isSignInWithEmailLink(a, location.href) && !a.currentUser;
}

/**
 * Finish a link. With `email` given it is the address typed on the settings
 * page — the case of a link opened on a phone that did not send it; without,
 * the one kept when it was sent. The link is taken off the address bar either
 * way, so a reload is a reload and not a second attempt at a spent link.
 */
export async function finishEmailLink(a: Auth | null = ready(), email = ""): Promise<string> {
  if (!a || !isSignInWithEmailLink(a, location.href)) return "";
  const to = email.trim() || heldEmail();
  if (to === "") return "Type the email the link was sent to.";
  try {
    await signInWithEmailLink(a, to, location.href);
    history.replaceState(null, "", location.pathname);
    return "";
  } catch {
    return "That link did not sign you in — it may be spent. Send another.";
  }
}

export async function signOut(): Promise<void> {
  const a = ready();
  if (a) await firebaseSignOut(a);
  keepEmail("");
}

function heldEmail(): string {
  try {
    return localStorage.getItem(EMAIL_KEY) ?? "";
  } catch {
    return "";
  }
}

function keepEmail(email: string): void {
  try {
    if (email === "") localStorage.removeItem(EMAIL_KEY);
    else localStorage.setItem(EMAIL_KEY, email);
  } catch {
    // Unstorable. The link asks for the address instead.
  }
}
