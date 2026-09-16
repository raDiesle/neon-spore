import type { FleetShip } from "./fleet-board.js";
import type { PinballRound } from "./pinball.js";
import type { PulseStage } from "./pulse.js";
import type { ScoutArena } from "./scout.js";
import type { SnakeRound } from "./snake.js";
import type { SpliceRound } from "./splice.js";

/**
 * **What a wave authors when it wants a round** — the bosses that take the
 * panel away, and nothing about the field.
 *
 * Cut out of `boss-entries.ts` when THE SCOUT took that file to nine lines
 * under its limit, along the seam `command-round.ts` and
 * `content/src/controls-round.ts` already cut for exactly the same growth:
 * next door is a boss that stands *on* the field — a body with a column, a
 * wheel over the hull, a projection of it — and this is whichever boss has
 * replaced the picture outright (`docs/spec/interludes.md`). Seven of these
 * against seven of those today, and these are the half that grows: nine more
 * rounds are designed and each one is an interface here.
 *
 * Every name is re-exported from `boss-entries.ts` and from `entries.ts`
 * after it, so nothing that already reached for one through either had to
 * move.
 */

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
 * What a wave authors when it wants THE SPLICE: how long each round lasts,
 * and nothing else.
 *
 * There is no placement to write. How many straws a round stands follows from
 * which round it is — two, then three, then four (`spliceStraws`) — and where
 * they run is laid from the seeded rng at the moment the round opens
 * (`splice-tangle.ts`), because a tangle an author drew by hand would be a
 * tangle the pair could learn. So the whole entry is PINBALL's `beats` with
 * the board taken away, which is the shortest an authored round has ever been.
 */
export interface SpliceEntry {
  kind: "splice";
  rounds: SpliceRound[];
}

/**
 * What a wave authors when it wants THE SCOUT: the arenas, in order.
 *
 * The arena *is* the round — where the motes hang, what is moving between them
 * and how long there is — so it is authored, the way SNAKE's and PINBALL's
 * are, and for the reason they give: a fight the author cannot read off the
 * page is a fight nobody designed. Everything about how the little ship
 * *flies* is tuning (`config-scout.ts`): an arena whose drag was authored per
 * round would be several different games with one name, and the one thing the
 * owner asked for by name — that the flying feels fluent — would be a
 * different feeling in every wave that used it.
 */
export interface ScoutEntry {
  kind: "scout";
  arenas: ScoutArena[];
}
