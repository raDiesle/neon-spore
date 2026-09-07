import type { WaveEntry } from "@neon-spore/content";
import {
  colSpan,
  DEFAULT_CONFIG,
  hullRow,
  isMeteorKind,
  METEOR_TIER_KINDS,
  type RockCross,
  type RockSize,
  rockMayCross,
} from "@neon-spore/sim";

/**
 * **A rock's own facts**: how fast it falls, how wide it arrives, and — since
 * the owner asked for a rock that comes over a wall — which way it crosses the
 * field and which row it crosses along.
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
 * Whether this entry is a plain meteor — a rock whose **speed** is the
 * author's to set. The torch is a rock and is deliberately not one of these:
 * it is not a tier (`fallTilesPerBeat`), so a speed dial on one would have to
 * write a tier's kind back over it. Nor is THE VEER, for the sharper version
 * of the same reason — it *is* one of the tiers' speeds, but its kind is what
 * makes it step sideways, so a dial that writes `METEOR_TIER_KINDS[n]` back
 * over it would quietly turn the author's creature into a plain rock.
 *
 * Asked of `METEOR_TIER_KINDS` rather than by excluding two names, so a rock
 * added beside those two is out of here by default rather than by being
 * remembered.
 */
export function isTieredRock(entry: WaveEntry): boolean {
  if (entry.kind === undefined || !isMeteorKind(entry.kind)) return false;
  return (METEOR_TIER_KINDS as readonly string[]).includes(entry.kind);
}

/**
 * Whether this entry's **width** is the author's to set — the five tiers, and
 * the torch.
 *
 * A second predicate rather than more of `isTieredRock`, because the two
 * questions came apart the day a torch got a width. Speed is a kind and width
 * is a field (`WaveEntry.size`), and the torch is the one rock that has the
 * second without the first: it is not a tier, and it is the body a coil's dome
 * leaves behind standing in a single column (`sim/coil.ts`), so a wave that
 * wants one directly has to be able to say so.
 *
 * THE VEER is deliberately still out. Its kind is what makes it step sideways,
 * and nothing about the sidestep is written for a body two columns wide — a
 * width offered there would be an author setting a number nobody has drawn.
 */
export function hasRockWidth(entry: WaveEntry): boolean {
  return isTieredRock(entry) || entry.kind === "torch";
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
 * Set the width. The **kind's own** width is written as no field at all rather
 * than as a number, so a rock left as it comes serialises exactly as it always
 * did and the diff of a wave nobody resized is empty.
 *
 * `colSpan` and not the literal one, which is what this used to be. A torch is
 * two tiles by default, so the plain-tier rule read backwards on one: a torch
 * an author left alone would have been written down as `size: 2`, and a torch
 * narrowed to a single column would have carried no field and come back two
 * tiles wide. The rule is *whatever the kind is* at either width, called
 * rather than spelled out.
 */
export function setMeteorSize(entry: WaveEntry, size: RockSize): void {
  entry.size = size === colSpan(entry.kind ?? "meteor") ? undefined : size;
}

/**
 * The three routes a rock may be authored onto: it falls down the column it
 * was painted in, or it comes over one of the two walls and walks a row.
 *
 * `null` for the fall rather than a fourth value, because "no route" is what
 * the wave file actually says — a rock that falls carries no `cross` field at
 * all (`WaveEntry.cross`), so every rock authored before crossing existed
 * serialises byte for byte as it did.
 */
export const ROCK_CROSSINGS: readonly (RockCross | null)[] = [null, -1, 1];

/**
 * Whether this entry's **route** is the author's to set — the same five tiers
 * and the torch that have a width, asked of the simulation rather than listed
 * again here (`rockMayCross`). THE VEER is out for the reason it is out of
 * `hasRockWidth`: its kind is what makes it step sideways, and a body on two
 * rules at once is what `own-step.ts` exists to prevent.
 */
export function hasRockCross(entry: WaveEntry): boolean {
  return entry.kind !== undefined && rockMayCross(entry.kind);
}

/** Which way this rock crosses, or null for one that falls. */
export function rockCrossOf(entry: WaveEntry): RockCross | null {
  return entry.cross ?? null;
}

/**
 * Set the route. The fall is written as *no* field rather than as a zero, the
 * arrangement `setMeteorSize` makes with a rock left at its ordinary width —
 * and the row goes with it, because a row means nothing on a rock that is not
 * crossing and a wave file carrying one would be a wave file that changed the
 * day somebody clicked.
 */
export function setRockCross(entry: WaveEntry, cross: RockCross | null): void {
  entry.cross = cross ?? undefined;
  if (cross === null) entry.row = undefined;
}

/** The rows a crossing rock may be authored onto: every row above the hull.
 * Read off the shipped field rather than typed out, so the panel cannot offer
 * a row the field does not have. */
export const ROCK_CROSS_ROWS: readonly number[] = Array.from(
  { length: hullRow(DEFAULT_CONFIG) },
  (_, i) => i,
);

/** The row this rock walks along. Unset means the top row, which is what
 * absent means downstream (`rockCrossRow`). */
export function rockRowOf(entry: WaveEntry): number {
  return entry.row ?? 0;
}

/** Set the row. Nought is written as *no* field, `setRockCross`' arrangement
 * one level down: the top row is what a rock told to cross and given no row
 * already does. */
export function setRockRow(entry: WaveEntry, row: number): void {
  entry.row = row === 0 ? undefined : row;
}
