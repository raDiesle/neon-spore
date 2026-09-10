import { openSmoothPath, type Point } from "../../../../../packages/content/src/index.js";
import { hash01 } from "../../../../../packages/render/src/backdrop.js";
import { strokeGlow } from "../../../../../packages/render/src/glow.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { barrelAcross } from "../../../../../packages/render/src/hull-barrel.js";
import type { HullLit } from "../../../../../packages/render/src/hull-light.js";
import type { SheenPass } from "../../../../../packages/render/src/hull-sheen.js";
import { dither } from "../../../../../packages/render/src/sheen.js";

/**
 * GULLET's skin: the hull is a **lip**.
 *
 * The shipped membrane is a soap film — bioluminescence drifting under it, a
 * spectrum across it, one highlight travelling over it. A lip is none of that.
 * It is wet, it has a gloss that sits *on* the edge and nowhere else, it is
 * creased across its whole width by the folds a lip has, and behind it there is
 * a throat: something moves down it, slowly, all the time.
 *
 * Four passes, drawn inside `drawHull`'s own clip to the body: the swallow, the
 * folds, the gloss, and the ship's own grain. Every colour is read off the
 * seat's skin at draw time, so the amber ship gets an amber lip.
 */

/** How many folds cross the lip, and how far down the body they run in tiles. */
const FOLDS = 20;
const FOLD_DROP = 1.3;

/** The swallow: how long one wave takes to travel the lip's height, in
 * seconds, and how bright it is. Slow, because the beat is the only thing on
 * this screen allowed to be fast. */
const SWALLOW_S = 3.2;
const SWALLOW = 0.16;

/**
 * The swallow. One soft band of light passing *down* through the lip toward
 * the throat, over and over — peristalsis seen from outside. It is what says
 * the ship is a gullet rather than a ridge: a lip that nothing moves through
 * is a shape, and a lip something is always going down is a mouth.
 */
function swallow(s: SheenPass): void {
  const { ctx, l, time, filled, skin } = s;
  const top = l.hullY - l.tile * 1.2;
  const bottom = l.bandTop + l.tile * 0.8;
  const span = bottom - top;
  const at = top + span * ((time / SWALLOW_S) % 1);
  const g = ctx.createLinearGradient(0, at - span * 0.28, 0, at + span * 0.18);
  const tint = skin.body[0];
  g.addColorStop(0, rgba(tint, 0));
  g.addColorStop(0.6, rgba(tint, SWALLOW));
  g.addColorStop(1, rgba(tint, 0));
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = g;
  ctx.fill(filled);
  ctx.globalCompositeOperation = "source-over";
}

/**
 * The folds. A lip is creased across its width, every crease running from the
 * edge down and dying out in the flesh, none of them the same length and none
 * of them straight. They are dark lines on a lit surface, so they are drawn
 * over the body in the deepest body stop rather than added.
 */
function folds(s: SheenPass): void {
  const { ctx, l, time, skinY, skin } = s;
  let d = "";
  const left = l.gridLeft - l.tile;
  const width = l.gridWidth + l.tile * 2;
  for (let i = 0; i < FOLDS; i++) {
    const x = left + width * ((i + 0.5) / FOLDS + ((hash01(i * 19 + 3) - 0.5) * 0.6) / FOLDS);
    const top = skinY(x) + l.tile * 0.06;
    const drop = l.tile * FOLD_DROP * (0.45 + hash01(i * 23 + 7) * 0.7);
    const lean = (hash01(i * 29 + 11) - 0.5) * l.tile * 0.5;
    const sway = Math.sin(time * 0.6 + i * 1.3) * l.tile * 0.04;
    const pts: Point[] = [];
    for (let k = 0; k <= 5; k++) {
      const p = k / 5;
      pts.push({ x: x + (lean + sway) * p * p, y: top + drop * p });
    }
    d += openSmoothPath(pts);
  }
  ctx.lineCap = "round";
  ctx.strokeStyle = rgba(skin.body[3], 0.3);
  ctx.lineWidth = Math.max(0.7, l.tile * 0.032);
  ctx.stroke(new Path2D(d));
  ctx.strokeStyle = rgba(skin.body[0], 0.14);
  ctx.lineWidth = Math.max(0.5, l.tile * 0.018);
  ctx.stroke(new Path2D(d));
}

/**
 * The gloss. Wet things are bright along their edge and only there: one broad
 * soft glow along the contour and one thin hard line just inside it, both in
 * the seat's palest colour. The shipped membrane spreads its light over the
 * whole body; a lip keeps it on the rim.
 */
function gloss(s: SheenPass): void {
  const { ctx, l, body, skin } = s;
  strokeGlow(ctx, body, skin.edge, l.tile * 0.16, 0.3);
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = rgba(skin.edge, 0.3);
  ctx.lineWidth = Math.max(1, l.tile * 0.035);
  ctx.stroke(body);
  ctx.globalCompositeOperation = "source-over";
}

/** Where the crease between the two lips runs under the edge, and how far
 * below it the lower lip's own highlight sits, in tiles. */
const CREASE = 0.42;
const LOWER = 0.86;

/**
 * The lower lip. What makes a lip read as a lip in section is that it is
 * **two** bulges: a dark crease runs a little under the edge, and below it the
 * flesh swells again and catches light of its own before falling into the
 * mouth. One dark stroke and one broad soft bright one, both following the
 * skin, and the contour's own gradient does the rest.
 */
function lowerLip(s: SheenPass): void {
  const { ctx, l, skinY, skin } = s;
  const crease: Point[] = [];
  const swell: Point[] = [];
  const steps = 40;
  for (let i = 0; i <= steps; i++) {
    const x = l.gridLeft - l.tile + (l.gridWidth + l.tile * 2) * (i / steps);
    const y = skinY(x);
    // The crease is not parallel to the edge: a lip's is deeper where the lip
    // is fuller and shallower between, so it wanders by a third of itself on
    // its own slow period across the width.
    const full =
      1 + 0.35 * Math.sin(x / (l.tile * 2.3) + 0.8) + 0.15 * Math.sin(x / (l.tile * 0.9));
    crease.push({ x, y: y + l.tile * CREASE * full });
    swell.push({ x, y: y + l.tile * LOWER * (0.85 + 0.15 * full) });
  }
  ctx.lineCap = "round";
  ctx.strokeStyle = rgba(skin.body[3], 0.5);
  ctx.lineWidth = Math.max(2, l.tile * 0.12);
  ctx.stroke(new Path2D(openSmoothPath(crease)));
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = rgba(skin.body[0], 0.14);
  ctx.lineWidth = Math.max(4, l.tile * 0.5);
  ctx.stroke(new Path2D(openSmoothPath(swell)));
  ctx.globalCompositeOperation = "source-over";
}

/** The material, as `HULL_SHEEN.passes` takes it. */
export function lip(s: SheenPass): void {
  swallow(s);
  lowerLip(s);
  folds(s);
  gloss(s);
  dither(s.ctx, s.filled);
}

/**
 * The light: the ship's own light across its width, and the inside of the
 * mouth glowing up from below. `barrel`'s crown is left off — a lip's gloss is
 * `gloss` above, on the edge, and a second bright band along the contour would
 * be two rims on one edge.
 */
export function mouthLight(ctx: CanvasRenderingContext2D, s: HullLit): void {
  barrelAcross(ctx, s.region, s.x, s.w, s.half);
  const g = ctx.createLinearGradient(0, s.y + s.h, 0, s.y + s.h * 0.35);
  g.addColorStop(0, rgba(s.skin.rim, 0.22));
  g.addColorStop(1, rgba(s.skin.rim, 0));
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = g;
  ctx.fill(s.region);
  ctx.globalCompositeOperation = "source-over";
}
