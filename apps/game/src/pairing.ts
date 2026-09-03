import {
  isName,
  type LinkStatus,
  normalizeName,
  ROOM_ALPHABET,
  ROOM_CODE_LENGTH,
} from "@neon-spore/net";

/**
 * The way *back* into a room, for two people who have played before.
 *
 * The four-character code stays the way in the **first** time. It is read
 * aloud, and that is the game: the pair are already talking, and the code is
 * the first sentence of the session. What this removes is the second meeting
 * onwards — two people who have played together should not have to negotiate a
 * code every evening.
 *
 * So a room can be *named for the pair*. `roomForPair` turns two names into
 * the same code wherever in the world they are, which means either of them can
 * open it and the other one lands in it. Both devices remember the pairing, so
 * the menu can offer REJOIN with nobody typing anything.
 *
 * **It does not resume the game.** That was deliberately left off the queue:
 * this removes the code from the second meeting, and nothing else. A rejoined
 * room starts a run the way any room does — with the two presses.
 */

/** How many partners a device remembers. The most recent is the one offered. */
export const PARTNERS_KEPT = 4;
/** The key the browser keeps them under. Namespaced like the others. */
export const PAIRS_KEY = "neon-spore.pairs";

/**
 * FNV-1a over the two names, in a fixed order.
 *
 * Order-independent on purpose: the pair is a pair, not a caller and a
 * callee, so whichever of them opens the room both must arrive at the same
 * four characters. Sorting is what makes that true, and lower-casing is what
 * makes it true for a person who capitalises their own name differently on a
 * different phone.
 */
function hashPair(a: string, b: string): number {
  const key = [a.toLowerCase(), b.toLowerCase()].sort().join("\u0000");
  let h = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/**
 * The room two named people share. "" when either of them has no name.
 *
 * It is an ordinary room code, in the ordinary alphabet, because the server
 * accepts nothing else and this is meant to be client-only past this line.
 * Two different pairs can therefore land on one code — there are about 390 000
 * of them — and what that looks like is the second pair being told the room is
 * full, which the room screen already has a sentence for. The way out is the
 * one that always existed: open a fresh room and read the code aloud.
 */
export function roomForPair(a: string, b: string): string {
  const one = normalizeName(a);
  const two = normalizeName(b);
  // Both have to be names, not merely non-empty: a stored partner is clamped
  // on the way out as well as in, because "some version of this code put it
  // there" is not a promise about which version.
  if (!isName(one) || !isName(two)) return "";
  let hash = hashPair(one, two);
  let out = "";
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    out += ROOM_ALPHABET[hash % ROOM_ALPHABET.length];
    hash = Math.floor(hash / ROOM_ALPHABET.length);
  }
  return out;
}

/**
 * Whatever was stored, read as a list of names. Unreadable means none.
 *
 * Names only: the room the two of you share follows from the pair of names
 * (`roomForPair`) and this device always knows its own, so storing it as well
 * would be a second copy of something derivable — and one that would go stale
 * the day the derivation changed.
 */
export function parsePartners(raw: string | null): string[] {
  if (raw === null) return [];
  try {
    const read = JSON.parse(raw) as unknown;
    if (!Array.isArray(read)) return [];
    return read
      .filter((entry): entry is string => typeof entry === "string")
      .map(normalizeName)
      .filter(isName)
      .slice(0, PARTNERS_KEPT);
  } catch {
    return [];
  }
}

/**
 * The list after playing with `partner`, most recent first.
 *
 * Pure, so the rule can be tested: a partner played with again moves to the
 * front rather than appearing twice, and the list is capped — a device that
 * has played with thirty people does not need to remember twenty-six of them
 * to offer the last one.
 */
export function afterPlayingWith(kept: readonly string[], partner: string): string[] {
  const name = normalizeName(partner);
  if (!isName(name)) return [...kept];
  const rest = kept.filter((held) => held.toLowerCase() !== name.toLowerCase());
  return [name, ...rest].slice(0, PARTNERS_KEPT);
}

/** The partners this device remembers, most recent first. */
export function readPartners(): string[] {
  try {
    return parsePartners(localStorage.getItem(PAIRS_KEY));
  } catch {
    return [];
  }
}

/**
 * Remember that these two played together. Called whenever a room holds two
 * named people, which is idempotent — the same pair every frame is one entry.
 */
export function rememberPartner(partner: string): void {
  const next = afterPlayingWith(readPartners(), partner);
  try {
    localStorage.setItem(PAIRS_KEY, JSON.stringify(next));
  } catch {
    // Nothing to be done: the pair can still read a code to each other, which
    // is what they did before this existed.
  }
}

/**
 * Who this device is playing with right now, or "" when it is playing with
 * nobody it could offer a way back to.
 *
 * Both seats filled and the other one named: a partner with no name cannot be
 * offered by one, and a room with one person in it has no pair to remember.
 * Pure, so the rule is testable — the storing half below only calls it.
 */
export function partnerIn(status: LinkStatus): string {
  if (status.player === 0 || status.peers < 2) return "";
  return status.names[status.player === 1 ? 1 : 0] ?? "";
}

/**
 * Remember the pair this status describes, if it describes one. Called on
 * every repaint, which is idempotent: the same partner every frame is one
 * entry, moved to the front of a list it is already at the front of.
 */
export function rememberFrom(status: LinkStatus): void {
  const partner = partnerIn(status);
  if (partner !== "") rememberPartner(partner);
}
