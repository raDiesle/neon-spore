import type { Point } from "@neon-spore/content";
import { type UndertowBreach, undertowBoss, undertowUnseated, type World } from "@neon-spore/sim";
import { halo, strokeGlow } from "./glow.js";
import type { SurfaceY } from "./hull-frame.js";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { splinePath } from "./spline.js";
import { BOW_TILES, bowLift, breachHalf, edgeLight } from "./undertow-shape.js";
import { showsUndertowBow, type ViewRole } from "./view-role.js";

/**
 * THE UNDERTOW, on the ship: the plate bowing, the seams lit, the breach
 * parted, and the whole edge rising before the last lobe.
 *
 * **Drawn on the finished ship** (`frame-on-ship.ts`), because every piece of
 * it is the hull's own plating doing something: a plate lifting off the skin
 * with violet light under it is a picture *over* the rim `drawHull` just lit,
 * and drawn with the field it would be under the ship and gone. The lobes
 * that come up through the plating are the other way round and go down with
 * the field (`undertow-lobe.ts`).
 *
 * **The bow is the pilot's** (`showsUndertowBow`). The floor is his half the
 * way the rocks are: he owns the maw and the cannon's column, so he is the
 * seat shown where the next lobe is pushing, four beats before it stands, and
 * the fight's first part is him calling the column. The navigator is shown a
 * breach the moment it opens and nothing before — the plate she has to stand
 * on it faces down for the first time in the game, and she has to be told
 * where. The rise before the last lobe is every seam at once and the whole
 * edge, and that is both screens: there is no column to call.
 *
 * **Violet, through the seams.** The light is `hull`, the ship's own colour,
 * which is the fiction the design asks for — it is coming up out of whatever
 * the ship is standing on. Nothing here is held between frames.
 */

/** How far the whole edge lifts at the rise, in tiles: less than one plate's bow. */
const EDGE_TILES = 0.18;
/** How high the light stands in an open breach, in tiles. */
const GLOW_TILES = 0.2;
/** Half-width of the two flaps a parted plate leaves either side of the lobe, in tiles. */
const FLAP_HALF = 0.32;
/** How far off the skin a parted flap stands, in tiles. */
const FLAP_TILES = 0.22;

export function drawUndertowHull(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  role: ViewRole,
  beatPhase: number,
  time: number,
  surfaceY: SurfaceY,
  cannonX: number,
): void {
  const u = undertowBoss(world);
  if (u === null) return;
  const { cfg, beat } = world;
  const edge = edgeLight(cfg, u, beat, beatPhase);
  if (edge > 0) drawEdge(ctx, l, edge, time, surfaceY);
  for (const b of u.breaches) {
    if (b.stage === "standing") drawParted(ctx, l, b, time, surfaceY);
    else if (showsUndertowBow(role) || u.phase === "last") {
      drawBow(ctx, l, b, bowLift(cfg, u, b, beat, beatPhase), time, surfaceY);
    }
  }
  // The seat's own column, lit under the cannon while it is unseated: the
  // floor came up under him and he stayed, and the four dead beats are shown
  // where they were earned. His screen alone — it is his seat that is dead.
  if (showsUndertowBow(role) && undertowUnseated(u, beat)) {
    halo(ctx, cannonX, surfaceY(cannonX), l.tile * 0.7, PALETTE.hull, 0.35 + 0.25 * flicker(time));
  }
}

/** A slow unsteady pulse for the light, off the frame clock; the same on both screens. */
function flicker(time: number): number {
  return 0.5 + 0.5 * Math.sin(time * 7.3) * Math.sin(time * 2.1);
}

/**
 * The skin between two screen x's, lifted by a raised-cosine window — the
 * plate as it bows — as an open run of points, left to right.
 */
function lifted(x0: number, x1: number, lift: number, surfaceY: SurfaceY): Point[] {
  const pts: Point[] = [];
  const n = 10;
  for (let i = 0; i <= n; i++) {
    const f = i / n;
    const x = x0 + (x1 - x0) * f;
    pts.push({ x, y: surfaceY(x) - lift * 0.5 * (1 - Math.cos(f * Math.PI * 2)) });
  }
  return pts;
}

/** The same run along the skin itself, right to left, to close a light against it. */
function along(x0: number, x1: number, surfaceY: SurfaceY): Point[] {
  const pts: Point[] = [];
  for (let i = 10; i >= 0; i--) {
    const x = x0 + (x1 - x0) * (i / 10);
    pts.push({ x, y: surfaceY(x) });
  }
  return pts;
}

/**
 * The light under a lifted plate: filled additively between the skin and the
 * plate's underside, so it reads as light through a seam rather than as a
 * second hull painted over the first.
 */
function seamLight(
  ctx: CanvasRenderingContext2D,
  plate: Point[],
  x0: number,
  x1: number,
  alpha: number,
  surfaceY: SurfaceY,
): void {
  const light = splinePath([...plate, ...along(x0, x1, surfaceY)], true);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = alpha;
  ctx.fillStyle = PALETTE.hull;
  ctx.fill(light);
  ctx.restore();
}

/** One plate bowing up under the pilot's eye: the seam lit, the rim lifted, a glow at each end. */
function drawBow(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  b: UndertowBreach,
  lift: number,
  time: number,
  surfaceY: SurfaceY,
): void {
  if (lift <= 0) return;
  const x = tileCX(l, b.col);
  const half = breachHalf(b) * l.tile;
  const plate = lifted(x - half, x + half, BOW_TILES * l.tile * lift, surfaceY);
  seamLight(ctx, plate, x - half, x + half, 0.25 + 0.3 * lift, surfaceY);
  strokeGlow(ctx, splinePath(plate, false), PALETTE.hullRim, STROKE.inner, 0.3 + 0.6 * lift);
  const glow = (0.2 + 0.4 * lift) * (0.7 + 0.3 * flicker(time));
  halo(ctx, x - half, surfaceY(x - half), l.tile * 0.35, PALETTE.hull, glow);
  halo(ctx, x + half, surfaceY(x + half), l.tile * 0.35, PALETTE.hull, glow);
}

/**
 * A plate parted round a standing lobe: light standing in the breach the
 * lobe's own width, and a flap lifted either side of it. The flaps stand
 * where the breach's edges are, so a breach widening a tenth of a tile a beat
 * is seen widening — the flaps walk outward — which is what the navigator's
 * plate is there to stop.
 */
function drawParted(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  b: UndertowBreach,
  time: number,
  surfaceY: SurfaceY,
): void {
  const x = tileCX(l, b.col);
  const half = breachHalf(b) * l.tile;
  const glow = 0.5 + 0.3 * flicker(time);
  const inside = lifted(x - half, x + half, GLOW_TILES * l.tile, surfaceY);
  seamLight(ctx, inside, x - half, x + half, 0.35 * glow, surfaceY);
  for (const s of [-1, 1]) {
    const fx = x + s * (half + FLAP_HALF * l.tile);
    const f0 = fx - FLAP_HALF * l.tile;
    const f1 = fx + FLAP_HALF * l.tile;
    const flap = lifted(f0, f1, FLAP_TILES * l.tile, surfaceY);
    seamLight(ctx, flap, f0, f1, 0.4, surfaceY);
    strokeGlow(ctx, splinePath(flap, false), PALETTE.hullRim, STROKE.inner, 0.8);
    halo(ctx, x + s * half, surfaceY(x + s * half), l.tile * 0.4, PALETTE.hull, glow);
  }
}

/**
 * The rise: every seam in the hull lit at once and the whole edge bowing
 * along its full width. One lifted run across the grid, its light under it
 * and its rim over, brightening with `edgeLight` and going out again as the
 * body goes down.
 */
function drawEdge(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  light: number,
  time: number,
  surfaceY: SurfaceY,
): void {
  const x0 = l.gridLeft;
  const x1 = l.gridLeft + l.gridWidth;
  const lift = EDGE_TILES * l.tile * light;
  const pts: Point[] = [];
  const n = 2 * l.cols;
  for (let i = 0; i <= n; i++) {
    const x = x0 + (x1 - x0) * (i / n);
    // Every seam: a ripple one column long, so the lit edge reads as plates
    // lifting one by one rather than as the whole hull drawn a hair higher.
    const seam = 0.5 * (1 - Math.cos(((x - x0) / l.tile) * Math.PI * 2));
    pts.push({ x, y: surfaceY(x) - lift * (0.4 + 0.6 * seam) });
  }
  seamLight(ctx, pts, x0, x1, (0.15 + 0.25 * light) * (0.8 + 0.2 * flicker(time)), surfaceY);
  strokeGlow(ctx, splinePath(pts, false), PALETTE.hullRim, STROKE.inner, 0.3 + 0.6 * light);
}
