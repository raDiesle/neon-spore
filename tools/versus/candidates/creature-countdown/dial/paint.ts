import { countDisc } from "../../../../../packages/render/src/countdown.js";
import type { Body } from "../../../../../packages/render/src/creature-body-in.js";
import { hazed } from "../../../../../packages/render/src/depth.js";
import { halo } from "../../../../../packages/render/src/glow.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { countdownIsOpen, countdownMarks } from "../../../../../packages/sim/src/countdown.js";

/**
 * DIAL — the disc is a clock face, and the count is a lit sector draining
 * clockwise from twelve with a hand at its leading edge.
 *
 * The shipped count is four notches cut into the rim, and at 26 px a notch is
 * three pixels: legible, and nothing more. A face is the other way round —
 * the count is most of the body's area rather than its edge — and a hand that
 * sweeps within the beat says *how soon* as well as *how many*, which is the
 * thing the pilot's sentence is really about ("on the next one"). The sector
 * is the beats left, the ticks round the face are how many a quarter is, and
 * on zero the whole face lights in the rim colour under the shipped halo.
 *
 * `dialOver` is on both screens and never moves: a dark face with a bezel and
 * a notch at twelve. The navigator sees a face with nothing on it.
 */

/** The face's radius as a share of the body's, and the sector's inside it. */
const FACE = 0.7;
const SECTOR = 0.9;
const TAU = Math.PI * 2;
const TOP = -Math.PI / 2;

export function dialOver(b: Body): void {
  const { ctx, world, near } = b;
  const { cx, cy, r, trio } = countDisc(b);
  ctx.fillStyle = rgba(trio.dark, 0.92);
  ctx.beginPath();
  ctx.arc(cx, cy, r * FACE, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = hazed(world.cfg, trio.rim, near);
  ctx.lineWidth = Math.max(1, r * 0.07);
  ctx.stroke();
  // Twelve: where the count starts and where the hand ends up. A notch in the
  // bezel, so the face has a top on both screens.
  ctx.beginPath();
  ctx.moveTo(cx, cy - r * FACE * 1.1);
  ctx.lineTo(cx, cy - r * FACE * 0.72);
  ctx.stroke();
}

export function dialCount(b: Body): void {
  const { ctx, world, c, near, beatPhase } = b;
  const cfg = world.cfg;
  const { cx, cy, r, trio } = countDisc(b);
  const face = r * FACE;
  if (countdownIsOpen(cfg, world.beat, c)) {
    // Zero: the face is all light, breathing with the beat, under the halo.
    halo(ctx, cx, cy, Math.round(r * 2.6), trio.hex, 0.55);
    ctx.fillStyle = rgba(trio.rim, 0.75 + 0.25 * Math.sin(beatPhase * TAU));
    ctx.beginPath();
    ctx.arc(cx, cy, face * SECTOR, 0, TAU);
    ctx.fill();
    return;
  }
  const slots = Math.max(1, cfg.countdownBeats);
  const marks = countdownMarks(cfg, world.beat, c);
  // The beats left as a share of the turn, the running beat draining as it
  // goes: the hand sweeps, and lands on a tick on the beat.
  const left = Math.max(0, marks - beatPhase) / slots;
  const end = TOP + left * TAU;
  ctx.fillStyle = rgba(trio.hex, 0.9);
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, face * SECTOR, TOP, end);
  ctx.closePath();
  ctx.fill();
  // The ticks: one per beat, so the pilot sees a quarter is a beat.
  ctx.strokeStyle = rgba(trio.rim, 0.45);
  ctx.lineWidth = Math.max(0.8, r * 0.04);
  ctx.beginPath();
  for (let k = 0; k < slots; k++) {
    const a = TOP + (k / slots) * TAU;
    ctx.moveTo(cx + Math.cos(a) * face * 0.78, cy + Math.sin(a) * face * 0.78);
    ctx.lineTo(cx + Math.cos(a) * face * 0.96, cy + Math.sin(a) * face * 0.96);
  }
  ctx.stroke();
  // The hand, on the sector's leading edge, and the pin it turns on.
  ctx.strokeStyle = hazed(cfg, trio.rim, near);
  ctx.lineWidth = Math.max(1.2, r * 0.09);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(end) * face * SECTOR, cy + Math.sin(end) * face * SECTOR);
  ctx.stroke();
  ctx.fillStyle = trio.rim;
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(1, r * 0.09), 0, TAU);
  ctx.fill();
}
