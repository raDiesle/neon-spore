import { instarActing, instarMarkCol, instarMarkDone, instarStep, sceneBoss } from "./instar.js";
import { answerMark } from "./instar-marks.js";
import type { InstarGesture } from "./instar-words.js";
import type { Bullet } from "./types.js";
import type { World } from "./world.js";

/**
 * **The ship's own panel on a scene's body**: SHOOT, SHIELD and SUCK marks
 * (`INSTAR_GESTURES`), which THE NETTLE is the first to ask for (§11.39).
 *
 * A thumb on the body is a drag on the mark (`instar-hand.ts`). These three
 * are the other kind of answer: the mark stands over a column and says what
 * the ship must do *in* it. So each is a press the panel already sends, heard
 * here in the column it happened in:
 *
 * - `shoot` — a bolt out of the top of the mark's column, either colour
 *   (`shotLeaves`). The cannon is player 1's, the trigger player 2's, so the
 *   one word needs both seats, which is what this boss is for.
 * - `shield` — the dome brought up with the shield under the mark (`guard`).
 * - `suck` — the maw opened with the cannon under the mark (`intake`).
 *
 * Each press counts one on the **first** undone mark of that verb in that
 * column, so two globs in one column are two presses. The rule is the one
 * sentence a pair can say: *put it under the mark and press*. Nothing else is
 * judged — no colour, no charge, no order between the marks.
 */

function panelHeard(world: World, verb: InstarGesture, col: number): boolean {
  const s = sceneBoss(world);
  if (s === null || !instarActing(s)) return false;
  const marks = instarStep(s)?.marks ?? [];
  for (let i = 0; i < marks.length; i++) {
    const mark = marks[i];
    if (mark?.gesture !== verb || instarMarkDone(s, i)) continue;
    if (instarMarkCol(world.cfg, mark) !== col) continue;
    answerMark(world, s, i, 1);
    return true;
  }
  return false;
}

/**
 * A bolt gone out of the top of the field, from `shotLeaves`. Named for the
 * one scene whose script asks for a shot, because `wasted-shot.test.ts` reads
 * the boss off the name of every call there; any scene's SHOOT mark is heard.
 */
export function nettleStruck(world: World, b: Bullet): void {
  panelHeard(world, "shoot", b.col);
}

/** The dome coming up, from the `guard` press. */
export function sceneGuard(world: World): void {
  panelHeard(world, "shield", world.shieldCol);
}

/** The maw opening, from the `intake` press. */
export function sceneSuck(world: World): void {
  panelHeard(world, "suck", world.cannonCol);
}
