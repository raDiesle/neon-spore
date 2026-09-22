import { type Creature, isWardable, type SimConfig, spanOf } from "@neon-spore/sim";
import { flatRadius } from "./creature-place.js";
import type { SurfaceY } from "./hull-frame.js";
import { type Layout, tileCY } from "./layout.js";
import { rockRadius } from "./rock-size.js";

/**
 * **Where a body's last glide ends: half-sunk in the ship's skin, not on the
 * centre of the ship's row.**
 *
 * The hull row's centre is under the membrane — a tile is taller than the
 * plating is thick — so a body glided there the way every other row is glided
 * to (`creatureCenter`) goes in under the skin and is painted over by the hull
 * for the last part of its landing beat.
 *
 * **It was written for rocks and it is the same defect for everything else.**
 * The owner's first report, 11 September 2026: a meteor vanished into the ship
 * and popped back up, because the sim removed it and `RockImpactFx` drew it
 * stuck *on* the skin. His second, 22 September 2026: *the first animation of
 * red colour on the hull and the electric wave is happening not in the exact
 * moment the enemy damages the ship.* That one is this rule missing rather than
 * a clock being wrong — the strike fires on the `breach` tick and always has
 * (`breach-strike.ts`), but a slick spent the whole landing beat sliding a full
 * tile down through the plating, so the pair read the hit five eighths of a
 * second before the ship answered it. A body that comes to rest **on** the skin
 * at the end of that beat is a body whose contact and whose flash are the same
 * moment.
 *
 * **Half-sunk and not resting tangent on it.** For a rock the number is
 * `RockImpactFx`'s own, the radius sunk by half (`rock-impact.ts`), asked one
 * beat earlier so the field pass hands the rock over standing exactly where the
 * replay picks it up. For everything living it is the same number for its own
 * reason: a body one row above the hull is already drawn touching the skin, so
 * a glide that ended tangent would not move at all, and a landing nothing moves
 * on is a landing the pair cannot see happen. Sunk by half, the last beat is a
 * short press into the plating that finishes on the beat the hull breaks.
 *
 * Every other row is left alone: the clamp only ever *raises* the end of a
 * glide, and a row's centre above the skin is above the rest as well. A wide
 * rock rests by its own radius, the same one the crater is dug to.
 */
export function landingY(
  l: Layout,
  cfg: SimConfig,
  c: Creature,
  x: number,
  y: number,
  glide: number,
  /** The plating without the cannon (`skinSampler`): the crater is dug in
   * the skin under whatever lobe stands over the column, and the rock lands
   * where its hole is — the same query `RockImpactFx` rests it by. */
  skinY: SurfaceY | undefined,
): number {
  if (!skinY) return y;
  const rest = skinY(x) - restRadius(l, cfg, c) * 0.5;
  const yEnd = Math.min(tileCY(l, c.row), rest);
  if (yEnd === tileCY(l, c.row)) return y;
  const yStart = Math.min(tileCY(l, c.fromRow), yEnd);
  return yStart + (yEnd - yStart) * glide;
}

/**
 * The radius the rest is measured by: the body's own, at the size it is drawn
 * standing there.
 *
 * A rock asks `rockRadius` flat, which is what it asked before this rule
 * covered anything else and what `RockImpactFx` still rests it by — the two
 * have to be the same number to the pixel or the hand-over from the field pass
 * to the replay is a jump. Everything else asks `flatRadius` at the end of the
 * glide, which is the perspective-grown size the body actually draws at on the
 * nearest row (`depth.ts`); a slick rested by its flat radius would sit a
 * sixteenth of a body too high on the one row where the growth is largest.
 */
function restRadius(l: Layout, cfg: SimConfig, c: Creature): number {
  return isWardable(c.kind) ? rockRadius(l, spanOf(c)) : flatRadius(l, cfg, c, 1);
}
