import type { SnakeRound } from "@neon-spore/sim";

/**
 * SNAKE's rounds, one per target. The body folds out of the ship, and then it
 * is the game everybody already knows with the one thing that game has never
 * had: two people, and neither of them able to turn a corner alone.
 *
 * **Authored, never generated.** Three numbers a round, written where a person
 * can read the shape of the whole fight down one page — the argument
 * `maze-rounds.ts` and `mirror` both make. A difficulty curve computed from a
 * single number would be a curve nobody chose, and the thing that has to be
 * chosen here is precisely the *relation* between the three: a target that goes
 * up while the step gets shorter is a round that gets harder twice, and doing
 * both at once is exactly as much as a pair can take.
 *
 * **The step, in ticks.** At 120 ticks a second, 90 is three quarters of a
 * second a tile and 55 is under half. Anything faster than that is a reflex
 * game — a spoken exchange takes 2.1–3.6 s (`docs/spec/latency.md`), which is
 * four tiles at the end of this list, so the last round is deliberately the
 * one where the pair has to have agreed *before* the corner arrives. That is
 * what player 2's brake is for, and it is why it buys most of a tile.
 *
 * **The clock, in beats.** Forty beats is twenty-five seconds at 96 BPM. Three
 * rounds is about ninety seconds with the morph and the verdict either side,
 * which is the length the whole category is written around
 * (`docs/spec/interludes.md`).
 */
export const SNAKE_ROUNDS: SnakeRound[] = [
  // Learning what the two halves are. Four pellets is four corners at worst,
  // and at this speed a corner can be discussed rather than called.
  { points: 4, beats: 40, stepTicks: 90 },
  // The body is now long enough to be in the way, which is the round where
  // player 2 stops only steering and starts describing.
  { points: 6, beats: 44, stepTicks: 70 },
  // Eight points at under half a second a tile. The orb is worth three of
  // them, so this is the round where "leave it, go for the bright one" is a
  // sentence somebody has to say and the other has to trust.
  { points: 8, beats: 48, stepTicks: 55 },
];
