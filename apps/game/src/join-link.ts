import {
  isRoomCode,
  normalizeRoomCode,
  ROOM_CODE_LENGTH,
  roomCodeFromBytes,
} from "@neon-spore/net";

/**
 * A room's code, and the two things that happen to one on a phone: it is drawn
 * fresh, or read off the address the page was opened on. The screen that shows
 * it is `join.ts`. Its own file because a code has nothing to do with a chip or
 * a sheet, and because `roomRequested` is a rule with a test
 * (`join-link.test.ts`) while the screen is a DOM binding without one.
 *
 * **It used to write a link as well, and hand it over with the share sheet.**
 * SEND LINK is off the room screen: the code is said down a voice call the pair
 * are already on, and a second way to deliver it was a button on the one screen
 * that had to be short enough to read aloud. A link *into* a room still works —
 * `roomRequested` is what reads it — because that is how somebody sent one
 * yesterday gets in; nothing in the app makes one any more.
 */

/** Four characters of real randomness. The browser's, never the simulation's. */
export function freshCode(): string {
  const bytes = new Uint8Array(ROOM_CODE_LENGTH);
  crypto.getRandomValues(bytes);
  return roomCodeFromBytes(bytes);
}

/**
 * The room a link was opened on, or "" for none. Pure, so the rule can be
 * tested the way `opensOnMenu` is.
 *
 * A code is still the way in and a link is only a way to deliver one, so this
 * accepts nothing a person could not have typed: the code goes through
 * `normalizeRoomCode` and is refused unless it is a whole one, which keeps a
 * mistyped or truncated address out of a room rather than into a wrong one.
 */
export function roomRequested(url: string): string {
  const given = new URL(url, "http://game.invalid/").searchParams.get(ROOM_PARAM);
  if (!given) return "";
  const code = normalizeRoomCode(given);
  return isRoomCode(code) ? code : "";
}

const ROOM_PARAM = "room";
