import { INTRO_KEY, INTRO_VERSION } from "../../apps/game/src/intro.js";
import { NAME_KEY } from "../../apps/game/src/nickname.js";
import { PAIRS_KEY } from "../../apps/game/src/pairing.js";

/**
 * WHAT THE CAMERA ARRIVES AS: the browser storage a menu shot is taken with.
 *
 * Two screens stand in front of the menu on a first visit — the intro scene
 * (`apps/game/src/intro.ts`) and the question of what this device is called
 * (`apps/game/src/hello.ts`) — and either of them leaves the capture waiting on
 * a hidden `#menu` until it times out. So both are stamped away: the intro's
 * version, and a name. A page whose state *is* a history — the PLAY page's list
 * of people this device has played with — is stamped in the same way, because a
 * camera that has played with nobody photographs an empty page for ever.
 *
 * **Every key is imported from the game rather than typed here.** One that went
 * stale would put a screen back and the failure would look like a broken
 * selector rather than a stale constant.
 *
 * Nothing here opens a browser: `menu-shot.ts` puts the pairs in through
 * `addInitScript` before the first navigation, and this half is a list.
 */

export interface Arrival {
  /**
   * Arrive with no name, which is the one thing that puts the first meeting in
   * front of the menu. The default is past it: nearly every page the camera is
   * pointed at is behind it.
   */
  firstVisit: boolean;
  /**
   * Who this device has played with, most recent first, and how far each pair
   * got — the two halves of a row on the PLAY page.
   */
  partners: readonly Played[];
}

/** One person this device has played with, as the camera arrives having done. */
export interface Played {
  name: string;
  /** The wave the row says, counted the way a person reads it: 1 is the first,
   * and 0 is a pair who have met and not played — which is what an older
   * build's plain name reads as (`apps/game/src/partners.ts`). */
  wave: number;
}

/** The storage a shot arrives with, as the pairs `addInitScript` writes. */
export function arrivalStamps({ firstVisit, partners }: Arrival): [string, string][] {
  return [
    [INTRO_KEY, INTRO_VERSION],
    // A name, unless the shot is of the screen that asks for one. Any name:
    // nothing is drawn from it on the pages this tool photographs, and the
    // registry is never asked, because a stored name is never re-claimed.
    ...(firstVisit ? [] : ([[NAME_KEY, "CAMERA"]] as [string, string][])),
    // And nobody at all unless somebody was asked for: an empty list is a
    // device that has played with nobody, which is what one that has not
    // should look like.
    ...(partners.length === 0
      ? []
      : ([[PAIRS_KEY, JSON.stringify(partners.map(stored))]] as [string, string][])),
  ];
}

/** One of them in the shape the game keeps, wave counted from 0 as it is there. */
function stored(one: Played): { name: string; furthest: number; level: "medium" } {
  return { name: one.name, furthest: Math.max(0, Math.floor(one.wave) - 1), level: "medium" };
}

/**
 * `--partners "Ada,David:7"` into the people it means, in the order given.
 *
 * A bare name is somebody met and not played with, which is the state every
 * older build's storage is in; `:7` is the wave their row will say, in the
 * numbering the row itself uses, because a flag that wanted the wave counted
 * from zero would photograph a row saying one more than it was asked for.
 */
export function parsePartnerFlag(value: string | undefined): Played[] {
  return (value ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part !== "")
    .map((part) => {
      const at = part.indexOf(":");
      if (at < 0) return { name: part, wave: 0 };
      const wave = Number(part.slice(at + 1));
      if (!Number.isFinite(wave)) {
        throw new Error(
          `--partners ${JSON.stringify(part)}: ${JSON.stringify(part.slice(at + 1))} is not a wave`,
        );
      }
      return { name: part.slice(0, at).trim(), wave };
    });
}
