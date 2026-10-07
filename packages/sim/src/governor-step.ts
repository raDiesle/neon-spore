import { bossStrikesHull } from "./boss-strike.js";
import { midCol } from "./config.js";
import {
  freshGovernor,
  type GovernorState,
  type GovernorStep,
  governorLitStep,
} from "./governor.js";
import { closeSlow, openSlow } from "./slow.js";
import type { World } from "./world.js";

/**
 * THE GOVERNOR's clock: each step lighting, a window running out, and the
 * flyweights flown spent.
 *
 * The needle turns on the tick (`governor-turn.ts`), because a mark is
 * crossed in a fraction of a beat and a tap is judged against where it is
 * *now*; the tap is heard on the tick too (`governor-hand.ts`). The shot is
 * judged where the hub meets the bolt (`governor-shot.ts`).
 *
 * **Only a shot is played under THE SLOW.** The owner, 6 October 2026: *apply
 * no slow if tap control is required — only on action on the top of boss or
 * shooting with cannon*, and *there must be more time to shoot*. A tap step
 * runs at the beat's own rate, with its needle quick and its window short.
 *
 * **A tap or a retap that runs out is tried again**, the step relit after a
 * rest with the cursor where it was and every mark already landed kept; a
 * retap run out dims the hub as well, so no fire step lights until it is made
 * — THE TRAPEZE's recatch (`trapeze-step.ts`). **A shot that runs out is the
 * hull**, THE SEAM's rule.
 */

export function installGovernor(world: World, steps: readonly GovernorStep[]): GovernorState {
  const s = freshGovernor(world.beat, steps);
  world.events.push({ type: "governorEnter", col: midCol(world.cfg) });
  return s;
}

export function stepGovernor(world: World, s: GovernorState): void {
  const cfg = world.cfg;
  const since = world.beat - s.phaseBeat;
  if (s.phase === "spent") {
    if (since >= cfg.governorSpentBeats) {
      world.events.push({ type: "governorOut", col: midCol(cfg) });
      world.boss = null;
    }
    return;
  }
  if (s.phase === "slack" && since >= cfg.governorSlackBeats) next(world, s);
  else if (s.phase === "rest" && since >= cfg.governorRestBeats) next(world, s);
  else if (s.phase === "lit") lit(world, s, since);
}

function lit(world: World, s: GovernorState, since: number): void {
  const step = s.steps[s.cursor];
  if (step === undefined || since < step.beats) return;
  if (step.ask === "fire") {
    miss(world, s);
    return;
  }
  const col = midCol(world.cfg);
  if (step.ask === "retap") {
    s.hubLit = false;
    world.events.push({ type: "governorDim", col });
  } else world.events.push({ type: "governorSway", col });
  rest(world, s, false);
}

/**
 * Mark `mark` of the lit step landed by `side`: counted on the seat's taps,
 * and with the step's last mark the step answered — the hub lit again on a
 * retap, or lit for the first time when a fire step is next. Called by the
 * tap (`governor-hand.ts`).
 */
export function governorLanded(world: World, s: GovernorState, side: 0 | 1, mark: number): void {
  const step = governorLitStep(s);
  if (step === null) return;
  const col = midCol(world.cfg);
  s.landed |= 1 << mark;
  s.taps[side] += 1;
  const markMilli = step.marks[mark]?.markMilli ?? 0;
  world.events.push({ type: "governorTick", side, mark, markMilli, taps: s.taps[side], col });
  if (s.landed !== (1 << step.marks.length) - 1) return;
  if (step.ask === "retap") {
    s.hubLit = true;
    world.events.push({ type: "governorRetap", side, col });
  } else if (s.steps[s.cursor + 1]?.ask === "fire" && !s.hubLit) {
    s.hubLit = true;
    world.events.push({ type: "governorHub", col });
  }
  governorAnswered(world, s);
}

/**
 * The lit step has its answer: THE SLOW lets go, the cursor moves on and the
 * flywheel rests. Called by the shot and by the last mark of a tap.
 */
export function governorAnswered(world: World, s: GovernorState): void {
  closeSlow(world);
  rest(world, s, true);
}

/** The next step lights, a shot under THE SLOW; or, with the script done, the governor spent. */
function next(world: World, s: GovernorState): void {
  const step = s.steps[s.cursor];
  const col = midCol(world.cfg);
  if (step === undefined) {
    s.phase = "spent";
    s.phaseBeat = world.beat;
    world.events.push({ type: "governorSpent", col });
    return;
  }
  s.phase = "lit";
  s.phaseBeat = world.beat;
  if (step.ask === "fire") openSlow(world, step.beats + 1, "ask");
  world.events.push({ type: "governorLight", ask: step.ask, marks: step.marks.length, col });
}

/** A fire step ran out with the hub unshot: the hull takes it, and the wave is lost. */
function miss(world: World, s: GovernorState): void {
  const col = midCol(world.cfg);
  world.events.push({ type: "governorMiss", col });
  closeSlow(world);
  rest(world, s, true);
  bossStrikesHull(world, "governor", col);
}

function rest(world: World, s: GovernorState, advance: boolean): void {
  s.phase = "rest";
  s.phaseBeat = world.beat;
  if (!advance) return;
  s.cursor += 1;
  s.landed = 0;
}
