import { facet, type Pin, pin } from "@neon-spore/content";
import { beatSeconds, type SimConfig } from "@neon-spore/sim";
import { DEG } from "./idle-drift.js";
import { bodyLife } from "./motion-life.js";
import { OUTLINE_SEED, outlineYaw } from "./outline-drift.js";

/**
 * **THE QUEEN's shell, placed by longitude** (`docs/spec/living-bosses.md`
 * §1, `packages/content/src/surface.ts`): the silhouette is posed, the surface
 * is placed. Her outline leans and squashes on the outline tier
 * (`outline-drift.ts`); the seams between her plates are pinned to the body
 * instead, so a turn carries them across her — fast through the middle,
 * crawling at the wing tips — takes the near ones over the rim and brings a
 * far pair, behind it at rest, round into view.
 *
 * Each seam's longitude is read off the share of her half-width it shipped
 * at, so at no turn every seam lands where it always did and the far pair is
 * hidden: a shell held still (`QUEEN_SURFACE.amount` 0, as shipped) draws the
 * shell the game has drawn since 11 September 2026.
 *
 * **The marks follow, by less.** They hang under her over columns the
 * simulation fires up (`queenMarkCol`), so they ride the same turn but only
 * `QUEEN_MARK_TURN` degrees of it (`queen-figure.ts`), and every place that
 * finds one — the drawing, the hit test, the cue, the caption — asks
 * `queenTurn` for the same number.
 */

export const QUEEN_SURFACE = {
  /** How much of the turn the shell takes: 0 still, as shipped; 1 the whole. */
  amount: 0,
  /** The widest turn of the shell, degrees, at the drift's widest yaw. */
  degrees: 45,
};

/** The seams, as shares of her half-width. Seven plates, three each side of the one over her middle. */
export const SEAMS: readonly number[] = [-0.75, -0.45, -0.15, 0.15, 0.45, 0.75];

/** How far round the back the far pair sits, radians: behind the rim at rest. */
const FAR = 100 * DEG;

/** Every seam, pinned on her equator at its longitude on a unit half-width, the far pair at each end. */
const PINS: readonly Pin[] = [-FAR, ...SEAMS.map(Math.asin), FAR].map((lon) => pin(lon, 0, 1));

/**
 * Her turn this frame, as a share of its widest, -1 to 1: the outline's own
 * yaw on her seed, so the plates go the way she leans. On the beat clock and
 * never hushed, so the hit test — which knows the beat and nothing of THE
 * SLOW — finds a mark exactly where it is drawn.
 */
export function queenTurn(cfg: SimConfig, beat: number, beatPhase: number): number {
  const k = QUEEN_SURFACE.amount * bodyLife();
  return outlineYaw((beat + beatPhase) * beatSeconds(cfg), k, OUTLINE_SEED.queen);
}

/** The shell's turn in radians, from a turn share `queenTurn` gave. */
export function shellTheta(turn: number): number {
  return turn * QUEEN_SURFACE.degrees * DEG;
}

/**
 * The seams at turn `theta` radians, in pixels from her middle, outermost
 * left first: `null` for one behind the rim. At no turn the six shipped seams
 * exactly, and the far pair hidden.
 */
export function seamsAt(theta: number, rx: number, breath: number): (number | null)[] {
  if (theta === 0) return [null, ...SEAMS.map((s) => s * rx * breath), null];
  return PINS.map((p) => {
    const f = facet(p, theta);
    return f.near ? f.x * rx * breath : null;
  });
}
