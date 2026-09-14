import {
  isRoomCode,
  normalizeRoomCode,
  ROOM_CODE_LENGTH,
  roomCodeFromBytes,
} from "@neon-spore/net";

/**
 * A room's code, and the four things that happen to one on a phone: it is
 * drawn fresh, read off the address the page was opened on, written into an
 * address the other phone can tap, and handed over by whatever the handset
 * has. The screen that shows it is `join.ts`. Its own file because a code has
 * nothing to do with a chip or a sheet, and because `roomRequested` is a rule
 * with a test (`join-link.test.ts`) while the screen is a DOM binding without
 * one.
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

/** The address that opens this room, for a message the other phone can tap. */
export function roomLink(room: string): string {
  const url = new URL(location.href);
  url.hash = "";
  url.search = "";
  url.searchParams.set(ROOM_PARAM, room);
  return url.href;
}

/**
 * Hand the room to the other phone by whatever the handset has. The share
 * sheet where there is one — that is the Android path and the one that
 * matters — the clipboard where there is not, and the plain address where
 * neither is allowed, because a code that cannot be copied can still be read.
 */
export async function shareRoom(room: string): Promise<string> {
  const url = roomLink(room);
  try {
    if (navigator.share) {
      await navigator.share({ title: "Neon Spore", text: `Room ${room}`, url });
      return `Sent. Room ${room}.`;
    }
    await navigator.clipboard.writeText(url);
    return `Link copied. Room ${room}.`;
  } catch {
    // A share sheet the player dismissed, or a clipboard the browser refused.
    // Neither is a failure worth a red word: the address is right there.
    return url;
  }
}
