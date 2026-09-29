import type { SimConfig } from "@neon-spore/sim";
import type { Point, StrikeFrame } from "./boss-strike-look.js";
import { TILT_READ } from "./governor-pose.js";
import { governorDial, rimDepth } from "./governor-shape.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **THE GOVERNOR's own blow at the hull** (`boss-strike-look.ts`). A fire
 * step ran out with the hub unshot (`governor-step.ts`'s `governorMiss`),
 * and the flywheel does what a flywheel with nobody governing it does: it
 * bursts. A shard of the brass rim shears off the near edge, and tumbles
 * end over end down the middle column, slow off the wheel and hard at the
 * end, to the skin at `reach = 1`. There it bites in: a notch is left where
 * it struck and brass sparks spray up off it and die.
 */

/** The shard's length and thickness, in tiles, and how many turns it tumbles on the way down. */
const LONG = 0.5;
const THICK = 0.16;
const TURNS = 2.5;
/** The sparks it bursts into, how high they spray and how wide, in tiles. */
const SPARKS = 8;
const SPRAY = 1;
const SPREAD = 1.1;

/** Where the blow leaves the body: the flywheel's near edge, under the dial's middle. */
export function governorBlowFrom(l: Layout, cfg: SimConfig): Point {
  const d = governorDial(l, cfg, TILT_READ);
  return { x: d.cx, y: d.cy + d.r * d.tilt + rimDepth(l, d) };
}

/** How far down the fall the shard is at `reach`: shed slow, falling hard. */
function fall(reach: number): number {
  return reach ** 1.6;
}

/** The shard: a curved piece of rim, brass on its face and dark on its broken edges. */
function shard(tile: number): Path2D {
  const w = LONG * tile;
  const h = THICK * tile;
  const p = new Path2D();
  p.moveTo(-w / 2, -h * 0.2);
  p.quadraticCurveTo(0, -h * 1.1, w / 2, -h * 0.4);
  p.lineTo(w * 0.42, h * 0.5);
  p.quadraticCurveTo(0, -h * 0.1, -w * 0.46, h * 0.6);
  p.closePath();
  return p;
}

export function governorBlow(ctx: CanvasRenderingContext2D, f: StrikeFrame): void {
  const { from, to, tile } = f;
  const fade = 1 - f.after;
  if (fade <= 0) return;
  const t = fall(f.reach);
  const x = from.x + (to.x - from.x) * t;
  const y = from.y + (to.y - from.y) * t;
  // Whole until it strikes, then gone to sparks in the first tenth after.
  const whole = f.after > 0 ? Math.max(0, 1 - f.after * 10) : 1;
  if (whole > 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * TURNS * Math.PI * 2);
    const body = shard(tile);
    ctx.fillStyle = rgba(PALETTE.governorBrass, whole);
    ctx.fill(body);
    ctx.strokeStyle = rgba(PALETTE.governorBrassDark, 0.95 * whole);
    ctx.lineWidth = tile * 0.05;
    ctx.stroke(body);
    ctx.restore();
  }
  if (f.after <= 0) return;
  const a = f.after;
  ctx.save();
  // The notch where it bit: a dark wedge cut into the plating.
  ctx.fillStyle = rgba(PALETTE.governorBrassDark, 0.85 * fade);
  ctx.beginPath();
  const open = tile * (0.2 + 0.2 * Math.min(1, a * 4));
  ctx.moveTo(to.x - open, to.y);
  ctx.lineTo(to.x, to.y + tile * 0.2);
  ctx.lineTo(to.x + open, to.y);
  ctx.closePath();
  ctx.fill();
  // The sparks, spraying up and out off the notch and falling back as they die.
  for (let i = 0; i < SPARKS; i++) {
    const across = (i / (SPARKS - 1)) * 2 - 1;
    const out = 1 - (1 - a) ** 2;
    const sx = to.x + across * SPREAD * tile * out;
    const sy = to.y - SPRAY * tile * (1 - Math.abs(across) * 0.6) * 4 * a * (1 - a);
    const s = tile * (0.05 + 0.03 * (i % 2)) * fade;
    ctx.fillStyle = rgba(i % 3 ? PALETTE.governorHot : PALETTE.governorBrass, fade);
    ctx.fillRect(sx - s, sy - s, s * 2, s * 2);
  }
  ctx.restore();
}
