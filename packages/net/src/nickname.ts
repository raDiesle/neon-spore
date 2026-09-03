/**
 * A player's name: what the other phone calls them.
 *
 * It sits beside `room-code.ts` for the same reason that file exists — both
 * halves of the wire have to agree about what a string means, and a rule
 * written twice is a rule that disagrees with itself. The room carries a name
 * without reading it; the two clients are what draw it, and both clamp what
 * arrives before drawing it.
 *
 * **The rules, decided by the owner on 3 September 2026.** A name is required.
 * `normalizeName` trims the ends, collapses any run of inner whitespace to one
 * space, and drops anything that is not a letter, a digit or one of those
 * spaces; `isName` then holds the result to 3 to 12 characters. Twelve because
 * a seat pill on a narrow phone is what has to hold it.
 *
 * Drawn upper case by CSS rather than stored that way: what is stored is what
 * was typed, so a person who writes "David" is not told the game thinks their
 * name is DAVID.
 */

/** The shortest name worth having. Two characters is initials, not a name. */
export const NAME_MIN = 3;
/** The longest a seat pill on a narrow phone can hold. */
export const NAME_MAX = 12;

/**
 * What somebody typed, turned into what they meant.
 *
 * Letters and digits from **any** script, not just the Latin alphabet: the
 * design vocabulary of this game is English and a player's own name is not
 * part of it. Punctuation and symbols go, because a name is said out loud
 * across a voice channel and a name with a `~` in it cannot be.
 */
export function normalizeName(raw: string): string {
  return raw
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/gu, " ")
    .trim();
}

/** Whether a normalized name is one. Call `normalizeName` first. */
export function isName(name: string): boolean {
  return name.length >= NAME_MIN && name.length <= NAME_MAX;
}

/**
 * A name off the wire, or "" for anything that is not one.
 *
 * The distrusting half: a name arrives as a string somebody else's device
 * sent, and it is clamped by the same rules this device's own name obeys
 * before it is ever drawn. "" is the honest answer for a peer that has not
 * given one, and every screen already has a word for that seat without a name.
 */
export function nameFromWire(value: unknown): string {
  if (typeof value !== "string") return "";
  const name = normalizeName(value);
  return isName(name) ? name : "";
}

/**
 * The one sentence for both refusals a claim can meet: a name somebody else
 * holds, and a name whose recovery code was wrong.
 *
 * They must read identically. If they did not, this route would be a way to
 * ask which names exist — one guess at a time, told apart by whether the
 * answer said "wrong code" or "not yours". `apps/server/test/names.test.ts`
 * asserts the two answers are equal, field for field.
 */
export const TAKEN_MESSAGE = "That name is taken. Choose another, or type its recovery code.";
