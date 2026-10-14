import { NO_BEARING } from "./bearing.js";
import {
  instarHeld,
  instarMarkCol,
  instarMarkDone,
  instarPanel,
  instarPulled,
  instarStep,
  NOT_DONE,
  type SceneState,
} from "./instar.js";
import { answerMark, slipMark } from "./instar-marks.js";
import type { InstarGesture } from "./instar-words.js";
import type { World } from "./world.js";

/**
 * **What the beat does to THE INSTAR's marks** while a step is acting — and
 * THE NETTLE's, on the same engine. Cut off `instar-step.ts` at the seam its
 * own header draws: that file is the clock (the pose, the window, the strike,
 * the landing), and this is the three things the clock does to the marks on
 * every beat of an act — a lonely mark slips, a pull is pushed back, a hold
 * is counted.
 */
export function stepInstarMarks(world: World, s: SceneState): void {
  slipLonely(world, s);
  pushBack(world, s);
  countHolds(world, s);
}

function slipLonely(world: World, s: SceneState): void {
  const step = instarStep(s);
  if (step === null || step.marks.length < 2) return;
  // Together is only asked of thumbs on the body. A mark done while what is
  // left is the panel's waits for the panel: the cannon has to get there,
  // and a pair cannot shoot and tap *at once* in any sense worth saying.
  // A hold is waited for the same way: it is beats, not a count, so it cannot
  // be hurried to meet a partner — the split lunge's eye, tapped shut before
  // the brow's three beats were up, slipped and had to be tapped again.
  const body = step.marks.some(
    (m, i) => !instarPanel(m.gesture) && m.gesture !== "hold" && !instarMarkDone(s, i),
  );
  if (!body) return;
  for (let i = 0; i < step.marks.length; i++) {
    const mark = step.marks[i];
    const done = s.doneBeat[i] ?? NOT_DONE;
    if (mark === undefined || done === NOT_DONE || waits(s, i, mark.gesture)) continue;
    if (world.beat - done <= world.cfg.instarTogetherBeats) continue;
    slipMark(world, s, i);
  }
}

/**
 * Whether a done mark waits for its partner however long it takes: a panel
 * verb and a hold always, and a pull while its thumb is still on it. A pull
 * counted and let go (`instar-hand.ts`, the one generic PULL) is done the
 * way a tap is, and is lonely the way a tap is.
 */
function waits(s: SceneState, i: number, gesture: InstarGesture): boolean {
  if (!instarHeld(gesture)) return false;
  return !instarPulled(gesture) || (s.thumbs[i] ?? 0) !== 0;
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
