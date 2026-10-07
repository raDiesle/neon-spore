import { beatSeconds, type StareState, type World } from "@neon-spore/sim";
import { IDLE_DRIFT } from "./idle-drift.js";
import { OUTLINE_SEED, outlineDrift } from "./outline-drift.js";
import { slowHush } from "./slow-hush.js";
import { noise1 } from "./solid-motion.js";
import type { StareEye } from "./stare-shape.js";

/**
 * **THE STARE rolls in its socket** (`docs/spec/living-bosses.md` §1, the
 * outline tier): the cowl, the eye, the lashes and the glass round them roll
 * together about the eye's middle, so the cowl's horns lift and dip by more
 * than half a tile, which is seen (*Big enough to be seen*, `docs/looks.md`).
 *
 * **About the eye, so the pupil does not move.** The gaze leaves from it, the
 * beam and its foot on the field stay in their column, and the captions and
 * THE SLOW's aim read the eye where it stands. The count of turns under it is
 * drawn level, outside the roll, since nobody reads a number off a tilt.
 *
 * **Still while it is pulled**: the charge is THE SLOW's window and the lash
 * fan is under thumbs, so the roll dies to nothing as the window opens; it is
 * still through the rise and the calm, which are their own motion, and comes
 * back over the first beat of every rest.
 */

/** How far it rolls at the widest, in radians: the cowl's horns, 2.7 tiles out, move most of a tile. */
export const STARE_ROLL = 0.3;

/** The roll at `beat` and `beatPhase`, radians, clockwise on the screen. */
export function stareRoll(world: World, s: StareState, beat: number, beatPhase: number): number {
  const k = outlineDrift("stare");
  if (k <= 0 || s.phase === "rise" || s.phase === "calm") return 0;
  const b = beat + beatPhase;
  const back = s.phase === "rest" ? Math.max(0, Math.min(1, b - s.phaseBeat)) : 1;
  const left = back * slowHush(world, beat, beatPhase, 0);
  if (left <= 0) return 0;
  const seconds = b * beatSeconds(world.cfg);
  return k * left * STARE_ROLL * noise1((seconds * 2) / IDLE_DRIFT.roll.period, OUTLINE_SEED.stare);
}

/** Draws `draw` rolled by `roll` about the eye's middle. */
export function withStareRoll(
  ctx: CanvasRenderingContext2D,
  socket: StareEye,
  roll: number,
  draw: () => void,
): void {
  if (roll === 0) {
    draw();
    return;
  }
  ctx.save();
  ctx.translate(socket.cx, socket.cy);
  ctx.rotate(roll);
  ctx.translate(-socket.cx, -socket.cy);
  draw();
  ctx.restore();
}
