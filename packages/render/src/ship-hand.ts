import { halo, strokeGlow } from "./glow.js";
import type { Circle, Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawShipMark } from "./ship-marks.js";
import type { ShipHand } from "./touch-hand.js";
import { cannonGrab, shieldGrab } from "./touch-ship.js";

/**
 * The one thing on the screen that is about the **hand** rather than about the
 * game: a ring round the swelling a finger has taken hold of, and — for player
 * 2's muzzle swipe — which of their two colours a lift would fire.
 *
 * The owner asked for exactly this and drew its edge: it belongs to the
 * controls touched on the ship itself, never to the strips in the band, "so
 * the user knows which element is active before swiping and that it locked
 * in". A thumb on a strip is already resting on the thing it is moving and
 * needs nothing said about it; a thumb on the hull is on a shape that was
 * drawn for another reason entirely, and without this there is no moment
 * between landing on it and the ship doing something.
 *
 * Render-only and per device. The hand is this phone's, so nothing here is
 * ever read back into a world, sent over the wire, or seen by the other seat.
 *
 * The seam against `touch-ship.ts` next door is the one `handles.ts` and
 * `handle-draw.ts` already draw: that file decides, this one paints, and the
 * circles both use come from there so a ring can never be drawn anywhere but
 * over the region that actually answers.
 */

/**
 * How far past level the cup reaches on each side, in radians.
 *
 * It is a cup over the top of the swelling and **not a ring round it**, which
 * is the one thing the first draft got wrong: a closed circle on a lobe that
 * grows out of the hull is cut in half by the skin, and what is left reads as
 * a bubble stuck to the ship rather than as a hand on one of its parts.
 */
const CUP = 0.3;
/**
 * How far the cup stands inside the grab circle, and how much it breathes.
 *
 * Tighter on the shield than on the cannon, and the reason is on the ship: the
 * muzzle is a tall swelling and the plate is nearly flat while nobody is
 * holding it open (`SHIELD_PASSIVE` in `hull-frame.ts`), so a cup the same
 * size on both floats over the shield instead of sitting on it.
 */
const RING_MUL = { cannon: 0.86, muzzle: 0.86, shield: 0.72 };
const BREATH = 0.05;
const BREATH_HZ = 1.1;
/** A hovering mouse is a suggestion; a finger down is a fact. */
const OVER_ALPHA = 0.4;

export function drawShipHand(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cannonCol: number,
  shieldCol: number,
  hand: ShipHand | undefined,
  time: number,
): void {
  if (!hand) return;
  const at = hand.on === "shield" ? shieldGrab(l, shieldCol) : cannonGrab(l, cannonCol);
  const alpha = hand.held ? 1 : OVER_ALPHA;
  const r = at.r * RING_MUL[hand.on] * (1 + BREATH * Math.sin(time * BREATH_HZ * Math.PI * 2));
  const base = hand.on === "shield" ? PALETTE.shieldRim : PALETTE.hullRim;

  ctx.save();
  halo(ctx, at.x, at.y, r * 1.4, base, 0.1 * alpha);
  const cup = new Path2D();
  cup.arc(at.x, at.y, r, Math.PI - CUP, 2 * Math.PI + CUP);
  ctx.globalAlpha = alpha;
  strokeGlow(ctx, cup, base, 2, alpha);
  ctx.globalAlpha = 1;
  // What this hand would *do*, in the colours the band already says it in —
  // arrows for a swelling that travels, the maw, the bolt (`ship-marks.ts`).
  // Player 2's two colours stay here rather than joining them: they are not a
  // mark that a gesture exists, they are the gesture's own readout, and the
  // one of them that is lit changes with every pixel the thumb moves.
  for (const mark of hand.marks) drawShipMark(ctx, mark, at, r, base, alpha, time);
  if (hand.on === "muzzle") drawColours(ctx, at, r, hand, alpha);
  ctx.restore();
}

/**
 * Player 2's two colours, one either side of the muzzle: red to the left and
 * cyan to the right, the order they stand in on their own band. Both are dim
 * while the swipe is short of the threshold, and the one a lift would fire
 * goes bright and grows a chevron pointing the way the hand is going.
 *
 * Drawn for a hand on the **muzzle** and never for player 1's slide, which is
 * a hand on the same swelling: a pilot shown a red mark and a cyan one would
 * be being told about a gesture their seat has not got, and the first thing
 * they would do is try it.
 */
function drawColours(
  ctx: CanvasRenderingContext2D,
  at: Circle,
  r: number,
  hand: ShipHand,
  alpha: number,
): void {
  for (const side of [-1, 1] as const) {
    const color = side < 0 ? PALETTE.red : PALETTE.cyan;
    const lit = hand.color === (side < 0 ? "red" : "cyan");
    const x = at.x + side * r * 1.45;
    halo(ctx, x, at.y, r * (lit ? 0.85 : 0.5), color, (lit ? 0.55 : 0.14) * alpha);
    const chevron = new Path2D();
    const w = r * 0.3;
    chevron.moveTo(x - side * w, at.y - w);
    chevron.lineTo(x + side * w, at.y);
    chevron.lineTo(x - side * w, at.y + w);
    ctx.globalAlpha = (lit ? 1 : 0.3) * alpha;
    strokeGlow(ctx, chevron, color, lit ? 2.4 : 1.4, lit ? alpha : 0.3 * alpha);
    ctx.globalAlpha = 1;
  }
}
