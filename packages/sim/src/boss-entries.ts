import type {
  FleetEntry,
  GaugeEntry,
  PinballEntry,
  PulseEntry,
  ScoutEntry,
  SnakeEntry,
  SpliceEntry,
} from "./boss-entries-round.js";
import type { MazeWheel } from "./maze-wheel.js";
import type { MirrorStep } from "./simon.js";

/**
 * **What a wave authors when it wants a boss that stands on the field** — and
 * the union of every boss there is, field and round together. The bosses that
 * take the picture away are in `boss-entries-round.ts`, which this file
 * re-exports whole; the two questions anything asks about the union are next
 * door in `boss-kinds.ts`.
 *
 * Cut out of `entries.ts` when THE CRAWLER's two fields took that file over
 * its 250-line limit, and the seam is the one that file was always going to be
 * cut along: next door is what a wave hands the field a *body* on, and this is
 * what it hands the field a whole *encounter* on. Twelve of these against two
 * of those, and the twelve are the half that grows — every round in
 * `docs/spec/bosses.md` still to come is one more interface here.
 *
 * `entries.ts` re-exports every name below and both questions, so nothing
 * that already reaches for a `BossEntry` through that file had to move.
 */

/**
 * What a wave authors when it wants the queen. The sim turns it into one
 * creature of kind `"queen"` plus a filled `QueenState`.
 */
export interface QueenEntry {
  kind: "queen";
  /** The column she starts on. */
  col: number;
  /** Petals she starts with. */
  petals: number;
}

/**
 * What a wave authors when it wants THE MIRROR: the sequences, in order, one
 * per round. No column and no health — it stands over the ship wherever the
 * ship is, and how much of it a round takes off follows from how many rounds
 * there are (`mirror.ts`), so the author sets the fight by writing it out
 * rather than by tuning a number beside it.
 */
export interface MirrorEntry {
  kind: "mirror";
  rounds: MirrorStep[][];
}

/**
 * What a wave authors when it wants THE WARDEN. No column: it is a fixture,
 * dead centre, and a Warden placed anywhere else would be a Warden with a
 * short side. Only how many plates it wears, which is how long the fight is.
 */
export interface WardenEntry {
  kind: "warden";
  plates?: number;
}

/**
 * What a wave authors when it wants THE CAIRN. No column: the pile stands dead
 * centre at `cairnRow`, and one placed off centre would have a long side and a
 * short one — so the two lanes a pull offers would be a different distance
 * from the shield's home depending on which way the hand went, which is the
 * one thing the choice must not be.
 *
 * Only how many rocks are stacked, which is how long the fight is — the
 * Warden's `plates` arrived at from the other end. There the number is damage
 * the ring can take; here it is the number of rocks the pair will have to ward
 * before it is over, and the two are the same sentence because the units *are*
 * the health: every one that leaves the pile leaves as a body the field still
 * has to answer.
 */
export interface CairnEntry {
  kind: "cairn";
  units?: number;
}

/**
 * What a wave authors when it wants THE VANE. No column: the bearing hangs dead
 * centre off the top edge, and an arm on an off-centre pivot would have a long
 * side and a short one, so the fold would mean a different thing depending on
 * which half of the field a body came down in. Only how many pins hold the
 * bearing, which is how long the fight is.
 */
export interface VaneEntry {
  kind: "vane";
  pins?: number;
}

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
 * What a wave authors when it wants THE STARE, which is nothing at all — THE
 * WELL's entry one boss along, and for a related reason.
 *
 * No column: the eye is in the sky rather than in a lane, and one placed over
 * a column would be a boss the pair could answer by standing somewhere else.
 * No health and no rounds: there is nothing to shoot. And no length either,
 * because the wave underneath is the wave its author wrote — the eye bends
 * what that wave costs rather than being the encounter (`bossFillsWave`), so
 * how long it runs is how long the entries take.
 *
 * Everything about its rhythm is tuning (`config-stare.ts`): a wave whose
 * warning was authored per encounter would be several different bosses
 * wearing one name, and the length of the warning is the whole fairness of it.
 */
export interface StareEntry {
  kind: "stare";
}

/** The boss counterpart of `PodEntry`: whichever boss a wave carries. */
export type BossEntry =
  | QueenEntry
  | MirrorEntry
  | WardenEntry
  | CairnEntry
  | VaneEntry
  | MazeEntry
  | GaugeEntry
  | FleetEntry
  | SnakeEntry
  | PinballEntry
  | PulseEntry
  | WellEntry
  | RepriseEntry
  | SpliceEntry
  | ScoutEntry
  | StareEntry;

export type {
  FleetEntry,
  GaugeEntry,
  PinballEntry,
  PulseEntry,
  ScoutEntry,
  SnakeEntry,
  SpliceEntry,
} from "./boss-entries-round.js";
