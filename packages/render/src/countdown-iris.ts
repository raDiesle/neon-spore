import { countdownIsOpen, countdownMarks, countdownSlots } from "@neon-spore/sim";
import { countDisc } from "./countdown.js";
import type { Body } from "./creature-body-in.js";
import { contourClock } from "./creature-place.js";
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
 * `irisOver` is on both screens: the socket and the core. The navigator
 * sees an eye that never blinks, and whose core wanders a hair about the
 * bottom of the socket on the body's own contour clock, the way a pupil is
 * never quite still — VERSUS `countdown:eye` / `drift`, the owner's pick of
 * 27 September 2026 (*hard to see, but looks better, we can use it*). It
 * still reads nothing of the count. On the pilot's screen the blades cover
 * the socket until zero, and at zero `irisCount`'s blazing core is drawn over
 * this one, centred and never narrower than it.
 */

/** The socket's radius as a share of the body's, and the core's. Exported
 * for a candidate that redraws the socket (`tools/versus/`). */
export const SOCKET = 0.52;
export const CORE = 0.17;
const TAU = Math.PI * 2;
const TOP = -Math.PI / 2;
/** The core's wander rates, off every term that already moves a body — the
 * contour's 0.9, 0.53 and 0.31 and the smoke's 0.9 — so the core is not read
 * as the outline. */
const WANDER_X = 0.61;
const WANDER_Y = 0.47;
/** How far the core wanders, as a share of the body's radius. The socket
 * leaves it 0.35 of room; at 0.06 the move was a pixel on a phone and read as
 * nothing (checked 27 September 2026). */
const WANDER = 0.09;

export function irisOver(b: Body): void {
  const { ctx, world, near, c, time } = b;
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
  const t = contourClock(c.id, time);
  const dx = Math.sin(t * WANDER_X) * r * WANDER;
  const dy = Math.sin(t * WANDER_Y + 1.1) * r * WANDER;
  ctx.fillStyle = hazed(world.cfg, trio.rim, near);
  ctx.beginPath();
  ctx.arc(cx + dx, cy + dy, r * CORE, 0, TAU);
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
  const slots = countdownSlots(cfg);
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
