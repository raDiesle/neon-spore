import { blobPoints } from "@neon-spore/content";
import type { SimConfig, SpliceState } from "@neon-spore/sim";
import { rgba } from "./hex.js";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE } from "./palette.js";
import { type SpliceCurve, spliceMouthR, spliceMouthY } from "./splice-straws.js";
import { splinePath } from "./spline.js";

/**
 * **What THE SPLICE's straws and mouths are made of**: gut, not wire
 * (`new-boss-more` §6.3).
 *
 * A straw is a tube — a dark casing, a translucent wall, a wet line of light
 * down its upper-left side — ringed across at even steps like a windpipe, so
 * it reads as a grown hose from end to end. A mouth is a puckered socket: a
 * lobed lip round the ring the state is told in, dark inside, wet where the
 * light catches its lower lip.
 *
 * **What the navigator traces is unchanged.** Each straw is drawn whole
 * before the next, so a crossing is still one hose passing behind another,
 * and nothing on a tube moves: a pulse down a straw would be a second thing
 * travelling down it, and the number in flight is the only one there is. The
 * mouth's ring and its colours are drawn over the lip, as they were before it.
 * The mouths came here from `splice-draw.ts` with their lips.
 * **Every width is off the tile.**
 */

/** How far apart a straw's rings are, in tiles. */
const RING_STEP = 0.42;

/** A point and the unit direction of travel, `t` along the curve. */
function along(c: SpliceCurve, t: number): { x: number; y: number; dx: number; dy: number } {
  const u = 1 - t;
  const x = u * u * c.x0 + 2 * u * t * c.cx + t * t * c.x1;
  const y = u * u * c.y0 + 2 * u * t * c.cy + t * t * c.y1;
  const dx = 2 * u * (c.cx - c.x0) + 2 * t * (c.x1 - c.cx);
  const dy = 2 * u * (c.cy - c.y0) + 2 * t * (c.y1 - c.cy);
  const n = Math.hypot(dx, dy) || 1;
  return { x, y, dx: dx / n, dy: dy / n };
}

function curve(ctx: CanvasRenderingContext2D, c: SpliceCurve): void {
  ctx.beginPath();
  ctx.moveTo(c.x0, c.y0);
  ctx.quadraticCurveTo(c.cx, c.cy, c.x1, c.y1);
  ctx.stroke();
}

/** One straw, whole: casing, wall, rings, the wet line. `wide` is the
 * casing's width. */
export function drawTube(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: SpliceCurve,
  wide: number,
): void {
  ctx.lineCap = "round";
  ctx.strokeStyle = PALETTE.rockDark;
  ctx.lineWidth = wide;
  curve(ctx, c);
  ctx.strokeStyle = rgba(PALETTE.rock, 0.55);
  ctx.lineWidth = wide * 0.62;
  curve(ctx, c);

  const length = Math.hypot(c.cx - c.x0, c.cy - c.y0) + Math.hypot(c.x1 - c.cx, c.y1 - c.cy);
  const rings = Math.max(2, Math.floor(length / (l.tile * RING_STEP)));
  const half = wide * 0.36;
  ctx.strokeStyle = rgba(PALETTE.rockDark, 0.7);
  ctx.lineWidth = Math.max(0.8, wide * 0.14);
  ctx.beginPath();
  for (let i = 1; i < rings; i++) {
    const p = along(c, i / rings);
    ctx.moveTo(p.x - p.dy * half, p.y + p.dx * half);
    ctx.lineTo(p.x + p.dy * half, p.y - p.dx * half);
  }
  ctx.stroke();

  // The wet line, a third of the way from the middle to the left-hand wall,
  // where a light from the upper left runs down a round thing.
  const off = wide * 0.16;
  const n = along(c, 0.5);
  const side = n.dy >= 0 ? 1 : -1;
  ctx.save();
  ctx.translate(-n.dy * off * side, n.dx * off * side);
  ctx.strokeStyle = rgba(PALETTE.sheenRim, 0.55);
  ctx.lineWidth = Math.max(0.7, wide * 0.12);
  curve(ctx, c);
  ctx.restore();
}

/** A straw's stub on the seat holding the cannon: the same tube, fading in
 * from nothing a hand's width over its mouth. `topY` is where it is gone. */
export function drawTubeStub(
  ctx: CanvasRenderingContext2D,
  c: SpliceCurve,
  wide: number,
  topY: number,
): void {
  const fade = (hex: string, a: number): CanvasGradient => {
    const g = ctx.createLinearGradient(0, topY, 0, c.y1);
    g.addColorStop(0, rgba(hex, 0));
    g.addColorStop(1, rgba(hex, a));
    return g;
  };
  ctx.lineCap = "round";
  ctx.strokeStyle = fade(PALETTE.rockDark, 1);
  ctx.lineWidth = wide;
  curve(ctx, c);
  ctx.strokeStyle = fade(PALETTE.rock, 0.6);
  ctx.lineWidth = wide * 0.55;
  curve(ctx, c);
}

/** The lip round a mouth: lobed, dark in its throat, a wet catch of light on
 * its lower edge. Under the ring the state is told in, and inside the ring the
 * pilot's own mouth is marked with, so the two never share an edge. */
function drawMouthLip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  beats: number,
  seed: number,
): void {
  const breath = 1 + 0.04 * Math.sin(beats * Math.PI + seed);
  const lip = splinePath(
    blobPoints(x, y, r * 1.4 * breath, r * 1.28 * breath, 6, 0.1, 0.04, beats * 0.3, seed, 24),
    true,
  );
  const g = ctx.createRadialGradient(x, y, r * 0.8, x, y, r * 1.45);
  g.addColorStop(0, PALETTE.sheenDeep);
  g.addColorStop(0.55, rgba(PALETTE.sheenMid, 0.45));
  g.addColorStop(1, rgba(PALETTE.sheenCold, 0.25));
  ctx.fillStyle = g;
  ctx.fill(lip);
  ctx.strokeStyle = rgba(PALETTE.sheenRim, 0.25);
  ctx.lineWidth = Math.max(0.8, r * 0.08);
  ctx.stroke(lip);
  ctx.strokeStyle = rgba(PALETTE.sheenRim, 0.6);
  ctx.lineWidth = Math.max(0.8, r * 0.12);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(x, y, r * 1.14, Math.PI * 0.2, Math.PI * 0.6);
  ctx.stroke();
}

/**
 * The mouths: one ring per straw, on the row two tiles over the plating.
 *
 * **The one the pair owes next is marked on neither screen.** Naming it would
 * be the picture answering the puzzle — the navigator has to trace the straw
 * and the pilot has to be told. What *is* marked, on the seat holding the
 * cannon, is the mouth the cannon is standing under: that is a fact about
 * their own thumb rather than about the tangle, and without it the pilot
 * cannot tell the third mouth from the fourth when the columns crowd.
 */
export function drawMouths(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: SpliceState,
  full: boolean,
  cannonCol: number,
  beat: number,
  beatPhase: number,
): void {
  const y = spliceMouthY(l, cfg);
  const r = spliceMouthR(l);
  for (let e = 0; e < s.entranceCols.length; e++) {
    const x = tileCX(l, s.entranceCols[e] ?? 0);
    const done = (s.topOf[e] ?? 0) < s.fed;
    drawMouthLip(ctx, x, y, r, beat + beatPhase, e);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.background;
    ctx.fill();
    ctx.strokeStyle = done ? PALETTE.good : PALETTE.hull;
    ctx.lineWidth = Math.max(1.5, l.tile * 0.07);
    ctx.stroke();
  }
  ctx.lineWidth = 1;
  // The cannon's own mouth, on the seat that moves the cannon. A ring outside
  // the mouth rather than a fill inside it: the mouth is a hole and a hole
  // that filled in when a thumb arrived would read as shut.
  if (full) return;
  const at = s.entranceCols.indexOf(cannonCol);
  if (at === -1) return;
  const pulse = 1 + 0.12 * Math.sin((beat + beatPhase) * Math.PI);
  ctx.beginPath();
  ctx.arc(tileCX(l, s.entranceCols[at] ?? 0), y, r * 1.55 * pulse, 0, Math.PI * 2);
  ctx.strokeStyle = PALETTE.hullRim;
  ctx.globalAlpha = 0.8;
  ctx.stroke();
  ctx.globalAlpha = 1;
}
