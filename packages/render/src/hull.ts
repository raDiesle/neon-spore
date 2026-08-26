import { openSmoothPath } from "@neon-spore/content";
import type { World } from "@neon-spore/sim";
import { type Crater, clipOutMouths, drawCraters, craters as findCraters } from "./craters.js";
import { strokeGlow } from "./glow.js";
import {
  frame,
  type HullFrame,
  type HullMood,
  type LobePositions,
  skin,
  surface,
} from "./hull-frame.js";
import type { Layout } from "./layout.js";
import { drawCharge, drawChew, drawInhale } from "./maw.js";
import { PALETTE, STROKE } from "./palette.js";
import { drawScars } from "./scars.js";
import { bloom, dither, innerLight, iridescence, sweep } from "./sheen.js";
import { drawShieldRim } from "./shield.js";

export type { HullMood, LobePositions } from "./hull-frame.js";
export { hullSkinY } from "./hull-frame.js";

/**
 * The ship, from `legacy/style-guide.html`. One membrane, not a collection of
 * parts: the cannon and the shield are local swellings of the same contour
 * (`bumpAdd`), so nothing sits *on* the hull — the hull grows where a player
 * puts something. The shape of that membrane, frame by frame, is
 * `hull-frame.ts`; this file only draws it.
 *
 * The contour is an ellipse far wider than the screen; only the arc around its
 * apex is in view, which is what keeps the surface almost flat and lets the
 * angle-to-x mapping stay linear (`xToAngle` in the style guide). It is sampled
 * as a height field over x (`hullPointAtX`), so a lobe stands above the column
 * it belongs to instead of leaning towards the middle of the field.
 */
/** How far past the field edges to sample, so the contour never ends in view. */
const MARGIN = 0.12;

function pointsAcross(f: HullFrame, l: Layout, steps: number) {
  const from = l.gridLeft - MARGIN * l.gridWidth;
  const to = l.gridLeft + (1 + MARGIN) * l.gridWidth;
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    pts.push(surface(f, from + (to - from) * (i / steps)));
  }
  return pts;
}

export function drawHull(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  time: number,
  mood: HullMood,
  hullPercent: number,
  at: LobePositions,
  craterVisible: (x: number) => boolean = () => true,
  crackArrived: (col: number, beat: number) => boolean = () => true,
): void {
  const f = frame(l, time, mood, at);
  // High resolution: the swelling has to read as one unbroken transition, not
  // as a bump glued to a line.
  const pts = pointsAcross(f, l, 140);

  const right = l.gridLeft + l.gridWidth;
  const body = new Path2D(openSmoothPath(pts));
  const filled = new Path2D(
    `${openSmoothPath(pts)} L ${right} ${l.bandTop} L ${l.gridLeft} ${l.bandTop} Z`,
  );

  // The hull is cut off at the columns, not at the window. The contour itself
  // is unchanged — it is sampled past both edges so it never ends in view — but
  // nothing of the ship is drawn outside the coordinate field, because that is
  // where the game ends on a phone and a wider screen may not show more ship.
  ctx.save();
  ctx.beginPath();
  ctx.rect(l.gridLeft, 0, l.gridWidth, l.height);
  ctx.clip();

  // Dark where it is thick, bright at the skin: a jellyfish is mostly the
  // membrane, and a hull filled edge to edge with its own colour is a plate.
  // The light is put back on top, by the passes in sheen.ts.
  const top = Math.min(...pts.map((p) => p.y));
  const bg = ctx.createLinearGradient(0, top, 0, l.bandTop);
  bg.addColorStop(0, "#B268F0");
  bg.addColorStop(0.14, "#6C2AAE");
  bg.addColorStop(0.5, "#33105E");
  bg.addColorStop(1, "#150632");
  ctx.fillStyle = bg;
  ctx.fill(filled);

  bloom(ctx, filled, l, time, (x) => skin(f, x).y);
  innerLight(ctx, body, filled);
  iridescence(ctx, body, filled, l, time);
  sweep(ctx, body, filled, l, time);
  dither(ctx, filled);
  // Every crater's geometry, whether or not its hole is open yet — a crack's
  // *position* (`scars.ts`'s `crackOrigin`) reads this unconditional list, so
  // it never moves once drawn. The rim goes round every OPEN crater, not
  // over it: a hole in the skin that still has the ship's own bright outline
  // running across its mouth is not a hole, it is a stain. `craterVisible`
  // keeps an open crater — and so this gap in the rim — out of the picture
  // until the rock that made it has climbed back out of it.
  const allCraters = findCraters(l, world.scars, (x) => skin(f, x));
  const openCraters = allCraters.filter((c) => craterVisible(c.x));
  strokeHullRim(ctx, l, body, hullPercent, openCraters);

  // Cracks first, each rock's dent after: its opaque fill paints over
  // whatever a crack drew across that patch, so the crack reads as staying
  // in the skin around the crater rather than running into it. `crackArrived`
  // is a rock's own arrival, not its crater opening — a crack belongs to the
  // impact, and shows long before the hole itself is allowed to.
  drawScars(
    ctx,
    l,
    world.scars,
    time,
    (x) => surface(f, x),
    (x) => skin(f, x),
    allCraters,
    crackArrived,
  );
  drawCraters(ctx, openCraters);
  drawShieldRim(ctx, l, mood.armed, time, at, (x) => surface(f, x));
  const tip = surface(f, f.cannonX);
  drawInhale(ctx, l, mood.intake, time, tip.x, tip.y);
  drawMuzzle(ctx, f, l, mood.intake);
  drawChew(ctx, l, mood, time, f.cannonX, (x) => surface(f, x));
  drawCharge(ctx, l, mood, filled, body);
  ctx.restore();
}

/** The outline, minus the mouths of any craters it would otherwise run over. */
function strokeHullRim(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  body: Path2D,
  hullPercent: number,
  craters: Crater[],
): void {
  ctx.save();
  clipOutMouths(ctx, l, craters);
  strokeGlow(ctx, body, PALETTE.hull, STROKE.outline + 0.6, Math.max(0.25, hullPercent / 100));
  ctx.restore();
}

/**
 * The fire opening at the tip of the cannon lobe. While the maw is open it is
 * the throat instead: it widens and darkens, and it sits at the bottom of the
 * dent rather than at the top of the swelling, because `surface` follows the
 * lobe wherever the lobe has gone.
 */
function drawMuzzle(ctx: CanvasRenderingContext2D, f: HullFrame, l: Layout, intake: number): void {
  const tip = surface(f, f.cannonX);
  ctx.fillStyle = PALETTE.redDark;
  ctx.beginPath();
  ctx.arc(tip.x, tip.y + l.tile * 0.12, l.tile * (0.13 + 0.22 * intake), 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = intake > 0.5 ? PALETTE.podRim : PALETTE.hullRim;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke();
}

/** Where a shot leaves the hull, so the bullet starts at the muzzle. */
export function cannonTip(
  l: Layout,
  time: number,
  mood: HullMood,
  at: LobePositions,
): { x: number; y: number } {
  const f = frame(l, time, mood, at);
  return surface(f, f.cannonX);
}
