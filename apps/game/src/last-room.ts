import { isRoomCode, normalizeRoomCode } from "@neon-spore/net";

/**
 * **The room this device was in a moment ago.**
 *
 * A phone that reloads loses everything about the room it was standing in: the
 * socket, the seat, the code. The other phone loses none of it — it is still
 * sitting in the room with the field up, waiting — and until this existed the
 * way back was for the pair to *talk about it again*, which is the one thing
 * the four-character code was supposed to have to be said only once.
 * `pairing.ts` removed the code from the second **meeting**; this removes it
 * from a reload in the middle of one.
 *
 * **It is a memory of where this device was, not a claim about the other
 * phone.** Nothing here asks the relay anything, and nothing here could: a
 * device with no socket knows only what it last saw. So the words on the button
 * say what is true — *you were in room ABCD* — and pressing it goes back and
 * finds out. A room that has emptied in the meantime is the room screen's
 * ordinary "waiting for the other phone", which it has always had a line for.
 *
 * **It goes stale**, because a code offered at breakfast for a room that closed
 * last night is worse than no button: it is a button that fails. Half an hour
 * is longer than a pair steps away from a wave and far shorter than a night.
 *
 * **A deliberate leave forgets it.** LEAVE ROOM, and the leave on the card that
 * comes up when the other phone goes quiet, are both somebody saying they are
 * done — offering them the way back in on the next screen would be the app
 * arguing with them.
 */

/** Where the browser keeps it. Namespaced like every other key this app owns. */
export const ROOM_KEY = "neon-spore.room";

/**
 * How long a remembered room is worth offering. Thirty minutes: a pair steps
 * away from a wave for a few of them, and a room nobody has touched for half an
 * hour is one the other phone has almost certainly closed.
 */
export const ROOM_FRESH_MS = 30 * 60_000;

export interface Held {
  room: string;
  at: number;
}

/**
 * What a stored string means, or null — and it is a *function* rather than four
 * lines inside the reader for `progress.ts`'s reason: this test runner has no
 * DOM and therefore no `localStorage`, so the deciding has to be reachable
 * without one.
 *
 * Clamped on the way out as well as on the way in, because "some version of
 * this code put it there" is not a promise about which version, and a room code
 * that is no longer one would be a button that cannot work.
 */
export function parseRoom(raw: string | null): Held | null {
  if (raw === null) return null;
  try {
    const held: unknown = JSON.parse(raw);
    if (typeof held !== "object" || held === null) return null;
    const { room, at } = held as Record<string, unknown>;
    if (typeof room !== "string" || typeof at !== "number" || !Number.isFinite(at)) return null;
    // Asked of the string as it stands rather than of a normalised copy of it.
    // `normalizeRoomCode` throws away every character the alphabet has not got
    // and keeps the first four of what is left, so *ACDEF* normalises to the
    // perfectly valid *ACDE* — a different room, offered under a button that
    // looks right. What this writes is already a code; anything else is a value
    // from a version that stored something else, and there is no offer.
    return isRoomCode(room) ? { room, at } : null;
  } catch {
    // A half-written value refuses to parse, which is "there is no room to go
    // back to" — the same answer a device with nothing stored gives.
    return null;
  }
}

/**
 * The room worth offering, out of what was stored and what time it is now.
 *
 * `now - at` rather than `at > now - fresh`, so a stamp from the **future** —
 * a phone whose clock moved, or one carried across a timezone with a wrong one
 * — reads as stale rather than as eternally fresh.
 */
export function freshRoom(held: Held | null, now: number): string {
  if (held === null) return "";
  const age = now - held.at;
  return age >= 0 && age < ROOM_FRESH_MS ? held.room : "";
}

/**
 * Keep this room, stamped now.
 *
 * Called on every status the room sends rather than once on joining, so the
 * stamp is *when this device was last in the room* rather than when it arrived.
 * A pair an hour into a session that reloads has a fresh stamp; a pair that
 * closed the tab an hour ago does not.
 */
export function rememberRoom(room: string, at: number): void {
  const code = normalizeRoomCode(room);
  if (!isRoomCode(code)) return;
  try {
    localStorage.setItem(ROOM_KEY, JSON.stringify({ room: code, at } satisfies Held));
  } catch {
    // Unstorable, and the run in front of them is unaffected: what is lost is
    // the offer after a reload, which is what a device without storage has.
  }
}

/** Somebody said they were done. Nothing to go back to. */
export function forgetRoom(): void {
  try {
    localStorage.removeItem(ROOM_KEY);
  } catch {
    // Nothing was stored, so nothing is left behind.
  }
}

/** The room worth offering a way back into, or "" for none. */
export function heldRoom(now: number): string {
  try {
    return freshRoom(parseRoom(localStorage.getItem(ROOM_KEY)), now);
  } catch {
    // Private browsing refuses to read. There is no offer, which is where a
    // device without storage stood before this existed.
    return "";
  }
}
