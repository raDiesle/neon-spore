import type { WaveEntry } from "@neon-spore/content";
import { colSpan, isMeteorKind, METEOR_TIER_KINDS, type RockSize } from "@neon-spore/sim";

/**
 * **A rock's two numbers**: how fast it falls and how wide it arrives.
 *
 * Cut out of `entry-fields.ts` when THE CRAWLER's two took that file over its
 * 250-line limit, and along a seam that file's own header describes: these
 * were the *first* facts to move off a brush and onto an entry — five meteor
 * buttons became one speed dial, and a width that was not authorable at all
 * became the second — so they are the oldest and most self-contained block in
 * it, and the one nobody has needed to read since.
 *
 * The same rule holds here as next door: every rule is *called*, never
 * re-derived. `METEOR_TIER_KINDS` says which kind is which speed and `colSpan`
 * says how wide a kind is by default, so the tool cannot come to disagree with
 * the game about either. `entry-fields.ts` re-exports all six names, so
 * nothing that already reached for one had to move.
 */

/** How fast a rock falls, as the tier number the bestiary counts in: 1..5,
 * one tile per beat each. */
export type MeteorSpeed = 1 | 2 | 3 | 4 | 5;

export const METEOR_SPEEDS: readonly MeteorSpeed[] = [1, 2, 3, 4, 5];
export const METEOR_SIZES: readonly RockSize[] = [1, 2];
/**
 * Whether this entry is a plain meteor — a rock whose speed and size are the
 * author's to set. The torch is a rock and is deliberately not one of these:
 * it is not a tier (`fallTilesPerBeat`) and its width is what it is. Nor is
 * THE VEER, for the sharper version of the same reason — it *is* one of the
 * tiers' speeds, but its kind is what makes it step sideways, so a speed dial
 * that writes `METEOR_TIER_KINDS[n]` back over it would quietly turn the
 * author's creature into a plain rock.
 *
 * Asked of `METEOR_TIER_KINDS` rather than by excluding two names, so a rock
 * added beside those two is out of here by default rather than by being
 * remembered.
 */
export function isTieredRock(entry: WaveEntry): boolean {
  if (entry.kind === undefined || !isMeteorKind(entry.kind)) return false;
  return (METEOR_TIER_KINDS as readonly string[]).includes(entry.kind);
}

/** The tier this rock falls at, counted from 1. */
export function meteorSpeed(entry: WaveEntry): MeteorSpeed {
  const tier = METEOR_TIER_KINDS.indexOf(entry.kind as (typeof METEOR_TIER_KINDS)[number]);
  return (METEOR_SPEEDS[tier] ?? 1) as MeteorSpeed;
}

/**
 * Set the fall speed, which means changing the *kind* — five tiers, and the
 * tier is the speed (`fallTilesPerBeat`). Nothing else about the arrival moves:
 * a rock made wide stays wide when it is made faster.
 */
export function setMeteorSpeed(entry: WaveEntry, speed: MeteorSpeed): void {
  entry.kind = METEOR_TIER_KINDS[speed - 1] ?? "meteor";
}

/** How many tiles wide this rock arrives. Unsized means the kind's own width. */
export function meteorSize(entry: WaveEntry): RockSize {
  return entry.size ?? (colSpan(entry.kind ?? "meteor") as RockSize);
}

/**
 * Set the width. One tile is written as *no* field rather than as `size: 1`,
 * so a rock left at the ordinary width serialises exactly as it always did and
 * the diff of a wave nobody widened is empty.
 */
export function setMeteorSize(entry: WaveEntry, size: RockSize): void {
  entry.size = size === 1 ? undefined : size;
}
