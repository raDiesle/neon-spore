import type { FleetShip } from "./fleet-board.js";
import type { MazeWheel } from "./maze-wheel.js";
import type { PinballRound } from "./pinball.js";
import type { MirrorStep } from "./simon.js";
import type { SnakeRound } from "./snake.js";

/**
 * **What a wave authors when it wants a boss** — nine shapes, the union of
 * them, and the two questions anything asks about that union.
 *
 * Cut out of `entries.ts` when THE CRAWLER's two fields took that file over
 * its 250-line limit, and the seam is the one that file was always going to be
 * cut along: next door is what a wave hands the field a *body* on, and this is
 * what it hands the field a whole *encounter* on. Nine of these against two of
 * those, and the nine are the half that grows — every round in
 * `docs/spec/bosses.md` still to come is one more interface here.
 *
 * `entries.ts` re-exports every name below, so nothing that already reaches
 * for a `BossEntry` through that file had to move.
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

/** The boss counterpart of `PodEntry`: whichever boss a wave carries. */
export type BossEntry =
  | QueenEntry
  | MirrorEntry
  | WardenEntry
  | VaneEntry
  | MazeEntry
  | GaugeEntry
  | FleetEntry
  | SnakeEntry
  | PinballEntry;

/**
 * Whether this boss *is* the wave, or only bends what the wave sends.
 *
 * All but one are the whole encounter and a creature placed beside one is
 * a wave nobody designed — THE GAUGE most of all, which does not draw a field
 * for a creature to stand on. THE VANE is the opposite — it spawns nothing at all,
 * and a wave without arrivals for it to throw is a mechanism turning over an
 * empty field. So the director's guard against a creature brush on a boss wave
 * asks this rather than `wave.boss !== undefined`, and there is one place the
 * answer lives.
 */
export function bossFillsWave(kind: BossEntry["kind"]): boolean {
  return kind !== "vane";
}

/**
 * The bosses that exist, as data. `tools/director` reads this to say which of
 * the twelve names in `docs/spec/bosses.md` are actually in the game — the
 * same question `CREATURES` answers for the bestiary, and one a tool must
 * never answer from a list of its own.
 */
export const BOSS_KINDS: readonly BossEntry["kind"][] = [
  "queen",
  "mirror",
  "warden",
  "vane",
  "maze",
  "gauge",
  "fleet",
  "snake",
  "pinball",
];
