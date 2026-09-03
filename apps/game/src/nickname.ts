import { isName, normalizeName } from "@neon-spore/net";

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
