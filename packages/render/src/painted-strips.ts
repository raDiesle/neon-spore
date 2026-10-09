import type { SpriteSheet } from "./sprite-burst.js";

/**
 * **Every painted strip, by its asset's name**: the one place a strip's
 * numbers are written. The renderer slices it with them, the generator paints
 * it with them (`tools/raster/src/spec.ts` reads this table), the assets test
 * holds the manifest `bun run raster` wrote against them, and the game binds
 * every row behind `?raster=1` in one loop (`apps/game/src/raster.ts`).
 *
 * A strip was twelve registrations before this table, and only the assets
 * test named the others (27 September 2026). A new one is now a painter in
 * `tools/raster/src/`, a row here, the effect that plays it, and a bake.
 *
 * The burst and THE CLASP's shield are not rows: the burst is baked with
 * extras of its own and every hit plays it, and the shield is a loop a
 * creature holds rather than a strip an effect throws.
 *
 * `seed` is the painter's and nothing here reads it; it is in the row so the
 * row is the whole of the strip.
 */
export interface PaintedSheet extends SpriteSheet {
  /** The seed the painter draws its frames from (`tools/raster`). */
  readonly seed: number;
}

export const PAINTED_STRIPS = {
  /** THE VISE's kernel crack, over the split (`vise-fx.ts`). */
  "vise-crack": { frames: 16, frameSize: 96, frameMs: 45, seed: 20260926 },
  /**
   * THE PLUMB's weight settling true (`plumb-fx.ts`): a damped swing hung
   * from the beam's end, mirrored for the navigator's. As wide as THE RIME's was,
   * because a chain and a ball under it are three tiles tall, and as slow,
   * because a swing dies away rather than bursts.
   */
  "plumb-settle": { frames: 16, frameSize: 128, frameMs: 50, seed: 20261001 },
  /**
   * THE SLING's cord drawing home (`sling-fx.ts`): one cord hauled down and
   * locked, the pilot's, mirrored for the navigator's. The entry's own floor,
   * twelve frames of 96 px, since a draw is over as fast as a plant.
   */
  "sling-draw": { frames: 12, frameSize: 96, frameMs: 45, seed: 20261002 },
} as const satisfies Record<string, PaintedSheet>;

export type StripName = keyof typeof PAINTED_STRIPS;

/** The names in the table's order. */
export const STRIP_NAMES = Object.keys(PAINTED_STRIPS) as StripName[];
