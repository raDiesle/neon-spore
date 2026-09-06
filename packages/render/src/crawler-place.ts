import type { Creature, World } from "@neon-spore/sim";
import { creatureCenter } from "./creature-place.js";
import { depthScale } from "./depth.js";
import type { SurfaceY } from "./hull-frame.js";
import type { Layout } from "./layout.js";

/**
 * Where a ring of THE CRAWLER actually sits on screen, and how much bigger it
 * draws for being that near.
 *
 * Two answers with three readers — the body, the marks laid over it, and
 * anything that comes after — and they are here rather than in `crawler.ts`
 * because that file draws the worm and this is a fact about where the worm is.
 * A second copy of either would put a crosshair beside the ring it is about,
 * or leave the crosshair on a flat line while the ring under it rode over the
 * cannon.
 */

/**
 * How far **above the ship's own surface** a ring's centre rides, as a share
 * of a tile.
 *
 * A crawler stands on `crawlRow` — the row the shield reaches, one above the
 * ship's own — because that is the only row both the cannon and the dome can
 * answer (`sim/crawler.ts`). Drawn on the centre of that row it would float a
 * whole tile clear of the plating and read as a thing flying alongside the
 * ship rather than crawling on it. So the picture comes down to meet the hull
 * while the rule stays where the two controls can reach it — the same licence
 * `shieldRow` itself takes, and the reason it exists.
 *
 * The number is what the worm has always been drawn at, restated against the
 * real membrane instead of against `Layout.hullY`. That flat line is not the
 * surface: the hull is an arc whose lobed radius leaves the drawn skin a good
 * half tile below it, and it varies across the field. So a worm placed against
 * `hullY` was floating over the plating by about this much, unevenly, and
 * measuring the clearance from the skin itself is what keeps it lying on the
 * ship wherever it happens to be standing.
 */
export const RIDE = 0.56;

/**
 * The surface a caller with no ship to sample gets: `Layout.hullY`'s flat
 * approximation of it, offset so a ring lands exactly where this creature
 * shipped — on the hull line, amidships, to within a fiftieth of a tile.
 *
 * Exported so that the transients a ring leaves behind fall back to the same
 * line the ring does (`crawler-fx.ts`). Two spellings of a fallback is two
 * pictures of one worm on a host that never built a `HullFrame`.
 */
export function flatSurface(l: Layout): SurfaceY {
  return () => l.hullY + l.tile * RIDE;
}

/**
 * The point a ring is drawn on: its glided column, on the ship's own surface.
 *
 * **The `y` comes off the hull, not off the row.** The owner asked for a worm
 * that walks the cannon rather than through it — *"so its part of the area it
 * walks, not just the ship surface. when i move cannon, the worm is pushed up
 * accordingly"* — and the ship is a membrane that swells wherever a player
 * puts something (`hull-frame.ts`). Sampling that membrane under each ring's
 * own column is the whole mechanism: a lobe passing beneath a run of rings
 * lifts them one after another and lets them down again, and the ship's own
 * breathing arc carries the body along whatever it is lying on.
 *
 * **Nothing here is a rule.** The ring's `row` and `col` are untouched, so the
 * hit test, the shield's column and both `from` fields are exactly what they
 * were: a shot is aimed by column, and `creatureMilli` reads rows. This is a
 * picture.
 */
export function linkCenter(
  l: Layout,
  c: Creature,
  beatPhase: number,
  surfaceY: SurfaceY = flatSurface(l),
): { x: number; y: number } {
  const { x } = creatureCenter(l, c, beatPhase);
  return { x, y: surfaceY(x) - l.tile * RIDE };
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
