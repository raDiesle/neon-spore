import { type UndertowLobe, undertowBoss, type World } from "@neon-spore/sim";
import { halo, strokeGlow } from "./glow.js";
import type { SurfaceY } from "./hull-frame.js";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { splinePath } from "./spline.js";
import { drawPlateBow, flicker, lifted, seamLight } from "./undertow-seam.js";
import { bowLift, PLATE_HALF } from "./undertow-shape.js";
import type { ViewRole } from "./view-role.js";
import { showsUndertowBow } from "./view-role-clocks.js";

/**
 * THE UNDERTOW, on the ship: the plate bowing, its seams lit, and the plate
 * parted round a lobe that has come up through it.
 *
 * **Drawn on the finished ship** (`frame-on-ship.ts`), because every piece of
 * it is the hull's own plating doing something: a plate lifting off the skin
 * with violet light under it is a picture *over* the rim `drawHull` just lit,
 * and drawn with the field it would be under the ship and gone. The lobes
 * that come up through the plating are the other way round and go down with
 * the field (`undertow-lobe.ts`).
 *
 * **The bow is the pilot's** (`showsUndertowBow`), four beats before the lobe
 * stands, and it shakes — a small tremor sideways, so a plate about to go
 * reads as pushed from under rather than drawn a hair high. What colour the
 * lobe will be is not shown until it stands; the bow only says where.
 *
 * **Violet, through the seams.** The light is `hull`, the ship's own colour.
 * Nothing here is held between frames.
 */

/** How high the light stands in an open plate, in tiles. */
const GLOW_TILES = 0.2;
/** Half-width of the two flaps a parted plate leaves either side of the lobe, in tiles. */
const FLAP_HALF = 0.32;
/** How far off the skin a parted flap stands, in tiles. */
const FLAP_TILES = 0.22;
/** The bow's tremor, in tiles each way, and how fast, per second. */
const BOW_SHAKE_TILES = 0.04;
const BOW_SHAKE_RATE = 19;

export function drawUndertowHull(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  role: ViewRole,
  beatPhase: number,
  time: number,
  surfaceY: SurfaceY,
): void {
  const u = undertowBoss(world);
  if (u === null) return;
  const { cfg, beat } = world;
  const half = PLATE_HALF * l.tile;
  for (const b of u.lobes) {
    if (b.stage !== "bowing") {
      drawParted(ctx, l, b, time, surfaceY);
      continue;
    }
    if (!showsUndertowBow(role)) continue;
    const lift = bowLift(cfg, b, beat, beatPhase);
    // The shake grows with the bow: nothing on the first beat, the full
    // tremor the beat the lobe is through.
    const shake = l.tile * BOW_SHAKE_TILES * lift * Math.sin(time * BOW_SHAKE_RATE + b.col * 2.3);
    drawPlateBow(ctx, l, tileCX(l, b.col) + shake, half, lift, time, surfaceY);
  }
}

/**
 * A plate parted round a standing lobe: light standing in the opening the
 * lobe's own width, and a flap lifted either side of it — the cannon's own
 * collar, which is what makes the lobe read as part of the ship.
 */
function drawParted(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  b: UndertowLobe,
  time: number,
  surfaceY: SurfaceY,
): void {
  const x = tileCX(l, b.col);
  const half = PLATE_HALF * l.tile;
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
