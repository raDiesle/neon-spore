import {
  type Bump,
  CANNON_LOBE,
  HULL,
  hullAngleAtX,
  hullPointAtX,
  type LobeShape,
  openSmoothPath,
  SHIELD_LOBE,
} from "@neon-spore/content";
import type { Scar, World } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

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

interface HullFrame {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  bumps: Bump[];
  /** Screen x of the cannon, needed again for the muzzle. */
  cannonX: number;
  shieldX: number;
  t: number;
}

/**
 * Where the lobes are, in columns. Fractional: the world moves the cannon a
 * whole column at a time and `Glide` in render/ carries the eye across.
 */
export interface LobePositions {
  cannon: number;
  shield: number;
}

/**
 * One lobe, as a bump on the contour. The lift breathes and the width breathes
 * against it, so the lobe swells and narrows the way a held breath does rather
 * than simply scaling up and down.
 */
function lobe(
  shape: LobeShape,
  angle: number,
  tile: number,
  ry: number,
  rx: number,
  time: number,
  scale: number,
): Bump {
  const breath = Math.sin(time * shape.breathHz * Math.PI * 2 + shape.breathPhase);
  const lift = ((tile * shape.liftTiles) / ry) * (1 + shape.breath * breath) * scale;
  const half = ((tile * shape.halfTiles) / rx) * (1 - shape.breath * 0.5 * breath);
  return {
    angle,
    strength: lift,
    plateau: half * shape.plateau,
    shoulder: half * shape.shoulder,
  };
}

function frame(l: Layout, time: number, armed: number, at: LobePositions): HullFrame {
  const rx = l.gridWidth;
  const ry = l.tile * 1.6;
  const cx = l.gridLeft + l.gridWidth / 2;
  const cy = l.hullY + ry;
  const toAngle = (x: number): number => hullAngleAtX(x, cx, rx);

  // The columns are followed, not snapped to: `at` is fractional.
  const cannonX = tileCX(l, at.cannon);
  const shieldX = tileCX(l, at.shield);

  const bumps: Bump[] = [lobe(CANNON_LOBE, toAngle(cannonX), l.tile, ry, rx, time, 1)];
  // The armour-plate variant of the shield: a real swelling, wider and flatter
  // than the cannon, and only there while player 1 holds it open.
  if (armed > 0.01) {
    bumps.push(lobe(SHIELD_LOBE, toAngle(shieldX), l.tile, ry, rx, time, armed));
  }
  return { cx, cy, rx, ry, bumps, cannonX, shieldX, t: time * 1.4 };
}

function pointsAcross(f: HullFrame, l: Layout, steps: number, bumps: Bump[]) {
  const from = l.gridLeft - MARGIN * l.gridWidth;
  const to = l.gridLeft + (1 + MARGIN) * l.gridWidth;
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const x = from + (to - from) * (i / steps);
    pts.push(
      hullPointAtX(
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
      ),
    );
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
  const pts = pointsAcross(f, l, 140, f.bumps);

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

  const halo = ctx.createLinearGradient(0, top - 26, 0, top + 26);
  halo.addColorStop(0, "#FFC24B00");
  halo.addColorStop(1, "#FFC24B26");
  ctx.fillStyle = halo;
  ctx.fillRect(l.gridLeft, top - 26, l.gridWidth, 52);

  strokeGlow(ctx, body, PALETTE.hull, STROKE.outline + 0.6, Math.max(0.25, hullPercent / 100));

  drawScars(ctx, l, world.scars, time);
  drawShieldRim(ctx, l, f, armed, time);
  drawMuzzle(ctx, f, l);
  ctx.restore();
}

/**
 * A breach stays. The prototype scatters it with `Math.random`; here the offset
 * comes from the column and the beat it happened on, so the same damage looks
 * the same on both screens without the simulation storing a jitter.
 */
function drawScars(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  scars: readonly Scar[],
  time: number,
): void {
  for (const s of scars) {
    const n = (s.col * 73856093) ^ (s.beat * 19349663);
    const ox = (((n >>> 8) % 100) / 100 - 0.5) * l.tile * 0.5;
    const radius = 4 + ((n >>> 3) % 40) / 10;
    const cx = tileCX(l, s.col) + ox;
    const cy = l.hullY + l.tile * 0.2;

    ctx.fillStyle = "#1A1330";
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    // Something still burns in the break.
    ctx.globalAlpha = 0.3 + Math.sin(time * 5 + s.col * 1.3) * 0.15;
    ctx.fillStyle = PALETTE.red;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

/**
 * The rim-thickening variant on top of the plate: over the shield's segment the
 * edge of the membrane brightens and thickens. Armed and passive then differ in
 * both silhouette and light, which is what docs/spec/systems.md 5.8 asks for — a deflection has
 * to be unmissable or the pair never learns the timing.
 */
function drawShieldRim(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  f: HullFrame,
  armed: number,
  time: number,
): void {
  const shimmer = 0.72 + 0.16 * Math.sin(time * 2.6) + 0.12 * Math.sin(time * 1.15 + 1.7);
  const glow = Math.max(0.12, armed * shimmer);
  const half = l.tile * 0.75;
  const pts = [];
  for (let i = 0; i <= 18; i++) {
    const x = f.shieldX - half + 2 * half * (i / 18);
    pts.push(
      hullPointAtX(
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
      ),
    );
  }
  const seg = new Path2D(openSmoothPath(pts));
  ctx.globalAlpha = 0.12 + 0.88 * glow;
  strokeGlow(ctx, seg, PALETTE.shieldRim, 2 + 6 * armed, 0.4 + armed);
  ctx.globalAlpha = 1;
}

/** The fire opening at the tip of the cannon lobe. */
function drawMuzzle(ctx: CanvasRenderingContext2D, f: HullFrame, l: Layout): void {
  const tip = hullPointAtX(
    f.cannonX,
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
  return hullPointAtX(
    f.cannonX,
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
