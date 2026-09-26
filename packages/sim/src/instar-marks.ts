import { NO_BEARING } from "./bearing.js";
import { midCol } from "./config.js";
import {
  instarAllDone,
  instarMarkCol,
  instarMarkDone,
  instarStep,
  NOT_DONE,
  type SceneState,
} from "./instar.js";
import { closeSlow } from "./slow.js";
import type { World } from "./world.js";

/**
 * What happens to one mark: armed, answered, done, slipped.
 *
 * Its own file because two things move a mark and neither may import the
 * other: the hand on the tick (`instar-hand.ts`) and the beat over a held
 * mark (`instar-step.ts`). Both say *this mark moved one unit* and let the
 * same code decide whether that was the unit that finished it, and whether
 * finishing it landed the step — so a tap and a beat of holding cannot
 * disagree about what done is.
 */

/** The per-mark lists sized to the current step, everything at nought. */
export function armMarks(s: SceneState): void {
  const n = instarStep(s)?.marks.length ?? 0;
  s.progress = [];
  s.doneBeat = [];
  s.ref = [];
  s.thumbs = [];
  for (let i = 0; i < n; i++) {
    s.progress.push(0);
    s.doneBeat.push(NOT_DONE);
    s.ref.push(NO_BEARING);
    s.thumbs.push(0);
  }
}

/**
 * Every mark of the step done: the beat is landed, and the body settles for
 * `landBeats` before the next morph. Reached the moment the last mark gets
 * there, so the landing is on the tick the pair earned it.
 *
 * **Every landing shuts THE SLOW** (`docs/decisions.md` #33): the window was
 * opened when the step began asking (`instar-step.ts`), and the owner's rule
 * of 22 September 2026 is that it ends the instant the step is answered or
 * missed — *when succeeded or failed the action step, it immediately stops the
 * slow effect*. So the body's own answer — the jaw giving, the club dropping,
 * the tail lifting — plays at full rate, and the slow is the asking rather
 * than the reward. Both devices shut it on the same tick because both land the
 * step there.
 */
export function landStep(world: World, s: SceneState): void {
  if (s.phase !== "act" || !instarAllDone(s)) return;
  s.phase = "land";
  s.phaseBeat = world.beat;
  closeSlow(world);
  world.events.push({ type: "instarLand", step: s.cursor, col: midCol(world.cfg) });
}

/**
 * Mark `i` moved by `units` of its need — a slap, an egg away, a beat held —
 * or, for a pull, **stands at** `units` now (`absolute`): a pull is where the
 * thumb is, not how often it has been there. `say` is whether the move is
 * worth a sound — a turn says one a quarter turn, not one a tick.
 */
export function answerMark(
  world: World,
  s: SceneState,
  i: number,
  units: number,
  absolute = false,
  say = true,
): void {
  const mark = instarStep(s)?.marks[i];
  if (mark === undefined || s.phase !== "act" || instarMarkDone(s, i)) return;
  const was = s.progress[i] ?? 0;
  const now = absolute ? units : was + units;
  s.progress[i] = now;
  const col = instarMarkCol(world.cfg, mark);
  if (say && now > was) world.events.push({ type: "instarAnswer", mark: i, part: mark.part, col });
  if (now < mark.need) return;
  s.doneBeat[i] = world.beat;
  world.events.push({ type: "instarDone", mark: i, part: mark.part, col });
  landStep(world, s);
}

/** A done mark whose partner did not come in time — or a pull let go of
 * before the step landed — back to nought. */
export function slipMark(world: World, s: SceneState, i: number): void {
  const mark = instarStep(s)?.marks[i];
  if (mark === undefined || s.phase !== "act") return;
  s.progress[i] = 0;
  s.doneBeat[i] = NOT_DONE;
  s.ref[i] = NO_BEARING;
  world.events.push({
    type: "instarSlip",
    mark: i,
    part: mark.part,
    col: instarMarkCol(world.cfg, mark),
  });
}
