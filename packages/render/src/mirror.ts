import type { MirrorState, SimConfig } from "@neon-spore/sim";
import { drawHull, type HullMood, type LobePositions, MIRROR_SKIN } from "./hull.js";
import type { Layout } from "./layout.js";
import { drawMirrorChamber } from "./mirror-chamber.js";
import type { ShieldSegment } from "./shield.js";

/**
 * THE MIRROR: the player's own ship, upside down at the top of the field, in
 * the colours of something that went wrong.
 *
 * It is drawn by `drawHull` — the same function, the same contour, the same
 * lobes, the same craters and cracks — under a vertical flip, because "an
 * exact copy of your ship" is a claim a second drawing of a similar shape
 * cannot make and a mirrored transform cannot fail to make. Its chamber is the
 * band's, under the same flip (`mirror-chamber.ts`). All this file decides is
 * where the flip goes and which skin the copy wears.
 */

/**
 * Where the hull sits inside the flipped frame, in tiles, and how tall that
 * frame is. Both are local to the mirror's own coordinate space and have
 * nothing to do with the real field: the flip sends local *down* to screen
 * *up*, so everything the hull draws above its own surface — the lobes, the
 * glow, the muzzle — lands below the mirror on screen, and the frame has to
 * be deep enough on both sides of the surface for none of it to be clipped.
 */
const LOCAL_HULL_TILES = 4;
const LOCAL_FRAME_TILES = 10;

/** The screen y THE MIRROR's hull surface sits on. */
export function mirrorHullY(l: Layout, cfg: SimConfig): number {
  return l.gridTop + cfg.mirrorRow * l.tile;
}

/**
 * The layout the mirror is drawn in: the real one with its hull moved to a
 * shallow local row and its band one tile below that, exactly as the ship's
 * own band sits one tile below its hull. Everything horizontal — the columns,
 * the tile, where the field starts — is shared, so a lobe over column 4 is
 * over column 4 on both ships.
 *
 * The band is as deep as the screen has room for above the mirror: its
 * bottom, flipped, is the top edge of the screen, so the chamber runs off the
 * frame the way the pair's own runs off the bottom of theirs, and no sky
 * shows between the copy's insides and the edge (`mirror-chamber.ts`). The
 * membrane's swing is a share of this depth (`seam-line.ts`), so the copy's
 * belly is as deep as the depth allows, not the ship's to the pixel.
 */
function mirrorLayout(l: Layout, cfg: SimConfig): Layout {
  const hullY = l.tile * LOCAL_HULL_TILES;
  const bandTop = l.tile * (LOCAL_HULL_TILES + 1);
  return {
    ...l,
    gridTop: 0,
    hullY,
    bandTop,
    bandHeight: mirrorChamberDepth(l, cfg),
    playHeight: bandTop,
    height: l.tile * LOCAL_FRAME_TILES,
  };
}

/** How deep the mirror's chamber is: from a tile under its hull to the top of the screen. */
export function mirrorChamberDepth(l: Layout, cfg: SimConfig): number {
  return Math.max(l.tile, mirrorHullY(l, cfg) - l.tile);
}

/**
 * The mirror's shield, as a body of segments the way the ship's is — but a
 * still one. It never travels of its own accord: it is over the column the
 * player's shield is over, and the whole point is that it got there without
 * being asked.
 */
function stillShield(col: number): ShieldSegment[] {
  return [
    { col, weight: 1, halfMul: 1 },
    { col, weight: 0.72, halfMul: 1.35 },
    { col, weight: 0.5, halfMul: 1.7 },
    { col, weight: 0.32, halfMul: 2.1 },
  ];
}

/**
 * Draw it. `mood` is the mirror's own — armed while it performs a guard, open
 * while it performs an intake — and comes from `MirrorFx`, which is the only
 * thing about this boss that lives in render/ rather than in the world.
 */
export function drawMirror(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  m: MirrorState,
  /** The column the player's shield holds — the mirror's shadows it. */
  shieldCol: number,
  time: number,
  mood: HullMood,
): void {
  const lm = mirrorLayout(l, cfg);
  const at: LobePositions = { cannon: m.cannonCol, shield: stillShield(shieldCol) };

  // Flip about the line that sends the local hull surface to the screen row
  // the mirror lives on. `scale(1, -1)` after the translate, so a local y of
  // `lm.hullY` lands exactly on `mirrorHullY` and everything else follows.
  ctx.save();
  ctx.translate(0, mirrorHullY(l, cfg) + lm.hullY);
  ctx.scale(1, -1);
  drawHull(
    ctx,
    lm,
    m.scars,
    time,
    mood,
    at,
    () => true,
    () => true,
    // Its rim fades with its own hull, the way the ship's used to with the
    // ship's; the boss still has points (`hash-boss.ts`), the ship has none.
    { ...MIRROR_SKIN, rimGlow: Math.max(0.25, m.hullMilli / 100_000) },
  );
  // Over the hull's belly and inside the same flip: the inside of the copy.
  drawMirrorChamber(ctx, lm, time);
  ctx.restore();
}
