import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * **What THE CURTAIN is made of**: a wet membrane hung from a gathered top
 * edge, thin enough to see a colour through, falling into folds that each
 * catch the light down one side and go to the deep down the other, weighted
 * along its hem with beads of the same flesh — and behind it a core that is a
 * body, a dark skin with its colour pooled inside. It is no longer a violet
 * fill with a glowing line drawn round it and round every lobe, which is the
 * one picture the brief rules out by name (`new-boss-more` §6.3).
 *
 * Split off `curtain-sheet.ts`, which decides *where* the fabric hangs, which
 * lobes stand and which are lit, so that file stays about the fight and this
 * one about the material. The colours go in plain and the strength in the
 * alpha, so `curtain-frame.test.ts` finds the hull, its rim, the grey and the
 * core's dark and rim on the op log.
 *
 * **Every width is off the tile**, never off a lobe's radius or the core's:
 * the naked core pulses, and a width that followed it would be a new width on
 * every frame.
 */

/** The fabric's alpha: through it, a colour is a shadow. */
const SHEET_ALPHA = 0.3;

/** Where the sheet hangs, for `paintSheet`. */
export interface Drape {
  x0: number;
  x1: number;
  railY: number;
  hemY: number;
  tile: number;
}

/**
 * The membrane: `body` the whole sheet, `folds` one line a fold, and
 * `shadows` the same lines a little to their right — the side of a fold
 * turned away from the light.
 */
export function paintSheet(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  folds: Path2D,
  shadows: Path2D,
  d: Drape,
): void {
  const { tile } = d;
  ctx.save();
  ctx.globalAlpha = SHEET_ALPHA;
  ctx.fillStyle = PALETTE.hull;
  ctx.fill(body);
  ctx.globalAlpha = 1;
  ctx.clip(body);
  // Lit where it hangs from the rail, gone to the deep where it gathers.
  const hang = ctx.createLinearGradient(0, d.railY, 0, d.hemY);
  hang.addColorStop(0, rgba(PALETTE.sheenRim, 0.1));
  hang.addColorStop(0.35, rgba(PALETTE.sheenRim, 0));
  hang.addColorStop(0.6, rgba(PALETTE.sheenDeep, 0));
  hang.addColorStop(1, rgba(PALETTE.sheenDeep, 0.35));
  ctx.fillStyle = hang;
  ctx.fill(body);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = tile * 0.1;
  ctx.strokeStyle = PALETTE.sheenDeep;
  ctx.globalAlpha = 0.3;
  ctx.stroke(shadows);
  ctx.lineWidth = Math.max(1, tile * 0.03);
  ctx.strokeStyle = PALETTE.hullRim;
  ctx.globalAlpha = 0.35;
  ctx.stroke(folds);
  // The gathered top edge, thick and lit from inside. The hem is left to the
  // deep: stroked wide along it, the hem read as the outline this replaced.
  band(ctx, body, d, d.railY - tile, d.railY + tile * 0.12, tile * 0.14, PALETTE.hull, 0.55);
  // The film across it, caught high on the left and held inside the cloth,
  // which a gathered hem brings up past where it would be.
  const w = d.x1 - d.x0;
  shine(ctx, d.x0 + w * 0.16, d.railY + tile * 0.2, w * 0.07, tile * 0.045, 0.22);
  ctx.restore();
}

/** The sheet stroked wide inside itself, over one band of its height. */
function band(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  d: Drape,
  top: number,
  foot: number,
  width: number,
  colour: string,
  a: number,
): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(d.x0 - d.tile, top, d.x1 - d.x0 + 2 * d.tile, foot - top);
  ctx.clip();
  ctx.lineWidth = width;
  ctx.strokeStyle = colour;
  ctx.globalAlpha = a;
  ctx.stroke(body);
  ctx.restore();
}

/**
 * One weight on the hem: a bead of the sheet's flesh, grey, or the hull's rim
 * when it is one of the pilot's soft ones — lit through, the way a torch is.
 */
export function paintBead(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  lit: boolean,
): void {
  const bead = new Path2D();
  bead.ellipse(x, y, r, r * 1.08, 0, 0, Math.PI * 2);
  ctx.save();
  ctx.globalAlpha = lit ? 1 : 0.75;
  ctx.fillStyle = lit ? PALETTE.hullRim : PALETTE.dim;
  ctx.fill(bead);
  ctx.clip(bead);
  const shade = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, 0, x, y, r * 1.15);
  shade.addColorStop(0, rgba(PALETTE.sheenRim, lit ? 0.3 : 0.4));
  shade.addColorStop(0.4, rgba(PALETTE.sheenRim, 0));
  shade.addColorStop(0.6, rgba(PALETTE.sheenDeep, 0));
  shade.addColorStop(1, rgba(PALETTE.sheenDeep, lit ? 0.35 : 0.7));
  ctx.fillStyle = shade;
  ctx.fill(bead);
  ctx.restore();
  ctx.save();
  ctx.fillStyle = rgba(PALETTE.sheenRim, 0.85);
  ctx.beginPath();
  ctx.arc(x - r * 0.38, y - r * 0.4, Math.max(0.8, r * 0.2), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * The bare core: a dark skin with its colour pooled in it, lit on the inside
 * of its lower wall, and filmed. `beat` is the naked core's throb, 0 → 1,
 * lit round its whole wall in the rim; `fade` its going.
 */
export function paintCoreBody(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  x: number,
  y: number,
  r: number,
  tile: number,
  hex: string,
  dark: string,
  rim: string,
  beat: number,
  fade: number,
): void {
  ctx.save();
  ctx.globalAlpha = fade;
  ctx.fillStyle = dark;
  ctx.fill(body);
  ctx.clip(body);
  const blood = ctx.createRadialGradient(x, y + r * 0.15, 0, x, y + r * 0.15, r);
  blood.addColorStop(0, rgba(hex, 0.85));
  blood.addColorStop(0.55, rgba(hex, 0.35));
  blood.addColorStop(1, rgba(hex, 0));
  ctx.fillStyle = blood;
  ctx.fill(body);
  const shade = ctx.createRadialGradient(x - r * 0.35, y - r * 0.45, 0, x, y, r * 1.2);
  shade.addColorStop(0.5, rgba(PALETTE.sheenDeep, 0));
  shade.addColorStop(1, rgba(PALETTE.sheenDeep, 0.55));
  ctx.fillStyle = shade;
  ctx.fill(body);
  ctx.lineJoin = "round";
  // Its wall, lit from inside on the lower half only: lit all round, it is
  // the outline this replaced.
  ctx.save();
  ctx.beginPath();
  ctx.rect(x - r * 2, y - r * 0.1, r * 4, r * 2);
  ctx.clip();
  ctx.lineWidth = tile * 0.12;
  ctx.strokeStyle = rim;
  ctx.globalAlpha = 0.55 * fade;
  ctx.stroke(body);
  ctx.restore();
  if (beat > 0) {
    ctx.lineWidth = tile * 0.07;
    ctx.strokeStyle = rim;
    ctx.globalAlpha = 0.5 * beat * fade;
    ctx.stroke(body);
  }
  // The nucleus, sunk in the pool.
  ctx.globalAlpha = 0.8 * fade;
  ctx.fillStyle = rim;
  ctx.beginPath();
  ctx.ellipse(x + r * 0.05, y + r * 0.12, r * 0.2, r * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  shine(ctx, x - r * 0.36, y - r * 0.44, r * 0.28, r * 0.1, 0.3 * fade);
}

/** The wet film: a soft bloom and a hard point at its upper-left end. */
function shine(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  a: number,
): void {
  if (a <= 0) return;
  ctx.save();
  ctx.fillStyle = rgba(PALETTE.sheenRim, a);
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, -0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = rgba(PALETTE.sheenRim, Math.min(1, a * 3));
  ctx.beginPath();
  ctx.arc(x - rx * 0.4, y - ry * 0.2, Math.max(0.8, ry * 0.45), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
