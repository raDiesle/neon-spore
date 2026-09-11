import { type Creature, isWardable, spanOf } from "@neon-spore/sim";
import type { SurfaceY } from "./hull-frame.js";
import { type Layout, tileCY } from "./layout.js";
import { rockRadius } from "./torch.js";

/**
 * **Where a rock's last glide ends: half-sunk in the ship's skin, not on the
 * centre of the ship's row.**
 *
 * The hull row's centre is under the membrane — a tile is taller than the
 * plating is thick — so a rock glided there the way every other row is glided
 * to (`creatureCenter`) went in under the skin and was painted over by the
 * hull for the last part of its landing beat. The sim then removed it, and
 * `RockImpactFx` drew it stuck *on* the skin: the owner saw a rock vanish
 * into the ship and pop back up. The stuck height is `RockImpactFx`'s own,
 * the radius sunk by half (`rock-impact.ts`), and this is the same number
 * asked one beat earlier, so the field pass hands the rock over standing
 * exactly where the replay picks it up.
 *
 * Every other row is left alone: the clamp only ever *raises* the end of a
 * glide, and a row's centre above the skin is above the rest as well. A wide
 * rock rests by its own radius, the same one the crater is dug to.
 */
export function rockLandingY(
  l: Layout,
  c: Creature,
  x: number,
  y: number,
  glide: number,
  /** The plating without the cannon (`skinSampler`): the crater is dug in
   * the skin under whatever lobe stands over the column, and the rock lands
   * where its hole is — the same query `RockImpactFx` rests it by. */
  skinY: SurfaceY | undefined,
): number {
  if (!skinY || !isWardable(c.kind)) return y;
  const rest = skinY(x) - rockRadius(l, spanOf(c)) * 0.5;
  const yEnd = Math.min(tileCY(l, c.row), rest);
  if (yEnd === tileCY(l, c.row)) return y;
  const yStart = Math.min(tileCY(l, c.fromRow), yEnd);
  return yStart + (yEnd - yStart) * glide;
}
