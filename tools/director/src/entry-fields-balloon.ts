import type { WaveEntry } from "@neon-spore/content";
import { balloonRiseRows, DEFAULT_CONFIG } from "@neon-spore/sim";

/**
 * **THE BALLOON's one authored fact**: how fast it climbs.
 *
 * Its own file beside `entry-fields-rock.ts` and `entry-fields-fence.ts`, on
 * the terms those set — `entry-fields.ts` is at its length limit and grows by
 * a per-arrival fact per creature — and with an argument of its own. This is
 * the second *speed* an author can set and it is a field where a rock's is a
 * kind, which is exactly the asymmetry `RockSize` argues for said from the
 * other side: the five meteor tiers were already in the bestiary before
 * anybody wanted a width, so speed stayed the kind there. Nothing was in the
 * bestiary first here, so the number is a number.
 *
 * The rule is called and never re-derived: `balloonRiseRows` is what the field
 * actually climbs at, so the panel cannot come to disagree with the game about
 * what an arrival that names nothing does.
 */

/** How fast a balloon may be authored to climb: rows a step, and the same
 * number of lanes across, because the path is a diagonal — a step every
 * `balloonClimbBeats` (`sim/config-balloon.ts`).
 *
 * Three, and the ceiling is the field rather than taste: at four rows a step
 * a balloon crosses the thirteen rows above the ship in under four steps,
 * which is about the four seconds a spoken exchange needs — and the exchange
 * is the whole creature (`.claude/skills/new-creature`, step 4). One is half
 * a slick's speed read upward and two is the pair having to mean it.
 */
export const BALLOON_SPEEDS: readonly number[] = [1, 2, 3];

/** Whether this entry is a balloon, and therefore has a climb to set. The one
 * kind that does: `rise` means nothing on anything else, and a row offered on
 * a slick would write a field the simulation never reads. */
export function hasBalloonSpeed(entry: WaveEntry): boolean {
  return entry.kind === "balloon";
}

/** How fast this one climbs. Unset means the shipped speed, asked of the
 * configuration rather than repeated — so the number under the map is the
 * number the field will use. */
export function balloonSpeedOf(entry: WaveEntry): number {
  return balloonRiseRows(DEFAULT_CONFIG, entry.rise);
}

/**
 * Set the climb. The default is written as *no* field rather than as the
 * number itself, the arrangement `setMeteorSize`, `setGhostPath` and
 * `setBeadCount` all make: a balloon left at the shipped speed serialises
 * exactly as it always did, and the diff of a wave nobody hurried is empty.
 */
export function setBalloonSpeed(entry: WaveEntry, rise: number): void {
  entry.rise = rise === DEFAULT_CONFIG.balloonRiseRows ? undefined : rise;
}
