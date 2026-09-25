import { blobPoints } from "@neon-spore/content";
import type { SimConfig, SpliceState } from "@neon-spore/sim";
import { rgba } from "./hex.js";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE } from "./palette.js";
import { spliceMouthY, splicePipeTopY } from "./splice-straws.js";
import { splinePath } from "./spline.js";

/**
 * **THE SPLICE's mouths, as pipes**: each straw goes into the top of a short
 * grown pipe that hangs over the cannon, open end down, and the word on its
 * rim says what it is for.
 *
 * The owner's picture (25 September 2026): *a pipe of Super Mario, so it is
 * clear the cannon can suck here*. So the shape is the one everybody reads as
 * "a way through" — a body and a wider rim, a dark throat — made of the ship's
 * own flesh rather than green steel: a horizontal sheen, cartilage rings, a
 * sphincter where the straw goes in and a drip off the lip.
 *
 * **Every pipe says SUCK, on both screens.** A label on one would be the
 * picture naming the answer; a label on all of them names only the verb, which
 * both seats already have. The one the pair owes next is still marked on
 * neither. What *is* marked, on the seat holding the cannon, is the pipe the
 * cannon is under — a fact about their own thumb, as the ring round the mouth
 * said before it.
 *
 * A number inside a pipe swells it where it is (`bulgeY`), which is the whole
 * of what the last stretch of the travel looks like from outside.
 */

/** Widths, in tiles: the body, the rim, and the rim's height over the mouth. */
const BODY = 0.72;
const RIM = 1.06;
const RIM_UP = 0.5;
const RIM_DOWN = 0.14;

/** The horizontal sheen a pipe is lit with, from its left edge to its right. */
function sheen(
  ctx: CanvasRenderingContext2D,
  x: number,
  half: number,
  lit: number,
): CanvasGradient {
  const g = ctx.createLinearGradient(x - half, 0, x + half, 0);
  g.addColorStop(0, PALETTE.sheenDeep);
  g.addColorStop(0.2, rgba(PALETTE.hull, 0.8));
  g.addColorStop(0.32, rgba(PALETTE.sheenRim, 0.75 + 0.2 * lit));
  g.addColorStop(0.44, rgba(PALETTE.hull, 0.95));
  g.addColorStop(0.78, rgba(PALETTE.sheenCold, 0.75));
  g.addColorStop(1, PALETTE.sheenDeep);
  return g;
}

function drawPipe(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  x: number,
  top: number,
  mouth: number,
  b: number,
  seed: number,
  mark: { done: boolean; under: boolean; sucking: boolean; bulgeY: number | null },
): void {
  const t = l.tile;
  const half = (t * BODY) / 2;
  const rimHalf = (t * RIM) / 2;
  const rimTop = mouth - t * RIM_UP;
  const rimBot = mouth + t * RIM_DOWN;
  const lit = mark.under || mark.sucking ? 1 : 0;

  // The body: a little waisted, as a grown thing is, and breathing on the beat.
  const breath = 1 + 0.03 * Math.sin((b + seed * 0.37) * Math.PI);
  const waist = half * (0.1 * breath);
  ctx.beginPath();
  ctx.moveTo(x - half, top);
  ctx.quadraticCurveTo(x - half + waist, (top + rimTop) / 2, x - half, rimTop + 1);
  ctx.lineTo(x + half, rimTop + 1);
  ctx.quadraticCurveTo(x + half - waist, (top + rimTop) / 2, x + half, top);
  ctx.closePath();
  ctx.fillStyle = sheen(ctx, x, half, lit);
  ctx.fill();

  if (mark.bulgeY !== null) {
    ctx.beginPath();
    ctx.ellipse(x, mark.bulgeY, half * 1.32, t * 0.26, 0, 0, Math.PI * 2);
    ctx.fillStyle = sheen(ctx, x, half * 1.32, 1);
    ctx.fill();
  }

  // Cartilage rings across it: a dark crease and the light just over it.
  ctx.lineWidth = Math.max(0.8, t * 0.04);
  for (let y = top + t * 0.2; y < rimTop - t * 0.08; y += t * 0.24) {
    ctx.beginPath();
    ctx.ellipse(x, y, half * 0.98, t * 0.05, 0, 0.15, Math.PI - 0.15);
    ctx.strokeStyle = rgba(PALETTE.sheenDeep, 0.6);
    ctx.stroke();
  }

  // The sphincter the straw goes in at.
  const lip = splinePath(
    blobPoints(x, top, half * 1.18, t * 0.12, 6, 0.14, 0.05, b * 0.4, seed, 18),
    true,
  );
  ctx.fillStyle = rgba(PALETTE.sheenMid, 0.55);
  ctx.fill(lip);
  ctx.strokeStyle = rgba(PALETTE.sheenRim, 0.35);
  ctx.stroke(lip);
  ctx.beginPath();
  ctx.ellipse(x, top, half * 0.42, t * 0.05, 0, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.sheenDeep;
  ctx.fill();

  // The rim, wider than the body, with its lit top edge.
  ctx.beginPath();
  ctx.roundRect(x - rimHalf, rimTop, rimHalf * 2, rimBot - rimTop, t * 0.12);
  ctx.fillStyle = sheen(ctx, x, rimHalf, lit);
  ctx.fill();
  ctx.strokeStyle = mark.done ? PALETTE.good : rgba(PALETTE.sheenDeep, 0.9);
  ctx.lineWidth = Math.max(1, t * (mark.done ? 0.06 : 0.035));
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - rimHalf + t * 0.1, rimTop + t * 0.05);
  ctx.lineTo(x + rimHalf - t * 0.1, rimTop + t * 0.05);
  ctx.strokeStyle = rgba(PALETTE.sheenRim, 0.55);
  ctx.lineWidth = Math.max(0.8, t * 0.035);
  ctx.stroke();

  // The throat, open toward the cannon, glowing while it pulls.
  const pull = mark.sucking ? 0.9 : mark.under ? 0.55 : 0.25;
  const throat = ctx.createRadialGradient(x, rimBot, 0, x, rimBot, rimHalf * 0.9);
  throat.addColorStop(0, rgba(PALETTE.sheenWarm, pull));
  throat.addColorStop(0.6, rgba(PALETTE.sheenDeep, 0.95));
  throat.addColorStop(1, rgba(PALETTE.sheenDeep, 0));
  ctx.beginPath();
  ctx.ellipse(x, rimBot, rimHalf * 0.86, t * 0.1, 0, 0, Math.PI * 2);
  ctx.fillStyle = throat;
  ctx.fill();

  // A drip off the lip, slow, on its own clock.
  const drip = (b * 0.5 + seed * 0.29) % 1;
  const dx = x + rimHalf * 0.45;
  ctx.beginPath();
  ctx.moveTo(dx - t * 0.05, rimBot - t * 0.02);
  ctx.quadraticCurveTo(dx, rimBot + t * (0.08 + 0.22 * drip), dx + t * 0.05, rimBot - t * 0.02);
  ctx.fillStyle = rgba(PALETTE.sheenMid, 0.8 * (1 - drip * 0.6));
  ctx.fill();

  const size = Math.max(7, Math.round(t * 0.28));
  ctx.font = `800 ${size}px "Courier New",monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const ty = (rimTop + rimBot) / 2 + t * 0.01;
  ctx.fillStyle = PALETTE.sheenDeep;
  ctx.fillText("SUCK", x + 1, ty + 1);
  ctx.fillStyle = mark.done ? PALETTE.good : mark.sucking ? PALETTE.podRim : PALETTE.text;
  ctx.fillText("SUCK", x, ty);
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";

  if (!mark.under) return;
  // The cannon's own pipe, on the seat that moves the cannon: its rim ringed,
  // outside the shape rather than filling it, because a hole that filled in
  // when a thumb arrived would read as shut.
  const pulse = 1 + 0.12 * Math.sin(b * Math.PI);
  ctx.beginPath();
  ctx.roundRect(
    x - rimHalf - t * 0.1 * pulse,
    rimTop - t * 0.1 * pulse,
    (rimHalf + t * 0.1 * pulse) * 2,
    rimBot - rimTop + t * 0.2 * pulse,
    t * 0.18,
  );
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.8);
  ctx.lineWidth = Math.max(1, t * 0.05);
  ctx.stroke();
}

/**
 * Every pipe, one per straw. `flightY` is the number in flight, or null; the
 * pipe it is inside swells round it.
 */
export function drawPipes(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: SpliceState,
  full: boolean,
  cannonCol: number,
  b: number,
  flightY: number | null,
): void {
  const top = splicePipeTopY(l, cfg);
  const mouth = spliceMouthY(l, cfg);
  for (let e = 0; e < s.entranceCols.length; e++) {
    const col = s.entranceCols[e] ?? 0;
    const sucking = e === s.feedFrom;
    const inside = sucking && flightY !== null && flightY > top && flightY < mouth;
    drawPipe(ctx, l, tileCX(l, col), top, mouth, b, e, {
      done: (s.topOf[e] ?? 0) < s.fed,
      under: !full && col === cannonCol,
      sucking,
      bulgeY: inside ? flightY : null,
    });
  }
  ctx.lineWidth = 1;
}
