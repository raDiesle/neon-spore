import { type GovernorState, governorTapping, type World } from "@neon-spore/sim";
import { governorLeft } from "./governor-pose.js";
import type { Layout } from "./layout.js";
import { drawFuseLine, fuseColours } from "./slow-fuse.js";
import { fuseAt, underAim } from "./slow-fuse-place.js";
import { aim } from "./slow-intake-aim.js";

/**
 * **THE GOVERNOR's tap window: THE SLOW's fuse, with no slow.** The owner,
 * 7 October 2026: *the remaining time for rotation should be extended and
 * visible like boss indicator.* A shot is played under THE SLOW and already
 * has its fuse (`slow-intake.ts`); a tap step is played at the beat's own rate
 * (`sim/governor-step.ts`), and its time left was a faint arc round the rim.
 *
 * So it is the one line every boss's window is counted by (`slow-fuse.ts`),
 * in the place the shot's own stands (`slow-fuse-place.ts`, off the same aim),
 * drawn by the same function, as THE MIMIC counts its own (`mimic-fuse.ts`).
 * It counts the lit step's beats, starts whole and burns in from both ends to
 * the beat the window runs out; the last mark landed ends it.
 */
export function drawGovernorFuse(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: GovernorState,
  beatPhase: number,
): void {
  if (!governorTapping(s)) return;
  const rest = governorLeft(s, world.beat, beatPhase);
  if (rest <= 0) return;
  const at = aim(world, l, world.beat, beatPhase);
  const { body, core } = fuseColours(rest);
  drawFuseLine(ctx, l, fuseAt(l, world, beatPhase, underAim(at)), rest, body, core);
}
