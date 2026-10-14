import { bossStrikesHull } from "./boss-strike.js";
import { midCol } from "./config.js";
import {
  type BossSequenceStep,
  type InstarState,
  instarActing,
  instarMarkCol,
  instarMarkDone,
  instarStep,
  instarStrikeBeat,
  type NettleState,
  type NettleStep,
  type SceneState,
  type SceneStep,
} from "./instar.js";
import { stepInstarMarks } from "./instar-beat.js";
import { armMarks } from "./instar-marks.js";
import { closeSlow, openSlow } from "./slow.js";
import type { World } from "./world.js";

/**
 * THE INSTAR's clock: the morph, the window, the landing, the next pose.
 *
 * Every clock in here is the step's own (`BossSequenceStep`), read off the
 * script by the cursor, and the one thing the beat does that a thumb cannot
 * is **close the window**: a mark still undone when `windowBeats` have run is
 * the part doing what the mark was there to stop, and that is one strike on
 * the hull at the mark's column — which, under the owner's rule of 12
 * September 2026, is the wave (`hull-damage.ts`, `wave-fail.ts`). A strike
 * is never two: the failed field is held from the next tick and this clock
 * does not run under a hold.
 *
 * The beat also **lets a lonely mark slip** (`instar-beat.ts`): one done `instarTogetherBeats`
 * ago whose partner is still not, back to nought with its sound. The thumbs
 * decide when a mark is done (`instar-hand.ts`); the beat decides whether
 * *done* was together. On the beat and not the tick so a hand two ticks late
 * on the other phone is not two ticks late — the window the pair is given is
 * said in beats, and a beat is the unit they can hear.
 *
 * The beat is also **the part pushing back** against a pull on a step that
 * says it does (`pushMilli`): each beat a thumb is on the mark, the carry
 * loses that much, and a jaw that was shut is open again until the thumb goes
 * further. On the beat, like the slip, so the shove is a pulse the pair can
 * feel in the music rather than a drift — and said, one `instarShove` per
 * thumb it pushed, so the lips can tremble and the ear can hear it.
 *
 * And the beat is what counts a **hold**: a mark whose thumbs are all on it
 * gains one unit per beat they stay, which is the one gesture with no command
 * of its own — a press and no lift, and time.
 */

export function installInstar(world: World, steps: readonly BossSequenceStep[]): InstarState {
  const s: InstarState = { kind: "instar", steps: copySteps(steps), ...fresh(world) };
  enter(world, s);
  return s;
}

/** THE NETTLE is THE INSTAR's engine with its own words (`nettle-words.ts`). */
export function installNettle(world: World, steps: readonly NettleStep[]): NettleState {
  const s: NettleState = { kind: "nettle", steps: copySteps(steps), ...fresh(world) };
  enter(world, s);
  return s;
}

function copySteps<St extends SceneStep>(steps: readonly St[]): St[] {
  return steps.map((step) => ({ ...step, marks: step.marks.map((m) => ({ ...m })) }));
}

function fresh(world: World): Omit<SceneState, "kind" | "steps"> {
  return {
    cursor: 0,
    phase: "morph",
    phaseBeat: world.beat,
    progress: [],
    doneBeat: [],
    ref: [],
    thumbs: [],
  };
}

function enter(world: World, s: SceneState): void {
  armMarks(s);
  const mid = midCol(world.cfg);
  world.events.push({ type: "instarEnter", col: mid });
  const first = instarStep(s);
  if (first !== null)
    world.events.push({ type: "instarMorph", step: 0, pose: first.pose, col: mid });
}

function strike(world: World, s: SceneState): void {
  const step = instarStep(s);
  if (step === null) return;
  // The first undone mark's part is the one that strikes; a step with two
  // undone is still one strike, because one is the wave.
  for (let i = 0; i < step.marks.length; i++) {
    const mark = step.marks[i];
    if (mark === undefined || instarMarkDone(s, i)) continue;
    const col = instarMarkCol(world.cfg, mark);
    // Failed is over, and over is full rate: the window closes on the strike
    // exactly as it closes on a landing (`slow.ts` `closeSlow`).
    closeSlow(world);
    world.events.push({ type: "instarStrike", part: mark.part, col });
    // The part the pair let through is what breaks the hull, never a rock
    // nobody saw fall (`boss-strike.ts`) — named for the body it is, so THE
    // NETTLE's blow is drawn as its own and not as THE INSTAR's.
    bossStrikesHull(world, s.kind, col);
    return;
  }
}

export function stepInstar(world: World, s: SceneState): void {
  const cfg = world.cfg;
  const mid = midCol(cfg);
  if (s.phase === "down") {
    // Nulled here rather than at the last landing, so the frame has its beats
    // of the beaten body before the wave is allowed to end (`bossHoldsWave`).
    if (world.beat - s.phaseBeat >= cfg.instarOutBeats) {
      world.events.push({ type: "instarOut", col: mid });
      world.boss = null;
    }
    return;
  }
  const step = instarStep(s);
  if (step === null) return;
  if (s.phase === "morph") {
    if (world.beat - s.phaseBeat < step.morphBeats) return;
    s.phase = "act";
    s.phaseBeat = world.beat;
    armMarks(s);
    // **The window is the slow.** Opened for the step's own `windowBeats` from
    // this beat, which is the same span `instarStrikeBeat` counts, so the rate
    // is a third for exactly as long as the pair is being asked for something
    // and not one beat longer (`slow.ts` `closeSlow`, and the owner's rule in
    // its header). Both devices reach this line on the same tick.
    openSlow(world, step.windowBeats, "ask");
    world.events.push({ type: "instarShow", step: s.cursor, col: mid });
    return;
  }
  if (s.phase === "act") {
    stepInstarMarks(world, s);
    // A hold that landed the step this beat has closed the window itself.
    if (instarActing(s) && world.beat >= instarStrikeBeat(s)) strike(world, s);
    return;
  }
  // Landed: the body settles, then either the next pose or the end.
  if (world.beat - s.phaseBeat < step.landBeats) return;
  s.cursor += 1;
  s.phaseBeat = world.beat;
  const next = instarStep(s);
  if (next === null) {
    s.phase = "down";
    armMarks(s);
    openSlow(world, cfg.instarSlowBeats, "show");
    world.events.push({ type: "instarDown", col: mid });
    return;
  }
  s.phase = "morph";
  world.events.push({ type: "instarMorph", step: s.cursor, pose: next.pose, col: mid });
}
