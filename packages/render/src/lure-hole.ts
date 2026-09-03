import { blobPath, type CreatureSilhouette } from "@neon-spore/content";
import type { Creature } from "@neon-spore/sim";
import { sinHash } from "./hash.js";
import type { Layout } from "./layout.js";
import { showsLureAlarm } from "./lure-alarm.js";
import { PALETTE } from "./palette.js";

/**
 * THE HOLE THROUGH A LURE, and what is coming out of it.
 *
 * A lure is a slick or a bulb in every pixel player 1 owns, and the seat that
 * *is* being told needs one look at the field to know which body is lying. The
 * corner frame and the words do that (`lure-alarm.ts`) — but both sit outside
 * the contour, and the middle of the body, the part the eye actually lands on,
 * said nothing at all.
 *
 * So it is bored through. **The hole is the body's own outline at
 * `HOLE_MUL`** — the same lobes, the same seed, the same wobble clock, so it
 * breathes with the contour around it rather than sitting in it like a coin —
 * and it is a real hole: the fill is even-odd, so the field, the grid and the
 * light shafts show through the middle of the creature. Nothing else in this
 * game is see-through in the middle, which is exactly why one glance is enough.
 *
 * And it is not a clean hole. Sparks come out of it and it flashes at the
 * mouth, in `ember` — the colour this game already spends on something going
 * wrong (a purge, an impact, a gauge running out) — so what player 2 reads is
 * *this body is burning through*, which is the true thing about it.
 *
 * **Why this is not a skull.** It was one, for exactly one look. A picture
 * laid over a body is a sticker on the disguise: it says *somebody has marked
 * this*, which is what the frame already says twice. A hole is the disguise
 * failing, which is what a lure is.
 *
 * **Only the seat being told.** `lureVented` is the whole of that rule, and it
 * runs through `showsLureAlarm` so the hole and the frame can never disagree
 * about which screen is which.
 */

/** How wide the hole is, as a share of the contour it is cut from. Big enough
 * to be a hole at a glance on a phone, small enough that the disguise's colour
 * and lobes are still what the body reads as — player 2 has to name that
 * colour out loud. */
const HOLE_MUL = 0.46;

/** Sparks in flight at once, and how long one takes to fly and fade. */
const SPARKS = 7;
const SPARK_SECONDS = 0.8;
/** How far a spark gets from the middle, as a share of the body's radius. Past
 * 1, and deliberately: a streak that dies inside the contour reads as a scratch
 * on the body, and one that clears it reads as something thrown out of it. */
const REACH = 1.9;
/** Seconds between flashes at the mouth of the hole. Off the spark cycle on
 * purpose: two rhythms read as something erratic burning, one reads as a
 * blinking light. */
const POP_SECONDS = 0.53;

/** Whether this body, on this screen, is drawn with a hole in it. */
export function lureVented(l: Layout, c: Creature): boolean {
  return showsLureAlarm(l) && c.kind === "lure";
}

/**
 * The hole's contour, in the body's own coordinates, ready to be appended to
 * the body's path string — two closed contours in one path, filled even-odd,
 * is a hole and costs nothing.
 *
 * `t` is the caller's contour clock, unchanged: the same argument the outer
 * contour was drawn with is what keeps the two wobbling as one piece.
 */
export function lureHolePath(shape: CreatureSilhouette, t: number): string {
  return blobPath(
    0,
    0,
    shape.rx * HOLE_MUL,
    shape.ry * HOLE_MUL,
    shape.lobes,
    shape.depth,
    shape.wobble,
    t,
    shape.seed,
    28,
  );
}

/**
 * What comes out of the hole, in screen coordinates, drawn after the body so
 * nothing about the contour's scale or lean squashes a spark.
 *
 * `time` is render's wall clock — allowed here and nowhere in `sim`, and the
 * reason `target-lock.ts` gives applies unchanged: two devices whose sparks
 * are half a frame apart is not a desync, and none of this reaches `hashWorld`.
 */
export function drawLureVent(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  /** The body's radius on screen — the hole is `HOLE_MUL` of it. */
  r: number,
  time: number,
  /** The creature's id, so two lures on the field never spark in step. */
  id: number,
): void {
  ctx.save();
  ctx.lineCap = "round";
  drawPop(ctx, x, y, r, time, id);
  for (let i = 0; i < SPARKS; i++) {
    drawSpark(ctx, x, y, r, time, id, i);
  }
  ctx.restore();
}

/** One spark: a short streak flying out from the mouth, fading as it goes. It
 * is re-aimed every cycle rather than given a fixed angle, so the hole throws
 * in every direction over a couple of seconds instead of wearing eight spokes. */
function drawSpark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  time: number,
  id: number,
  i: number,
): void {
  const run = time / SPARK_SECONDS + sinHash(id * 7.3 + i * 3.1);
  const u = run - Math.floor(run);
  const angle = sinHash(id * 2.7 + i * 5.9 + Math.floor(run) * 1.7) * Math.PI * 2;
  const dist = r * (HOLE_MUL * 0.5 + (REACH - HOLE_MUL * 0.5) * u);
  const len = Math.max(2, r * 0.42 * (1 - u * 0.5));
  const ax = Math.cos(angle);
  const ay = Math.sin(angle);
  ctx.globalAlpha = 0.95 * (1 - u);
  ctx.strokeStyle = u < 0.45 ? PALETTE.podRim : PALETTE.ember;
  ctx.lineWidth = Math.max(1, r * 0.075 * (1 - u * 0.5));
  ctx.beginPath();
  ctx.moveTo(x + ax * dist, y + ay * dist);
  ctx.lineTo(x + ax * (dist - len), y + ay * (dist - len));
  ctx.stroke();
}

/** The flash at the mouth: a ring that swells out of the hole and dies, with
 * only a breath of a core behind it. A *disc* was the first try and it was
 * wrong — it filled the opening for most of every cycle, and a hole that is
 * lit up solid is a glowing middle rather than a hole. The ring leaves the
 * field showing through, which is the one thing this creature has to say. */
function drawPop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  time: number,
  id: number,
): void {
  const run = time / POP_SECONDS + sinHash(id * 11.7);
  const u = run - Math.floor(run);
  const radius = r * HOLE_MUL * (0.55 + 1.15 * u);
  ctx.globalAlpha = 0.8 * (1 - u);
  ctx.strokeStyle = PALETTE.ember;
  ctx.lineWidth = Math.max(1, r * 0.13 * (1 - u));
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 0.3 * (1 - u) * (1 - u);
  ctx.fillStyle = PALETTE.podRim;
  ctx.beginPath();
  ctx.arc(x, y, r * HOLE_MUL * 0.3, 0, Math.PI * 2);
  ctx.fill();
}
