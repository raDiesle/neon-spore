import {
  type Bump,
  CANNON_LOBE,
  HULL,
  hullAngleAtX,
  hullPointAtX,
  MAW,
  openSmoothPath,
  type Point,
  SHIELD_LOBE,
} from "@neon-spore/content";
import type { World } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { type Layout, tileCX } from "./layout.js";
import { lobe } from "./lobe.js";
import { drawCharge, drawChew, drawInhale } from "./maw.js";
import { PALETTE, STROKE } from "./palette.js";
import { drawScars } from "./scars.js";
import { bloom, dither, innerLight, iridescence, sweep } from "./sheen.js";
import { drawShieldRim, type ShieldSegment } from "./shield.js";

/**
 * The ship, from `legacy/style-guide.html`. One membrane, not a collection of
 * parts: the cannon and the shield are local swellings of the same contour
 * (`bumpAdd`), so nothing sits *on* the hull — the hull grows where a player
 * puts something.
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
 * How much of the shield's lift is there while nobody holds it open. It is not
 * zero: a shield that only exists during the trigger window cannot be aimed,
 * and player 2 has to see the thing they are sliding. Armed still doubles it.
 */
const SHIELD_PASSIVE = 0.42;

interface HullFrame {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  bumps: Bump[];
  /**
   * Everything but the cannon lobe. Damage hangs from this rather than from the
   * full contour — see `drawScars`.
   */
  skinBumps: Bump[];
  /** Screen x of the cannon, needed again for the muzzle. */
  cannonX: number;
  t: number;
}

/**
 * Where the lobes are, in columns. Fractional: the world moves them a whole
 * column at a time and render/ carries the eye across — `Glide` for the cannon,
 * a chain of them for the shield (`ShieldBody`).
 */
export interface LobePositions {
  cannon: number;
  /** The shield's body, head first. Each segment is its own bump. */
  shield: readonly ShieldSegment[];
}

/**
 * The ship's transient state, all of it eased and none of it in the world.
 * One object rather than four arguments, because every one of them is the same
 * kind of thing: how the membrane is behaving this frame.
 */
export interface HullMood {
  /** 0..1 towards the shield held open. */
  armed: number;
  /** 0..1 towards the cannon lobe turned inside out — the maw. */
  intake: number;
  /** 0..1 while the skin around the maw comes apart over a pod. */
  chew: number;
  /** 0..1 the light that goes through the ship once the pod is inside. */
  charge: number;
}

function frame(l: Layout, time: number, mood: HullMood, at: LobePositions): HullFrame {
  const rx = l.gridWidth;
  const ry = l.tile * 1.6;
  const cx = l.gridLeft + l.gridWidth / 2;
  const cy = l.hullY + ry;
  const toAngle = (x: number): number => hullAngleAtX(x, cx, rx);

  // The columns are followed, not snapped to: `at` is fractional.
  const cannonX = tileCX(l, at.cannon);
  // The maw is the cannon lobe with the sign of its lift taken away from it: at
  // full intake the same swelling has passed through flat into a throat. One
  // lobe, two directions — see `MAW`.
  const cannonScale = 1 + (MAW.scale - 1) * mood.intake;
  const cannonHalf = 1 + (MAW.halfMul - 1) * mood.intake;
  const cannon = lobe(CANNON_LOBE, toAngle(cannonX), l.tile, ry, rx, time, cannonScale, cannonHalf);
  const skinBumps: Bump[] = [];

  // The shield is a body, not a plate: a head and three followers, each a bump
  // of its own. At rest they lie on top of each other and add up to the armour
  // plate; while it travels they string out behind the head and the skin of the
  // ship travels with them.
  const scale = SHIELD_PASSIVE + (1 - SHIELD_PASSIVE) * mood.armed;
  for (const seg of at.shield) {
    const x = tileCX(l, seg.col);
    skinBumps.push(
      lobe(SHIELD_LOBE, toAngle(x), l.tile, ry, rx, time, scale * seg.weight, seg.halfMul),
    );
  }
  return { cx, cy, rx, ry, bumps: [cannon, ...skinBumps], skinBumps, cannonX, t: time * 1.4 };
}

/** The membrane directly above a screen x. `bumps` selects which lobes count. */
function pointOn(f: HullFrame, x: number, bumps: Bump[]): Point {
  return hullPointAtX(
    x,
    f.cx,
    f.cy,
    f.rx,
    f.ry,
    HULL.lobes,
    HULL.depth,
    HULL.wobble,
    f.t,
    HULL.seed,
    bumps,
  );
}

/** The outline as drawn: lobes and all. */
function surface(f: HullFrame, x: number): Point {
  return pointOn(f, x, f.bumps);
}

/** The same membrane without the cannon lobe standing on it. */
function skin(f: HullFrame, x: number): Point {
  return pointOn(f, x, f.skinBumps);
}

function pointsAcross(f: HullFrame, l: Layout, steps: number): Point[] {
  const from = l.gridLeft - MARGIN * l.gridWidth;
  const to = l.gridLeft + (1 + MARGIN) * l.gridWidth;
  const pts: Point[] = [];
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
  strokeGlow(ctx, body, PALETTE.hull, STROKE.outline + 0.6, Math.max(0.25, hullPercent / 100));

  drawScars(
    ctx,
    l,
    world.scars,
    time,
    (x) => surface(f, x),
    (x) => skin(f, x),
  );
  drawShieldRim(ctx, l, mood.armed, time, at, (x) => surface(f, x));
  const tip = surface(f, f.cannonX);
  drawInhale(ctx, l, mood.intake, time, tip.x, tip.y);
  drawMuzzle(ctx, f, l, mood.intake);
  drawChew(ctx, l, mood, time, f.cannonX, (x) => surface(f, x));
  drawCharge(ctx, l, mood, filled, body);
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
