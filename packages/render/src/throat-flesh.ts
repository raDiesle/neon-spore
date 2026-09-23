import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";
import { splinePath } from "./spline.js";

/**
 * **What THE THROAT is made of**: a wet gullet of ring muscle, lit from above
 * and to the left — not a grey fill with a glowing line drawn round it, which
 * is the one picture the brief rules out by name (`new-boss-more` §6.3).
 *
 * Split off `throat-draw.ts`, `throat-mouth.ts` and `throat-evert.ts`, which
 * decide *what* the gullet says — how many rings still hold, where the mouth
 * stands, how far it has everted — so they stay about the fight and this one
 * about the material.
 *
 * **The rings were carrying the count, and still are.** A taut ring is a band
 * of muscle standing proud of the tube, its front lit and its underside in
 * shadow; the gulp passing through it lights its crest in the hull's rim; a
 * slack one is a limp dark band sagging inside its station. Only the *front*
 * of a ring is drawn — the back is behind the tube — except on the top one,
 * whose whole rim is the gullet's opening.
 *
 * **Every width is off the tile, never off a ring's radius**, so a squeezing
 * ring does not add a width per frame. The colours go in plain and the
 * strength in the alpha, so the tests find them on the op log.
 *
 * The mouth's lip and the everted inside are `throat-flesh-lip.ts`.
 */

/** Points round an oval from angle `from` to `to`, with a little life in them. */
export function ovalArc(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  time: number,
  seed: number,
  from: number,
  to: number,
  n: number,
): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= n; i++) {
    const a = from + ((to - from) * i) / n;
    const m = 1 + 0.05 * Math.sin(a * 3 + seed) + 0.03 * Math.sin(time * 1.1 + a * 2 + seed);
    pts.push({ x: cx + Math.cos(a) * rx * m, y: cy + Math.sin(a) * ry * m });
  }
  return pts;
}

/**
 * The tube: rock gone dark at both edges, the way a cylinder does, with a
 * wet streak running down its lit side. `streak` is a line down that side.
 */
export function paintTube(
  ctx: CanvasRenderingContext2D,
  skin: Path2D,
  streak: Path2D,
  tile: number,
): void {
  ctx.save();
  ctx.fillStyle = PALETTE.rockDark;
  ctx.fill(skin);
  ctx.clip(skin);
  // The edges turning away from the eye: the skin stroked inside itself in
  // three widths, so the dark comes in by degrees rather than as a second
  // layer — one wide stroke was drawn first and read as a tube in a sleeve.
  ctx.lineJoin = "round";
  ctx.strokeStyle = PALETTE.sheenDeep;
  for (const [w, a] of [
    [0.5, 0.2],
    [0.32, 0.22],
    [0.16, 0.3],
  ] as const) {
    ctx.lineWidth = tile * w;
    ctx.globalAlpha = a;
    ctx.stroke(skin);
  }
  // The lit side, soft, and its wet film broken into glints — one unbroken
  // film was drawn first and read as a seam.
  ctx.lineCap = "round";
  ctx.lineWidth = tile * 0.24;
  ctx.strokeStyle = PALETTE.rock;
  ctx.globalAlpha = 0.18;
  ctx.stroke(streak);
  ctx.lineWidth = Math.max(1, tile * 0.03);
  ctx.strokeStyle = PALETTE.sheenRim;
  ctx.globalAlpha = 0.45;
  ctx.setLineDash([tile * 0.5, tile * 0.35, tile * 0.15, tile * 0.6]);
  ctx.stroke(streak);
  ctx.setLineDash([]);
  ctx.restore();
}

export interface Band {
  x: number;
  y: number;
  rx: number;
  ry: number;
  index: number;
  tile: number;
  time: number;
  /** The gulp passing through it, 0..1. */
  squeeze: number;
  /** The top one: its whole rim is the opening, with the dark inside it. */
  mouth: boolean;
}

/** A taut ring: a band of muscle round the tube, its front lit. */
export function paintBand(ctx: CanvasRenderingContext2D, b: Band): void {
  const { tile } = b;
  const arc = (dy: number, from: number, to: number) =>
    splinePath(ovalArc(b.x, b.y + dy, b.rx, b.ry, b.time, b.index, from, to, 14), false);
  ctx.save();
  ctx.lineCap = "round";
  if (b.mouth) {
    const hole = splinePath(
      ovalArc(b.x, b.y, b.rx, b.ry, b.time, b.index, 0, Math.PI * 2, 26),
      true,
    );
    const dark = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.rx);
    dark.addColorStop(0, rgba(PALETTE.background, 0.95));
    dark.addColorStop(1, rgba(PALETTE.sheenDeep, 0.9));
    ctx.fillStyle = dark;
    ctx.fill(hole);
    ctx.lineWidth = tile * 0.07;
    ctx.strokeStyle = PALETTE.rock;
    ctx.globalAlpha = 0.45;
    ctx.stroke(arc(0, Math.PI, Math.PI * 2));
  }
  const front = arc(0, 0, Math.PI);
  // Its underside's shadow on the tube, then the band, then its crest.
  ctx.lineWidth = tile * 0.16;
  ctx.strokeStyle = PALETTE.sheenDeep;
  ctx.globalAlpha = 0.7;
  ctx.stroke(arc(tile * 0.04, 0, Math.PI));
  ctx.lineWidth = tile * 0.1;
  ctx.strokeStyle = PALETTE.rock;
  ctx.globalAlpha = 0.75 + 0.25 * b.squeeze;
  ctx.stroke(front);
  ctx.lineWidth = Math.max(1, tile * 0.03);
  ctx.strokeStyle = PALETTE.sheenRim;
  ctx.globalAlpha = 0.55;
  ctx.stroke(arc(-tile * 0.025, Math.PI * 0.55, Math.PI * 0.9));
  if (b.squeeze > 0) {
    ctx.lineWidth = tile * 0.05;
    ctx.strokeStyle = PALETTE.hullRim;
    ctx.globalAlpha = 0.85 * b.squeeze;
    ctx.stroke(arc(-tile * 0.02, Math.PI * 0.1, Math.PI * 0.9));
  }
  ctx.restore();
}

/** A slack ring: the band gone limp, sagging inside its own station. */
export function paintLimp(ctx: CanvasRenderingContext2D, b: Band): void {
  const { tile } = b;
  const sag = splinePath(
    ovalArc(b.x, b.y + tile * 0.07, b.rx * 0.66, b.ry * 1.5, 0, b.index, 0, Math.PI, 14),
    false,
  );
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineWidth = tile * 0.1;
  ctx.strokeStyle = PALETTE.sheenDeep;
  ctx.globalAlpha = 0.8;
  ctx.stroke(sag);
  ctx.lineWidth = tile * 0.06;
  ctx.strokeStyle = PALETTE.rockDark;
  ctx.globalAlpha = 1;
  ctx.stroke(sag);
  ctx.restore();
}
