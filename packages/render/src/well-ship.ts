import type { HullSkin } from "./hull.js";
import type { HullMood, LobePositions } from "./hull-frame.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { ViewState } from "./renderer.js";
import { seatSkin } from "./seat-skin.js";
import type { PlaceHand } from "./ship-hand.js";
import { wellCannonGrab, wellShieldGrab } from "./touch-well.js";
import { wellAngle, wellAt, wellCenter, wellHub, wellSectorAngle } from "./well.js";

/**
 * THE WELL's ship: the hull as a ring at the middle of the clock.
 *
 * Cut off `well-draw.ts` at the seam `frame-field.ts` and `frame-ship.ts`
 * already draw — the board and the bodies on one side, the ship and its two
 * controls on the other — when that file reached its length limit. It is
 * called from inside `drawShip`, in place of `drawHull`, so the pose it reads
 * is the eased one every other frame reads (`well.ts`).
 */

/**
 * Where this phone's own finger's ring goes on the well's ship: the grab
 * circle `touch-well.ts` answers the press with — at the world's column, the
 * rule the flat ring follows — turned to the lobe's hour, so the cup sits over
 * the swelling's outward face rather than over its top on the screen. The
 * ring was not drawn here at all until 13 September 2026: `drawShip` left for
 * this pass before `drawShipHand`, and the one control on the well a thumb
 * could hold showed nothing under it (`docs/queue.md`, closed that day).
 */
export const wellHandPlace: PlaceHand = (l, on, cannonCol, shieldCol) =>
  on === "shield"
    ? { at: wellShieldGrab(l, shieldCol), turn: wellAngle(l, shieldCol) }
    : { at: wellCannonGrab(l, cannonCol), turn: wellAngle(l, cannonCol) };

/**
 * The ship, at the middle: a ring of hull with **one sector missing**.
 *
 * The gap is the seam, and it is not a decoration — the hull spans every column
 * and the field has two walls, so rolled into a circle its two ends stop a
 * sector short of each other. The cannon rides the ring as the clock's hand and
 * cannot cross that gap, which is the same rule as on the flat hull said in a
 * picture: column one and column eleven are the ends of a rail, not neighbours.
 *
 * The shield stands outside the ring, an arc per segment of the body the
 * renderer is easing toward the world's column (`shield.ts`), and lifts as it
 * arms. Both are drawn from `LobePositions` and `HullMood`, which is what the
 * flat hull is drawn from — so the two screens' controls are in the same place
 * in the same frame, and one of them is round.
 */
export function drawWellShip(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  mood: HullMood,
  at: LobePositions,
): void {
  const c = wellCenter(l);
  const hub = wellHub(l);
  // The seat's own ship, as the skin the flat hull is painted from — violet on
  // the pilot's screen, amber on the navigator's (`seat-skin.ts`). Its four
  // body stops run bright to dark: the ring takes the rim and the inside the
  // last of them.
  const skin = seatSkin(view.role).hull;
  const half = wellSectorAngle(l) / 2;
  // The body inside the hull: a disc, dark, so the ring reads as a surface with
  // something behind it rather than as a circle drawn on the backdrop.
  // The darkest stop, so the middle reads as the bottom of a well with a lit
  // rim rather than as a disc laid on the field. The ring below is the hull;
  // this is what is behind it.
  ctx.fillStyle = skin.body[3];
  ctx.beginPath();
  ctx.arc(c.x, c.y, hub, 0, Math.PI * 2);
  ctx.fill();
  // The plating, from the left wall clockwise to the right one. Canvas angles
  // run from +x and the well's from up, so both ends lose a quarter turn.
  const from = wellAngle(l, 0) - half - Math.PI / 2;
  const to = wellAngle(l, l.cols - 1) + half - Math.PI / 2;
  ctx.strokeStyle = skin.rim;
  ctx.lineWidth = Math.max(2, l.tile * 0.12);
  ctx.beginPath();
  ctx.arc(c.x, c.y, hub, from, to);
  ctx.stroke();
  ctx.strokeStyle = skin.edge;
  ctx.globalAlpha = 0.6;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(c.x, c.y, hub + l.tile * 0.06, from, to);
  ctx.stroke();
  ctx.globalAlpha = 1;
  drawWellCannon(ctx, l, at, skin);
  drawWellShield(ctx, l, at, mood);
}

/** The hand of the clock: the cannon's own swelling on the ring, with the
 * muzzle pointing up its lane. */
function drawWellCannon(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  at: LobePositions,
  skin: HullSkin,
): void {
  const a = wellAngle(l, at.cannon);
  const hub = wellHub(l);
  const seat = wellAt(l, a, hub);
  const r = Math.max(3, l.tile * 0.3);
  ctx.fillStyle = skin.body[1];
  ctx.beginPath();
  ctx.arc(seat.x, seat.y, r, 0, Math.PI * 2);
  ctx.fill();
  const muzzle = wellAt(l, a, hub + r * 1.5);
  ctx.strokeStyle = skin.edge;
  ctx.lineWidth = Math.max(1.5, l.tile * 0.07);
  ctx.beginPath();
  ctx.moveTo(seat.x, seat.y);
  ctx.lineTo(muzzle.x, muzzle.y);
  ctx.stroke();
}

/** The dome, outside the ring, one arc per segment of the eased body. */
function drawWellShield(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  at: LobePositions,
  mood: HullMood,
): void {
  const c = wellCenter(l);
  const hub = wellHub(l);
  const half = wellSectorAngle(l) / 2;
  const lift = l.tile * (0.18 + 0.2 * mood.armed);
  ctx.strokeStyle = PALETTE.shield;
  ctx.lineCap = "round";
  for (const seg of at.shield) {
    const a = wellAngle(l, seg.col) - Math.PI / 2;
    const reach = half * Math.max(0.3, seg.halfMul);
    ctx.globalAlpha = Math.min(1, 0.35 + 0.55 * mood.armed) * Math.max(0.2, seg.weight * 2);
    ctx.lineWidth = Math.max(1.5, l.tile * (0.08 + 0.06 * mood.armed));
    ctx.beginPath();
    ctx.arc(c.x, c.y, hub + lift, a - reach, a + reach);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.lineCap = "butt";
}
