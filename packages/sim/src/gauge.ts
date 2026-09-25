import { drawBand, driftBand, gaugeSeatedBy } from "./gauge-band.js";
import { gaugeJammed, gaugeSettling } from "./gauge-hand.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * THE GAUGE: one needle, two marks, one of you reading and the other turning.
 *
 * The smallest of the twelve rounds, and the whole of it is an asymmetry.
 * The pilot holds the valve and can move the needle; his screen shows the dial
 * with nothing on it to aim at. The navigator sees the two marks and cannot
 * move anything; her one verb is the call. So the round is ninety seconds of
 * "left — less — less — now", and neither of them can finish a sentence alone.
 *
 * **Why a call and not a hold.** A needle that scored itself the moment it sat
 * between the marks would leave the navigator with information and no verb: a
 * player watching. The call is the moment she commits to what she has been
 * saying, and it is the only thing in the round that can be wrong. It costs
 * `gaugeCallRestBeats` whether it lands or not. Time is what a call costs; what
 * the *round* costs when it is not finished in time is the hull, in
 * `gauge-round.ts` — this file is only its arithmetic.
 *
 * **Why the band drifts.** Without it the round ends the first time the pilot
 * happens to stop in the right place and the pair never has to keep talking.
 * Drifting on the beat means they are never done, only currently right, and it
 * needs no wall clock — which is what makes a round like this possible here at
 * all (`docs/spec/interludes.md`).
 *
 * **What is drawn from the rng, and why it is allowed.** Where the band lands
 * and which way it sets off. That is exactly the randomness rule
 * (`docs/spec/structure.md` 7.3): the only thing that stays random is what one
 * player knows and the other does not. A fixed band would be a band the pilot
 * memorised on the third playthrough, and then nobody has to say anything.
 */

/** The dial, end to end, in thousandths. Everything here is a share of this. */
export const GAUGE_FULL = 1000;

/**
 * The parts of the round. They used to belong to a shell every round of
 * this kind entered through; the shell is gone and they are the round's own —
 * a lead-in so the pair can read two screens that have just stopped being the
 * field, the play, and a verdict that stands at the end of it.
 *
 * `spent` is the fourth and it draws nothing new: the round is over and
 * only being looked at, and it stays installed so the picture holds until
 * the next wave replaces it rather than dropping back to the field for the
 * beats of rest in between (`wave-end.ts`).
 *
 * Choreography rather than difficulty, which is why the beat counts beside
 * them in `gauge-round.ts` are constants and not `SimConfig` fields — the same
 * argument `mirror.ts` makes about `SHOW_BEATS`.
 */
export const GAUGE_PHASES = ["lead", "play", "verdict", "spent"] as const;
export type GaugePhase = (typeof GAUGE_PHASES)[number];

/**
 * Everything the round remembers between ticks. A `BossState` like the other
 * five: THE GAUGE is a boss wave now, so the fight *is* the wave and there is
 * no gap number to carry — `boss-state.ts` has the union.
 */
export interface GaugeState {
  kind: "gauge";
  phase: GaugePhase;
  /** `world.beat` the current phase began on. */
  phaseBeat: number;
  /** `world.beat` the round opened on — the round's own clock. */
  openBeat: number;
  /** How it went. Only meaningful once the phase is `verdict`. */
  passed: boolean;
  /** Where the needle stands, 0..`GAUGE_FULL`. */
  needleMilli: number;
  /** Which way the pilot's valve is pushing: -1, 0 or 1. */
  valve: number;
  /** The centre of the band between the two marks. Only the navigator sees it. */
  markMilli: number;
  /** Which way the band is walking on the beat: -1 or 1. */
  driftDir: number;
  /** Calls that landed between the marks. */
  marks: number;
  /** Calls that did not. They cost time and nothing else. */
  misses: number;
  /** `world.beat` of the most recent call, for the rest between two of them. */
  calledBeat: number;
  /** Where the needle stood when it was called, so the picture can show it. */
  calledMilli: number;
  /** Whether that call landed. */
  calledGood: boolean;
  /**
   * `world.tick` of the most recent call. The beat is what the rest between
   * calls is counted in; this is what the shot's flight is timed from, because
   * a call made late in a beat would otherwise be drawn as half over the
   * moment it was made (`render/gauge-shot.ts`).
   */
  calledTick: number;
  /**
   * `world.beat` the valve jammed on, or `-1`. A call that misses jams it and
   * a call that lands frees it, so the state the round is in is the pair's own
   * last answer (`gauge-hand.ts`).
   */
  jamBeat: number;
  /** Whether the pilot's hand is on the needle itself. */
  handOn: boolean;
  /** `world.beat` his hand came off it, or `-1`: the settle counts from here. */
  liftBeat: number;
  /** `world.beat` the band wound tight on, or `-1` while it is free. */
  boundBeat: number;
  /** Whether the navigator's thumb is holding the wound band open. */
  openThumb: boolean;
}

/** Far enough before any call was made that the first one is never blocked. */
const NEVER_CALLED = -1_000_000;

export function openGauge(world: World): GaugeState {
  const gauge: GaugeState = {
    kind: "gauge",
    phase: "lead",
    phaseBeat: world.beat,
    openBeat: world.beat,
    passed: false,
    needleMilli: Math.floor(GAUGE_FULL / 2),
    valve: 0,
    markMilli: Math.floor(GAUGE_FULL / 2),
    driftDir: 1,
    marks: 0,
    misses: 0,
    calledBeat: NEVER_CALLED,
    calledMilli: -1,
    calledGood: false,
    calledTick: NEVER_CALLED,
    jamBeat: -1,
    handOn: false,
    liftBeat: -1,
    boundBeat: -1,
    openThumb: false,
  };
  drawBand(world, gauge);
  return gauge;
}

/** Beats left on the clock. Never below zero; display and the round both ask. */
export function gaugeBeatsLeft(world: World, gauge: GaugeState): number {
  return Math.max(0, world.cfg.gaugeRoundBeats - (world.beat - gauge.openBeat));
}

/**
 * One tick of the round, and whether it is over: `true` passed, `false` out of
 * time, `null` still going. The shell owns the phases and calls this only
 * while the round is actually being played.
 *
 * The needle moves on the tick and the band on the beat, deliberately. A valve
 * that only answered on the beat would feel like a queue rather than a hand on
 * something, and a band that drifted every tick would be a thing that slides
 * rather than a thing that steps — and the pair can only hear the steps.
 */
export function stepGauge(world: World, gauge: GaugeState, onBeat: boolean): boolean | null {
  const cfg = world.cfg;
  // A jammed valve is dead, and the needle is the pilot's own hand until a
  // call lands (`gauge-hand.ts`). The command is still heard and still sets
  // `valve` — what a seat is holding is a fact about the seat — so the needle
  // sets off again the instant the jam clears, without a second press.
  if (gauge.valve !== 0 && !gaugeJammed(gauge)) {
    const next = gauge.needleMilli + gauge.valve * cfg.gaugeTurnMilli;
    gauge.needleMilli = Math.max(0, Math.min(GAUGE_FULL, next));
  }
  // Her thumb on the band stops it walking. That is the whole of what the
  // hold buys, and it is bought with the call she cannot make while it is down.
  if (onBeat && !gauge.openThumb) driftBand(world, gauge);

  if (gauge.marks >= cfg.gaugeMarks) return true;
  if (gaugeBeatsLeft(world, gauge) <= 0) return false;
  return null;
}

/** Whether the needle is between the two marks, which is the whole judgement. */
export function gaugeSeated(world: World, gauge: GaugeState): boolean {
  return gaugeSeatedBy(world.cfg, gauge);
}

/**
 * The two controls, and the two seats they belong to.
 *
 * The seat check is a rule of the simulation rather than a coat of paint on
 * the picture, for the reason the rest of the split is: a pilot who could call
 * would be playing both halves of a round whose only content is that he cannot
 * see the marks, and both devices have to agree exactly which presses counted.
 *
 * A call also reports itself, in `events-gauge.ts`: `gaugeMark` or
 * `gaugeMiss`, and `gaugeJam` or `gaugeBind` beside it when the same call
 * sticks the valve or winds the band. Both of the second pair are facts about
 * the *other* seat's half, which is exactly why an ear says them faster than
 * an eye finding the other screen could (`docs/queue.md`, 19 September 2026).
 */
export function gaugeHeard(world: World, gauge: GaugeState, player: 1 | 2, command: Command): void {
  if (command.kind === "valve") {
    // The pilot turns. A valve from the navigator is not refused loudly — she
    // has no valve drawn on her screen at all, so there is nothing to refuse.
    if (player !== 1) return;
    gauge.valve = command.on ? command.dir : 0;
    return;
  }
  if (command.kind !== "call" || player !== 2) return;
  // Two calls in a row cost the rest between them whether the first landed or
  // not, so a thumb held on the button is slower than a pair who talk.
  if (world.beat - gauge.calledBeat < world.cfg.gaugeCallRestBeats) return;
  // **Refused rather than missed**, twice: while her own thumb is holding the
  // band open, and while his needle is still settling from his hand. Both are
  // the round asking for something else at that moment, and a miss would
  // charge her for a state one of them is in the middle of leaving — the
  // rest between calls would run as well, so a pair doing exactly what the
  // round asked would be slowed for it.
  if (gauge.openThumb || gaugeSettling(world.cfg, gauge, world.beat)) return;

  const good = gaugeSeated(world, gauge);
  gauge.calledBeat = world.beat;
  gauge.calledMilli = gauge.needleMilli;
  gauge.calledGood = good;
  gauge.calledTick = world.tick;
  if (!good) {
    gauge.misses += 1;
    // And the valve sticks. A miss is the one thing in this round that was
    // free — time, and the pair was going to spend that anyway — so what it
    // costs now is the control itself, until the next call lands.
    gauge.jamBeat = world.beat;
    world.events.push({ type: "gaugeMiss" });
    world.events.push({ type: "gaugeJam" });
    return;
  }
  gauge.marks += 1;
  gauge.jamBeat = -1;
  world.events.push({ type: "gaugeMark" });
  // Every other mark winds the band tight, and the one after it lets it go:
  // the round alternates between the two states rather than ending in one.
  gauge.boundBeat = gauge.marks % world.cfg.gaugeBindMarks === 0 ? world.beat : -1;
  if (gauge.boundBeat !== -1) world.events.push({ type: "gaugeBind" });
  // A mark spends the band it was made on: the next one is somewhere else and
  // the pair has to find it again from words alone.
  drawBand(world, gauge);
}
