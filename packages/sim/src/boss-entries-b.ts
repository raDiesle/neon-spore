import type { MazeWheel } from "./maze-wheel.js";

/**
 * **The entries `boss-entries.ts` had no room for**: THE MAZE, THE WELL and
 * THE REPRISE, and THE VANE after them.
 *
 * They came across on 22 September 2026, when the queue found that page seven
 * lines from its 250-line limit and named it as one of the five a
 * choreographed boss still has to touch. The **last** rows went, which is the
 * rule the seam is for: an entry a lane is working on stays where the comment
 * explaining it is, and the three at the foot of the file are the three
 * nobody was in the middle of.
 *
 * The three are not a family — one authors a wheel, one authors nothing at
 * all and one authors a beat count — and that is the point: the page next
 * door is the union and the entries a reader reaches for, and this is the
 * overflow it names. `boss-entries.ts` re-exports all three, so nothing that
 * reached for one through it (or through `entries.ts` behind it) moved.
 */
/**
 * What a wave authors when it wants THE MAZE: the wheels, in order, one per
 * round. No column and no health, for the same two reasons THE MIRROR has
 * neither — the mouths are spread across the field by `mazeMouthCol` rather
 * than placed, and how much of it a round takes off follows from how many
 * rounds there are (`maze-round.ts`). The author sets the fight by writing the
 * wheel out, and `mazeFault` says whether what they wrote is a round at all.
 */
export interface MazeEntry {
  kind: "maze";
  rounds: MazeWheel[];
}

/**
 * What a wave authors when it wants THE WELL, which is nothing at all — THE
 * GAUGE's entry arrived at from the opposite end.
 *
 * No column, no health and no rounds, for the reason there is no state either:
 * the whole boss is a **projection**, and a projection has nothing to place and
 * nothing to tune. The wave under it is the wave its author wrote, which is the
 * one thing a well entry cannot say (`bossFillsWave` answers it for every
 * caller). `packages/sim/src/well.ts` is the argument.
 */
export interface WellEntry {
  kind: "well";
}

/**
 * What a wave authors when it wants THE REPRISE: how long a stretch of it runs
 * before it is sent back at the pair unseen — and that is the whole entry.
 *
 * No column, for THE VANE's and THE MAZE's reason: the mechanism hangs at the
 * top middle and has no body on the grid, so there is nothing to place. No
 * health either, and none is possible: the fight is as long as the wave its
 * author wrote, and it ends when the script is spent rather than when a count
 * runs out (`reprise.ts`).
 *
 * One number, and it says two things that must not be able to disagree — how
 * long a stretch is, and therefore which beat the first echo begins on. The
 * first stretch runs from the wave's own start, so the two are the same
 * integer (`repriseEvery`). Absent takes `repriseBeats` from the configuration,
 * the way an unpinned vane takes `vanePins`.
 */
export interface RepriseEntry {
  kind: "reprise";
  beat?: number;
}

/**
 * What a wave authors when it wants THE VANE. No column: the bearing hangs dead
 * centre off the top edge, and an arm on an off-centre pivot would have a long
 * side and a short one, so the fold would mean a different thing depending on
 * which half of the field a body came down in. Only how many pins hold the
 * bearing, which is how long the fight is.
 *
 * Came across on 26 September 2026, the last entry defined on the first page
 * when THE DAVIT's union row took it past its 250-line limit.
 */
export interface VaneEntry {
  kind: "vane";
  pins?: number;
}
