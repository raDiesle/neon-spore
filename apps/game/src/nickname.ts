import { isName, NAME_MINE_ROUTE, NAME_ROUTE, normalizeName } from "@neon-spore/net";
import { httpOrigin } from "./origin.js";
import { idToken } from "./sign-in.js";

/**
 * This device's player name: asked once, kept here, carried into every room.
 *
 * The *rules* about what a name may be live in `@neon-spore/net` beside the
 * room code's, because both ends of the wire have to agree about them. What
 * is here is the device's own half: where the name is kept, and the fact that
 * the room screen does not continue without one.
 *
 * **Asked once.** The first time a device reaches the room screen with nothing
 * stored, it asks; after that the name is simply shown. Changing it lives on
 * the settings page — "things about me" belongs in one durable place, and it
 * keeps this screen down to asking a first-timer.
 *
 * What is stored is what was typed. The UI draws it upper case in CSS, so a
 * person who writes "David" is not told the game thinks their name is DAVID.
 */

/** The key the browser keeps it under. Namespaced like the others. */
export const NAME_KEY = "neon-spore.name";
/**
 * The key this device is known by at the registry.
 *
 * Generated here, kept here, and sent with every claim: it is what makes a
 * returning device the same device, so re-claiming the name it already holds
 * answers yes rather than "taken". It is not an account and identifies nobody
 * — it is a random string this browser happens to remember.
 *
 * It dies with the browser's storage, which is what a sign-in is for
 * (`sign-in.ts`): a name claimed under one is given back to whichever device
 * signs in as that person next.
 */
export const TOKEN_KEY = "neon-spore.token";

/** The stored name, or "" for a device that has never given one. */
export function readName(): string {
  try {
    const stored = localStorage.getItem(NAME_KEY);
    // Clamped on the way out as well as in: what is in storage was put there
    // by some version of this code, and "some version" is not a promise.
    const name = normalizeName(stored ?? "");
    return isName(name) ? name : "";
  } catch {
    // Private browsing refuses to store. The player is asked again, which is
    // the right answer — it is the only one that still lets them play.
    return "";
  }
}

/** Fired on `document` whenever the name changes, for what draws it (`menu-who.ts`). */
export const NAME_EVENT = "neon-spore:name";

/**
 * Keep a name. Answers whether it was one — a caller that gets `false` has a
 * player still standing in front of the field, and must say why.
 */
export function writeName(raw: string): boolean {
  const name = normalizeName(raw);
  if (!isName(name)) return false;
  try {
    localStorage.setItem(NAME_KEY, name);
  } catch {
    // Unstorable, but not unusable: the run in front of them still gets the
    // name, and the next visit asks again.
  }
  if (typeof document !== "undefined") document.dispatchEvent(new Event(NAME_EVENT));
  return true;
}

/** Whether this device has a name yet. The room screen asks when it has not. */
export function hasName(): boolean {
  return readName() !== "";
}

/** Why a typed name was refused, in a sentence, or "" when it was not. */
export function nameProblem(raw: string): string {
  const name = normalizeName(raw);
  if (name === "") return "A name, so the other phone knows who you are.";
  if (!isName(name)) return "Three to twelve letters, so it fits on a seat.";
  return "";
}

/**
 * This device's token, minted on first use.
 *
 * A device that cannot store one gets a fresh token every time, which means it
 * can claim a free name and never re-claim it. That is the honest behaviour
 * for a private window: the name is theirs for the session and held by nobody
 * afterwards.
 */
export function deviceToken(): string {
  try {
    const held = localStorage.getItem(TOKEN_KEY);
    if (held && held.length >= 16) return held;
  } catch {
    // Unreadable storage. Fall through and mint one for this session.
  }
  const minted = [...crypto.getRandomValues(new Uint8Array(16))]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  try {
    localStorage.setItem(TOKEN_KEY, minted);
  } catch {
    // Nothing to be done; see above.
  }
  return minted;
}

/** What the registry said. */
export interface NameClaim {
  ok: boolean;
  name?: string;
  why?: string;
}

/**
 * Ask the registry for a name, signed by whoever is signed in.
 *
 * A network that will not answer is not a refusal: the player keeps the name
 * on this device and plays. Uniqueness is worth having and it is not worth
 * standing between somebody and the game — the room still shows two names, and
 * the worst case is two people called DAVID who can both see that they are.
 */
export async function claimName(raw: string): Promise<NameClaim> {
  const name = normalizeName(raw);
  if (!isName(name)) return { ok: false, why: nameProblem(raw) };
  try {
    const answer = await ask(NAME_ROUTE, { name });
    return typeof answer?.ok === "boolean" ? answer : { ok: true, name };
  } catch {
    return { ok: true, name };
  }
}

/**
 * After a sign-in: the name this person already holds wins and is written
 * here, so a new phone is told the name rather than asked for it; a person
 * with no name yet has the device's own bound to them by claiming it again,
 * now signed. Nothing to do while nobody is signed in.
 */
export async function syncName(): Promise<void> {
  if ((await idToken()) === "") return;
  try {
    const mine = await ask(NAME_MINE_ROUTE, {});
    if (mine.ok && mine.name) {
      writeName(mine.name);
      return;
    }
  } catch {
    return;
  }
  if (hasName()) await claimName(readName());
}

/** One question to the registry, with this device's token and its sign-in. */
async function ask(route: string, body: Record<string, string>): Promise<NameClaim> {
  const res = await fetch(`${httpOrigin()}${route}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...body, token: deviceToken(), idToken: await idToken() }),
  });
  return (await res.json()) as NameClaim;
}
