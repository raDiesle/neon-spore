import type { SimConfig } from "@neon-spore/sim";
import type { Point, StrikeFrame } from "./boss-strike-look.js";
import { flueCentre, flueUnitR } from "./flue-shape.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **THE FLUE's own blow at the hull** (`boss-strike-look.ts`). A fire step
 * ran out unshot (`flue-step.ts`'s `miss`), and the flue does what a flue
 * does with nobody drawing on it: it coughs. A cinder is coughed out from
 * under the damper, soot outside and the rim's white hot at its heart
 * (`flue-draw.ts`), and falls down the middle column trailing smoke, slow off
 * the flue and hard at the end, to the skin at `reach = 1`. There it bursts:
 * a scorch is left where it struck and sparks of the rim's white spray up off
 * it and die.
 */

/** The cinder's radius and its white heart's, in tiles. */
const CINDER = 0.26;
const HEART = 0.11;
/** The smoke puffs trailing it, how far back along the fall each sits and how wide each grows, in tiles. */
const PUFFS = 4;
const TRAIL = 0.09;
const PUFF = 0.18;
/** The sparks it bursts into, how high they spray and how wide, in tiles. */
const SPARKS = 8;
const SPRAY = 1.1;
const SPREAD = 1.2;

/** Where the blow leaves the body: the damper's underside, under the flue's middle. */
export function flueBlowFrom(l: Layout, cfg: SimConfig): Point {
  const c = flueCentre(l, cfg);
  return { x: c.x, y: c.y + flueUnitR(l) };
}

/** How far down the fall the cinder is at `reach`: coughed out slow, falling hard. */
function fall(reach: number): number {
  return reach ** 1.6;
}

export function flueBlow(ctx: CanvasRenderingContext2D, f: StrikeFrame): void {
  const { from, to, tile } = f;
  const fade = 1 - f.after;
  if (fade <= 0) return;
  const t = fall(f.reach);
  const x = from.x + (to.x - from.x) * t;
  const y = from.y + (to.y - from.y) * t;
  // Whole until it strikes, then gone to sparks in the first tenth after.
  const whole = f.after > 0 ? Math.max(0, 1 - f.after * 10) : 1;
  if (whole > 0) {
    const r = CINDER * tile;
    ctx.save();
    ctx.translate(x, y);
    const body = new Path2D();
    body.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = rgba(PALETTE.flueSoot, whole);
    ctx.fill(body);
    ctx.strokeStyle = rgba(PALETTE.flueSootDark, 0.95 * whole);
    ctx.lineWidth = tile * 0.05;
    ctx.stroke(body);
    const heart = new Path2D();
    heart.arc(0, 0, HEART * tile * (0.85 + 0.15 * Math.sin(f.time * 18)), 0, Math.PI * 2);
    ctx.fillStyle = rgba(PALETTE.hullRim, whole);
    ctx.fill(heart);
    ctx.restore();
    // The smoke it trails, thinning and widening back up the fall.
    for (let i = 1; i <= PUFFS; i++) {
      const back = fall(Math.max(0, f.reach - i * TRAIL));
      const py = from.y + (to.y - from.y) * back;
      if (py >= y) continue;
      const puff = new Path2D();
      puff.arc(from.x, py, (CINDER + i * PUFF * 0.5) * tile, 0, Math.PI * 2);
      ctx.fillStyle = rgba(PALETTE.flueSootDark, (0.4 * whole * (PUFFS + 1 - i)) / PUFFS);
      ctx.fill(puff);
    }
  }
  if (f.after <= 0) return;
  const a = f.after;
  ctx.save();
  // The scorch where it struck: a dark oval on the plating.
  ctx.fillStyle = rgba(PALETTE.flueSootDark, 0.8 * fade);
  ctx.beginPath();
  ctx.ellipse(
    to.x,
    to.y,
    tile * (0.35 + 0.35 * Math.min(1, a * 4)),
    tile * 0.12,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // The sparks, spraying up and out off the scorch and falling back as they die.
  for (let i = 0; i < SPARKS; i++) {
    const across = (i / (SPARKS - 1)) * 2 - 1;
    const out = 1 - (1 - a) ** 2;
    const sx = to.x + across * SPREAD * tile * out;
    const sy = to.y - SPRAY * tile * (1 - Math.abs(across) * 0.6) * 4 * a * (1 - a);
    const s = tile * (0.05 + 0.03 * (i % 2)) * fade;
    ctx.fillStyle = rgba(i % 3 ? PALETTE.hullRim : PALETTE.flueSoot, fade);
    ctx.fillRect(sx - s, sy - s, s * 2, s * 2);
  }
  ctx.restore();
}
