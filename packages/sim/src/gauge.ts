import { drawBand, driftBand, gaugeSeatedBy, gaugeWoundOpen } from "./gauge-band.js";
import { gaugeShotLands, gaugeWoundRegrows } from "./gauge-call.js";
import { gaugeJammed } from "./gauge-hand.js";
import { gaugeAllLevels } from "./gauge-level.js";
import { gaugeToothLapses } from "./gauge-tooth.js";
import type { Color } from "./types.js";
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
 * **What is drawn from the rng, and why it is allowed.** Where the band lands,
 * which way it sets off, and which colour the wound wants (`gauge-call.ts`). That is exactly the randomness rule
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
  /** `world.beat` the round opened on. */
  openBeat: number;
  /** Levels behind the pair, 0 on the first (`gauge-level.ts`). */
  level: number;
  /** `world.beat` this level's clock starts from — later than now during a rest. */
  levelBeat: number;
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
  /** Calls that landed between the marks, over the whole round. */
  marks: number;
  /** Calls that did not. They cost time and nothing else. */
  misses: number;
  /** `world.beat` of the most recent call, for the rest between two of them. */
  calledBeat: number;
  /** Where the needle stood when it was called, so the picture can show it. */
  calledMilli: number;
  /** Whether that call landed. */
  calledGood: boolean;
  /** The colour the wound wants, drawn with it (`drawBand`). Only she sees it. */
  woundColor: Color;
  /** The colour that call went out in, which the shot and the scar wear. */
  calledColor: Color;
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
  /**
   * `world.tick` the shot in the air lands on, or `-1` with none out. A call
   * is judged there and not when it is made (`gauge-call.ts`).
   */
  shotTick: number;
  /** `world.beat` a shot-out wound's successor opens on, or `-1` while one is open. */
  regrowBeat: number;
  /** `world.beat` the wound now on the rim opened on, which the picture grows it from. */
  woundBeat: number;
  /** The loose tooth or `-1`, the teeth out, and her pull (`gauge-tooth.ts`). */
  looseTooth: number;
  pulledTeeth: number;
  toothHold: number;
  toothDxMilli: number;
  toothDyMilli: number;
}

/** Far enough before any call was made that the first one is never blocked. */
const NEVER_CALLED = -1_000_000;

export function openGauge(world: World): GaugeState {
  const gauge: GaugeState = {
    kind: "gauge",
    phase: "lead",
    phaseBeat: world.beat,
    openBeat: world.beat,
    level: 0,
    levelBeat: world.beat,
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
    woundColor: "cyan",
    calledColor: "cyan",
    calledTick: NEVER_CALLED,
    jamBeat: -1,
    handOn: false,
    liftBeat: -1,
    boundBeat: -1,
    openThumb: false,
    shotTick: -1,
    regrowBeat: -1,
    woundBeat: world.beat,
    looseTooth: -1,
    pulledTeeth: 0,
    toothHold: -1,
    toothDxMilli: 0,
    toothDyMilli: 0,
  };
  drawBand(world, gauge);
  return gauge;
}

/**
 * Beats left on this level's clock. Never below zero, and full while the rest
 * before a level runs; display and the round both ask.
 */
export function gaugeBeatsLeft(world: World, gauge: GaugeState): number {
  return Math.max(0, world.cfg.gaugeLevelBeats - Math.max(0, world.beat - gauge.levelBeat));
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
  // The bolt reaches the rim, and only then is the call judged; a wound shot
  // out leaves the rim bare for `gaugeRegrowBeats` (`gauge-call.ts`).
  if (gauge.shotTick !== -1 && world.tick >= gauge.shotTick) gaugeShotLands(world, gauge);
  if (onBeat) gaugeWoundRegrows(world, gauge);
  if (onBeat) gaugeToothLapses(world, gauge);
  // Her thumb on the band stops it walking. That is the whole of what the
  // hold buys, and it is bought with the call she cannot make while it is down.
  // A band with a shot on its way to it stands still too, so the call is judged
  // against the wound she saw it made at; and a bare rim has no band to walk.
  const still = gauge.openThumb || gauge.shotTick !== -1 || !gaugeWoundOpen(gauge);
  if (onBeat && !still) driftBand(world, gauge);

  if (gaugeAllLevels(cfg, gauge)) return true;
  if (gaugeBeatsLeft(world, gauge) <= 0) return false;
  return null;
}

/** Whether the needle is between the two marks, which is the whole judgement. */
export function gaugeSeated(world: World, gauge: GaugeState): boolean {
  return gaugeSeatedBy(world.cfg, gauge);
}
