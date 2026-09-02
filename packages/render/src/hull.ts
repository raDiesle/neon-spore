import { LIGHT_HALF, openSmoothPath } from "@neon-spore/content";
import type { Scar } from "@neon-spore/sim";
import { drawLay } from "./cannon-maw.js";
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
import { litBox } from "./key-light.js";
import type { Layout } from "./layout.js";
import { drawCharge, drawChew, drawInhale } from "./maw.js";
import { drawMuzzle } from "./muzzle.js";
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

/**
 * The colours one ship is painted in. Everything else about a hull — its
 * contour, its lobes, its sheen, the way damage hangs off it — is the same for
 * every ship there will ever be, so the only thing THE MIRROR needs in order
 * to be an exact copy of the player's ship is a second one of these.
 */
export interface HullSkin {
  /** The body, dark where it is thick and bright at the skin, top to bottom. */
  body: readonly [string, string, string, string];
  /** The outline, and what its glow is made of. */
  rim: string;
  /** The bright edge on the muzzle. */
  edge: string;
  /** Inside the muzzle. */
  muzzle: string;
}

/** The player's ship: purple membrane, pale rim. The style guide, as a skin. */
export const OWN_SKIN: HullSkin = {
  body: ["#B268F0", "#6C2AAE", "#33105E", "#150632"],
  rim: PALETTE.hull,
  edge: PALETTE.hullRim,
  muzzle: PALETTE.redDark,
};

/**
 * THE MIRROR: the same ship with the light gone out of it. Blood where the
 * player has violet, bone where the player has white — near enough to read as
 * a copy at a glance, wrong enough to read as a copy of the wrong thing.
 */
export const MIRROR_SKIN: HullSkin = {
  body: ["#FF4A63", "#8E0F2E", "#3A0413", "#120106"],
  rim: "#FF2E52",
  edge: "#FFD9DE",
  muzzle: "#120106",
};

function pointsAcross(f: HullFrame, l: Layout, steps: number) {
  const from = l.gridLeft - MARGIN * l.gridWidth;
  const to = l.gridLeft + (1 + MARGIN) * l.gridWidth;
  const pts = [];
  for (let i = 0; i <= steps; i++) pts.push(surface(f, from + (to - from) * (i / steps)));
  return pts;
}

export function drawHull(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  scars: readonly Scar[],
  time: number,
  mood: HullMood,
  hullPercent: number,
  at: LobePositions,
  craterVisible: (x: number) => boolean = () => true,
  crackArrived: (col: number, beat: number) => boolean = () => true,
  skin_: HullSkin = OWN_SKIN,
  // Render-only, and off by default: nothing here moves the hull's own
  // coordinate math, only where the finished picture lands on the canvas.
  // The offset itself is a boss's business — `queen.ts`'s `hullShake` is the
  // one shape of it that exists today — so this file stays boss-agnostic and
  // only asks for the two numbers. See queen.ts `hullShake` for the signal
  // this is meant to carry; a shake here is a decision the owner made rather
  // than one this file invented.
  shake: { x: number; y: number } = { x: 0, y: 0 },
  // As `hullSkinY`: usually already built this tick and handed down.
  f: HullFrame = frame(l, time, mood, at),
): void {
  // High resolution: the swelling has to read as one unbroken transition, not
  // as a bump glued to a line.
  const pts = pointsAcross(f, l, 140);

  const right = l.gridLeft + l.gridWidth;
  const spline = openSmoothPath(pts);
  const body = new Path2D(spline);
  const filled = new Path2D(`${spline} L ${right} ${l.bandTop} L ${l.gridLeft} ${l.bandTop} Z`);

  // The hull is cut off at the columns, not at the window. The contour itself
  // is unchanged — it is sampled past both edges so it never ends in view — but
  // nothing of the ship is drawn outside the coordinate field, because that is
  // where the game ends on a phone and a wider screen may not show more ship.
  // The bottom edge is `bandTop`, not `l.height`: the field ends where the
  // control band begins, and everything in this function — the fill already
  // stops there (`filled`, above) — has to agree, or the one shape with
  // negative lift (the maw, inverted past the hull line) draws into the
  // buttons instead of stopping at the skin around it.
  ctx.save();
  // The shake translates the whole hull pass — clip included, so the clipped
  // window shudders with the ship rather than cropping it against a window
  // that held still. Scoped to this `save`/`restore` alone: nothing drawn
  // outside this function (the other hand, the rock-impact overlay) reads
  // this offset, so it never reaches a hit region or anything `packages/sim`
  // believes.
  ctx.translate(shake.x, shake.y);
  ctx.beginPath();
  ctx.rect(l.gridLeft, 0, l.gridWidth, l.bandTop);
  ctx.clip();

  // Dark where it is thick, bright at the skin: a jellyfish is mostly the
  // membrane, and a hull filled edge to edge with its own colour is a plate.
  // The light is put back on top, by the passes in sheen.ts.
  const top = Math.min(...pts.map((p) => p.y));
  const bg = ctx.createLinearGradient(0, top, 0, l.bandTop);
  bg.addColorStop(0, skin_.body[0]);
  bg.addColorStop(0.14, skin_.body[1]);
  bg.addColorStop(0.5, skin_.body[2]);
  bg.addColorStop(1, skin_.body[3]);
  ctx.fillStyle = bg;
  ctx.fill(filled);

  // One clip for all five sheen passes — see sheen.ts's header.
  ctx.save();
  ctx.clip(filled);
  bloom(ctx, l, time, (x) => skin(f, x).y);
  innerLight(ctx, body);
  iridescence(ctx, body, l, time);
  sweep(ctx, body, l, time);
  dither(ctx, filled);
  ctx.restore();
  // WHERE THE LIGHT IS. Everything above this line implies one — the vertical
  // body ramp, the inner glow, the sweep — and none of them names it, which is
  // why the ship read flat however good each pass was on its own. The key
  // light goes over all of them and under the outline, because a rim light
  // lies on the silhouette and the outline *is* the silhouette here. The
  // direction is `@neon-spore/content`'s `KEY`, the one constant the director's
  // skins and this renderer both read; nothing in this file names an angle.
  litBox(ctx, filled, l.gridLeft, top, l.gridWidth, l.bandTop - top, LIGHT_HALF.hull);
  // Every crater's geometry, whether or not its hole is open yet — a crack's
  // *position* (`scars.ts`'s `crackOrigin`) reads this unconditional list, so
  // it never moves once drawn. The rim goes round every OPEN crater, not
  // over it: a hole in the skin that still has the ship's own bright outline
  // running across its mouth is not a hole, it is a stain. `craterVisible`
  // keeps an open crater — and so this gap in the rim — out of the picture
  // until the rock that made it has climbed back out of it.
  const allCraters = findCraters(l, scars, (x) => skin(f, x));
  const openCraters = allCraters.filter((c) => craterVisible(c.x));
  strokeHullRim(ctx, l, body, hullPercent, openCraters, skin_.rim);

  // Cracks first, each rock's dent after: its opaque fill paints over
  // whatever a crack drew across that patch, so the crack reads as staying
  // in the skin around the crater rather than running into it. `crackArrived`
  // is a rock's own arrival, not its crater opening — a crack belongs to the
  // impact, and shows long before the hole itself is allowed to.
  drawScars(
    ctx,
    l,
    scars,
    time,
    (x) => surface(f, x),
    (x) => skin(f, x),
    allCraters,
    crackArrived,
  );
  drawCraters(ctx, openCraters);
  drawShieldRim(ctx, l, mood.armed, time, at, (x) => surface(f, x), mood.resonance ?? 0);
  const tip = surface(f, f.cannonX);
  drawInhale(ctx, l, mood.intake, time, tip.x, tip.y);
  drawMuzzle(ctx, f, l, mood.intake, skin_);
  drawChew(ctx, l, mood, time, f.cannonX, (x) => surface(f, x));
  drawCharge(ctx, l, mood, filled, body);
  // Last, and over everything the ship is otherwise doing: a shot about to
  // leave is the most urgent thing on the hull, and it is the only thing here
  // that either player has to act on within the beat.
  drawLay(ctx, l, mood.lay ?? 0, time, f.cannonX, tip.y, mood.intake, (x) => surface(f, x));
  ctx.restore();
}

/** The outline, minus the mouths of any craters it would otherwise run over. */
function strokeHullRim(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  body: Path2D,
  hullPercent: number,
  craters: Crater[],
  rim: string,
): void {
  ctx.save();
  clipOutMouths(ctx, l, craters);
  strokeGlow(ctx, body, rim, STROKE.outline + 0.6, Math.max(0.25, hullPercent / 100));
  ctx.restore();
}

/**
 * The fire opening at the tip of the cannon lobe. While the maw is open it is
 * the throat instead: it widens and darkens, and it sits at the bottom of the
 * dent rather than at the top of the swelling, because `surface` follows the
 * lobe wherever the lobe has gone.
 *
 * At rest this is the same circle it always was, offset a little below the
 * tip so it sits inside the raised muzzle rather than on its peak. As the
 * maw opens, that offset eases back to zero — the tip is already sinking
 * into the throat, so the opening no longer needs to reach further below it
 * — and the growth that used to go equally into the radius in every
 * direction now goes sideways only. `MUZZLE_RY` never changes with intake:
 * whatever the maw does, this shape cannot reach any further below the tip
 * than the resting muzzle already did. The width spends what the depth no
 * longer does — at full intake, `rx` against `MUZZLE_RY` fills 0.94 × 0.13 ×
 * π ≈ 0.1222 tile², against the old full-intake circle's 0.35² × π ≈ 0.1225
 * tile²: the same opening, spent across instead of down.
 */
export function cannonTip(
  l: Layout,
  time: number,
  mood: HullMood,
  at: LobePositions,
  f: HullFrame = frame(l, time, mood, at),
): { x: number; y: number } {
  return surface(f, f.cannonX);
}
