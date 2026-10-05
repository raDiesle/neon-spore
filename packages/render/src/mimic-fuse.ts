import { type MimicState, mimicStep, type World } from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import { mimicFrames, mimicHold } from "./mimic-frame-look.js";
import type { MimicPose } from "./mimic-shape.js";
import { phaseInto } from "./phase-into.js";
import { drawFuseLine, fuseColours } from "./slow-fuse.js";
import { fuseAt, type Under } from "./slow-fuse-place.js";

/**
 * **THE MIMIC's clock: THE SLOW's fuse, with no slow.** The owner, 5 October
 * 2026: *remove the duplicated time remaining indicator. use the generic one
 * we use for bosses on slows (but no slow here)*. The fight had two — the
 * slow's fuse and THE FLEET's drain bar with its seconds over the hull — and
 * the bar went with the slow.
 *
 * So it is the one line every boss's window is counted by
 * (`slow-fuse.ts`), in the same place (`slow-fuse-place.ts`) — under the
 * frame and its words, over the hull, clear of every mark — and drawn by the
 * same function, the same way THE REPRISE counts its own clock
 * (`reprise-fuse.ts`). It counts the step's own window, a picture's or the
 * bare core's, read off the phase and the beat, starts whole and burns in from
 * both ends to the beat the window runs out; a peel or a tap on the core ends
 * the phase and takes it with it.
 */

/** How far under the frame its words reach, in tiles: the verb and its `why` line. */
const WORDS = 1.3;

/** The share of the window left, 0 to 1, or 0 with no window counting. */
export function mimicFuseRest(s: MimicState, beat: number, beatPhase: number): number {
  const step = mimicStep(s);
  if (step === null || (s.phase !== "sign" && s.phase !== "core")) return 0;
  const total = Math.max(1, step.beats);
  return Math.min(1, Math.max(0, (total - phaseInto(s, beat, beatPhase)) / total));
}

/** Draws the fuse for this frame, under the frames, or under the mantle while the core is bare. */
export function drawMimicFuse(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: MimicState,
  p: MimicPose,
  beatPhase: number,
): void {
  const rest = mimicFuseRest(s, world.beat, beatPhase);
  if (rest <= 0) return;
  const hold = mimicHold(l, mimicFrames(l, world.cfg, s));
  const body: Under =
    s.phase === "sign" && hold !== null
      ? { top: hold.top, bottom: hold.bottom + WORDS * l.tile }
      : { top: p.y - p.r, bottom: p.y + p.r * p.squash };
  const { body: hex, core } = fuseColours(rest);
  drawFuseLine(ctx, l, fuseAt(l, world, beatPhase, body), rest, hex, core);
}
