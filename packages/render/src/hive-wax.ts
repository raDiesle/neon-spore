import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * **What THE HIVE is made of**: wax — a dark mass of it, lit from the upper
 * left and gone to the deep beneath, pressed all over with comb, each cell a
 * groove with a lit lip under it, the wax's thickness caught along the top
 * and its underside lit amber from inside where the lobes hang, and a film
 * of gloss high on the left. The lobes, the breaches and the scars are cells
 * of the same wax (`hive-cell.ts`). It is no longer a dark fill with a glowing
 * yellow line drawn round the mass and round every lobe, which is the one
 * picture the brief rules out by name (`new-boss-more` §6.3).
 *
 * Split off `hive-draw.ts`, which decides *what* each seat is shown — which
 * breach is in its colour, which lobe swells — so it stays about the fight
 * and this one about the material. Colours go in plain at the fade with the
 * strength in the alpha, so `hive-frame.test.ts` counts the bile, the
 * colours, the dim and the rims on the op log.
 *
 * **Every width is off the tile.**
 */

/**
 * A colour at the fade: the hex itself while the body hangs, so the frame
 * tests can count it, and an `rgba` once it is going.
 */
export function faded(hex: string, fade: number, alpha = 1): string {
  return fade >= 1 && alpha >= 1 ? hex : rgba(hex, alpha * fade);
}

/** The mass's box this frame. */
export interface Wax {
  left: number;
  right: number;
  top: number;
  bottom: number;
  tile: number;
}

/** A comb cell's radius, in tiles. */
const COMB = 0.2;

export function paintWax(ctx: CanvasRenderingContext2D, body: Path2D, w: Wax, fade: number): void {
  const { left, right, top, bottom, tile } = w;
  const h = bottom - top;
  ctx.save();
  ctx.fillStyle = faded(PALETTE.background, fade);
  ctx.fill(body);
  ctx.fillStyle = faded(PALETTE.bileDeep, fade, 0.8);
  ctx.fill(body);
  ctx.clip(body);
  const light = ctx.createLinearGradient(left, top, left + (right - left) * 0.3, bottom + h);
  light.addColorStop(0, rgba(PALETTE.sheenRim, 0.14 * fade));
  light.addColorStop(0.35, rgba(PALETTE.sheenRim, 0));
  light.addColorStop(0.55, rgba(PALETTE.sheenDeep, 0));
  light.addColorStop(1, rgba(PALETTE.sheenDeep, 0.45 * fade));
  ctx.fillStyle = light;
  ctx.fill(body);
  // The comb: one path of cells, stroked once as the groove and once, a
  // hair lower, as the lip the light catches.
  const comb = combPath(left, right, top - tile, bottom + tile, tile * COMB);
  ctx.save();
  ctx.lineJoin = "round";
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = faded(PALETTE.sheenDeep, fade);
  ctx.lineWidth = Math.max(1, tile * 0.035);
  ctx.stroke(comb);
  ctx.translate(0, Math.max(1, tile * 0.025));
  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = faded(PALETTE.bile, fade);
  ctx.lineWidth = Math.max(0.8, tile * 0.015);
  ctx.stroke(comb);
  ctx.restore();
  // Its thickness along the top, and the underside lit amber from inside:
  // each a glow rising into the wax, never a line round it.
  const cap = ctx.createLinearGradient(0, top - tile * 0.1, 0, top + h * 0.35);
  cap.addColorStop(0, rgba(PALETTE.bile, 0.2 * fade));
  cap.addColorStop(1, rgba(PALETTE.bile, 0));
  ctx.fillStyle = cap;
  ctx.fill(body);
  const under = ctx.createLinearGradient(0, bottom - h * 0.5, 0, bottom + tile * 0.2);
  under.addColorStop(0, rgba(PALETTE.bile, 0));
  under.addColorStop(1, rgba(PALETTE.bile, 0.22 * fade));
  ctx.globalAlpha = 1;
  ctx.fillStyle = under;
  ctx.fill(body);
  ctx.restore();
  // The film, high on the left.
  const fx = left + (right - left) * 0.2;
  const fy = top + h * 0.3;
  ctx.save();
  ctx.fillStyle = rgba(PALETTE.sheenRim, 0.2 * fade);
  ctx.beginPath();
  ctx.ellipse(fx, fy, (right - left) * 0.1, tile * 0.06, -0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = rgba(PALETTE.sheenRim, 0.75 * fade);
  ctx.beginPath();
  ctx.arc(fx - (right - left) * 0.07, fy, Math.max(0.8, tile * 0.035), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Hexagonal cells, flat side up, covering the box. */
function combPath(left: number, right: number, top: number, bottom: number, r: number): Path2D {
  const p = new Path2D();
  const dx = r * 1.5;
  const dy = r * Math.sqrt(3);
  let col = 0;
  for (let x = left; x <= right + r; x += dx, col++) {
    const shift = col % 2 === 0 ? 0 : dy * 0.5;
    for (let y = top + shift; y <= bottom + r; y += dy) {
      for (let k = 0; k <= 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        const px = x + r * 0.92 * Math.cos(a);
        const py = y + r * 0.92 * Math.sin(a);
        if (k === 0) p.moveTo(px, py);
        else p.lineTo(px, py);
      }
    }
  }
  return p;
}
