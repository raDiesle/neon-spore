import { TRIVET_PADS } from "@neon-spore/sim";
import type { StrikeFrame } from "./boss-strike-look.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";
import { trivetLegPath, trivetPlatePath, trivetSocketAt, trivetSocketR } from "./trivet-shape.js";

/**
 * **THE TRIVET's own blow at the hull** (`boss-strike-look.ts`). A fire step
 * ran out with the hub unshot (`trivet-step.ts`'s `miss`), so the stand does
 * the one thing its third leg is for: it stamps. The middle needle, the leg
 * that is never lifted, runs on out of its foot down the middle column,
 * slow to start and hard at the end, a stake driven rather than a shot. It
 * pierces the plating and leaves the stand's own footprint there, a plate
 * with its sockets pressed into the skin, then draws back up into the foot.
 */

/** How far the needle is drawn back before it drives, in tiles. */
const COCK = 0.35;

export function trivetBlow(ctx: CanvasRenderingContext2D, f: StrikeFrame): void {
  const { l, from, to, tile } = f;
  const fade = 1 - f.after;
  if (fade <= 0) return;
  ctx.save();
  // Driven: it draws back a little, then goes hard, reaching the skin at 1.
  const drive = f.reach < 0.3 ? -COCK * tile * (f.reach / 0.3) : 0;
  const t = f.reach < 0.3 ? 0 : ((f.reach - 0.3) / 0.7) ** 2;
  const withdraw = f.after * f.after;
  const tipY = from.y + drive + (to.y - from.y) * t * (1 - withdraw);
  if (tipY > from.y + tile * 0.05) {
    const needle = trivetLegPath(l, { x: from.x, y: from.y }, { x: to.x, y: tipY });
    ctx.fillStyle = rgba(PALETTE.trivetMetal, fade);
    ctx.fill(needle);
    ctx.strokeStyle = rgba(PALETTE.trivetMetalDark, 0.9 * fade);
    ctx.lineWidth = tile * 0.04;
    ctx.stroke(needle);
  }
  if (f.after > 0) {
    // The footprint: the stand's plate pressed flat into the skin, its sockets holes.
    const press = Math.min(1, f.after * 5);
    ctx.save();
    ctx.translate(to.x, to.y);
    ctx.scale(1 + 0.25 * press, 0.55);
    ctx.fillStyle = rgba(PALETTE.trivetMetalDark, 0.8 * fade);
    ctx.fill(trivetPlatePath(l));
    ctx.strokeStyle = rgba(PALETTE.trivetSocket, 0.8 * fade);
    ctx.lineWidth = tile * 0.06;
    ctx.stroke(trivetPlatePath(l));
    ctx.fillStyle = rgba(PALETTE.trivetSocket, 0.85 * fade * (1 - 0.6 * f.after));
    for (let k = 0; k < TRIVET_PADS; k++) {
      const s = trivetSocketAt(l, 0, k);
      ctx.beginPath();
      ctx.arc(s.x, s.y, trivetSocketR(l), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    // The shock of the stamp, running out flat along the plating.
    ctx.strokeStyle = rgba(PALETTE.trivetSocket, 0.6 * fade);
    ctx.lineWidth = tile * 0.06;
    ctx.beginPath();
    ctx.ellipse(
      to.x,
      to.y,
      tile * (0.7 + 1.5 * f.after),
      tile * (0.14 + 0.2 * f.after),
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }
  ctx.restore();
}
