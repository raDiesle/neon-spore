import { type SimConfig, ticksPerBeat } from "./config.js";
import type { Creature } from "./types.js";

/**
 * **THE BALLOON's three clocks**, read and never stored: how far into its
 * swell a body is, whether this is a beat it climbs on and how far along the
 * climb the picture should draw it, and how far through the hold at full
 * stretch a pair has got.
 *
 * Cut out of `balloon.ts` when the climb stopped being one row a beat. Every
 * one of these is read from a moment the body carries — the beat it came into
 * being, the tick both hands went taut — plus a length from the config, and
 * never from a countdown (`World.guardTick`'s rule, `echoDue`'s spelling): a
 * stored count is a second copy of the config it came from, and two devices
 * can come to disagree about a copy.
 *
 * Every function takes the config and the body, so the step, the picture and
 * the hit test are three readings of one arithmetic.
 */

/**
 * How far through its swell this body is, 0..1 — nought on the beat it came
 * into being and one once it has started climbing.
 *
 * It takes beats as a fraction rather than an integer, `echoSplitPhase`'s
 * arrangement and for its reason: the drawing is sampled between beats, and a
 * body that grew in steps would read as a stutter rather than as something
 * filling with air.
 */
export function balloonSwellPhase(cfg: SimConfig, beats: number, c: Creature): number {
  const wait = Math.max(1, cfg.balloonSwellBeats);
  const gone = beats - (c.balloonBeat ?? 0);
  return Math.max(0, Math.min(1, gone / wait));
}

/**
 * Whether this balloon is still filling rather than climbing — read on the
 * beat, from the moment it came into being plus a length.
 */
export function balloonIsSwelling(cfg: SimConfig, beat: number, c: Creature): boolean {
  return beat - (c.balloonBeat ?? 0) < cfg.balloonSwellBeats;
}

/** Beats between one climb and the next, never less than one: a period of
 * nought would be a body that climbs on no beat at all. */
function climbEvery(cfg: SimConfig): number {
  return Math.max(1, cfg.balloonClimbBeats);
}

/**
 * Whether this is a beat the body takes its step on.
 *
 * The first climb is the beat the swell ends, and the next every
 * `balloonClimbBeats` after it — counted from the body's own `balloonBeat`
 * rather than from `world.beat`, which is the opposite of `echoFalls` and is
 * the creature: an echo's eight are one falling clock the pair counts, and
 * nobody counts a balloon, they take hold of it. Per body, several on one
 * field drift out of step with each other, which is what a field of things
 * floating looks like.
 */
export function balloonClimbs(cfg: SimConfig, beat: number, c: Creature): boolean {
  if (balloonIsSwelling(cfg, beat, c)) return false;
  return (beat - (c.balloonBeat ?? 0) - cfg.balloonSwellBeats) % climbEvery(cfg) === 0;
}

/**
 * How far along its current step the body is drawn, 0..1 — the fraction of
 * the way from `fromRow`/`fromCol` to `row`/`col`.
 *
 * `drawnRow`'s one-beat glide, stretched over the `balloonClimbBeats` a step
 * takes: a body that climbed a whole tile on the first beat and then stood
 * still on the second would be a body stopping and starting, and the owner
 * asked for slower, not jerkier. It works because `stepBalloon` writes the
 * `from` fields only on a climbing beat and `beat.ts` leaves them alone on
 * the rest, so they hold the tile the step set out from for the whole of it.
 *
 * `beatPhase` alone while the body swells: nothing is moving, both pairs of
 * fields agree, and the answer is the same whatever is returned.
 */
export function balloonGlidePhase(
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
  c: Creature,
): number {
  if (balloonIsSwelling(cfg, beat, c)) return beatPhase;
  const every = climbEvery(cfg);
  const into = (beat - (c.balloonBeat ?? 0) - cfg.balloonSwellBeats) % every;
  return Math.max(0, Math.min(1, (into + beatPhase) / every));
}

/**
 * How far through the hold at full stretch this body is, 0..1 — nought while
 * either hand is short of taut, one on the tick it gives.
 *
 * Read on the tick, because the rub is (`rubBalloons`): a hold counted in
 * beats would let go up to a beat after the one the pair counted themselves
 * into. The picture reads this for the halo coming up to full, so the beat
 * the body is about to come apart is the beat it is brightest.
 */
export function balloonHoldPhase(cfg: SimConfig, tick: number, c: Creature): number {
  if (c.balloonTautTick === undefined) return 0;
  const hold = Math.max(1, cfg.balloonHoldBeats * ticksPerBeat(cfg));
  return Math.max(0, Math.min(1, (tick - c.balloonTautTick) / hold));
}

/** Whether the hold is over: both hands have been taut together for
 * `balloonHoldBeats`, and the body gives on this tick. */
export function balloonHoldDone(cfg: SimConfig, tick: number, c: Creature): boolean {
  return c.balloonTautTick !== undefined && balloonHoldPhase(cfg, tick, c) >= 1;
}
