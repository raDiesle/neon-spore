import {
  type Bump,
  CANNON_LOBE,
  HULL,
  hullAngleAtX,
  hullPointAtX,
  openSmoothPath,
  type Point,
  SHIELD_LOBE,
} from "@neon-spore/content";
import type { World } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { type Layout, tileCX } from "./layout.js";
import { lobe } from "./lobe.js";
import { PALETTE, STROKE } from "./palette.js";
import { drawScars } from "./scars.js";
import type { ShieldSegment } from "./shield.js";

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

function frame(l: Layout, time: number, armed: number, at: LobePositions): HullFrame {
  const rx = l.gridWidth;
  const ry = l.tile * 1.6;
  const cx = l.gridLeft + l.gridWidth / 2;
  const cy = l.hullY + ry;
  const toAngle = (x: number): number => hullAngleAtX(x, cx, rx);

  // The columns are followed, not snapped to: `at` is fractional.
  const cannonX = tileCX(l, at.cannon);
  const bumps: Bump[] = [lobe(CANNON_LOBE, toAngle(cannonX), l.tile, ry, rx, time, 1)];

  // The shield is a body, not a plate: a head and three followers, each a bump
  // of its own. At rest they lie on top of each other and add up to the armour
  // plate; while it travels they string out behind the head and the skin of the
  // ship travels with them.
  const scale = SHIELD_PASSIVE + (1 - SHIELD_PASSIVE) * armed;
  for (const seg of at.shield) {
    const x = tileCX(l, seg.col);
    bumps.push(
      lobe(SHIELD_LOBE, toAngle(x), l.tile, ry, rx, time, scale * seg.weight, seg.halfMul),
    );
  }
  return { cx, cy, rx, ry, bumps, cannonX, t: time * 1.4 };
}

/** The membrane directly above a screen x, lobes and all. */
function surface(f: HullFrame, x: number): Point {
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
    f.bumps,
  );
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
  armed: number,
  hullPercent: number,
  at: LobePositions,
): void {
  const f = frame(l, time, armed, at);
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

  const top = Math.min(...pts.map((p) => p.y));
  const bg = ctx.createLinearGradient(0, top, 0, l.bandTop);
  bg.addColorStop(0, "#FFE9BE");
  bg.addColorStop(0.3, PALETTE.hull);
  bg.addColorStop(1, "#7A4E14");
  ctx.fillStyle = bg;
  ctx.fill(filled);

  innerWarmth(ctx, body, filled);
  strokeGlow(ctx, body, PALETTE.hull, STROKE.outline + 0.6, Math.max(0.25, hullPercent / 100));

  drawScars(ctx, l, world.scars, time, (x) => surface(f, x));
  drawShieldRim(ctx, l, f, armed, time, at);
  drawMuzzle(ctx, f, l);
  ctx.restore();
}

/**
 * The warm light just under the skin.
 *
 * It used to be a gradient rectangle across the full width, starting at the
 * highest point of the contour — which meant that whenever the two lobes met
 * and the surface rose, a pale band slid up the whole hull and showed its own
 * straight lower edge. The membrane has no straight edges. So the glow is a
 * wide, soft stroke of the contour itself, clipped to the inside of the hull:
 * it follows every swelling exactly, and the half that would spill into space
 * is cut away by the clip rather than by a horizontal line.
 */
function innerWarmth(ctx: CanvasRenderingContext2D, body: Path2D, filled: Path2D): void {
  ctx.save();
  ctx.clip(filled);
  ctx.strokeStyle = "#FFC24B";
  ctx.lineCap = "round";
  for (const [width, alpha] of [
    [46, 0.05],
    [22, 0.06],
    [9, 0.08],
  ] as const) {
    ctx.globalAlpha = alpha;
    ctx.lineWidth = width;
    ctx.stroke(body);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

/**
 * The rim-thickening variant on top of the plate: over the shield's segment the
 * edge of the membrane brightens and thickens. Armed and passive then differ in
 * both silhouette and light, which is what docs/spec/systems.md 5.8 asks for — a
 * deflection has to be unmissable or the pair never learns the timing.
 *
 * The bright stretch spans the whole body, head to tail, so a shield in motion
 * lights up as a long moving band rather than a dot with a tail behind it.
 */
function drawShieldRim(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  f: HullFrame,
  armed: number,
  time: number,
  at: LobePositions,
): void {
  if (at.shield.length === 0) return;
  const cols = at.shield.map((s) => s.col);
  const shimmer = 0.72 + 0.16 * Math.sin(time * 2.6) + 0.12 * Math.sin(time * 1.15 + 1.7);
  const glow = Math.max(0.34, armed * shimmer);
  const half = l.tile * 0.8;
  const from = tileCX(l, Math.min(...cols)) - half;
  const to = tileCX(l, Math.max(...cols)) + half;
  const pts: Point[] = [];
  const steps = 26;
  for (let i = 0; i <= steps; i++) pts.push(surface(f, from + (to - from) * (i / steps)));

  const seg = new Path2D(openSmoothPath(pts));
  ctx.globalAlpha = 0.3 + 0.7 * glow;
  strokeGlow(ctx, seg, PALETTE.shieldRim, 2.4 + 5.6 * armed, 0.5 + armed);
  ctx.globalAlpha = 1;
}

/** The fire opening at the tip of the cannon lobe. */
function drawMuzzle(ctx: CanvasRenderingContext2D, f: HullFrame, l: Layout): void {
  const tip = surface(f, f.cannonX);
  ctx.fillStyle = PALETTE.redDark;
  ctx.beginPath();
  ctx.arc(tip.x, tip.y + l.tile * 0.12, l.tile * 0.13, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.hullRim;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke();
}

/** Where a shot leaves the hull, so the bullet starts at the muzzle. */
export function cannonTip(
  l: Layout,
  time: number,
  armed: number,
  at: LobePositions,
): { x: number; y: number } {
  const f = frame(l, time, armed, at);
  return surface(f, f.cannonX);
}
