import { flipSeat, type World } from "@neon-spore/sim";
import { type Layout, tileCX } from "./layout.js";
import { flipsField } from "./view-role.js";

/**
 * THE FLIP, as a screen sees it: **this field is drawn about its own middle,
 * so the body in column 0 is really in the last one.**
 *
 * The simulation authors which seat is turned and hashes it (`sim/flip.ts`);
 * what is here is the whole of what a fold in a picture needs — one column
 * arithmetic, and the rule about where it may be applied.
 *
 * **It reaches the bodies on the field and nothing else.** Mirroring inside
 * `tileCX` would have been one line and is the wrong line: every strip, lobe
 * and band mark goes through that function, so the cannon's own slider would
 * turn with the field — and a seat whose finger is mirrored the same way as
 * its eye is a seat for whom nothing has happened at all. The mechanic is
 * exactly that the picture moved and the controls did not: the pilot's "third
 * column" is now the navigator's fifth, and the pair have to find that out by
 * talking.
 *
 * **The layout carries it, so a finger and a frame cannot disagree.** A hit
 * test is handed a layout and never a world (`touch-field.ts`), and the rule
 * `layout.ts` exists to keep is that a thing is never drawn in one place and
 * answered in another — so the fold is a field of the layout, set by the two
 * callers that have a world in hand (`canvas2d.ts` draws with it,
 * `apps/game/src/field-input.ts` answers with it), exactly as `handedLayout`
 * seats one for THE HANDOVER.
 */

/**
 * The same layout with the fold on it, or the object itself when this screen
 * is not the turned one — so an ordinary wave allocates nothing per frame and
 * nothing per touch, which is `handedLayout`'s arrangement and its reason.
 */
export function flippedLayout(l: Layout, world: World): Layout {
  const seat = flipSeat(world);
  return seat !== null && flipsField(l.role, seat) ? { ...l, flip: true } : l;
}

/**
 * A column on **this** field, from the column the world holds.
 *
 * Its own function rather than a subtraction written at each site, because the
 * mirror has to be the same one everywhere: a fractional column mirrors as
 * cleanly as a whole one — a dart gliding from 1 to 3 comes back gliding from
 * 5 to 3 — and a wide body is mirrored about the column it is *drawn* at, so
 * its two halves stay under its own picture (`bodyCenterCol`).
 */
export function fieldCol(l: Layout, col: number): number {
  return l.flip ? l.cols - 1 - col : col;
}

/**
 * The pixel a **body's** column is at on this screen — `tileCX` with the fold
 * in front of it, and the line that decides what the fold reaches.
 *
 * What is drawn from a world column falls in two piles and they are not the
 * same pile. A body, the spark where one died, the goo it burst into, the
 * mouth that swallowed a pod, the blip warning of one coming: all of those are
 * *the field*, and they turn. The cannon on its rail, the shield's arc, a scar
 * in the hull and the band below are the *ship*, and they do not — mirroring
 * the sight along with the thing sighted would leave the pair with nothing to
 * say, which is the whole mechanic (`sim/flip.ts`).
 *
 * So a site asks itself which pile it is in and calls `fieldX` or `tileCX`
 * accordingly. A per-mechanic picture — THE SPLICE's tangle, THE WELL's clock,
 * a boss's own limbs — is neither until a wave puts one under a flip, and none
 * does: the fault's own wave is a plain field of bodies.
 */
export function fieldX(l: Layout, col: number): number {
  return tileCX(l, fieldCol(l, col));
}
