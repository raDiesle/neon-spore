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
 * space, and drops anything that is not a letter, a digit, one of those spaces
 * or a hyphen; `isName` then holds the result to 3 to 12 characters.
 *
 * **The hyphen is the one piece of punctuation allowed**, added on 13 September
 * 2026 when the game started writing these names where it used to write P1 and
 * P2. Anne-Marie is a name and Anne Marie is a different one, and the rule that
 * threw the hyphen away was the rule for a string nobody but the room ever
 * read. Everything else still goes: a name is said out loud across a voice
 * channel, and a name with a `~` in it cannot be.
 *
 * **Twelve, and the labels are what decide it.** A name is drawn in three
 * places the pair reads mid-wave — the siren's seat chip, a hand's label over a
 * body, and a rehearsal's caption — and all three now *measure* what they are
 * given and grow (`siren-seats.ts`, `grip.ts`, `guide-tide-caption.ts`). What twelve
 * buys is that the widest of them, the chip, still leaves the field's top row
 * visible on a narrow phone: at nine pixels of Courier that is about eighty
 * pixels of pill, and two of them with the dial between comes to a little over
 * half a phone — which is affordable only because the chips are drawn while a
 * call is on and at no other time.
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
 * part of it. One hyphen's worth of punctuation stays, for the reason at the
 * top of this file; everything else goes, because a name is said out loud
 * across a voice channel and a name with a `~` in it cannot be.
 */
export function normalizeName(raw: string): string {
  return raw
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
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
 * holds, and a name whose owner this is not — a signed-in device asking for
 * a name that is bound to a different sign-in.
 *
 * They must read identically. If they did not, this route would be a way to
 * ask which names exist — one guess at a time, told apart by whether the
 * answer said "not yours" or "not anybody's". `apps/server/test/names.test.ts`
 * asserts the two answers are equal, field for field.
 */
export const TAKEN_MESSAGE = "That name is taken. Choose another, or sign in if it is yours.";
