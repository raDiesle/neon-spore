import { RATCHET_TEETH } from "@neon-spore/sim";
import type { StrikeFrame } from "./boss-strike-look.js";
import { haspBlow } from "./hasp-blow.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";
import { ratchetGirth, ratchetStep } from "./ratchet-shape.js";

/**
 * **THE RATCHET's own blows at the hull** (`boss-strike-look.ts`). It has two
 * ways to break the ship, and the sim names which (`ratchet-step.ts`):
 *
 * - **The loose bolt** has already fallen the middle column in plain sight
 *   (`ratchet-draw.ts`'s `drawBolt`), the same pale pin THE HASP throws, so
 *   its blow is THE HASP's: that pin driven home (`hasp-blow.ts`).
 * - **The jam**: the pawl lets go and the rack's head plate, the wide one at
 *   its foot, is shot down the strut. It is the rack's own plate — straight
 *   sides, the tooth stepped out on the pawl's side, the rack's dark stone —
 *   gathering speed with a smear of itself behind it, and it hits the plating
 *   flat, crumples, and throws its stone off in chips.
 */

/** Ghosts of the plate left behind it on the way down, and how far apart. */
const GHOSTS = 3;
const GHOST_GAP = 0.09;
/** Chips thrown off the plating, and how far, in tiles. */
const CHIPS = 6;
const THROW = 1.3;

export function ratchetBlow(ctx: CanvasRenderingContext2D, f: StrikeFrame): void {
  if (f.blow === "bolt") {
    haspBlow(ctx, f);
    return;
  }
  const { from, to, tile } = f;
  const fade = 1 - f.after;
  if (fade <= 0) return;
  const w = ratchetGirth(f.l, RATCHET_TEETH - 1);
  const h = ratchetStep(f.l);
  const lap = 0.2 * tile;
  // Falling, not thrown: it gathers speed all the way down.
  const at = (t: number) => from.y + (to.y - from.y) * t * t;
  // Flattened against the hull once it lands.
  const squash = 1 - 0.55 * Math.min(1, f.after * 3);
  const plate = (bottom: number, alpha: number): void => {
    const top = bottom - h * squash;
    const spread = 1 + 0.25 * (1 - squash);
    ctx.fillStyle = rgba(PALETTE.rockDark, 0.9 * alpha);
    ctx.strokeStyle = rgba(PALETTE.rock, alpha);
    ctx.beginPath();
    ctx.moveTo(to.x - w * spread, top);
    ctx.lineTo(to.x + w * spread, top);
    ctx.lineTo(to.x + (w + lap) * spread, bottom);
    ctx.lineTo(to.x - w * spread, bottom);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };
  ctx.save();
  ctx.lineWidth = tile * 0.06;
  ctx.lineJoin = "miter";
  if (f.after === 0) {
    for (let g = GHOSTS; g >= 1; g--) {
      const t = f.reach - g * GHOST_GAP;
      if (t > 0) plate(at(t), 0.22 * (1 - g / (GHOSTS + 1)));
    }
  }
  plate(at(f.reach), fade);
  if (f.after > 0) {
    // The chips of the rack's stone, thrown up off the plating and falling back.
    ctx.fillStyle = rgba(PALETTE.rock, fade);
    for (let i = 0; i < CHIPS; i++) {
      const a = Math.PI * (1.08 + (0.84 * i) / (CHIPS - 1));
      const d = THROW * tile * f.after;
      const x = to.x + Math.cos(a) * d;
      const y = to.y + Math.sin(a) * d + 2 * tile * f.after * f.after;
      const r = tile * (0.08 + 0.04 * (i % 2));
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    // And the plating rings under the weight.
    ctx.strokeStyle = rgba(PALETTE.red, 0.8 * fade);
    ctx.lineWidth = tile * 0.09;
    ctx.beginPath();
    ctx.ellipse(
      to.x,
      to.y,
      tile * (0.8 + 1.4 * f.after),
      tile * (0.16 + 0.26 * f.after),
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }
  ctx.restore();
}
