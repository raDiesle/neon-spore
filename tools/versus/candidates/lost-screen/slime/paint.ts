import { smoothstep } from "../../../../../packages/render/src/ease.js";
import { sinHash } from "../../../../../packages/render/src/hash.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import type { LostPaint } from "../../../../../packages/render/src/lost-look.js";
import { shutPlates } from "../../../../../packages/render/src/lost-shut.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";

/**
 * One body of the stuff, the width of the phone, crawling down from the top
 * edge and stopping half way — and then going on dripping.
 *
 * The owner, 19 September 2026: the thirteen fast rivulets should have a much
 * slower answer with far fewer elements in it, *maybe a single slime flowing
 * full width top to middle of the screen in some red*. This is that read
 * straight. One element instead of thirteen, one movement instead of thirteen
 * loops out of step with each other, and it is over in the sense that matters
 * — the body stops — while never being still, because the lobes along its
 * lower edge keep reaching down after it has.
 *
 * **It stops above the buttons, which is the whole reason it can be red.**
 * The shipped fluid is the ship's violet because red is already the bodies'
 * colour and WAVE LOST's own type, and a red curtain the height of the phone
 * puts one colour on the whole screen (`lost-blood.ts`). The run is measured
 * against `buttonsY` and leaves the drips their own clearance below it, so the
 * hull, the breach and both presses are on plain ground at every age — that is
 * the one rule this slot has, and `lost-screen.ts` states it (`lost-look.ts`).
 *
 * **The weight is at the lower edge and not at the top.** The first shot of
 * this candidate ran it the other way — heaviest where it hangs from — and put
 * its deepest red under WAVE LOST and the three lines below it, which are the
 * two things on this screen that have to be read. Gathering it downward is
 * also what the stuff does: a wall of it is thin where it is stretched and
 * heavy at the meniscus it is about to let go of.
 *
 * **It is a function of `age` and the lobe's index, like the fluid it would
 * replace.** No state, nothing in `Effects`, the same frame twice on one tick
 * (`render/test/restart.test.ts`).
 *
 * **How it can lose.** One element is one element: on the sixth loss of an
 * evening a picture that does the same thing every time and holds still at the
 * end may read as a screen that has frozen. Thirteen rivulets never stop, and
 * *never stops* is a real property of the shipped answer that this gives up.
 */

/** Seconds the body takes to reach where it stops. */
const CRAWL = 5.5;

/** Where it stops, as a share of the run from the top edge to the buttons. */
const STOP = 0.78;

/** How many lobes hang along its lower edge. */
const LOBES = 5;

/** How far a lobe hangs below the edge at rest, as a share of a tile. */
const HANG = 1.2;

/** Seconds a drip takes to reach its full length, after the body has stopped. */
const DRIP = 7;

/** The body at its heaviest, along the lower edge it hangs from. */
const DEEP = 0.62;

/** And at the top, where it is stretched thin over the words. */
const THIN = 0.2;

const HUE = PALETTE.red;
const RIM = PALETTE.redRim;

/** How far down a lobe hangs at this age: the edge's own sag, plus the drip
 * it goes on growing once the body itself has stopped moving. */
function lobe(i: number, age: number, tile: number): number {
  const own = 0.45 + sinHash(i, 1) * 0.9;
  const crept = smoothstep(Math.min(1, age / DRIP)) * (0.3 + sinHash(i, 2) * 1.5);
  return tile * HANG * (own + crept);
}

/**
 * The lower edge as points: one per lobe, each hanging its own distance, and
 * the two ends hanging too — nothing on this line ever comes back up to the
 * edge itself. The first two shots of this candidate built the line out of one
 * curve per segment between points *on* the edge, which left a sharp notch at
 * every junction and read as a row of teeth. A boundary that only ever
 * undulates cannot make a tooth.
 */
function edgePoints(p: LostPaint, edge: number, down: number): { x: number; y: number }[] {
  const { width: w, tile } = p.l;
  const out: { x: number; y: number }[] = [];
  for (let i = 0; i <= LOBES; i++) {
    out.push({ x: (w * i) / LOBES, y: edge + lobe(i, p.age, tile) * down });
  }
  return out;
}

/**
 * The points splined: each one taken as the control of a curve that ends
 * halfway to the next, which is the cheapest smooth line through a run of
 * points and the one `spline.ts` uses for a body's own contour. Walked into
 * whatever path the caller has open, so the fill and the lit edge are the same
 * line and cannot drift apart.
 */
function walkEdge(ctx: CanvasRenderingContext2D, pts: { x: number; y: number }[]) {
  const first = pts[0];
  const last = pts[pts.length - 1];
  if (first === undefined || last === undefined) return;
  ctx.lineTo(first.x, first.y);
  for (let i = 1; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    if (a === undefined || b === undefined) continue;
    ctx.quadraticCurveTo(a.x, a.y, (a.x + b.x) / 2, (a.y + b.y) / 2);
  }
  ctx.lineTo(last.x, last.y);
}

export const slimeVeil = (ctx: CanvasRenderingContext2D, p: LostPaint): void => {
  shutPlates(ctx, p);
  const { width: w, tile } = p.l;
  // Eased the whole way: the thing is heavy, and a linear crawl reads as a
  // bar being dragged rather than as something with weight in it.
  const down = smoothstep(Math.min(1, p.age / CRAWL));
  // The room it has: down to the buttons, less what the longest drip needs.
  const room = p.buttonsY - tile * HANG * 3;
  const edge = room * STOP * down;
  if (edge <= 1) return;
  const pts = edgePoints(p, edge, down);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, 0);
  walkEdge(ctx, pts);
  ctx.lineTo(w, 0);
  ctx.closePath();
  const grad = ctx.createLinearGradient(0, 0, 0, edge);
  grad.addColorStop(0, rgba(HUE, THIN));
  grad.addColorStop(1, rgba(HUE, DEEP));
  ctx.fillStyle = grad;
  ctx.fill();
  // The lit edge, and only the edge: a rim round the whole body would draw a
  // line down both sides of the phone and across the top of it.
  ctx.beginPath();
  ctx.moveTo(0, pts[0]?.y ?? edge);
  walkEdge(ctx, pts);
  ctx.strokeStyle = rgba(RIM, 0.5);
  ctx.lineWidth = Math.max(1, tile * 0.04);
  ctx.stroke();
  ctx.restore();
};
