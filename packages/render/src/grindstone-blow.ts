import type { SimConfig } from "@neon-spore/sim";
import type { Point, StrikeFrame } from "./boss-strike-look.js";
import { grindstoneCentre, grindstoneR } from "./grindstone-shape.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **THE GRINDSTONE's own blow at the hull** (`boss-strike-look.ts`). A fire
 * step ran out unanswered (`grindstone-step.ts`'s `miss`), and the wheel does
 * what a stone does when it is run with nobody on it: it throws a chip. A
 * piece breaks off the bottom of the wheel, grey outside and the pale tan of
 * a ground flat on the face it broke along (`grindstone-draw.ts`), and
 * tumbles down the middle column, slow off the stone and hard at the end, to
 * the skin at `reach = 1`. There it shatters: grit skids out low along the
 * plating either way, and a dark scuff is left where it struck.
 */

/** The chip's radius, in tiles, and the turns it tumbles on its way down. */
const CHIP = 0.34;
const TURNS = 1.75;
/** The chip's outline, and the face it broke along, in chip radii round its middle. */
const OUTLINE: readonly (readonly [number, number])[] = [
  [-1, -0.5],
  [-0.2, -0.85],
  [0.85, -0.45],
  [1, 0.3],
  [0.3, 0.9],
  [-0.7, 0.6],
];
const FACE: readonly (readonly [number, number])[] = [
  [-1, -0.5],
  [-0.2, -0.85],
  [0.85, -0.45],
  [0.15, -0.05],
];
/** The grit it shatters into, how far it skids either way and how high it hops, in tiles. */
const GRIT = 7;
const SKID = 1.5;
const HOP = 0.35;

/** Where the blow leaves the body: the bottom of the wheel, under the axle. */
export function grindstoneBlowFrom(l: Layout, cfg: SimConfig): Point {
  const c = grindstoneCentre(l, cfg);
  return { x: c.x, y: c.y + grindstoneR(l) };
}

function polygon(pts: readonly (readonly [number, number])[], r: number): Path2D {
  const p = new Path2D();
  pts.forEach(([x, y], i) => {
    if (i === 0) p.moveTo(x * r, y * r);
    else p.lineTo(x * r, y * r);
  });
  p.closePath();
  return p;
}

export function grindstoneBlow(ctx: CanvasRenderingContext2D, f: StrikeFrame): void {
  const { from, to, tile } = f;
  const fade = 1 - f.after;
  if (fade <= 0) return;
  // Thrown off a turning stone: slow off the wheel and hard at the end.
  const t = f.reach ** 2;
  const x = from.x + (to.x - from.x) * t;
  const y = from.y + (to.y - from.y) * t;
  // Whole until it strikes, then gone to grit in the first tenth after.
  const whole = f.after > 0 ? Math.max(0, 1 - f.after * 10) : 1;
  if (whole > 0) {
    const r = CHIP * tile;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(f.reach * TURNS * Math.PI * 2);
    const chip = polygon(OUTLINE, r);
    ctx.fillStyle = rgba(PALETTE.grindstoneStone, whole);
    ctx.fill(chip);
    ctx.fillStyle = rgba(PALETTE.grindstoneFlat, whole);
    ctx.fill(polygon(FACE, r));
    ctx.strokeStyle = rgba(PALETTE.grindstoneStoneDark, 0.95 * whole);
    ctx.lineWidth = tile * 0.05;
    ctx.lineJoin = "round";
    ctx.stroke(chip);
    ctx.restore();
  }
  if (f.after <= 0) return;
  const a = f.after;
  ctx.save();
  // The scuff where it struck: a dark streak along the plating.
  ctx.strokeStyle = rgba(PALETTE.grindstoneStoneDark, 0.85 * fade);
  ctx.lineWidth = tile * 0.1;
  ctx.lineCap = "round";
  const scuff = tile * (0.3 + 0.5 * Math.min(1, a * 4));
  ctx.beginPath();
  ctx.moveTo(to.x - scuff, to.y);
  ctx.lineTo(to.x + scuff, to.y);
  ctx.stroke();
  // The grit, skidding out low either way, grey and tan by turns.
  for (let i = 0; i < GRIT; i++) {
    const across = (i / (GRIT - 1)) * 2 - 1;
    const out = 1 - (1 - a) ** 2;
    const gx = to.x + across * SKID * tile * out;
    const gy = to.y - HOP * tile * (1 - Math.abs(across) * 0.5) * 4 * a * (1 - a);
    const s = tile * (0.07 + 0.04 * ((i * 3) % 2)) * fade;
    ctx.fillStyle = rgba(i % 2 ? PALETTE.grindstoneFlat : PALETTE.grindstoneStone, fade);
    ctx.save();
    ctx.translate(gx, gy);
    ctx.rotate(across * 3 + a * 6);
    ctx.fillRect(-s, -s, s * 2, s * 2);
    ctx.restore();
  }
  ctx.restore();
}
