import { type SimConfig, ticksPerBeat } from "./config.js";

/**
 * Converting between the tick line and the beat, in the one place that may
 *
 * **`world.beat` is a label, not a position.** It is a counter that
 * `beatMetronome` increments, and a wave's opening holds the field with
 * `world.tick += 1` and an early return *before* `onBeat` — so every opening a
 * run passes through adds ticks with no beat under them, and `world.beat` falls
 * permanently behind `world.tick / ticksPerBeat(cfg)` for the rest of that run.
 * Measured in the shipping build on 8 September 2026: after a fresh load and
 * three hundred ticks of wave 59, `world.tick` was 300 and `world.beat` was 0.
 *
 * Nothing is wrong with the boundaries. `onBeat` still fires on multiples of
 * `ticksPerBeat`, so the beat lands where the ear expects it, every time. What
 * is wrong is that a *label* reads like a position, and multiplying one back
 * into ticks is silently a different moment. THE BEATBOX's deadline was written
 * that way first and settled every run a beat early — a mistake nothing in the
 * picture would have explained to a player.
 *
 * So the conversion is here and is called rather than written out. Everything
 * below takes a **tick** and answers in ticks; none of them takes a beat, which
 * is the whole point — there is no arithmetic that turns a label back into a
 * position, so this file cannot offer one.
 */

/** How far into the current beat this tick is: 0 on a boundary, up to `tpb - 1`. */
export function beatPhaseTicks(cfg: SimConfig, tick: number): number {
  return tick % ticksPerBeat(cfg);
}

/** The same, as a fraction of a beat — what an animation eases along. */
export function beatPhase(cfg: SimConfig, tick: number): number {
  const tpb = ticksPerBeat(cfg);
  return (tick % tpb) / tpb;
}

/** Whether `onBeat` runs on this tick. The one question `step` asks. */
export function isBeatTick(cfg: SimConfig, tick: number): boolean {
  return beatPhaseTicks(cfg, tick) === 0;
}

/** The tick the beat containing this one began on. */
export function beatStartTick(cfg: SimConfig, tick: number): number {
  return tick - beatPhaseTicks(cfg, tick);
}

/**
 * The boundary a tick was *reaching for*, early or late.
 *
 * What a press is judged against: a thumb lands inside a window either side of
 * a boundary, and the nearest multiple of `ticksPerBeat` is the one it meant.
 * Only sound when the window is under half a beat, which the config's own test
 * holds it to.
 */
export function nearestBeatTick(cfg: SimConfig, tick: number): number {
  const tpb = ticksPerBeat(cfg);
  return Math.round(tick / tpb) * tpb;
}
