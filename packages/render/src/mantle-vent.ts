import type { MantleState, World } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { mantleVentCircle } from "./mantle-grip.js";
import { mantleReach, type Point } from "./mantle-shape.js";
import { mantleCrossCrack, mantleVentOpen } from "./mantle-story.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE MANTLE's vent and its crosswise crack, drawn** (§23 rows 9 and 10):
 * the numbers are `mantle-story.ts`, and this page only lays them on the shell.
 *
 * - **The vent** is a slot gaping on the seam's crack, lit from the core
 *   under it, with puffs of hiss rising off it and a ring breathing round it
 *   — the mark a tap is answered on (`mantleVentCircle`), from either seat.
 * - **The crosswise crack** runs out both ways across the seam from its
 *   middle, kinked like the seam's own and glowing in the core's colour,
 *   brighter while the shell braces.
 */

/** Puffs of hiss off the vent at once. */
const PUFFS = 5;
/** Kinks in the crosswise crack, end to end. */
const KINKS = 10;

export function drawMantleVent(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: MantleState,
  beat: number,
  beatPhase: number,
  time: number,
): void {
  const open = mantleVentOpen(s, beat, beatPhase);
  if (open === 0) return;
  const vent = mantleVentCircle(l, world.cfg);
  const slot = new Path2D();
  slot.ellipse(vent.x, vent.y, vent.r * 0.6 * open, vent.r * 0.24 * open, 0, 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.red, 0.85);
  ctx.fill(slot);
  strokeGlow(ctx, slot, PALETTE.red, STROKE.inner, 1.4);
  for (let k = 0; k < PUFFS; k++) {
    const rise = (time * 1.4 + k / PUFFS) % 1;
    const drift = Math.sin(k * 2.1 + time * 3) * vent.r * 0.35;
    const puff = new Path2D();
    const x = vent.x + drift * rise;
    const y = vent.y - rise * vent.r * 1.6;
    puff.arc(x, y, l.tile * (0.08 + 0.14 * rise) * open, 0, Math.PI * 2);
    ctx.fillStyle = rgba(PALETTE.dim, 0.5 * (1 - rise) * open);
    ctx.fill(puff);
  }
  const breathe = 0.5 + 0.5 * Math.sin(beatPhase * Math.PI * 2);
  const ring = new Path2D();
  ring.arc(vent.x, vent.y, vent.r * (0.9 + 0.1 * breathe), 0, Math.PI * 2);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.red, (0.4 + 0.4 * breathe) * open);
  ctx.stroke(ring);
}

export function drawMantleCrossCrack(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: MantleState,
  at: Point,
  beat: number,
  beatPhase: number,
): void {
  const crack = mantleCrossCrack(s, world.cfg, beat, beatPhase);
  if (crack === 0) return;
  const { rx, ry } = mantleReach(l);
  const y = at.y - ry * 0.15;
  const half = crack * rx * 0.8;
  const path = new Path2D();
  path.moveTo(at.x - half, y);
  for (let k = 1; k <= KINKS; k++) {
    const x = at.x - half + (2 * half * k) / KINKS;
    const kink = k === KINKS ? 0 : (k % 2 === 0 ? 1 : -1) * l.tile * 0.06 * (1 + (k % 3) * 0.4);
    path.lineTo(x, y + kink);
  }
  const bracing = s.phase === "brace";
  const glow = bracing ? 1.2 + 0.6 * Math.cos(beatPhase * Math.PI * 2) : 0.6 + 0.6 * crack;
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.red, 0.55 + 0.35 * crack);
  ctx.stroke(path);
  strokeGlow(ctx, path, PALETTE.red, STROKE.inner, glow);
}
