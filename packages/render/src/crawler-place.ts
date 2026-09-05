import type { Creature, World } from "@neon-spore/sim";
import { creatureCenter } from "./creature-place.js";
import { depthScale } from "./depth.js";
import type { Layout } from "./layout.js";

/**
 * Where a ring of THE CRAWLER actually sits on screen, and how much bigger it
 * draws for being that near.
 *
 * Two lines with three readers — the body, the marks laid over it, and
 * anything that comes after — and they are here rather than in `crawler.ts`
 * because that file draws the worm and this is a fact about where the worm is.
 * A second copy of either would put a crosshair beside the ring it is about.
 */

/**
 * How far below its tile's centre a ring is drawn, as a share of a tile.
 *
 * A crawler stands on `crawlRow` — the row the shield reaches, one above the
 * ship's own — because that is the only row both the cannon and the dome can
 * answer (`sim/crawler.ts`). Drawn on the centre of it, the worm floats a whole
 * tile clear of the hull and reads as a thing flying alongside the ship rather
 * than crawling on it. So the picture comes down to meet the plating while the
 * rule stays where the two controls can reach it — the same licence
 * `shieldRow` itself takes, and the reason it exists.
 */
export const SIT = 0.52;

/** The point a ring is drawn on: its glided tile centre, dropped by `SIT`. */
export function linkCenter(l: Layout, c: Creature, beatPhase: number): { x: number; y: number } {
  const { x, y } = creatureCenter(l, c, beatPhase);
  return { x, y: y + l.tile * SIT };
}

/**
 * The depth envelope a ring draws at. Every link of every worm stands on the
 * same row, so this is one number for the whole field — but it is asked per
 * ring, because it has to be applied **about that ring's own centre** and not
 * about the canvas origin (`drawLink`).
 */
export function linkScale(world: World, l: Layout): number {
  return depthScale(world.cfg, l, world.cfg.rows - 2);
}
