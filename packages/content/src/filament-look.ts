import type { HaloedOpts } from "./haloed.js";
import type { Point } from "./shapes.js";
import { SAC_SKIN, sacPoints } from "./silhouettes-gum.js";
import type { StuddedOpts } from "./studded.js";

/**
 * **THE FILAMENT as the inside of an alien** — the owner, 25 September 2026:
 * *maybe some alien which needs to be defeated, e.g. its the inner of its
 * body and the vene to travel with some weapon. and the other player needs
 * some other tool or weapon to carry behind. and when both reach … the
 * hearth inside, then both weapons are applied.*
 *
 * So the body over the field is a heart, each filament is a vein into it,
 * and each thumb carries a tool up the vein. None of the three is a shape the
 * game already drew (`CLAUDE.md`):
 *
 * - **The heart** is two cards combined: THE WEIGHT's sac (`sacPoints`, the
 *   sheet's `bosses.ts`) at a lighter sag and turned over so the mass is at
 *   the top, the slumped draft's crown dent moved to the middle as the notch
 *   between the two lobes, and the narrow end drawn in to a point.
 * - **Player 1's rasp** is THE RASP (`tower-defence.ts`): a burr of short
 *   spines that turns as it bores, the thumb that cuts the way.
 * - **Player 2's corona** is THE CORONA (`tower-defence.ts`): a ring of
 *   nodes that turns, with one wide gap — the charge carried behind.
 *
 * The numbers are the cards', moved here when the game took them, which is
 * what `taken` means (`tools/shape-sheet/src/catalogue.ts`).
 */

/** THE RASP's card, at the sheet's size; the drawer scales it to a ring. */
export const FILAMENT_RASP: StuddedOpts = {
  rx: 44,
  ry: 42,
  studs: 20,
  reach: 0.26,
  width: 0.34,
  blunt: 0.0,
  lobes: 3,
  depth: 0.04,
  seed: 6.7,
};

/** THE CORONA's card, at the sheet's size. */
export const FILAMENT_CORONA: HaloedOpts = {
  r: 96,
  // Wide: `ring.test.ts` holds a ring to enclosing its material rather than
  // its opening, and a band this thin is also truer to the source, which is a
  // small core inside a wide circle of satellites.
  hole: 0.56,
  nodes: 11,
  bump: 0.2,
  // A shade under a fifth of a turn per beat, on the card: the gap comes round
  // in about six beats. On a thumb it is turned by the drawer as well.
  spin: 0.19,
  missing: 2,
  seed: 8.3,
};

/** THE WEIGHT's sag, lightened and turned over into the heart's two lobes. */
const HEART_BIAS = 0.2;
/** How deep the notch between the lobes is, as a fraction of the radius, and how wide, in radians. */
const NOTCH = 0.5;
const NOTCH_WIDTH = 0.28;
/**
 * How far the lower half is drawn in to its point: from `TAPER_FROM` of the
 * radius above the centre, to all but `1 - TAPER` of its width at the tip, at
 * the power `TAPER_CURVE` — above one, so the flanks round into the point
 * rather than meet it at a shoulder.
 */
const TAPER = 0.97;
const TAPER_FROM = -0.8;
const TAPER_CURVE = 1.4;

/** Signed shortest angle from `a` to `to`, in radians. */
function angleDiff(a: number, to: number): number {
  let d = a - to;
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

/**
 * The heart's contour at time `t`, `n` points round, in units of `rx` and
 * `ry`: the lobes up to `-(1 + HEART_BIAS) * ry`, the point down at
 * `(1 - HEART_BIAS) * ry`. Screen y grows downward.
 */
export function heartPoints(t: number, rx: number, ry: number, n = 48): Point[] {
  return sacPoints(t, HEART_BIAS, rx, ry, SAC_SKIN, n).map((p) => {
    const y = -p.y;
    const d = angleDiff(Math.atan2(y, p.x), -Math.PI / 2) / NOTCH_WIDTH;
    const dent = 1 - NOTCH * Math.exp(-d * d);
    const from = TAPER_FROM * ry;
    const low = Math.max(0, (y - from) / (ry * (1 - HEART_BIAS) - from));
    return { x: p.x * dent * (1 - TAPER * low ** TAPER_CURVE), y: y * dent };
  });
}

/** How far above its centre the heart's lobes reach, and below it its point, in units of `ry`. */
export const HEART_TOP = 1 + HEART_BIAS;
export const HEART_POINT = 1 - HEART_BIAS;
