import { type Bump, HULL, hullPointAt, openSmoothPath } from "@neon-spore/content";
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
 * angle-to-x mapping stay linear (`xToAngle` in the style guide).
 */
const APEX = -Math.PI / 2;
/** How far past the field edges to sample, so the contour never ends in view. */
const MARGIN = 0.12;

interface HullFrame {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  bumps: Bump[];
  /** Angle of the cannon, needed again for the muzzle. */
  cannonAngle: number;
  shieldAngle: number;
  t: number;
}

function frame(l: Layout, world: World, time: number, armed: number): HullFrame {
  const rx = l.gridWidth;
  const ry = l.tile * 1.6;
  const cx = l.gridLeft + l.gridWidth / 2;
  const cy = l.hullY + ry;
  const toAngle = (x: number): number => APEX + (x - cx) / rx;

  // Widths are chosen in tiles and converted, so a lobe stays the same size
  // relative to a column whatever the screen does.
  const cannonHalf = (l.tile * 0.42) / rx;
  const shieldHalf = (l.tile * 0.6) / rx;
  const cannonAngle = toAngle(tileCX(l, world.cannonCol));
  const shieldAngle = toAngle(tileCX(l, world.shieldCol));

  const bumps: Bump[] = [
    {
      angle: cannonAngle,
      strength: (l.tile * 0.5) / ry,
      plateau: cannonHalf * 0.35,
      shoulder: cannonHalf * 0.65,
    },
  ];
  // The armour-plate variant of the shield: a real swelling, wider and flatter
  // than the cannon, and only there while player 1 holds it open.
  if (armed > 0.01) {
    bumps.push({
      angle: shieldAngle,
      strength: ((l.tile * 0.34) / ry) * armed,
      plateau: shieldHalf * 0.45,
      shoulder: shieldHalf * 0.55,
    });
  }
  return { cx, cy, rx, ry, bumps, cannonAngle, shieldAngle, t: time * 1.4 };
}

function pointsAcross(f: HullFrame, l: Layout, steps: number, bumps: Bump[]) {
  const from = APEX + (l.gridLeft - MARGIN * l.gridWidth - f.cx) / f.rx;
  const to = APEX + (l.gridLeft + (1 + MARGIN) * l.gridWidth - f.cx) / f.rx;
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const a = from + (to - from) * (i / steps);
    pts.push(
      hullPointAt(
        a,
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
): void {
  const f = frame(l, world, time, armed);
  // High resolution: the swelling has to read as one unbroken transition, not
  // as a bump glued to a line.
  const pts = pointsAcross(f, l, 140, f.bumps);

  const body = new Path2D(openSmoothPath(pts));
  const filled = new Path2D(`${openSmoothPath(pts)} L ${l.width} ${l.bandTop} L 0 ${l.bandTop} Z`);

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
  ctx.fillRect(0, top - 26, l.width, 52);

  strokeGlow(ctx, body, PALETTE.hull, STROKE.outline + 0.6, Math.max(0.25, hullPercent / 100));

  drawScars(ctx, l, world.scars, time);
  drawShieldRim(ctx, l, f, armed, time);
  drawMuzzle(ctx, f, l);
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
  const half = (l.tile * 0.75) / f.rx;
  const pts = [];
  for (let i = 0; i <= 18; i++) {
    const a = f.shieldAngle - half + 2 * half * (i / 18);
    pts.push(
      hullPointAt(
        a,
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
  const tip = hullPointAt(
    f.cannonAngle,
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
  world: World,
  time: number,
  armed: number,
): { x: number; y: number } {
  const f = frame(l, world, time, armed);
  return hullPointAt(
    f.cannonAngle,
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
