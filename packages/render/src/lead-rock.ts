import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * **THE LEAD's ridge**: dark rock, lit along its top edge and gone to the deep
 * under it, laid in strata and pitted, with no glowing line drawn round it —
 * the one picture the brief rules out by name (`new-boss-more` §6.3). The
 * flesh that grows out of it is `lead-flesh.ts`'.
 *
 * **A fade is in the colour**, through `faded`, never in `globalAlpha` alone:
 * the frame test counts the rock's hex while the body stands and its `rgba`
 * once it is going. **Every width is off the tile.**
 */

/** A colour at the fade: the hex itself at full, an `rgba` once it is going. */
export function faded(hex: string, fade: number, alpha = 1): string {
  return fade >= 1 && alpha >= 1 ? hex : rgba(hex, alpha * fade);
}

/** Where the ridge runs. */
export interface Ridge {
  left: number;
  right: number;
  top: number;
  bottom: number;
  tile: number;
}

/** How many pits along the ridge, and where the strata lie, as shares of its depth. */
const PITS = 9;
const STRATA = [0.45, 0.72] as const;

export function paintRidge(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  r: Ridge,
  fade: number,
): void {
  const { left, right, top, bottom, tile } = r;
  const deep = bottom - top;
  ctx.save();
  ctx.fillStyle = faded(PALETTE.background, fade);
  ctx.fill(body);
  ctx.fillStyle = faded(PALETTE.rockDark, fade, 0.85);
  ctx.fill(body);
  ctx.clip(body);
  const hang = ctx.createLinearGradient(0, top, 0, bottom + tile * 0.1);
  hang.addColorStop(0, rgba(PALETTE.sheenRim, 0.12 * fade));
  hang.addColorStop(0.35, rgba(PALETTE.sheenRim, 0));
  hang.addColorStop(0.5, rgba(PALETTE.sheenDeep, 0));
  hang.addColorStop(1, rgba(PALETTE.sheenDeep, 0.55 * fade));
  ctx.fillStyle = hang;
  ctx.fill(body);
  ctx.lineCap = "round";
  // The strata: the rock laid in beds, a dark line a bed.
  ctx.strokeStyle = faded(PALETTE.sheenDeep, fade);
  ctx.lineWidth = Math.max(1, tile * 0.03);
  ctx.globalAlpha = 0.35;
  for (const at of STRATA) {
    ctx.beginPath();
    for (let i = 0; i <= 12; i++) {
      const x = left + ((right - left) * i) / 12;
      const y = top + deep * at + Math.sin(i * 1.7 + at * 9) * tile * 0.03;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  // The pits: a dark hollow with the light caught on its lower lip.
  for (let i = 0; i < PITS; i++) {
    const x = left + ((right - left) * (i + 0.3 + 0.4 * ((i * 7) % 3) * 0.5)) / PITS;
    const y = top + deep * (0.3 + 0.25 * ((i * 5) % 3) * 0.5);
    const w = tile * (0.06 + 0.03 * (i % 2));
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = faded(PALETTE.sheenDeep, fade);
    ctx.beginPath();
    ctx.ellipse(x, y, w, w * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = faded(PALETTE.rock, fade);
    ctx.lineWidth = Math.max(0.8, tile * 0.018);
    ctx.beginPath();
    ctx.ellipse(x, y + w * 0.15, w, w * 0.55, 0, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }
  // Its top edge, caught by the light: stroked wide inside the rock over the
  // top band only, never all round, which was the outline.
  ctx.beginPath();
  ctx.rect(left - tile, top - tile, right - left + 2 * tile, tile + deep * 0.3);
  ctx.clip();
  ctx.lineJoin = "round";
  ctx.lineWidth = tile * 0.1;
  ctx.strokeStyle = faded(PALETTE.rock, fade);
  ctx.globalAlpha = 0.45;
  ctx.stroke(body);
  ctx.restore();
}
