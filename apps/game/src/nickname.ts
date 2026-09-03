import { isName, NAME_ROUTE, normalizeName } from "@neon-spore/net";
import { httpOrigin } from "./origin.js";

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
 * It dies with the browser's storage, which is what the recovery code is for.
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

/** What the registry said. `code` arrives once, on a fresh claim only. */
export interface NameClaim {
  ok: boolean;
  name?: string;
  code?: string;
  why?: string;
}

/**
 * Ask the registry for a name, offering a recovery code if one was typed.
 *
 * A network that will not answer is not a refusal: the player keeps the name
 * on this device and plays. Uniqueness is worth having and it is not worth
 * standing between somebody and the game — the room still shows two names, and
 * the worst case is two people called DAVID who can both see that they are.
 */
export async function claimName(raw: string, code = ""): Promise<NameClaim> {
  const name = normalizeName(raw);
  if (!isName(name)) return { ok: false, why: nameProblem(raw) };
  try {
    const res = await fetch(`${httpOrigin()}${NAME_ROUTE}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, token: deviceToken(), code }),
    });
    const answer = (await res.json()) as NameClaim;
    return typeof answer?.ok === "boolean" ? answer : { ok: true, name };
  } catch {
    return { ok: true, name };
  }
}
