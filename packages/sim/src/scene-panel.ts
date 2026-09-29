import { instarActing, instarMarkCol, instarMarkDone, instarStep, sceneBoss } from "./instar.js";
import { answerMark } from "./instar-marks.js";
import type { InstarGesture } from "./instar-words.js";
import type { Bullet, Color } from "./types.js";
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
 * - `shoot` — a bolt out of the top of the mark's column (`shotLeaves`), in
 *   the mark's `color` when it names one. The cannon is player 1's, the
 *   trigger player 2's, so the one word needs both seats, which is what this
 *   boss is for. A bolt of the other colour counts nothing and pushes
 *   `instarRefuse` for player 2, whose button chose it — the same word a
 *   thumb from the wrong seat gets (`instar-hand.ts`).
 * - `shield` — the dome brought up with the shield under the mark (`guard`).
 * - `suck` — the maw opened with the cannon under the mark (`intake`).
 *
 * Each press counts one on the **first** undone mark of that verb in that
 * column, so two globs in one column are two presses. The rule is the one
 * sentence a pair can say: *put it under the mark and press* — and, on a
 * mark that names a colour, *in its colour*. Nothing else is judged — no
 * charge, no order between the marks.
 */

function panelHeard(world: World, verb: InstarGesture, col: number, color?: Color): boolean {
  const s = sceneBoss(world);
  if (s === null || !instarActing(s)) return false;
  const marks = instarStep(s)?.marks ?? [];
  let refused = -1;
  for (let i = 0; i < marks.length; i++) {
    const mark = marks[i];
    if (mark?.gesture !== verb || instarMarkDone(s, i)) continue;
    if (instarMarkCol(world.cfg, mark) !== col) continue;
    if (color !== undefined && mark.color !== undefined && mark.color !== color) {
      if (refused === -1) refused = i;
      continue;
    }
    answerMark(world, s, i, 1);
    return true;
  }
  if (refused === -1) return false;
  // The bolt reached a mark that would not take it: met, and told so.
  world.events.push({ type: "instarRefuse", mark: refused, player: 2, col });
  return true;
}

/**
 * A bolt gone out of the top of the field, from `shotLeaves`, heard by THE
 * NETTLE's SHOOT marks. One call per boss, named for it, because
 * `wasted-shot.test.ts` reads the boss off the name of every call there.
 * A bolt a mark did not hear met nothing: the mark is the only thing up there
 * a shot is for (`shot-out.ts`).
 */
export function nettleStruck(world: World, b: Bullet): boolean {
  return world.boss?.kind === "nettle" && panelHeard(world, "shoot", b.col, b.color);
}

/** The same, for THE INSTAR's SHOOT marks since its second act (§11.32). Two
 * calls rather than one so a bolt is heard once, by the boss that is up. */
export function instarStruck(world: World, b: Bullet): boolean {
  return world.boss?.kind === "instar" && panelHeard(world, "shoot", b.col, b.color);
}

/** The dome coming up, from the `guard` press. */
export function sceneGuard(world: World): void {
  panelHeard(world, "shield", world.shieldCol);
}

/** The maw opening, from the `intake` press. */
export function sceneSuck(world: World): void {
  panelHeard(world, "suck", world.cannonCol);
}
