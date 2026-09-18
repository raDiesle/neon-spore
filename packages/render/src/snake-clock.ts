import { SNAKE_MORPH_BEATS, type SnakeState, type World } from "@neon-spore/sim";

/**
 * SNAKE's world, reduced to the three numbers its drawing runs on.
 *
 * Each is read straight off the world — the tick, the beat, the round's own
 * phase beat and mouth tick — and nothing is stored for any of them: two
 * devices on the same tick are at the same point of the same movement, and a
 * restart begins each cycle again because the counter it is read off begins
 * again. `snake-head.ts` and `snake-button.ts` are handed a phase rather than
 * left to invent one out of a clock they must not have; this file is where
 * that phase is made, once, for the arena and the band alike.
 */

/** Ticks in one flick of the tongue: a little under a second at sixty. */
const FLICK_TICKS = 52;

/** How far through one flick of the tongue this tick is, 0 to 1 — the dart
 * out, the pause and the wait, in one cycle of `FLICK_TICKS`. */
export function flick(tick: number): number {
  return (((tick % FLICK_TICKS) + FLICK_TICKS) % FLICK_TICKS) / FLICK_TICKS;
}

/**
 * How wide the mouth is standing open, 0 to 1.
 *
 * Read off the world's own window and eased at both ends, so the jaws *swing*:
 * a mouth that snapped to full gape and back would be a light going on and off
 * where what the pair has to read is a movement. The window itself is the
 * simulation's (`snakeMawTicks`), so what is drawn open is exactly what would
 * swallow a point.
 */
export function gape(world: World, round: SnakeState): number {
  const span = world.cfg.snakeMawTicks;
  const age = world.tick - round.mawTick;
  if (age < 0 || age >= span) return 0;
  const t = age / span;
  // Snaps open over the first eighth, **stands open for three quarters of the
  // window**, and swings shut over what is left. The owner asked for a mouth
  // that stays open longer, and there were two ways to give it: the window
  // itself is longer now (`snakeMawTicks`), and the share of it spent wide
  // open went from under half to three quarters. The jaws used to start
  // closing about as soon as they had finished opening, which read as a
  // twitch rather than as a mouth held open for something to be driven into.
  if (t < 0.12) return t / 0.12;
  if (t < 0.86) return 1;
  return 1 - (t - 0.86) / 0.14;
}

/**
 * The emergence, as a number: 0 the moment the ship's mouth starts to open
 * and 1 the moment the body, out on the arena, sets off. Derived from the
 * round's own phase beat and nothing else, so a restart cannot carry half an
 * emergence into the next run. The sim still calls the phase `morph`; what is
 * drawn under it is the body coming out of the cannon's slot
 * (`snake-emerge.ts`).
 */
export function emerge01(world: World, beatPhase: number, round: SnakeState): number {
  if (round.phase !== "morph") return 1;
  const beats = world.beat - round.phaseBeat + beatPhase;
  return Math.max(0, Math.min(1, beats / SNAKE_MORPH_BEATS));
}
