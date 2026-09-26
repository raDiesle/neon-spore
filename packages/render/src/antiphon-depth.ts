import type { Mantle } from "./antiphon-flesh.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";
import { drawContact } from "./solid-haze.js";
import { breath } from "./solid-motion.js";

/**
 * **THE ANTIPHON in depth**: the mantle is not a band painted across the top
 * of the field but a long soft body bowed toward the pair, its middle nearest
 * and its two ends going away into the dark — and it turns, slowly, while it
 * lives, so one end comes forward as the other goes back and the light slides
 * along it. Once it is still it stops turning, which is what still means.
 *
 * **Nothing it says moves.** The pits keep their spots and the organs and the
 * candidates keep their perches, because the fx throw their bursts at those
 * spots (`antiphon-shape.ts`) and the navigator reads the rail by column. Only
 * the light and the haze go with the turn: each lobe of the hem is lit as its
 * own pouch, the far end is hazed toward the field, the edge turned from the
 * key catches a rim, and what hangs under the hem sits in a contact shadow
 * on the membrane it grew out of.
 *
 * Nothing here keeps state: the turn is a breath of the clock
 * (`solid-motion.ts`), so a restart starts it again.
 */

/** The turn's period, in seconds: slower than the body's own breath. */
const TURN_PERIOD = 9;
/** How far along the mantle its light slides at full turn, in body widths. */
const SLIDE = 0.12;
/** How much of the way toward the field each end is hazed while the body faces the pair. */
const HAZE = 0.3;
/** How much the turn takes from one end's haze and gives to the other's. */
const HAZE_TURN = 0.6;
/** How far in from the far end the rim reaches, in body widths. */
const RIM = 0.18;

/** The mantle's turn this frame, -1..1; nought once it is still. */
export function mantleTurn(time: number, still: boolean): number {
  return still ? 0 : breath(time, TURN_PERIOD, 0.35, 23);
}

/** How far the mantle's light has slid at `turn`, in pixels. */
export function mantleSlide(m: Mantle, turn: number): number {
  return (m.right - m.left) * SLIDE * turn;
}

/**
 * The mantle's roundness over its flat paint (`paintMantle`): each hem lobe
 * a pouch lit high and gone deep at its sides, the ends hazed as they go
 * away, and a rim on the side turned from the key.
 */
export function paintMantleDepth(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  m: Mantle,
  turn: number,
  fade: number,
): void {
  const { left, right, top, bottom, tile } = m;
  const w = right - left;
  const h = bottom - top;
  const slide = mantleSlide(m, turn);
  const n = Math.max(1, m.lobes);
  const step = w / n;
  ctx.save();
  ctx.clip(body);
  for (let i = 0; i < n; i++) {
    const cx = left + step * (i + 0.5);
    const lx = cx - step * 0.15 + slide * 0.5;
    const ly = bottom - h * 0.3;
    const g = ctx.createRadialGradient(lx, ly, 0, cx, ly, step * 0.62);
    g.addColorStop(0, rgba(PALETTE.sheenRim, 0.06 * fade));
    g.addColorStop(0.4, rgba(PALETTE.sheenRim, 0));
    g.addColorStop(0.7, rgba(PALETTE.sheenDeep, 0));
    g.addColorStop(1, rgba(PALETTE.sheenDeep, 0.35 * fade));
    ctx.fillStyle = g;
    ctx.fillRect(cx - step * 0.5, top, step, h + tile);
  }
  // The ends going away: hazed toward the field, the one turned back the more.
  const near = Math.max(0.1, Math.min(0.9, 0.5 + SLIDE * turn));
  const haze = ctx.createLinearGradient(left, 0, right, 0);
  haze.addColorStop(0, rgba(PALETTE.background, HAZE * (1 + HAZE_TURN * turn) * fade));
  haze.addColorStop(near, rgba(PALETTE.background, 0));
  haze.addColorStop(1, rgba(PALETTE.background, HAZE * (1 - HAZE_TURN * turn) * fade));
  ctx.fillStyle = haze;
  ctx.fillRect(left - tile, top - tile, w + tile * 2, h + tile * 2);
  // The rim: the end turned from the key, down its far flank only, so it is
  // light caught on an edge and never a line drawn round the body.
  const rim = ctx.createLinearGradient(right - w * (RIM - SLIDE * turn), 0, right, 0);
  rim.addColorStop(0, rgba(PALETTE.sheenRim, 0));
  rim.addColorStop(1, rgba(PALETTE.sheenRim, 0.35 * fade));
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = rim;
  ctx.lineWidth = tile * 0.08;
  ctx.lineJoin = "round";
  ctx.stroke(body);
  ctx.restore();
}

/** Where a bud grows out of the hem: a soft cool dark on the membrane round its root. */
export function budContact(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  x: number,
  y: number,
  r: number,
  fade: number,
): void {
  drawContact(ctx, body, x, y - r * 0.2, r * 1.5, 0.7 * fade);
}

/** A pit's lower lip, where the membrane turns back up out of the socket and takes the light. */
export function paintPitLip(
  ctx: CanvasRenderingContext2D,
  pit: Path2D,
  y: number,
  r: number,
  tile: number,
  fade: number,
): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(-1e5, y + r * 0.35, 2e5, r * 2);
  ctx.clip();
  ctx.lineWidth = Math.max(1, tile * 0.035);
  ctx.lineJoin = "round";
  ctx.strokeStyle = rgba(PALETTE.sheenRim, 0.3 * fade);
  ctx.stroke(pit);
  ctx.restore();
}
