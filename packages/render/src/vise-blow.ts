import type { StrikeFrame } from "./boss-strike-look.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";
import { viseKernel, viseKernelPath } from "./vise-shape.js";

/**
 * **THE VISE's own blow at the hull** (`boss-strike-look.ts`). A fire step
 * ran out with the kernel unshot (`vise-step.ts`'s `miss`), so the seed-case
 * does what a seed-case does: it spits a seed. Out of the split at its heavy
 * end comes a husk in the case's own dry brown, the kernel's pointed oval
 * (`viseKernelPath`), tumbling down the middle column. It lands point first,
 * and on the plating it cracks down its long axis and its two halves spring
 * apart, as the case's two lobes do.
 */

/** The seed's size, as a share of the kernel at its fullest. */
const SIZE = 0.8;
/** Turns it tumbles on the way down, ending point first. */
const TURNS = 1.5;
/** How far the halves are thrown apart, in tiles, and how far they swing. */
const THROW = 0.9;
const SWING = 1.1;

export function viseBlow(ctx: CanvasRenderingContext2D, f: StrikeFrame): void {
  const { l, from, to, tile } = f;
  const fade = 1 - f.after;
  if (fade <= 0) return;
  const k = viseKernel(l);
  const seed = viseKernelPath(l, SIZE);
  const tall = k.r * SIZE * 1.22;
  // Lay the seed down with its middle at (x, y), turned `turn`, or one half of it.
  const husk = (x: number, y: number, turn: number, alpha: number, clip?: 0 | 1): void => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(turn);
    ctx.translate(-k.x, -k.y);
    if (clip !== undefined) {
      const half = new Path2D();
      half.rect(clip === 0 ? k.x - tall * 2 : k.x, k.y - tall * 2, tall * 2, tall * 4);
      ctx.clip(half);
    }
    ctx.fillStyle = rgba(PALETTE.viseCase, alpha);
    ctx.fill(seed);
    ctx.strokeStyle = rgba(PALETTE.viseCaseDark, alpha);
    ctx.lineWidth = tile * 0.06;
    ctx.stroke(seed);
    ctx.restore();
  };
  ctx.save();
  if (f.after === 0) {
    // Spat, not dropped: fast out of the case, and still quick at the skin.
    const t = 1 - (1 - f.reach) ** 1.5;
    const x = from.x + (to.x - from.x) * t;
    const y = from.y + (to.y - tall - from.y) * t;
    // Point first at the end: its tip is its top, so it lands turned over.
    husk(x, y, Math.PI * (1 + 2 * TURNS * (1 - t)), 1);
  } else {
    // Cracked down its length on the plating, the halves springing apart.
    const spring = 1 - (1 - f.after) ** 2;
    for (const side of [0, 1] as const) {
      const dir = side === 0 ? -1 : 1;
      const x = to.x + dir * THROW * tile * spring;
      const y = to.y - tall + 1.6 * tile * f.after * f.after - 0.5 * tile * spring;
      husk(x, y, Math.PI + dir * SWING * spring, fade, side);
    }
    // The dent it drove into the plating.
    ctx.strokeStyle = rgba(PALETTE.viseCrack, 0.85 * fade);
    ctx.lineWidth = tile * 0.08;
    ctx.beginPath();
    ctx.ellipse(
      to.x,
      to.y,
      tile * (0.35 + 1.2 * f.after),
      tile * (0.1 + 0.22 * f.after),
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }
  ctx.restore();
}
