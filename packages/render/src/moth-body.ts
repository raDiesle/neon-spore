import { heartLight } from "./heartbeat.js";
import { mixHex, rgba } from "./hex.js";
import type { MothPose } from "./moth-place.js";
import { bellyPlates } from "./moth-shape.js";
import { PALETTE } from "./palette.js";
import { lightWithin } from "./part-light.js";

/**
 * **THE MOTH's body**, between its wings (`moth-draw.ts`): six legs, the belly
 * of plates, a furred thorax, and a head with two great eyes and two
 * feathered antennae — read off the pose, nothing kept.
 *
 * **The legs are the landing coming.** Folded under it while it flies, they
 * reach down for the cannon as it sinks (`reach`), claws opening, so the pair
 * sees how near it is to landing without a count.
 *
 * **The belly is lit only while it is open** — sinking over the cannon on the
 * last step (`mothBellyOpen`): every plate glows red from within and beats
 * on the heart's curve (`heartbeat.ts`), and nothing round it glows, the
 * owner's rule of 2 October 2026 for a part a bolt must hit.
 */

/** Its fur and its shell, greyed as it is beaten. */
function tone(hex: string, p: MothPose): string {
  return mixHex(hex, PALETTE.rockDark, p.spent * 0.8);
}

export function drawMothBody(
  ctx: CanvasRenderingContext2D,
  p: MothPose,
  tile: number,
  plates: number,
  open: boolean,
  beatPhase: number,
  time: number,
): void {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  drawLegs(ctx, p, tile, time);
  drawBelly(ctx, p, tile, plates, open, beatPhase);
  drawThorax(ctx, p, tile);
  drawHead(ctx, p, tile, time);
  ctx.restore();
}

/** Six legs, three a side, folded up or reaching down for the cannon. */
function drawLegs(ctx: CanvasRenderingContext2D, p: MothPose, tile: number, time: number): void {
  ctx.strokeStyle = rgba(tone(PALETTE.dim, p), 0.55 + 0.4 * p.reach);
  ctx.lineWidth = Math.max(1, tile * 0.045);
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const twitch = Math.sin(time * 7 + i * 2 + side) * 0.04 * (1 - p.reach);
      const hip = { x: p.x + side * tile * 0.18, y: p.y + tile * (-0.05 + i * 0.12) };
      const knee = {
        x: p.x + side * tile * (0.5 - p.reach * 0.12 + i * 0.04),
        y: p.y + tile * (0.12 + i * 0.12 + twitch),
      };
      const foot = {
        x: p.x + side * tile * (0.36 + i * 0.1 - p.reach * 0.08),
        y: p.y + tile * (0.42 + i * 0.08 + p.reach * 1.5),
      };
      ctx.beginPath();
      ctx.moveTo(hip.x, hip.y);
      ctx.lineTo(knee.x, knee.y);
      ctx.lineTo(foot.x, foot.y);
      // The claw, opening as it reaches.
      const claw = tile * (0.06 + 0.08 * p.reach);
      ctx.moveTo(foot.x - claw, foot.y + claw * 0.6);
      ctx.lineTo(foot.x, foot.y);
      ctx.lineTo(foot.x + claw, foot.y + claw * 0.6);
      ctx.stroke();
    }
  }
}

/** THE TITHE's plates down its belly; lit red within while the belly is open. */
function drawBelly(
  ctx: CanvasRenderingContext2D,
  p: MothPose,
  tile: number,
  count: number,
  open: boolean,
  beatPhase: number,
): void {
  // A belly with no hits owed is still a belly: one dull plate.
  const plates = bellyPlates(p, tile, Math.max(1, count));
  for (let i = plates.length - 1; i >= 0; i--) {
    const pl = plates[i];
    if (pl === undefined) continue;
    const path = new Path2D();
    path.ellipse(pl.x, pl.y, pl.rx, pl.ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = tone(mixHex(PALETTE.hull, PALETTE.background, 0.7), p);
    ctx.fill(path);
    if (open && count > 0) {
      lightWithin(ctx, path, PALETTE.red, heartLight(beatPhase), { x: pl.x, y: pl.y, r: pl.rx });
    }
    ctx.strokeStyle = rgba(tone(PALETTE.dim, p), 0.85);
    ctx.lineWidth = Math.max(1, tile * 0.035);
    ctx.stroke(path);
  }
}

/** The thorax: a furred oval, its fur standing out round its rim. */
function drawThorax(ctx: CanvasRenderingContext2D, p: MothPose, tile: number): void {
  const rx = tile * 0.3;
  const ry = tile * 0.38 * (1 - 0.15 * p.pitch);
  const cy = p.y - tile * 0.08;
  const fur = tone(mixHex(PALETTE.dim, PALETTE.text, 0.35), p);
  ctx.strokeStyle = rgba(fur, 0.75);
  ctx.lineWidth = Math.max(1, tile * 0.035);
  ctx.beginPath();
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2;
    const x0 = p.x + Math.cos(a) * rx * 0.85;
    const y0 = cy + Math.sin(a) * ry * 0.85;
    ctx.moveTo(x0, y0);
    ctx.lineTo(x0 + Math.cos(a + 0.3) * tile * 0.12, y0 + Math.sin(a + 0.3) * tile * 0.12);
  }
  ctx.stroke();
  const g = ctx.createRadialGradient(p.x - rx * 0.3, cy - ry * 0.4, 1, p.x, cy, ry);
  g.addColorStop(0, tone(mixHex(PALETTE.dim, PALETTE.text, 0.45), p));
  g.addColorStop(1, tone(mixHex(PALETTE.hull, PALETTE.background, 0.6), p));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(p.x, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

/** The head: two great eyes catching the light, and two feathered antennae. */
function drawHead(ctx: CanvasRenderingContext2D, p: MothPose, tile: number, time: number): void {
  const hy = p.y - tile * (0.52 - 0.12 * p.pitch);
  ctx.fillStyle = tone(mixHex(PALETTE.hull, PALETTE.background, 0.55), p);
  ctx.beginPath();
  ctx.arc(p.x, hy, tile * 0.17, 0, Math.PI * 2);
  ctx.fill();
  for (const side of [-1, 1]) {
    // An antenna: a curved stem, combed both sides, swaying a little.
    const sway = Math.sin(time * 2.3 + side) * tile * 0.05;
    const x0 = p.x + side * tile * 0.07;
    const y0 = hy - tile * 0.12;
    const x1 = p.x + side * tile * 0.78 + sway;
    const y1 = hy - tile * 0.95;
    const cx = p.x + side * tile * 0.2;
    const cy = hy - tile * 0.85;
    ctx.strokeStyle = rgba(tone(mixHex(PALETTE.dim, PALETTE.text, 0.3), p), 0.85);
    ctx.lineWidth = Math.max(1, tile * 0.03);
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(cx, cy, x1, y1);
    for (let i = 2; i < 11; i++) {
      const t = i / 11;
      const u = 1 - t;
      const x = u * u * x0 + 2 * u * t * cx + t * t * x1;
      const y = u * u * y0 + 2 * u * t * cy + t * t * y1;
      const barb = tile * 0.13 * Math.sin(t * Math.PI);
      ctx.moveTo(x - barb * 0.5, y - barb);
      ctx.lineTo(x, y);
      ctx.lineTo(x + side * barb, y - barb * 0.4);
    }
    ctx.stroke();
    // A great eye, dark, with the light caught in it.
    const ex = p.x + side * tile * 0.12;
    ctx.fillStyle = tone(PALETTE.background, p);
    ctx.beginPath();
    ctx.arc(ex, hy + tile * 0.02, tile * 0.09, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = rgba(PALETTE.lamp, 0.85 * (1 - p.spent));
    ctx.beginPath();
    ctx.arc(ex - tile * 0.025, hy - tile * 0.01, tile * 0.025, 0, Math.PI * 2);
    ctx.fill();
  }
}
