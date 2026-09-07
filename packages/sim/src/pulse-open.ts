import { ticksPerBeat } from "./config-derived.js";
import { PULSE_COUNT_BEATS, type PulseStage, type PulseState } from "./pulse.js";
import type { World } from "./world.js";

/**
 * Opening a stage, and opening the round — the two places a `PulseState` is
 * written from nothing.
 *
 * Its own file for the reason `snake-open.ts` is one: `pulse.ts` next door is
 * what the round *is*, and this is the only code that builds one. Splitting on
 * the line limit is what forced it, and this is where the seam already was —
 * everything here writes the whole of a stage at once, and everything there is
 * a shape or a word.
 */
export function openPulse(world: World, stages: readonly PulseStage[]): PulseState {
  // A wave that carries this boss and authors nothing is a round with no song
  // — SNAKE's objection, and it is worth the same throw.
  if (stages.length === 0) throw new Error("a pulse wave with no stages is not a round");
  const state: PulseState = {
    kind: "pulse",
    phase: "count",
    phaseBeat: world.beat,
    openBeat: world.beat,
    passed: false,
    stages: stages.map((s) => ({
      name: s.name,
      steps: s.steps,
      notes: s.notes.map((n) => ({ ...n })),
    })),
    stage: 0,
    notes: [],
    startTick: world.tick + PULSE_COUNT_BEATS * ticksPerBeat(world.cfg),
    judged1: [],
    judged2: [],
    from1: 0,
    from2: 0,
    meter: world.cfg.pulseMeterStartMilli,
    combo1: 0,
    combo2: 0,
    last1: 0,
    last2: 0,
    lastTick1: -1,
    lastTick2: -1,
    lastLane1: -1,
    lastLane2: -1,
  };
  loadStage(world, state);
  return state;
}

/** The stage being played. Clamped, so a state read after the last one answers. */
export function pulseCurrent(state: PulseState): PulseStage {
  const stage = state.stages[Math.min(state.stage, state.stages.length - 1)];
  if (stage === undefined) throw new Error("a pulse round with no stages left to play");
  return stage;
}

/**
 * The current stage's chart onto the lanes, nothing resolved and both meters
 * back where they started.
 *
 * The meter goes back with the chart rather than carrying between stages, and
 * that is the arcade's rule as much as ours: a stage is a stage, and a pair
 * who scraped through the first one on a tenth of a bar should be playing the
 * second one rather than losing it in its first bar.
 */
export function loadStage(world: World, state: PulseState): void {
  const stage = pulseCurrent(state);
  state.notes = stage.notes.map((n) => ({ ...n }));
  state.judged1 = state.notes.map(() => 0);
  state.judged2 = state.notes.map(() => 0);
  state.from1 = 0;
  state.from2 = 0;
  state.meter = world.cfg.pulseMeterStartMilli;
  state.combo1 = 0;
  state.combo2 = 0;
  state.last1 = 0;
  state.last2 = 0;
  state.lastTick1 = -1;
  state.lastTick2 = -1;
  state.lastLane1 = -1;
  state.lastLane2 = -1;
  state.startTick = world.tick + PULSE_COUNT_BEATS * ticksPerBeat(world.cfg);
}
