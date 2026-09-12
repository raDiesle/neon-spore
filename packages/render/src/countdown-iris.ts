import { countdownIsOpen, countdownMarks } from "@neon-spore/sim";
import { countDisc } from "./countdown.js";
import type { Body } from "./creature-body-in.js";
import { hazed } from "./depth.js";
import { halo } from "./glow.js";
import { rgba } from "./hex.js";

/**
 * IRIS — what THE COUNT wears since 12 September 2026, the owner's pick from
 * `creature:countdown` on VERSUS over DIAL and FUSE (`countdown-dial.ts`,
 * `countdown-fuse.ts`, kept for the SHAPES page's LIBRARY) and over the
 * notches it was judged against (`drawCountMarks`, `countdown.ts`).
 *
 * IRIS — a socket in the disc with a bright core at the bottom of it, and
 * blades of the body's own flesh closed over it: one blade per beat left,
 * the next to go sliding back into the rim through its beat. On zero there
 * are no blades, and the core is what a shot goes into.
 *
 * The shipped count says *how many* with notches. This says *what the count
 * is for*: the body can only be hit on zero, so on zero there is visibly a
 * hole to hit, and while it is closed the thing in the way is the body
 * itself. The blades left are the count, read as a fan from twelve.
 *
 * `irisOver` is on both screens and never moves: the socket and the core.
 * The navigator sees an eye that never blinks.
 */

/** The socket's radius as a share of the body's, and the core's. */
const SOCKET = 0.52;
const CORE = 0.17;
const TAU = Math.PI * 2;
const TOP = -Math.PI / 2;

export function irisOver(b: Body): void {
  const { ctx, world, near } = b;
  const { cx, cy, r, trio } = countDisc(b);
  ctx.fillStyle = rgba(trio.dark, 0.96);
  ctx.beginPath();
  ctx.arc(cx, cy, r * SOCKET, 0, TAU);
  ctx.fill();
  // The socket's lip, brightest on the lit side, so it reads as a hole.
  ctx.strokeStyle = rgba(trio.rim, 0.35);
  ctx.lineWidth = Math.max(0.8, r * 0.05);
  ctx.beginPath();
  ctx.arc(cx, cy, r * SOCKET, Math.PI * 0.85, Math.PI * 1.95);
  ctx.stroke();
  ctx.fillStyle = hazed(world.cfg, trio.rim, near);
  ctx.beginPath();
  ctx.arc(cx, cy, r * CORE, 0, TAU);
  ctx.fill();
}

/** One blade: the wedge from the socket's centre to its rim between two
 * angles, its tip drawn back along the bisector by `back` of the radius. */
function blade(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  s: number,
  a0: number,
  a1: number,
  back: number,
): void {
  const mid = (a0 + a1) / 2;
  const tx = cx + Math.cos(mid) * s * back;
  const ty = cy + Math.sin(mid) * s * back;
  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.lineTo(cx + Math.cos(a0) * s, cy + Math.sin(a0) * s);
  ctx.arc(cx, cy, s, a0, a1);
  ctx.closePath();
}

export function irisCount(b: Body): void {
  const { ctx, world, c, near, beatPhase } = b;
  const cfg = world.cfg;
  const { cx, cy, r, trio } = countDisc(b);
  const s = r * SOCKET * 1.02;
  if (countdownIsOpen(cfg, world.beat, c)) {
    // Zero: the core blazes and the halo says so from across the field.
    halo(ctx, cx, cy, Math.round(r * 2.6), trio.hex, 0.55);
    const pulse = 1.5 + 0.5 * Math.sin(beatPhase * TAU);
    ctx.fillStyle = rgba(trio.rim, 0.9);
    ctx.beginPath();
    ctx.arc(cx, cy, r * CORE * pulse, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = hazed(cfg, trio.rim, near);
    ctx.lineWidth = Math.max(1.5, r * 0.1);
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.04, 0, TAU);
    ctx.stroke();
    return;
  }
  const slots = Math.max(1, cfg.countdownBeats);
  const marks = countdownMarks(cfg, world.beat, c);
  ctx.fillStyle = trio.hex;
  ctx.strokeStyle = hazed(cfg, trio.rim, near);
  ctx.lineWidth = Math.max(0.8, r * 0.05);
  ctx.lineJoin = "round";
  for (let k = 0; k < marks; k++) {
    const a0 = TOP + (k / slots) * TAU;
    const a1 = TOP + ((k + 1) / slots) * TAU;
    // The last blade standing is the one going: its tip slides back to the
    // rim through the beat, and on the beat it is gone.
    const back = k === marks - 1 ? beatPhase : 0;
    blade(ctx, cx, cy, s, a0, a1, back);
    ctx.fill();
    ctx.stroke();
  }
}
