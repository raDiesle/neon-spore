import type { StrikeFrame } from "./boss-strike-look.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { colFromX } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE GIMBAL's own blow at the hull** (`boss-strike-look.ts`). The seam's
 * bead has already run the middle column in plain sight (`gimbal-draw.ts`'s
 * `drawLeak`) and sits on the skin when the fuse ends, so nothing new is
 * thrown. The bead, in the colour it was venting, is pressed flat into the
 * plating, and the plating splits along a seam — the drum's crack carried
 * into the ship, bent over the skin rather than sagging as the drum's does —
 * lit from inside, spitting beads of the same colour along the skin, then
 * closing dark.
 */

/** The bead's own half-sizes, in tiles — `drawLeak`'s. */
const BEAD_W = 0.18;
const BEAD_H = 0.26;
/** Half the width of the seam the hull opens along, and how far its ends drop, in tiles. */
const SEAM = 0.75;
const DROP = 0.22;
const SPITS = 8;

export function gimbalBlow(ctx: CanvasRenderingContext2D, f: StrikeFrame): void {
  const { l, to, tile } = f;
  const fade = 1 - f.after;
  if (fade <= 0) return;
  // The colour the seam was venting, read the way `drawLeak` reads it.
  const colour = colFromX(l, to.x) % 2 === 0 ? PALETTE.red : PALETTE.cyan;
  ctx.save();
  // The bead pressed into the skin: from where the leak left it, flatter and wider.
  if (f.after < 0.5) {
    const press = f.reach * (1 - f.after * 2);
    const y = l.hullY + (to.y - l.hullY) * f.reach;
    const bead = new Path2D();
    bead.ellipse(
      to.x,
      y,
      tile * BEAD_W * (1 + 1.6 * f.reach),
      tile * BEAD_H * (1 - 0.7 * f.reach),
      0,
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = rgba(colour, 0.9 * (1 - f.after * 2));
    ctx.fill(bead);
    strokeGlow(ctx, bead, colour, STROKE.inner, 2 * (0.5 + press));
  }
  if (f.after > 0) {
    // The plating opens along the drum's seam, the widest at the landing.
    const open = Math.min(1, f.after * 3);
    const shut = Math.max(0, (f.after - 0.55) / 0.45);
    const w = tile * SEAM * (0.4 + 0.6 * open);
    const seam = new Path2D();
    seam.moveTo(to.x - w, to.y + tile * DROP * (w / (tile * SEAM)));
    seam.quadraticCurveTo(
      to.x,
      to.y - tile * DROP,
      to.x + w,
      to.y + tile * DROP * (w / (tile * SEAM)),
    );
    ctx.lineCap = "round";
    ctx.strokeStyle = rgba(PALETTE.hullRim, 0.9 * (1 - shut));
    ctx.lineWidth = tile * 0.08 * (1 - shut);
    ctx.stroke(seam);
    strokeGlow(ctx, seam, colour, STROKE.outline * (1 + open), 2.5 * (1 - shut));
    // Beads of it spat out along the skin to either side, and falling back.
    ctx.fillStyle = rgba(colour, fade);
    for (let i = 0; i < SPITS; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const k = Math.floor(i / 2);
      const a = -Math.PI / 2 + side * (0.5 + 0.28 * k);
      const d = tile * (0.9 + 0.35 * k) * f.after;
      const x = to.x + Math.cos(a) * d;
      const y = to.y + Math.sin(a) * d + 2.2 * tile * f.after * f.after;
      ctx.beginPath();
      ctx.arc(x, y, tile * (0.1 - 0.015 * k), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}
