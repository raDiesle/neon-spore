import { openSmoothPath, type Point } from "../../../../../packages/content/src/index.js";
import { hash01 } from "../../../../../packages/render/src/backdrop.js";
import type { BandAttach } from "../../../../../packages/render/src/band-join.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import type { Circle } from "../../../../../packages/render/src/layout.js";
import { bell, belly, sameLight, sky } from "./tissue.js";

/**
 * The paint FUSED is made of.
 *
 * It is ORGANS' claim — every control is the swollen end of something the
 * membrane grew — rebuilt around the three things the owner said about it.
 *
 * **The silhouette is sampled, not beziered.** `organs/paint.ts` writes each
 * trunk as four bezier segments between hand-placed control points, and every
 * one of those segments is very nearly straight over its middle: the shoulder
 * in particular is a ruled diagonal from the roof to the waist, which is what
 * makes the shipped card read as a paper cone rather than as tissue. Here a
 * trunk is a **width profile** sampled down its length and splined through, so
 * there is no straight run anywhere in it and the roundness the owner liked in
 * ROOF is a property of the curve rather than of where four points landed.
 */

/** How wide a trunk is, in radii, at the roof, at its waist and at the button. */
const SHOULDER = 2.2;
const WAIST = 0.42;
const FOOT = 1.0;

/** How far a trunk leans, in radii, and how slowly. Small and slow: five stalks
 * swinging is a hanging garden, and what this argues is that it is one body. */
const SWAY = 0.16;
const SWAY_RATE = 0.5;

/** Samples down one side of a trunk. Enough that the spline has no flat run in
 * it at phone size, few enough that five trunks are a hundred points. */
const STEPS = 22;

/**
 * How wide a trunk is at `p` of the way from the roof to its tip, in radii.
 *
 * Three terms and each is a sentence. A wide **shoulder** that has already
 * spread by the time it reaches the membrane, so what the clip cuts is a broad
 * base and not a stalk end. A **waist** it never goes below, so the thing is a
 * tube rather than a pair of curves that touch. A **flare** into the button, so
 * the control is the swollen end of the trunk and not something the trunk
 * points at. The tip is pinched off over the last twentieth so the bottom
 * closes to a round rather than to the flat lid a sampled loop otherwise ends
 * in — it is under the button either way, and a shape that is only correct
 * because something covers it is the kind that shows up the day it moves.
 */
function width(p: number): number {
  const body = SHOULDER * bell(p, 0.0, 0.2) + WAIST + FOOT * bell(p, 0.9, 0.17);
  return body * Math.min(1, (1 - p) / 0.06);
}

/**
 * One trunk, from above the membrane down into the button, as a closed path.
 *
 * Left side down and right side back up in one point list, splined as one loop
 * and closed with `Z`. The straight edge that `Z` puts across the top is at
 * `sky` — above the highest the membrane reaches — so the chamber's own clip
 * removes it and the trunk arrives welded to whatever the roof is doing at
 * every x it spans.
 */
function trunk(c: Circle, top: number, sway: number): string {
  const bottom = c.y + c.r * 0.55;
  const drop = Math.max(1, bottom - top);
  const pts: Point[] = [];
  const back: Point[] = [];
  for (let i = 0; i <= STEPS; i++) {
    const p = i / STEPS;
    const y = top + drop * p;
    const w = width(p) * c.r;
    // The lean is pinned at both ends: the roof does not move and neither does
    // the button, so the sway is all in the middle of the tube.
    const lean = sway * Math.sin(p * Math.PI);
    pts.push({ x: c.x + lean - w, y });
    back.push({ x: c.x + lean + w, y });
  }
  back.reverse();
  return `${openSmoothPath([...pts, ...back])} Z`;
}

/** The thin thread of light down the middle of a tube, which is what says the
 * thing is round. It stops short of both ends, where a tube's own wall would
 * hide it. */
function lumen(c: Circle, top: number, sway: number): string {
  const bottom = c.y + c.r * 0.55;
  const drop = Math.max(1, bottom - top);
  const pts: Point[] = [];
  for (let i = 0; i <= STEPS; i++) {
    const p = 0.1 + (i / STEPS) * 0.72;
    pts.push({ x: c.x + sway * Math.sin(p * Math.PI), y: top + drop * p });
  }
  return openSmoothPath(pts);
}

/** How many small vessels leave each trunk on each side, and how far they
 * reach as a share of the trunk's own half-width where they leave it. */
const SPRIGS = 4;

/**
 * The small vessels. The owner asked for *more veins, big and small ones*, and
 * a trunk with nothing coming off it is a pipe: what makes a thing read as
 * grown is that it is not the same thickness everywhere and not the only thing
 * there. Each sprig leaves the tube at its waist and curls away and down.
 */
function sprigs(c: Circle, index: number, top: number, sway: number): string {
  const bottom = c.y + c.r * 0.55;
  const drop = Math.max(1, bottom - top);
  let d = "";
  for (let i = 0; i < SPRIGS; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const seed = index * 37 + i * 11;
    const p = 0.3 + hash01(seed + 3) * 0.42;
    const y = top + drop * p;
    const w = width(p) * c.r;
    const x = c.x + sway * Math.sin(p * Math.PI) + side * w;
    const reach = c.r * (0.7 + hash01(seed + 7) * 1.5);
    const fall = c.r * (0.3 + hash01(seed + 13) * 0.9);
    d += `M ${x.toFixed(2)} ${y.toFixed(2)} C ${(x + side * reach * 0.5).toFixed(2)} ${(
      y + fall * 0.1
    ).toFixed(2)}, ${(x + side * reach).toFixed(2)} ${(y + fall * 0.4).toFixed(2)}, ${(
      x + side * reach * 0.92
    ).toFixed(2)} ${(y + fall).toFixed(2)} `;
  }
  return d;
}

/**
 * FUSED: the membrane and every control are one piece of tissue.
 *
 * One fill and one stroke for every trunk on the panel, one stroke for every
 * sprig and one for the lumens — five organs drawn one at a time would be five
 * paths and fifteen strokes of a frame's budget for a thing nobody looks
 * straight at, which is the bargain `band-slime.ts` already makes.
 */
export function welded(d: BandAttach): void {
  const { ctx, l, lobes, time, skin } = d;
  if (lobes.length === 0) {
    sameLight(d);
    return;
  }

  const top = sky(l);
  let body = "";
  let light = "";
  let small = "";
  let deepest = l.bandTop;
  for (const [i, c] of lobes.entries()) {
    const sway = Math.sin(time * SWAY_RATE + i * 1.9) * c.r * SWAY;
    body += trunk(c, top, sway);
    light += lumen(c, top, sway);
    small += sprigs(c, i, top, sway);
    deepest = Math.max(deepest, c.y + c.r);
  }

  // Brightest where it leaves the ship and going to the seat's own tint as it
  // reaches the button, so the light in this chamber still comes from above —
  // and the first stop is the belly's own pale, so the tissue that meets the
  // membrane is the colour the ship is on the other side of it.
  const grad = ctx.createLinearGradient(0, top, 0, deepest);
  grad.addColorStop(0, rgba(belly(skin), 0.52));
  grad.addColorStop(0.35, rgba(skin.flesh[1], 0.4));
  grad.addColorStop(1, rgba(skin.tint, 0.3));
  ctx.fillStyle = grad;
  ctx.fill(new Path2D(body));

  ctx.lineCap = "round";
  ctx.strokeStyle = rgba(skin.flesh[1], 0.26);
  ctx.lineWidth = Math.max(0.8, l.tile * 0.04);
  ctx.stroke(new Path2D(small));

  ctx.strokeStyle = rgba(skin.rim, 0.14);
  ctx.lineWidth = Math.max(0.6, l.tile * 0.026);
  ctx.stroke(new Path2D(body));

  ctx.strokeStyle = rgba(skin.rim, 0.1);
  ctx.lineWidth = Math.max(1, l.tile * 0.07);
  ctx.stroke(new Path2D(light));

  sameLight(d);
}
