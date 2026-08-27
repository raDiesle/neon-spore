import { ticksPerBeat } from "./config.js";
import type { GaugeState } from "./gauge.js";
import { gaugeHeard, openGauge, stepGauge } from "./gauge.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * The shell an interlude runs inside: a round that is not the field.
 *
 * `docs/spec/interludes.md` describes twelve of them and this file is what the
 * other eleven will enter through, so the four decisions it makes are worth
 * more than the one round built on top of it.
 *
 * **A mode, not a second world.** An interlude is a field on `World` and an
 * early return in `step`, not a `World` of its own. Two devices in lockstep
 * agree by hashing one world every tick; two worlds would need a supervisor
 * holding the switch between them, and that supervisor is the one piece of
 * state no fingerprint would cover — so the pair could disagree about *which
 * round they are in* while agreeing about everything inside it. One world
 * keeps one `step`, one `hashWorld`, one replay format and one command stream.
 * The price is a second meaning for the word "round", and it is paid where it
 * is cheapest: `step` returns before it reaches a single rule of the field, so
 * `bullets.ts`, `beat.ts` and `hull.ts` never learn the word "interlude".
 *
 * **The field is gone, and it costs nothing to make it gone.** The spec is
 * emphatic — not decorated, not paused behind a panel, gone — and this shell
 * gets that for free because of *where* it cuts: an interlude opens only at a
 * seam where the field is already empty and the next wave has not started. It
 * never has to answer what happens to the rock in the air, because there is
 * never a rock in the air. That is the whole reason the entry is here and not
 * anywhere a wave is running.
 *
 * **The clock keeps running, the wave does not.** `world.beat` advances
 * through an interlude exactly as it does through THE FORK — the metronome is
 * the game's heartbeat and the ear would notice ninety seconds of silence —
 * but `onBeat`'s field work does not run, so nothing spawns, nothing falls and
 * nothing reaches the hull. `world.waveBeat` stands still: the wave has not
 * begun.
 *
 * **Failing costs time and nothing else.** No hull, no score, no scar. It is
 * not a rule this file enforces so much as one it makes easy to keep: nothing
 * here writes to any of them, and a round that ends badly ends by pushing the
 * same `needWave` a round that ends well pushes.
 */

/** No interlude has been played yet, or the run has been left. */
export const NO_INTERLUDE = -1;

/**
 * Beats of quiet before the round begins. The pair needs long enough to read
 * two screens that have just stopped being the field and to notice that they
 * do not say the same thing.
 */
export const INTERLUDE_LEAD_BEATS = 4;

/** Beats the result stands before the field comes back. */
export const INTERLUDE_VERDICT_BEATS = 5;

/**
 * The three parts of any interlude. Choreography rather than difficulty, which
 * is why the two constants above are here and not in `SimConfig` — the same
 * argument `mirror.ts` makes about `SHOW_BEATS`.
 */
export const INTERLUDE_PHASES = ["lead", "play", "verdict"] as const;
export type InterludePhase = (typeof INTERLUDE_PHASES)[number];

/** Every interlude there is. One so far; `docs/spec/interludes.md` has twelve. */
export const INTERLUDE_KINDS = ["gauge"] as const;
export type InterludeKind = (typeof INTERLUDE_KINDS)[number];

/**
 * What content hands the simulation to open one — the input side, exactly as
 * `BossEntry` is for a boss. Which gap carries which round is content's
 * business and this package never asks.
 */
export type InterludeEntry = { kind: "gauge" };

/** What every interlude carries, whatever its own rules are. */
export interface InterludeRound {
  kind: InterludeKind;
  /**
   * The wave this gap sits in front of. The round is over when that wave is
   * asked for, so the number is both the destination and the receipt.
   */
  wave: number;
  phase: InterludePhase;
  /** `world.beat` the current phase began on. */
  phaseBeat: number;
  /** `world.beat` the round opened on — the round's own clock. */
  openBeat: number;
  /** How it went. Only meaningful once the phase is `verdict`. */
  passed: boolean;
}

export type InterludeState = GaugeState;

/**
 * Whether a round that is not the field has the world. The whole of whether
 * `step` runs the field at all, so it is asked once, in one place.
 */
export function interludeHolds(world: World): boolean {
  return world.interlude !== null;
}

/**
 * Whether the gap in front of this wave is one an interlude may open in.
 *
 * Three conditions and they are all here rather than at the call site. The
 * switch is off by default for the reason the other two in `config-pair.ts`
 * are: a headless caller — the director's loop, a replay, a determinism run —
 * answers its own `needWave` and must not be handed a round that waits for two
 * thumbs. A gap is played once, which `interludeDone` records. And **wave zero
 * is never one**: the first thing a pair meets in a run is the field, or the
 * game has taught them a round whose rules it then throws away.
 *
 * What it deliberately does not answer is *which* interlude. That is content's,
 * and content points at this package, never back.
 */
export function interludeDue(world: World, wave: number): boolean {
  return world.cfg.interludes && wave > 0 && world.interludeDone !== wave;
}

/**
 * Open one, in front of the wave that will follow it. The mirror image of
 * `startWave`: the host owns content, builds the entry and calls this, and the
 * simulation only knows the round.
 *
 * It refuses when the switch is off, rather than trusting every caller to have
 * asked `interludeDue` first — a director that opened one by accident would sit
 * at a screen it has no thumbs for and look like a hang.
 */
export function startInterlude(world: World, entry: InterludeEntry, wave: number): void {
  if (!world.cfg.interludes) return;
  const round: InterludeRound = {
    kind: entry.kind,
    wave,
    phase: "lead",
    phaseBeat: world.beat,
    openBeat: world.beat,
    passed: false,
  };
  world.interlude = openGauge(world, round);
}

/**
 * The round is over: the gap is marked spent and the wave that was waiting
 * behind it is asked for. Failing and passing leave by the same door, which is
 * the spec's rule about what failing costs, written as code rather than as a
 * promise.
 */
export function closeInterlude(world: World): void {
  const round = world.interlude;
  if (round === null) return;
  world.interludeDone = round.wave;
  world.interlude = null;
  world.events.push({ type: "needWave", wave: round.wave });
}

/**
 * Forget that any interlude was ever played. For a run being left, not for a
 * wave starting — a gap already crossed stays crossed for as long as the run
 * does.
 */
export function clearInterlude(world: World): void {
  world.interlude = null;
  world.interludeDone = NO_INTERLUDE;
}

/** Beats the pair has been in this round. Display only. */
export function interludeBeats(world: World): number {
  const round = world.interlude;
  return round === null ? 0 : world.beat - round.openBeat;
}

/**
 * One tick of the round. The shell owns the three-phase clock and every
 * interlude owns what happens inside `play` — so a new one writes its own
 * rules and inherits the lead-in, the verdict and the way out.
 */
export function stepInterlude(world: World): void {
  const round = world.interlude;
  if (round === null) return;
  const since = world.beat - round.phaseBeat;

  if (round.phase === "lead") {
    if (since >= INTERLUDE_LEAD_BEATS) enterPhase(round, "play", world.beat);
    return;
  }
  if (round.phase === "verdict") {
    if (since >= INTERLUDE_VERDICT_BEATS) closeInterlude(world);
    return;
  }

  const onBeat = world.tick % ticksPerBeat(world.cfg) === 0;
  const verdict = stepGauge(world, round, onBeat);
  if (verdict === null) return;
  round.passed = verdict;
  enterPhase(round, "verdict", world.beat);
}

/**
 * One control, as the round heard it. Nothing reaches it outside `play`: the
 * lead-in is for reading two screens and the verdict is for looking at one, and
 * a press that counted during either would be a press nobody meant.
 */
export function interludeHeard(world: World, player: 1 | 2, command: Command): void {
  const round = world.interlude;
  if (round === null || round.phase !== "play") return;
  gaugeHeard(world, round, player, command);
}

export function enterPhase(round: InterludeRound, phase: InterludePhase, beat: number): void {
  round.phase = phase;
  round.phaseBeat = beat;
}
