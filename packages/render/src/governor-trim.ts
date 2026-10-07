import type { Point } from "./governor-shape.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE GOVERNOR's works, made strange** (`governor-works.ts`): the collars
 * cased round the shaft, the crown of prongs on its head, and each
 * flyweight's lit seam — the parts that take it from an engine's governor to
 * something not built here.
 */

/** The collars cased round the shaft, as fractions of its height. */
const COLLARS = [0.3, 0.45, 0.6, 0.75] as const;
/** The crown's prongs: how far out and up they reach, in tiles. */
const PRONG_OUT = 0.32;
const PRONG_UP = 0.42;

/** The collars round the shaft: short dark bands with a lit lip, so it reads as cased and not a rod. */
export function drawCasing(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  foot: Point,
  head: Point,
): void {
  const bands = new Path2D();
  const lips = new Path2D();
  const rx = 0.11 * l.tile;
  for (const f of COLLARS) {
    const x = foot.x + (head.x - foot.x) * f;
    const y = foot.y + (head.y - foot.y) * f;
    bands.ellipse(x, y, rx, rx * 0.45, 0, 0, Math.PI * 2);
    lips.ellipse(x, y - rx * 0.2, rx, rx * 0.4, 0, Math.PI, Math.PI * 1.6);
  }
  ctx.fillStyle = PALETTE.governorBrassDark;
  ctx.fill(bands);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = PALETTE.governorBrass;
  ctx.stroke(lips);
}

/** The crown on the head: three prongs curling up and out, their tips lit. */
export function drawCrown(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  head: Point,
  pulse: number,
): void {
  const prongs = new Path2D();
  const tips = new Path2D();
  const t = l.tile;
  for (const out of [-1, 0, 1]) {
    const up = out === 0 ? PRONG_UP * 1.3 : PRONG_UP;
    const tip = { x: head.x + out * PRONG_OUT * t, y: head.y - up * t };
    prongs.moveTo(head.x + out * 0.08 * t, head.y);
    prongs.quadraticCurveTo(head.x + out * PRONG_OUT * 0.2 * t, tip.y + 0.1 * t, tip.x, tip.y);
    tips.moveTo(tip.x + 0.06 * t, tip.y);
    tips.arc(tip.x, tip.y, 0.06 * t, 0, Math.PI * 2);
  }
  ctx.lineCap = "round";
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = PALETTE.governorBrassDark;
  ctx.stroke(prongs);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = PALETTE.governorBrass;
  ctx.stroke(prongs);
  ctx.fillStyle = rgba(PALETTE.governorGlow, pulse);
  ctx.fill(tips);
}

/**
 * A flyweight's seam: a dark cut round its middle, seen from above so it
 * bows down, with the veins' light inside it; and a fleck of gloss up toward
 * the key.
 */
export function drawPodSeam(
  ctx: CanvasRenderingContext2D,
  ball: Point,
  r: number,
  pulse: number,
): void {
  const seam = new Path2D();
  seam.ellipse(ball.x, ball.y + r * 0.1, r, r * 0.32, 0, 0, Math.PI);
  ctx.lineWidth = Math.max(STROKE.inner * 1.6, r * 0.22);
  ctx.strokeStyle = PALETTE.governorBrassDark;
  ctx.stroke(seam);
  ctx.lineWidth = Math.max(1, r * 0.08);
  ctx.strokeStyle = rgba(PALETTE.governorGlow, pulse);
  ctx.stroke(seam);
  const fleck = new Path2D();
  fleck.ellipse(ball.x - r * 0.38, ball.y - r * 0.45, r * 0.22, r * 0.12, -0.6, 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.governorSheen, 0.55);
  ctx.fill(fleck);
}
