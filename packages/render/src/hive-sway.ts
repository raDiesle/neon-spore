import {
  beatSeconds,
  type HiveState,
  hiveNext,
  hiveNextBeat,
  hiveOnWall,
  hiveOpen,
  hiveTwins,
  type World,
} from "@neon-spore/sim";
import { HUSH, IDLE_DRIFT } from "./idle-drift.js";
import { OUTLINE_SEED, outlineDrift } from "./outline-drift.js";
import { slowHush } from "./slow-hush.js";
import { noise1 } from "./solid-motion.js";

/**
 * **THE HIVE's drops sway on their sites** (`docs/spec/living-bosses.md` §1,
 * the outline tier; the part map's "a lobe swings by moving its piece"): one
 * gust runs along the underside, column by column, and each shut drop leans
 * on it about the site it hangs from, its tip swinging across by more than
 * half a tile, which is seen (*Big enough to be seen*, `docs/looks.md`).
 *
 * **Only a shut drop sways.** A breach is shot up its own column and a scar
 * is the count of what is sealed, so both hang still; a cocoon on a wall lies
 * on its side and keeps still too. **The next site eases out the beat before
 * it swells**, with its twin, so the drop a thumb is about to be asked to
 * pinch is plumb by the time it is. A bolt meets each drop as it leans
 * (`hiveStopper`).
 *
 * THE SLOW a breach opens hushes it to a tenth (`HUSH.liveMark`).
 */

/** How far a shut drop's tip swings at the widest, in tiles. */
export const HIVE_TIP = 0.75;
/** How far a drop's tip hangs below its site, in tiles (`hive-shape.ts`: `SITE_R` × `SITE_HANG`). */
const DROP = 0.92;
/** Seconds the gust takes to pass from one column to the next. */
const LAG = 0.25;

/** Site `i`'s shear this beat: how many pixels across per pixel below its site. */
export function hiveLean(
  world: World,
  s: HiveState,
  i: number,
  beat: number,
  beatPhase: number,
): number {
  const k = outlineDrift("hive");
  if (k <= 0 || hiveOnWall(s, i) || s.sealed[i] || hiveOpen(s, i)) return 0;
  const left =
    upcoming(world, s, i, beat + beatPhase) * slowHush(world, beat, beatPhase, HUSH.liveMark);
  if (left <= 0) return 0;
  const col = s.cols[i] ?? 0;
  const seconds = (beat + beatPhase) * beatSeconds(world.cfg) - col * LAG;
  const lean = noise1((seconds * 2) / IDLE_DRIFT.roll.period, OUTLINE_SEED.hive);
  return (k * left * HIVE_TIP * lean) / DROP;
}

/** 1 for a site nothing is coming to, and for the next one and its twin, falling to 0 over the beat before their swell. */
function upcoming(world: World, s: HiveState, i: number, b: number): number {
  const next = hiveNext(s);
  if (next < 0 || s.downBeat >= 0) return 1;
  const twin = hiveTwins(s, world.cfg) ? next + 1 : next;
  if (i !== next && i !== twin) return 1;
  const swells = hiveNextBeat(s, world.cfg) - world.cfg.hiveSwellBeats;
  return Math.max(0, Math.min(1, swells - b));
}
