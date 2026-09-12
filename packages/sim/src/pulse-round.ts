import { midCol } from "./config.js";
import { breachHull } from "./hull.js";
import { PULSE_COUNT_BEATS, type PulsePhase, type PulseStage, type PulseState } from "./pulse.js";
import { pulseEndTick, pulseExpire, pulseLaneIndex } from "./pulse-chart.js";
import { pulseHeard, pulseMark } from "./pulse-controls.js";
import { loadStage, openPulse, pulseCurrent } from "./pulse-open.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * THE PULSE's clock: the count-in, the song, and the one way the hull pays.
 *
 * The fourth round to be built and it is built the way the first three are: a
 * round that is not the field is a **boss wave**, so a wave names
 * `boss: { kind: "pulse", stages: [...] }`, `startWave` installs it, and
 * nothing anywhere has an opinion about when a round is reached
 * (`docs/decisions.md` #20). Everything `gauge-round.ts` says about what that
 * buys holds here word for word, so this header says only what is different.
 *
 * **It is stepped on the tick, and for PINBALL's reason turned inside out.**
 * PINBALL steps on the tick because a ball under an acceleration integrated
 * once a beat would pass through the table. This one does it because the whole
 * round is *when* a thumb landed: a beat is 75 ticks, so a press judged on the
 * beat would be judged to within six hundred milliseconds, which is not a
 * judgement, it is a shrug.
 *
 * **The song is the clock and there is no second one.** Every other round has
 * a `beats` field saying how long the pair have; this one runs until the grid
 * runs out, because a chart already says exactly how long it is. A stage that
 * needed a timer beside it would be a stage whose own length was a lie.
 */

/** Beats the result stands before the wave gives way to the next one. */
export const PULSE_VERDICT_BEATS = 5;

/** Whether the round has the world — asked once, in `step`, and nowhere else. */
export function pulseHolds(world: World): boolean {
  return world.boss !== null && world.boss.kind === "pulse";
}

/** The round, if it is the one running. Narrowing in one place rather than six. */
export function pulseRound(world: World): PulseState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "pulse" ? boss : null;
}

/** Install it, from the wave's own `boss:` entry. */
export function installPulse(world: World, stages: readonly PulseStage[]): PulseState {
  return openPulse(world, stages);
}

/**
 * One tick of the round. Called from `step`'s own early return rather than
 * from `stepBoss`, because a press is judged to within a tick.
 */
export function stepPulseRound(world: World): void {
  const state = pulseRound(world);
  if (state === null || world.over) return;
  const since = world.beat - state.phaseBeat;

  if (state.phase === "count") {
    if (since < PULSE_COUNT_BEATS) return;
    // Nothing about the song moves here: `startTick` was fixed when the stage
    // was loaded, and this beat is the one it was counted to. The phase change
    // is what opens the four buttons.
    enterPhase(state, "play", world.beat);
    return;
  }
  // Over, and only being looked at — THE GAUGE's spent phase, same reason.
  if (state.phase === "spent") return;
  if (state.phase === "verdict") {
    if (since >= PULSE_VERDICT_BEATS) enterPhase(state, "spent", world.beat);
    return;
  }

  expire(world, state, 1);
  expire(world, state, 2);

  // The meter is read after the sweep, so a note that emptied it is a note
  // that emptied it — and before the end, so a stage lost on its last arrow is
  // lost rather than passed.
  if (state.meter <= 0) {
    state.passed = false;
    breachHull(world, midCol(world.cfg), "meteorFastest", 0, "heavy");
    enterPhase(state, "verdict", world.beat);
    return;
  }
  // Past the end of the grid *and* past the window of the last arrow on it:
  // the song is not over while a thumb could still be right about something.
  const end = pulseEndTick(world.cfg, state.startTick, pulseCurrent(state));
  if (world.tick >= end + world.cfg.pulseGoodTicks) nextStage(world, state);
}

/** What this seat has run out of time on, charged to its meter. */
function expire(world: World, state: PulseState, player: 1 | 2): void {
  const judged = player === 1 ? state.judged1 : state.judged2;
  const from = player === 1 ? state.from1 : state.from2;
  const out = pulseExpire(world.cfg, state.startTick, state.notes, judged, from, world.tick);
  if (player === 1) state.from1 = out.from;
  else state.from2 = out.from;
  if (out.missed.length === 0) return;
  let meter = state.meter;
  let lane = player === 1 ? state.lastLane1 : state.lastLane2;
  for (const i of out.missed) {
    judged[i] = 3;
    meter -= world.cfg.pulseMissMilli;
    const note = state.notes[i];
    if (note !== undefined) lane = pulseLaneIndex(note.lane);
  }
  pulseMark(world, state, player, 3, lane, meter, 0);
}

/** The next stage, or the round passed. */
function nextStage(world: World, state: PulseState): void {
  if (state.stage + 1 >= state.stages.length) {
    state.passed = true;
    enterPhase(state, "verdict", world.beat);
    return;
  }
  pulseOpenStage(world, state, state.stage + 1);
}

/**
 * Open a numbered stage, chart and meters together.
 *
 * The one way in, so the round's own `nextStage` and a caller jumping to a
 * stage cannot disagree about what a stage is — `setBossRound`'s whole point
 * (`boss-round.ts`).
 */
export function pulseOpenStage(world: World, state: PulseState, stage: number): void {
  state.stage = Math.max(0, Math.min(state.stages.length - 1, stage));
  loadStage(world, state);
  // A stage reached by winning starts its count again: the pair have just
  // watched a verdict and the next chart's first arrow must not already be
  // halfway down.
  enterPhase(state, "count", world.beat);
}

/**
 * Take the round off the world outright, picture and all. `closeGauge` says
 * why that is not how a round ends: this is for a run being left.
 */
export function closePulse(world: World): void {
  if (!pulseHolds(world)) return;
  world.boss = null;
}

/**
 * One control, as the round heard it.
 *
 * **The count-in answers a thumb and the other rounds’ lead-ins do not**, and
 * that difference is a defect this round shipped with for an afternoon. THE
 * GAUGE and PINBALL refuse everything before `play` because their lead-in is
 * for *reading a screen that has just stopped being the field* — nothing is
 * happening in it. Here the arrows are already falling through the count: step
 * 0 is due on the very tick the phase turns over, and `step` reads commands
 * *before* it runs this round, so a thumb landing on that tick found a round
 * still counting and was dropped. The first arrow of every stage could only be
 * hit late, and only for the second half of its window.
 *
 * A press during the count with nothing near it is still a stray and still
 * costs, which is the same rule as anywhere else in the song — mashing through
 * a count-in is mashing.
 */
export function pulseRoundHeard(world: World, player: 1 | 2, command: Command): void {
  const state = pulseRound(world);
  if (state === null) return;
  if (state.phase !== "play" && state.phase !== "count") return;
  pulseHeard(world, state, player, command);
}

export function enterPhase(state: PulseState, phase: PulsePhase, beat: number): void {
  state.phase = phase;
  state.phaseBeat = beat;
}
