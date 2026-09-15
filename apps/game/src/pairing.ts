import {
  isName,
  type LinkStatus,
  normalizeName,
  ROOM_ALPHABET,
  ROOM_CODE_LENGTH,
} from "@neon-spore/net";
import type { Difficulty } from "@neon-spore/sim";
import { readName } from "./nickname.js";
import { afterPlayingWith, afterReaching, type Partner, parsePartners } from "./partners.js";

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
 * **What is remembered about each of them is a record and not a name** — the
 * wave the two of them reached and the tempo they played it at, so the PLAY
 * page can offer *Continue game with David · wave 7* rather than a name on its
 * own. The record and its rules are `partners.ts`; this file is the key, the
 * room a pair share, and the reading and writing.
 *
 * **It still does not resume the game.** A rejoined room starts a run the way
 * any room does — the wave is what the row offers to go back to, and the two
 * presses are what start it.
 */

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

/** The partners this device remembers, most recent first. */
export function readPartners(): Partner[] {
  try {
    return parsePartners(localStorage.getItem(PAIRS_KEY));
  } catch {
    return [];
  }
}

function writePartners(next: readonly Partner[]): void {
  try {
    localStorage.setItem(PAIRS_KEY, JSON.stringify(next));
  } catch {
    // Nothing to be done: the pair can still read a code to each other, which
    // is what they did before this existed.
  }
}

/**
 * Remember that these two played together. Called whenever a room holds two
 * named people, which is idempotent — the same pair every frame is one entry.
 */
export function rememberPartner(partner: string, level: Difficulty | null = null): void {
  writePartners(afterPlayingWith(readPartners(), partner, level));
}

/**
 * **The people this device can carry on with**, most recent first, each with
 * the room the two of them share.
 *
 * Derived rather than stored, for `roomForPair`'s reason, and read on every
 * paint of the PLAY page: the list grows the moment a room holds two named
 * people, and that page is often up when it does.
 *
 * A partner this device shares no room with is not on it at all — that is a
 * device which has not given its own name yet, and a row that cannot be
 * pressed is worse than no row.
 */
export function pairsHere(): (Partner & { room: string })[] {
  const mine = readName();
  if (mine === "") return [];
  return readPartners()
    .map((one) => ({ ...one, room: roomForPair(mine, one.name) }))
    .filter((one) => one.room !== "");
}

/**
 * **A NEW GAME with somebody this device has played with before**: their record
 * starts again, at whatever tempo the new room settles on.
 *
 * The owner, 15 September 2026: a game that already exists does not change its
 * difficulty, and NEW GAME is the way to another — a clear-and-start-over,
 * rare on purpose. So the wave the two of them had reached goes with the game
 * it was reached in, rather than standing on a row beside a tempo they are no
 * longer playing at. Called once per room made, by the screen that made it
 * (`join.ts`), and never by a rejoin.
 */
export function startOverWith(partner: string, level: Difficulty | null): void {
  writePartners(afterPlayingWith(readPartners(), partner, level, true));
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
 * **Who the last status said is in the other seat**, and the one thing this
 * module holds that is not in storage.
 *
 * A wave is reached in `waves.ts`, which knows the number and has no link to
 * ask who it was reached with; the status that does know arrives on the room
 * screen's own repaint (`join.ts`). Rather than thread a link through wave
 * progression for one string, the last status seen leaves it here — and takes
 * it away again the moment a status says this device is on its own, so a solo
 * run cannot write a wave against the person played with last night.
 */
let playingWith = "";

/**
 * Remember the pair this status describes, if it describes one. Called on
 * every repaint, which is idempotent: the same partner every frame is one
 * entry, moved to the front of a list it is already at the front of.
 */
export function rememberFrom(status: LinkStatus): void {
  const partner = partnerIn(status);
  playingWith = partner;
  if (partner !== "") rememberPartner(partner, status.level);
}

/**
 * The wave the pair have got to, written against the partner this device is
 * playing with. Nothing at all off the wire: a run with nobody in the other
 * seat is this device's own, and `progress.ts` is where that is kept.
 */
export function reachedWith(wave: number): void {
  if (playingWith === "") return;
  writePartners(afterReaching(readPartners(), playingWith, wave));
}
