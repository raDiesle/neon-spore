import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * **What THE DIASTOLE's chambers are made of**: muscle, lit from above, with
 * its owner's blood showing through it — not a grey fill with a glowing line
 * drawn round it, which is what the brief rules out by name.
 *
 * Split off `diastole-draw.ts`, which decides *what* a chamber says, so that
 * file stays about the count and this one about the material.
 *
 * **The line round the chamber was carrying the round**, so nothing it said is
 * dropped, only moved inside: whose chamber it is (the hue), how hard it is
 * squeezing (`glow`), and the snap of a contraction (`snap`, in `rim`). The
 * hue now pools in the flesh from the middle outward and lights the inside of
 * the wall, the way light comes through a membrane — both brighter as the
 * chamber squeezes, and grey where the seat is shown nothing.
 */
export interface Flesh {
  x: number;
  y: number;
  r: number;
  /** Whose blood: the owner's hue, or rock grey. */
  hue: string;
  /** How strongly it shows, 0..1. */
  glow: number;
  /** The contraction's own snap, 0..1, lit in `rim`. */
  snap: number;
  rim: string;
  /** Which side, so the two chambers' veins do not lie the same way. */
  side: number;
}

/** Each vein: where it enters, as a fraction of `r` from the middle, and which
 * way it bends. */
const VEINS: readonly (readonly [number, number])[] = [
  [-0.3, -0.25],
  [0.28, 0.3],
];

export function paintChamber(ctx: CanvasRenderingContext2D, body: Path2D, f: Flesh): void {
  const { x, y, r } = f;
  ctx.save();
  const muscle = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.05, x, y, r * 1.15);
  muscle.addColorStop(0, PALETTE.rock);
  muscle.addColorStop(0.45, PALETTE.rockDark);
  muscle.addColorStop(1, PALETTE.sheenDeep);
  ctx.fillStyle = muscle;
  ctx.fill(body);
  ctx.clip(body);
  // The blood, pooled in the middle and gone by the wall.
  const blood = ctx.createRadialGradient(x, y + r * 0.1, 0, x, y + r * 0.1, r * 0.9);
  blood.addColorStop(0, rgba(f.hue, 0.55 * f.glow));
  blood.addColorStop(1, rgba(f.hue, 0));
  ctx.fillStyle = blood;
  ctx.fill(body);
  // Veins over the curve, from the bridge's side outward: two that fork, not
  // a row of parallels — parallels were drawn first and read as a striped ball.
  ctx.strokeStyle = rgba(PALETTE.sheenDeep, 0.45);
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(1, r * 0.035);
  const t = f.side < 0 ? 1 : -1;
  for (const [dy, bend] of VEINS) {
    const sx = x + t * r;
    const sy = y + dy * r;
    const mx = x + t * r * 0.15;
    const my = y + (dy + bend) * r;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(x + t * r * 0.55, sy + bend * r * 0.2, mx, my);
    ctx.quadraticCurveTo(
      x - t * r * 0.2,
      my - bend * r * 0.6,
      x - t * r * 0.5,
      my - bend * r * 0.9,
    );
    ctx.moveTo(mx, my);
    ctx.quadraticCurveTo(
      x - t * r * 0.05,
      my + bend * r * 0.5,
      x - t * r * 0.3,
      my + bend * r * 0.9,
    );
    ctx.stroke();
  }
  // The wall lit from inside: the hue on the inner edge, and the snap over it.
  // The colours go in plain and the strength in the alpha, so the round's own
  // hue and rim are what the op log carries (`diastole-frame.test.ts`).
  ctx.lineWidth = r * 0.16;
  ctx.strokeStyle = f.hue;
  ctx.globalAlpha = 0.15 + 0.6 * f.glow;
  ctx.stroke(body);
  if (f.snap > 0) {
    ctx.lineWidth = r * 0.12;
    ctx.strokeStyle = f.rim;
    ctx.globalAlpha = f.snap;
    ctx.stroke(body);
  }
  ctx.restore();
  paintFilm(ctx, x, y, r);
}

/** A husk: the same muscle with the blood gone out of it, and no light. */
export function paintHusk(
  ctx: CanvasRenderingContext2D,
  husk: Path2D,
  x: number,
  y: number,
  r: number,
): void {
  ctx.save();
  const dead = ctx.createRadialGradient(x - r * 0.3, y - r * 0.4, r * 0.05, x, y, r * 1.2);
  dead.addColorStop(0, PALETTE.rockDark);
  dead.addColorStop(1, PALETTE.sheenDeep);
  ctx.fillStyle = dead;
  ctx.fill(husk);
  ctx.strokeStyle = rgba(PALETTE.rock, 0.3);
  ctx.lineWidth = 1;
  ctx.stroke(husk);
  ctx.restore();
}

/** The wet film on the shoulder: a soft bloom and a hard point. */
function paintFilm(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.save();
  ctx.fillStyle = rgba(PALETTE.sheenRim, 0.28);
  ctx.beginPath();
  ctx.ellipse(x - r * 0.34, y - r * 0.44, r * 0.3, r * 0.11, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = rgba(PALETTE.sheenRim, 0.8);
  ctx.beginPath();
  ctx.arc(x - r * 0.42, y - r * 0.48, Math.max(1, r * 0.05), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
