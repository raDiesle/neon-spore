import { GAUGE_TEETH, type GaugeState, gaugeToothLoose, gaugeWoundOpen } from "@neon-spore/sim";
import type { Dial } from "./gauge.js";
import { angleOf } from "./gauge-alien.js";
import { depthOf, TOOTH_STEP, toothPath } from "./gauge-teeth.js";
import { PALETTE } from "./palette.js";

/**
 * **What the pilot sees while he waits for her call**: the teeth lit in a
 * sweep that races left to right and back, each one red or cyan at random —
 * and plainly not real. The owner, 2 October 2026: *for p1 to indicate he is
 * waiting for player to call … very fast rotating teeths … colouring left to
 * right, then right to left, in random cyan and red and in some visual that
 * it's hallucination not real*.
 *
 * **It says nothing true, on purpose.** His screen has no wound on it, and
 * the colours a pair reads as *hit this* are only ever the wound's
 * (`gauge-alien.ts`). So the colours here are drawn from a hash of the pass
 * and the tooth, never from the state, and the light is a ghost — two copies
 * of each tooth split apart and shivering, drawn additive and faint, so it can
 * never be mistaken for a tooth that changed. A frame of it carries exactly
 * one fact: his hand is off the valve and the round is waiting on her voice.
 *
 * Only while that is so: in the play, a wound open, no bolt in the air, no
 * tooth or tongue asking for a hand, the valve answering and not held.
 */

/** Seconds one pass takes across the jaw, one way. */
const PASS = 0.42;
/** Teeth the sweep's tail lights behind its head. */
const TRAIL = 5;
/** How far the two ghosts split either side of a tooth, in its own width. */
const SPLIT = 0.22;
/** How far a ghost floats in off the jaw, as a share of the dial. */
const FLOAT = 0.035;
/** The ghosts' light at the head of the sweep. */
const LIGHT = 0.9;

/** Whether his screen is waiting on her call, and so shows the mirage. */
export function gaugeMirageShown(g: GaugeState): boolean {
  if (g.phase !== "play" || g.valve !== 0) return false;
  if (!gaugeWoundOpen(g) || g.shotTick !== -1) return false;
  return !gaugeToothLoose(g) && !g.tongueOut;
}

/** A coin for tooth `k` on pass `pass`: the same frame twice, never the state. */
function redOn(pass: number, k: number): boolean {
  let h = (pass * 374761393 + k * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) & 1) === 1;
}

/** The sweep over the teeth still in, on the pilot's screen. After the teeth. */
export function drawGaugeMirage(
  ctx: CanvasRenderingContext2D,
  dial: Dial,
  g: GaugeState,
  time: number,
): void {
  const run = time / PASS;
  const pass = Math.floor(run);
  const ahead = pass % 2 === 0;
  // The head runs a little past both ends, so the tail clears the jaw before
  // it turns and the turn reads as a turn.
  const head = (run - pass) * (GAUGE_TEETH + TRAIL) - TRAIL / 2;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineJoin = "round";
  for (let k = 0; k < GAUGE_TEETH; k++) {
    if ((g.pulledTeeth & (1 << k)) !== 0) continue;
    const behind = ahead ? head - k : k - (GAUGE_TEETH - 1 - head);
    if (behind < 0 || behind >= TRAIL) continue;
    const light = LIGHT * (1 - behind / TRAIL);
    const hex = redOn(pass, k) ? PALETTE.red : PALETTE.cyan;
    const shiver = Math.sin(time * 47 + k * 2.3) * 0.06;
    // Each ghost floats loose of the jaw towards the cannon and back, so it is
    // never a tooth that changed colour: a tooth does not leave its socket.
    const mid = angleOf((k + 0.5) * TOOTH_STEP);
    for (const side of [-1, 1]) {
      const lo = k * TOOTH_STEP + side * TOOTH_STEP * (SPLIT + shiver);
      const depth = depthOf(dial, k) * (1.15 + 0.12 * Math.sin(time * 33 + k + side));
      const path = toothPath(dial, lo, lo + TOOTH_STEP, depth);
      const float = dial.r * FLOAT * (0.6 + 0.4 * Math.sin(time * 21 + k * 1.7 + side));
      ctx.save();
      ctx.translate(-Math.cos(mid) * float, -Math.sin(mid) * float);
      ctx.globalAlpha = light * (side < 0 ? 1 : 0.7);
      ctx.fillStyle = hex;
      ctx.fill(path);
      ctx.strokeStyle = hex;
      ctx.lineWidth = 1.2;
      ctx.stroke(path);
      ctx.restore();
    }
  }
  ctx.restore();
}
