import { NO_BEARING } from "./bearing.js";
import { midCol } from "./config.js";
import { breachHull } from "./hull-damage.js";
import {
  type BossSequenceStep,
  type InstarState,
  instarActing,
  instarHeld,
  instarMarkCol,
  instarMarkDone,
  instarPanel,
  instarPulled,
  instarStep,
  instarStrikeBeat,
  type NettleState,
  type NettleStep,
  NOT_DONE,
  type SceneState,
  type SceneStep,
} from "./instar.js";
import { answerMark, armMarks, slipMark } from "./instar-marks.js";
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
 * The beat also **lets a lonely mark slip**: one done `instarTogetherBeats`
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
    breachHull(world, col, "meteorFastest", 0, "heavy");
    return;
  }
}

function slipLonely(world: World, s: SceneState): void {
  const step = instarStep(s);
  if (step === null || step.marks.length < 2) return;
  // Together is only asked of thumbs on the body. A mark done while what is
  // left is the panel's waits for the panel: the cannon has to get there,
  // and a pair cannot shoot and tap *at once* in any sense worth saying.
  const body = step.marks.some((m, i) => !instarPanel(m.gesture) && !instarMarkDone(s, i));
  if (!body) return;
  for (let i = 0; i < step.marks.length; i++) {
    const mark = step.marks[i];
    const done = s.doneBeat[i] ?? NOT_DONE;
    if (mark === undefined || instarHeld(mark.gesture) || done === NOT_DONE) continue;
    if (world.beat - done <= world.cfg.instarTogetherBeats) continue;
    slipMark(world, s, i);
  }
}

/** The part pushes back against every thumb on a pull, by the step's
 * `pushMilli`: what it has taken back is kept in `ref` (`NO_BEARING` until
 * the first shove of a grab), so the next move is judged against it. */
function pushBack(world: World, s: SceneState): void {
  const step = instarStep(s);
  const push = step?.pushMilli ?? 0;
  if (step === null || push <= 0) return;
  for (let i = 0; i < step.marks.length; i++) {
    const mark = step.marks[i];
    if (mark === undefined || !instarPulled(mark.gesture) || (s.thumbs[i] ?? 0) === 0) continue;
    s.ref[i] = Math.max(0, s.ref[i] ?? NO_BEARING) + push;
    s.progress[i] = Math.max(0, (s.progress[i] ?? 0) - push);
    if ((s.progress[i] ?? 0) < mark.need) s.doneBeat[i] = NOT_DONE;
    const col = instarMarkCol(world.cfg, mark);
    world.events.push({ type: "instarShove", mark: i, part: mark.part, pushMilli: push, col });
  }
}

/** Which thumbs a hold mark wants, as the bits `s.thumbs` keeps: player 1's
 * is 1, player 2's is 2. */
const HOLDERS = { p1: 1, p2: 2, both: 3 } as const;

/** Every thumb a hold mark wants on it is one more beat of it — both on a
 * `both` mark, and one seat's alone on a mark of its own, which is the
 * lunge holding its brow while the other seat strikes the eye. */
function countHolds(world: World, s: SceneState): void {
  const step = instarStep(s);
  if (step === null) return;
  for (let i = 0; i < step.marks.length; i++) {
    const mark = step.marks[i];
    if (mark?.gesture !== "hold" || s.thumbs[i] !== HOLDERS[mark.seat]) continue;
    answerMark(world, s, i, 1);
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
    slipLonely(world, s);
    pushBack(world, s);
    countHolds(world, s);
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
