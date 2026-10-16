import {
  blisterBlowsLeft,
  blisterBlowsOf,
  blisterMayTap,
  type Creature,
  type SimConfig,
} from "@neon-spore/sim";
import { type Layout, seatOf } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawFuseRing, pipRadius } from "./pip-ring.js";

/**
 * **How many blows a blister still owes**, on the seat that may deal them:
 * THE MINE's ring of pips round the body (`pip-ring.ts`), one a blow, lit for
 * the blows left and dark for the blows landed, the next to go breathing.
 * Drawn only on a body that takes more than one — a wave or a director cell
 * asking for it (`blister-numbers.ts`, the owner's of 16 October 2026) — so a
 * one-blow blister, every blister the game shipped with, wears nothing new.
 *
 * A blow that was not the last throws the pip it spent off the ring: the pip
 * flashes white and a ring swells out of it and fades (`drawBlowSpent`, from
 * `blister-verdicts.ts`, which keeps the clock). The green verdict ring says
 * *that counted*; the flash says *and that was one of them*.
 */

/** The ring's radius, as a share of the body's: clear of the contour and of
 * the help laid over it. */
const RING = 1.45;

/** How long a spent pip's flash lasts, in seconds — about a beat at the
 * tempos THE BLISTER plays at. */
export const BLOW_FLASH_S = 0.5;

/** Whether this screen is the one a count is drawn on: the seat that may deal
 * the blow, and the test view, which draws every seat's help. */
export function blowsShownOn(l: Layout, c: Creature): boolean {
  return l.role === "test" || blisterMayTap(c, seatOf(l.role));
}

/** The ring of blows still owed, round a body that takes more than one. */
export function drawBlisterBlows(
  ctx: CanvasRenderingContext2D,
  cfg: SimConfig,
  c: Creature,
  at: { x: number; y: number; r: number },
  time: number,
): void {
  const full = blisterBlowsOf(cfg, c);
  if (full <= 1) return;
  const left = blisterBlowsLeft(cfg, c);
  const ring = { left, full };
  drawFuseRing(ctx, at.x, at.y, at.r * RING, ring, c.color, time, ctx.globalAlpha);
}

/** The pip the last blow spent, thrown off the ring `age` seconds after it. */
export function drawBlowSpent(
  ctx: CanvasRenderingContext2D,
  cfg: SimConfig,
  c: Creature,
  at: { x: number; y: number; r: number },
  age: number,
): void {
  const full = blisterBlowsOf(cfg, c);
  const k = age / BLOW_FLASH_S;
  if (full <= 1 || k >= 1) return;
  // The pip just spent is the first dark one clockwise from twelve: the ring
  // lights the ones below `left`.
  const i = blisterBlowsLeft(cfg, c);
  const a = -Math.PI / 2 + (i / full) * Math.PI * 2;
  const x = at.x + Math.cos(a) * at.r * RING;
  const y = at.y + Math.sin(a) * at.r * RING;
  const pip = pipRadius(at.r * RING);
  const fade = 1 - k;
  ctx.save();
  ctx.fillStyle = PALETTE.text;
  ctx.globalAlpha *= fade;
  ctx.beginPath();
  ctx.arc(x, y, pip * (1 + 0.6 * fade), 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.text;
  ctx.lineWidth = Math.max(1, pip * 0.5 * fade);
  ctx.beginPath();
  ctx.arc(x, y, pip * (1.5 + 3 * k), 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}
