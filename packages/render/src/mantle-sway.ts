import { beatSeconds, type MantleState, type World } from "@neon-spore/sim";
import { HUSH, IDLE_DRIFT } from "./idle-drift.js";
import type { Layout } from "./layout.js";
import { mantleOpen } from "./mantle-pose.js";
import { mantleTieY, type Point } from "./mantle-shape.js";
import { OUTLINE_SEED, outlineDrift } from "./outline-drift.js";
import { slowHush } from "./slow-hush.js";
import { noise1 } from "./solid-motion.js";

/**
 * **THE MANTLE leans on its straps** (`docs/spec/living-bosses.md` §1, the
 * outline tier): the shell, the core in it, its seam, its crack and its vent
 * are sheared together about the line the two straps are tied on, so the
 * nose wanders across by most of a tile and the ties do not move. That is
 * seen (*Big enough to be seen*, `docs/looks.md`).
 *
 * **Nothing a thumb holds moves.** The knobs hang off the ties, which are on
 * the line, and the rings — the brace rings, the core's ring, the vent's — are
 * drawn and answered where they stand; a bolt meets the shell as it leans
 * (`mantleStopper`). A tail dragged down by its handle takes its tie off the
 * line by under half a tile, which the lean moves by a few hundredths.
 *
 * Every step of the story opens THE SLOW, and the lean dies to a tenth under
 * it (`HUSH.liveMark`); it goes as the valves swing open, the core bared.
 */

/** How far the nose leans at the widest, in tiles. */
export const MANTLE_LEAN = 0.8;
/** How far the nose stands over the ties, in tiles (`mantle-shape.ts`: `RY` above the middle, `2·RY·HANDLE_F − RY` below it). */
const NOSE = 4.05;

/** The shear this beat: how many pixels across per pixel above the ties. */
export function mantleLean(world: World, s: MantleState, beat: number, beatPhase: number): number {
  const k = outlineDrift("mantle");
  if (k <= 0) return 0;
  const { cfg } = world;
  const left =
    (1 - mantleOpen(s, cfg, beat, beatPhase)) * slowHush(world, beat, beatPhase, HUSH.liveMark);
  if (left <= 0) return 0;
  const seconds = (beat + beatPhase) * beatSeconds(cfg);
  const lean = noise1((seconds * 2) / IDLE_DRIFT.roll.period, OUTLINE_SEED.mantle);
  return (k * left * MANTLE_LEAN * lean) / NOSE;
}

/** Where the lean puts `p`, sheared about the ties of the shell centred on `at`. */
export function mantleLeaned(l: Layout, at: Point, p: Point, lean: number): Point {
  return { x: p.x + lean * (mantleTieY(l, at) - p.y), y: p.y };
}

/** Draws `draw` sheared by `lean` about the ties; with none, draws it as it stands. */
export function withMantleLean(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  at: Point,
  lean: number,
  draw: () => void,
): void {
  if (lean === 0) {
    draw();
    return;
  }
  const y0 = mantleTieY(l, at);
  ctx.save();
  ctx.transform(1, 0, -lean, 1, lean * y0, 0);
  draw();
  ctx.restore();
}
