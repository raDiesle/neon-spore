import type { FleetShip } from "./fleet-board.js";
import type { MazeWheel } from "./maze-wheel.js";
import type { PinballRound } from "./pinball.js";
import type { PulseStage } from "./pulse.js";
import type { MirrorStep } from "./simon.js";
import type { SnakeRound } from "./snake.js";

/**
 * **What a wave authors when it wants a boss** — twelve shapes and the union
 * of them. The two questions anything asks about that union are next door in
 * `boss-kinds.ts`.
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
 * What a wave authors when it wants THE GAUGE, which is nothing at all.
 *
 * No column, no health and no rounds: the whole encounter is one dial, and how
 * long it lasts, how far the band walks and how many marks pass it are tuning
 * rather than content (`config-gauge.ts`). It is the shortest entry in this
 * file on purpose — the eleven rounds behind it are eleven more bosses, and
 * the point of the shape is that a round with nothing to author costs one line
 * here and one line in `waves.ts`.
 */
export interface GaugeEntry {
  kind: "gauge";
}

/**
 * What a wave authors when it wants THE FLEET: where the ships are, and
 * nothing else.
 *
 * The placement *is* the fight — how long it lasts, how much of the chart is
 * water, whether the pair has one long hull to walk along or five short ones
 * scattered — so it is the only thing here, exactly as THE MIRROR's sequences
 * are the only thing in its entry. How long the pair has and what running out
 * costs are tuning (`config-fleet.ts`).
 *
 * The squares are the real field's and not the seven authored columns; see
 * `FleetShip`, which says why a run of squares cannot survive a remap.
 */
export interface FleetEntry {
  kind: "fleet";
  ships: FleetShip[];
}

/**
 * What a wave authors when it wants SNAKE: the rounds, in order.
 *
 * No column, no health and no arena — the arena is the same size in every
 * snake wave there will ever be, so it is `SnakeConfig`'s. What is authored is
 * the only thing that changes between one round of it and the next: how many
 * points pass, how many beats there are, and how fast the body goes. Written
 * out rather than generated from a difficulty number, for THE MIRROR's reason
 * — a fight the author cannot read off the page is a fight nobody designed.
 */
export interface SnakeEntry {
  kind: "snake";
  rounds: SnakeRound[];
}

/**
 * What a wave authors when it wants PINBALL: the boards, in order.
 *
 * The board *is* the fight — where the targets are, what stands between them
 * and the bucket, whether there is a lane back down — so it is authored, the
 * way THE FLEET's placement is, and `pinballFault` says whether what was
 * written is a table at all. Everything about the ball is tuning
 * (`config-pinball.ts`): a round whose gravity was authored per board would be
 * eleven different games with one name.
 */
export interface PinballEntry {
  kind: "pinball";
  rounds: PinballRound[];
}

/**
 * What a wave authors when it wants THE PULSE: the stages, in order.
 *
 * The chart *is* the fight — which arrows come, in what order, and which of
 * them arrive on one seat's screen with the direction taken off them — so it
 * is authored, the way THE MIRROR's sequences are, and `pulseFault` says
 * whether what was written is a song at all. Everything about how a press is
 * judged is tuning (`config-pulse.ts`): a stage whose timing window was
 * authored per chart would be several different games with one name.
 */
export interface PulseEntry {
  kind: "pulse";
  stages: PulseStage[];
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
  | WellEntry;
