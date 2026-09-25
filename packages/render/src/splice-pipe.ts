import { blobPoints } from "@neon-spore/content";
import type { SimConfig, SpliceState } from "@neon-spore/sim";
import { rgba } from "./hex.js";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawFeelers } from "./splice-flesh.js";
import { spliceMouthY, splicePipeTopY } from "./splice-straws.js";
import { splinePath } from "./spline.js";

/**
 * **THE SPLICE's mouths, as living trunks**: each straw goes into the top of a
 * short trunk of flesh that hangs over the cannon and flares into a mouth,
 * open end down, and the word on its lip says what it is for.
 *
 * The owner's first picture (25 September 2026) was *a pipe of Super Mario, so
 * it is clear the cannon can suck here*, and it kept that shape — a body, a
 * wider end, a dark throat — until the same day's *more living and not
 * mechanical*. So nothing on it is a cylinder any more: the trunk swells and
 * waists like a throat and breathes on the beat, veins run down it, and the
 * mouth is a fat lip ringed with feelers that wave on their own and curl in
 * while it pulls. It is the ship's own flesh, the hold's violet and pink, so
 * it reads as grown out of the same thing as the walls.
 *
 * **Every pipe says SUCK, on both screens.** A label on one would be the
 * picture naming the answer; a label on all of them names only the verb, which
 * both seats already have. The one the pair owes next is still marked on
 * neither. What *is* marked, on the seat holding the cannon, is the pipe the
 * cannon is under — a fact about their own thumb.
 *
 * A number inside a pipe swells it where it is (`bulgeY`), which is the whole
 * of what the last stretch of the travel looks like from outside. Several may
 * be on their way at once, each down its own straw into its own pipe.
 */

/** Widths, in tiles: the trunk at the top, the lip, and the lip's height. */
const BODY = 0.62;
const LIP = 1.1;
const LIP_TALL = 0.44;

/** The horizontal light a trunk is lit with, from its left edge to its right. */
function flesh(
  ctx: CanvasRenderingContext2D,
  x: number,
  half: number,
  lit: number,
): CanvasGradient {
  const g = ctx.createLinearGradient(x - half, 0, x + half, 0);
  g.addColorStop(0, PALETTE.sheenDeep);
  g.addColorStop(0.22, rgba(PALETTE.sheenMid, 0.7));
  g.addColorStop(0.36, rgba(PALETTE.sheenWarm, 0.75 + 0.2 * lit));
  g.addColorStop(0.5, rgba(PALETTE.sheenMid, 0.8));
  g.addColorStop(0.8, rgba(PALETTE.sheenCold, 0.6));
  g.addColorStop(1, PALETTE.sheenDeep);
  return g;
}

/** The trunk's half-width at `f`, 0 at the straw and 1 at the lip. */
function trunkHalf(t: number, f: number, breath: number, seed: number): number {
  const flare = f ** 2.4 * (LIP * 0.42 - BODY * 0.5);
  const waist = -0.05 * Math.sin(f * Math.PI) + 0.03 * Math.sin(f * 7 + seed);
  return t * (BODY * 0.5 + flare + waist) * breath;
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
  const lipY = mouth - t * LIP_TALL * 0.3;
  const lit = mark.under || mark.sucking ? 1 : 0;
  const breath = 1 + 0.04 * Math.sin((b + seed * 0.37) * Math.PI);

  // The trunk: waisted, flaring into the lip, breathing on the beat.
  const steps = 10;
  // It bows a little on the beat, both ends held: the lip stays over its column.
  const bow = t * 0.08 * Math.sin((b + seed) * Math.PI * 0.5);
  const edge = (side: number) =>
    Array.from({ length: steps + 1 }, (_, i) => {
      const f = i / steps;
      const mid = x + bow * Math.sin(f * Math.PI);
      return { x: mid + side * trunkHalf(t, f, breath, seed), y: top + (lipY - top) * f };
    });
  const trunk = splinePath([...edge(-1), ...edge(1).reverse()], true);
  const halfLip = trunkHalf(t, 1, breath, seed);
  ctx.fillStyle = flesh(ctx, x, halfLip, lit);
  ctx.fill(trunk);
  ctx.strokeStyle = rgba(PALETTE.sheenRim, 0.25);
  ctx.lineWidth = Math.max(0.8, t * 0.03);
  ctx.stroke(trunk);

  if (mark.bulgeY !== null) {
    const f = (mark.bulgeY - top) / Math.max(1, lipY - top);
    const bh = trunkHalf(t, Math.max(0, Math.min(1, f)), breath, seed) * 1.4;
    ctx.beginPath();
    ctx.ellipse(x, mark.bulgeY, bh, t * 0.28, 0, 0, Math.PI * 2);
    ctx.fillStyle = flesh(ctx, x, bh, 1);
    ctx.fill();
  }

  // Veins down it, branching, a little brighter while it pulls.
  ctx.strokeStyle = rgba(PALETTE.sheenWarm, 0.3 + 0.3 * lit);
  ctx.lineWidth = Math.max(0.7, t * 0.03);
  ctx.beginPath();
  for (const [dx, bend] of [
    [-0.35, 0.2],
    [0.3, -0.25],
  ] as const) {
    const x0 = x + dx * t * BODY * 0.5;
    ctx.moveTo(x0, top + t * 0.15);
    const mx = x + (dx + bend) * t * BODY * 0.6;
    const my = (top + lipY) / 2;
    ctx.quadraticCurveTo(x0, my, mx, lipY - t * 0.08);
    ctx.moveTo(x0 + bend * t * 0.1, my - t * 0.1);
    ctx.lineTo(x0 + bend * t * 0.4, my + t * 0.2);
  }
  ctx.stroke();

  // The sphincter the straw goes in at.
  const pucker = splinePath(
    blobPoints(x, top, t * BODY * 0.55, t * 0.1, 6, 0.14, 0.05, b * 0.4, seed, 18),
    true,
  );
  ctx.fillStyle = rgba(PALETTE.sheenMid, 0.6);
  ctx.fill(pucker);
  ctx.beginPath();
  ctx.ellipse(x, top, t * BODY * 0.2, t * 0.04, 0, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.sheenDeep;
  ctx.fill();

  // The mouth: feelers first, then a fat lip over their roots and the throat.
  const rx = t * LIP * 0.5 * breath;
  const ry = t * LIP_TALL * 0.5;
  const curl = mark.sucking ? 1 : 0;
  drawFeelers(ctx, x, lipY + ry * 0.4, rx * 0.85, t, b, seed, curl);
  const lip = splinePath(blobPoints(x, lipY, rx, ry, 7, 0.16, 0.08, b * 0.5, seed + 3, 28), true);
  ctx.fillStyle = flesh(ctx, x, rx, lit);
  ctx.fill(lip);
  ctx.strokeStyle = mark.done ? PALETTE.good : rgba(PALETTE.sheenRim, 0.4);
  ctx.lineWidth = Math.max(1, t * (mark.done ? 0.06 : 0.035));
  ctx.stroke(lip);
  const pull = mark.sucking ? 0.9 : mark.under ? 0.55 : 0.25;
  const throat = ctx.createRadialGradient(x, lipY + ry * 0.55, 0, x, lipY + ry * 0.55, rx * 0.8);
  throat.addColorStop(0, rgba(PALETTE.sheenWarm, pull));
  throat.addColorStop(0.6, rgba(PALETTE.sheenDeep, 0.95));
  throat.addColorStop(1, rgba(PALETTE.sheenDeep, 0));
  ctx.beginPath();
  ctx.ellipse(x, lipY + ry * 0.55, rx * (0.7 - 0.12 * curl), ry * 0.45, 0, 0, Math.PI * 2);
  ctx.fillStyle = throat;
  ctx.fill();

  // A drip off the lip, slow, on its own clock.
  const drip = (b * 0.5 + seed * 0.29) % 1;
  const dx = x + rx * 0.5;
  const dy = lipY + ry * 0.7;
  ctx.beginPath();
  ctx.moveTo(dx - t * 0.05, dy);
  ctx.quadraticCurveTo(dx, dy + t * (0.08 + 0.22 * drip), dx + t * 0.05, dy);
  ctx.fillStyle = rgba(PALETTE.sheenWarm, 0.7 * (1 - drip * 0.6));
  ctx.fill();

  const size = Math.max(7, Math.round(t * 0.26));
  ctx.font = `800 ${size}px "Courier New",monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const ty = lipY - ry * 0.12;
  ctx.fillStyle = PALETTE.sheenDeep;
  ctx.fillText("SUCK", x + 1, ty + 1);
  ctx.fillStyle = mark.done ? PALETTE.good : mark.sucking ? PALETTE.podRim : PALETTE.text;
  ctx.fillText("SUCK", x, ty);
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";

  if (!mark.under) return;
  // The cannon's own mouth, on the seat that moves the cannon: its lip ringed,
  // outside the shape rather than filling it, because a mouth that filled in
  // when a thumb arrived would read as shut.
  const pulse = 1 + 0.12 * Math.sin(b * Math.PI);
  ctx.beginPath();
  ctx.ellipse(x, lipY, rx + t * 0.12 * pulse, ry + t * 0.12 * pulse, 0, 0, Math.PI * 2);
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.8);
  ctx.lineWidth = Math.max(1, t * 0.05);
  ctx.stroke();
}

/**
 * Every pipe, one per straw. `flights` are the numbers on their way down and
 * how far down each is; a pipe with one inside it swells round it.
 */
export function drawPipes(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: SpliceState,
  full: boolean,
  cannonCol: number,
  b: number,
  flights: readonly { straw: number; y: number }[],
): void {
  const top = splicePipeTopY(l, cfg);
  const mouth = spliceMouthY(l, cfg);
  for (let e = 0; e < s.entranceCols.length; e++) {
    const col = s.entranceCols[e] ?? 0;
    const flight = flights.find((f) => f.straw === e);
    const sucking = flight !== undefined;
    const inside = flight !== undefined && flight.y > top && flight.y < mouth;
    drawPipe(ctx, l, tileCX(l, col), top, mouth, b, e, {
      done: (s.topOf[e] ?? 0) < s.fed,
      under: !full && col === cannonCol,
      sucking,
      bulgeY: inside ? flight.y : null,
    });
  }
  ctx.lineWidth = 1;
}
