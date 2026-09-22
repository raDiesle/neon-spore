import {
  type SimConfig,
  type UndertowState,
  undertowLobeAt,
  undertowUnseated,
} from "@neon-spore/sim";
import { handleRadius } from "./handle-draw.js";
import { type Circle, type Layout, tileCX } from "./layout.js";

/**
 * **THE UNDERTOW's two hands**, and the circles the drawing and the hit test
 * share: the navigator's thumb pinning a lobe shut, and her thumb on the
 * column the floor has the pilot stuck in (`sim/undertow-hand.ts`,
 * `docs/spec/bosses.md` §11.20).
 *
 * Both gestures shipped in the simulation with nothing drawn to take hold of.
 * The look is exempt under *a look with no shipped alternative*: there was no
 * drawing of either control to run a candidate against.
 *
 * **Both are hers, and that is the point of them.** His hands are the cannon
 * and the maw and they are full; her plate faces down for the whole of this
 * fight, so her seat is the one with a thumb to spare. They are also the pair
 * that reaches across the split: the free is the only control in the game
 * that gives the other player his own seat back.
 *
 * **Neither ring is on the hull's skin, and both are read off `l.hullY`.**
 * That skin is a function of x the draw files are handed and a hit test is
 * not, and it is never more than a fraction of a tile off the line — the
 * argument the captions make for ringing this same boss (`bossAnchorE` in
 * `caption-anchor-boss-e.ts`). A ring is a ring and not a trace.
 *
 * **The places and the gates, and next door the press and the drawing**
 * (`undertow-grip.ts`). The cut is `ledger-gates.ts`' and for its reason: the
 * two rings have to be hit-tested where they are drawn, so the four answers
 * both halves ask are the one thing in this pair that may not be written
 * twice — and the file that held all of it was at its 250 lines when the
 * drawing grew a seat rule of its own.
 */

/**
 * How far above the hull line the pin's ring floats, in tiles: just clear of
 * the plating, in the lobe's own throat.
 *
 * **Where a plate would stand**, which is the whole of what this handle is:
 * `undertowPinned` is asked on the same line as `world.shieldCol` in both
 * places that number is asked (`undertow-step.ts`, `undertow-press.ts`), so
 * her thumb *is* a second plate and the handle belongs where the first one
 * goes. It clears the lobe's own two bands as well — the cyan on a tall one's
 * top third means *the beam and not the maw* (`undertow-lobe.ts`), and a ring
 * over it would cover the one thing the pilot is being told.
 */
const PIN_UP = 0.45;

/**
 * And how far above it the free's ring hangs, in tiles: a clear tile, over the
 * stuck cannon rather than on it. It clears the plate, the cannon under it and
 * the bow rising off the skin in that same column — the one warning either
 * seat gets — and hangs in air nothing of this fight is drawn in.
 */
const FREE_UP = 1.2;

/** The circle on a lobe standing in `col`, wherever the column is drawn. */
export function undertowPinCircle(l: Layout, cfg: SimConfig, col: number): Circle {
  return { x: tileCX(l, col), y: l.hullY - l.tile * PIN_UP, r: handleRadius(l, cfg) };
}

/** The circle over the unseated pilot's column, which is the cannon's own. */
export function undertowFreeCircle(l: Layout, cfg: SimConfig, cannonCol: number): Circle {
  return { x: tileCX(l, cannonCol), y: l.hullY - l.tile * FREE_UP, r: handleRadius(l, cfg) };
}

/**
 * Whether the boss is offering a thumb that column: `pin`'s own gate read back
 * rather than restated — a lobe standing in it, and not the last one, which
 * `undertowTake` refuses in that phase and where a pin could only be a way for
 * her to spoil his hold.
 */
export function undertowPinnable(u: UndertowState, col: number): boolean {
  return u.phase !== "last" && undertowLobeAt(u, col) !== null;
}

/**
 * And whether it is offering her his column, which is the whole of `free`'s:
 * only while he is actually unseated. Before that the same thumb in the same
 * place is a thumb on the hull, and the count it would bank is time she did
 * not spend watching the bow.
 */
export function undertowFreeable(u: UndertowState, beat: number): boolean {
  return undertowUnseated(u, beat);
}
