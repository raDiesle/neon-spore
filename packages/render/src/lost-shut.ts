import { strokeGlow } from "./glow.js";
import type { LostPaint } from "./lost-look.js";
import { drawWound, traceWound, woundOf } from "./lost-wound.js";

/**
 * The lost screen: plates that shut, and a wound where the hull was broken.
 *
 * **What ships**, taken out of the `lost:screen` slot on 17 September 2026 as
 * the `shut` candidate. The plates come in from off both edges over `CLOSE`
 * seconds and meet at the seam, and what is left open is the place the ship
 * was hit. Nothing else on the screen is field any more.
 *
 * **The hole was a column until 22 September 2026, and is a circle now.** The
 * owner asked for it by name: a radial focus ring round the damage rather than
 * a lit slot the height of the phone, with the ship's blood welling out of its
 * border. What the slot got wrong is what a slot is — two and a half tiles
 * wide from the top edge to the foot, it read as a rail down the screen and
 * pointed at a *column* when the thing worth pointing at is a *place*. The
 * circle is `lost-wound.ts`, which also holds the bleeding; the plates and the
 * way they arrive are all that is left here.
 *
 * **The tension it resolves, and how.** `lost-look.ts` says the pair are meant
 * to look at where it got through, and a full-screen statement that covers it
 * takes the lesson away. This answers with one hole and bets the hole is
 * louder for being the only one.
 *
 * **On a wave that scars nothing** (`breachX` null — a wall earths through the
 * dome and leaves no mark) there is nothing to leave open, and the plates
 * simply shut. That is the honest picture and not a missing feature: nothing
 * got through the skin, so there is nothing to point at.
 */

/**
 * How long the plates take to shut, seconds — **and how long the wound takes
 * to come up**, because they are the same span and the same number.
 *
 * It was 0.45 until 22 September 2026, when the owner asked for the focus
 * circle *much quicker, just right when the ship visualised the damage*. Half
 * a second is a long time to hold a pair who have just lost a wave and are
 * looking for where it got through, and the answer they are waiting for is the
 * hole. A quarter of a second still reads as metal arriving — sixteen frames
 * on a phone — and it lands on the screen rather than settling onto it.
 */
const CLOSE = 0.26;

/**
 * Where the two plates meet, as a share of the play area.
 *
 * It was 0.44 until 24 September 2026, when the owner asked for the buttons
 * *more top* (`lost-answer.ts`): the seam is the line between what the screen
 * says and what the pair can do about it, so it came up with them and still
 * runs above RETRY WAVE rather than through it.
 */
const SEAM = 0.3;

const PLATE = "#0C0A16";
const EDGE = "#2A2140";

function shut(age: number): number {
  return Math.max(0, Math.min(1, age / CLOSE));
}

/**
 * Where each plate has got to, at `age`, and the one number that says so.
 *
 * `k` goes out with the geometry because it is also the wound's: the plates
 * and the focus are drawn off the same clock, so there is no second clock for
 * one of them to lag behind (`lost-wound.ts`'s `arrive`).
 */
function arriving(p: LostPaint): { top: number; foot: number; seam: number; k: number } {
  const k = shut(p.age);
  const seam = p.l.playHeight * SEAM;
  return { top: -seam * (1 - k), foot: seam + (1 - k) * (p.l.height - seam), seam, k };
}

/**
 * The two plates, coming in, with the wound cut out of them.
 *
 * Exported for the same reason the wound is its own file: what the shipped
 * answer decided was *which way the plates go*, and what is drawn at the
 * breach is a separate argument.
 */
export function shutPlates(ctx: CanvasRenderingContext2D, p: LostPaint): void {
  const { top, foot, seam, k } = arriving(p);
  const w = woundOf(p, k);

  // **Cut, and not drawn.** The hole is a hole the held field is seen through,
  // so it comes off the plates as a clip — everything but the hole — rather
  // than going into their path as a second shape. `evenodd` on the fill was
  // the first drawing of this and it was wrong in the one frame that shows it:
  // between the two plates, where neither covers anything, the hole's own
  // outline was the only shape there and the rule filled it, so a black shape
  // stood in the open field for the quarter second the plates were coming in.
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, p.l.width, p.l.height);
  if (w !== null) traceWound(ctx, w);
  ctx.clip("evenodd");

  ctx.beginPath();
  ctx.rect(0, top, p.l.width, seam);
  ctx.rect(0, foot, p.l.width, p.l.height - foot);
  ctx.fillStyle = PLATE;
  ctx.fill();

  // The leading edge of each plate, so they read as metal arriving. At rest
  // they are the same line, which is what a bulkhead closed looks like — and
  // inside the clip, because an edge drawn across the wound would be a plate
  // where the plate was torn away.
  const lip = new Path2D();
  lip.moveTo(0, top + seam);
  lip.lineTo(p.l.width, top + seam);
  lip.moveTo(0, foot);
  lip.lineTo(p.l.width, foot);
  strokeGlow(ctx, lip, EDGE, 2, 0.5);
  ctx.restore();
}

/**
 * The plates, and the ship bleeding out of the hole in them.
 *
 * **The wound comes up with the plates and not behind them.** It used to be
 * clipped to the two plate rectangles, so that a lit ring and a tongue of
 * blood could not stand in open field over a wave that was still on the
 * screen. The clip bought that at a price nobody had measured: the hole is
 * centred on the hull line, which sits near the foot of the phone, so the
 * *bottom* plate had to sweep the whole way up past it before one pixel of the
 * wound showed — two fifths of the close, on a screen whose one job is to
 * point at where it got through. The owner, 22 September 2026: *the dark
 * circle animation must be done together with the circle animation, so not
 * sequential waiting and then show the new animation of circle focus, but
 * together.*
 *
 * What replaces the clip answers the same worry without the wait: the wound is
 * drawn at `k`, so at the instant the screen comes up it is not there either,
 * and it is full exactly when the plates are shut. Nothing is ever lit over
 * open field, because what is lit over open field is lit at nothing.
 */
export function shutVeil(ctx: CanvasRenderingContext2D, p: LostPaint): void {
  shutPlates(ctx, p);
  const w = woundOf(p, arriving(p).k);
  if (w === null) return;
  drawWound(ctx, w, p.age);
}
