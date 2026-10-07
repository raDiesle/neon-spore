import type { CurtainState } from "@neon-spore/sim";
import { CURTAIN_GIVE_ACROSS, CURTAIN_GIVE_SAG_MAX, type CurtainGive } from "./curtain-give.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **THE CURTAIN thins where it is strained** — the design's THE SLOW on this
 * boss (`docs/spec/bosses-choreographed.md` §6), and on this boss the jam is
 * THE SLOW. While a hit pins the rail the shove is refused, the hand still
 * carries, and the cloth goes as far as it can towards the hand
 * (`curtain-give.ts`); this is what that strain does to the membrane: it goes
 * more see-through round the hand, and its fibres stand out drawn towards it.
 *
 * **It gives the pilot nothing.** His screen draws no core under the sheet
 * (`showsCurtainShadow`), so what shows through on his glass is the field. On
 * the navigator's the shadow she already sees reads plainer where the hands
 * are, which is a colour she is already told.
 *
 * Only the fill thins. The hem and its beads are drawn as they were, so the
 * soft lobes and the health read the same, and nothing ever opens: §11.24
 * argues against a hole the core could be seen through.
 */

/** How far round the hand the cloth thins, in tiles. */
const THIN_R = 1.25;
/** How much of the sheet's alpha a full strain takes away at the hand. */
const THIN_MOST = 0.75;
/** The strained grain: threads either side of the hand's, their spacing and half-length in tiles, and how far in they pinch. */
const FIBRE_ROWS = 2;
const FIBRE_GAP = 0.2;
const FIBRE_REACH = 1.1;
const FIBRE_PINCH = 0.25;

/** Where the sheet thins, and how far: 0 none, 1 a full strain. */
export interface CurtainThin {
  x: number;
  y: number;
  r: number;
  amount: number;
}

/**
 * The thinning under the hands on the jammed sheet, or `null`: only while
 * the rail is pinned, and only as far as the cloth is strained.
 */
export function curtainThin(
  l: Layout,
  c: CurtainState,
  give: CurtainGive,
  /** The row's centre, where the hand ring hangs. */
  cy: number,
): CurtainThin | null {
  if (c.phase !== "pinned" || give.sag <= 0) return null;
  const pull = Math.abs(give.across) / (CURTAIN_GIVE_ACROSS * l.tile);
  const dip = give.sag / (CURTAIN_GIVE_SAG_MAX * l.tile);
  const amount = Math.min(1, 0.5 * pull + dip);
  if (amount <= 0) return null;
  return { x: give.x + give.across, y: cy, r: THIN_R * l.tile, amount };
}

/** The sheet's fill: the plain alpha everywhere, falling towards the hand by the strain. */
export function thinFill(
  ctx: CanvasRenderingContext2D,
  thin: CurtainThin,
  alpha: number,
): CanvasGradient {
  const g = ctx.createRadialGradient(thin.x, thin.y, 0, thin.x, thin.y, thin.r);
  g.addColorStop(0, rgba(PALETTE.hull, alpha * (1 - THIN_MOST * thin.amount)));
  g.addColorStop(0.55, rgba(PALETTE.hull, alpha * (1 - 0.5 * THIN_MOST * thin.amount)));
  g.addColorStop(1, rgba(PALETTE.hull, alpha));
  return g;
}

/**
 * The cloth's grain drawn taut towards the hand: threads across the strain,
 * bowed in to the hand's height so they pinch where it holds — stretched
 * fabric rather than a crack, which a burst of spokes reads as.
 */
export function drawThinFibres(
  ctx: CanvasRenderingContext2D,
  thin: CurtainThin,
  tile: number,
): void {
  const reach = FIBRE_REACH * tile;
  const gap = FIBRE_GAP * tile;
  const fibres = new Path2D();
  for (let k = -FIBRE_ROWS; k <= FIBRE_ROWS; k++) {
    const y = thin.y + k * gap;
    fibres.moveTo(thin.x - reach, y);
    fibres.quadraticCurveTo(thin.x, thin.y + k * gap * FIBRE_PINCH, thin.x + reach, y);
  }
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(1, tile * 0.03);
  ctx.strokeStyle = PALETTE.hullRim;
  ctx.globalAlpha = 0.45 * thin.amount;
  ctx.stroke(fibres);
  ctx.restore();
}
