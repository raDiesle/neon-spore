import {
  balloonPull,
  type DragTarget,
  lidIsHeld,
  NO_TETHER,
  occupiesCol,
  type World,
  wardenHandleMilli,
} from "@neon-spore/sim";
import { balloonHandleCircle, balloonHandleSeat } from "./balloon-handles.js";
import { choirArrowCircle, showsChoirArrows } from "./choir-arrows.js";
import { fieldPoint, handleRadius } from "./handle-draw.js";
import type { Circle, Layout } from "./layout.js";
import { lidCordCircle, lidHandlePoint } from "./lid-string.js";
import { mazeStringCircle, mazeStringHandle } from "./maze-string.js";

/**
 * **Where a handle is standing**, as against where a finger may grab it.
 *
 * Cut out of `handles.ts` when THE BALLOON's two took that file over its
 * 250-line limit, and along the seam its own header already draws in these
 * words: next door answers *where a press lands*, and that is always the
 * **resting** circle — by the time a handle has swung, the pointer is
 * captured and nothing is hit-tested again. This answers the other question,
 * and it has exactly two callers, neither of them a finger: the ghost hand in
 * a guide's rehearsal, and the caption pointing at one. A thumb drawn at the
 * rest while the cord it is holding swings away is a hand that has visibly
 * let go.
 *
 * The two halves also grow for different reasons. That one gains a hit test
 * per creature with a handle; this one gains a branch only when a handle
 * *travels*, which most of them do not.
 *
 * `handles.ts` re-exports `handleCircle`, so nothing that already reached for
 * it through that file had to move.
 */

/**
 * Where a handle is *standing*, as opposed to where it rests.
 *
 * `handleUnder` above answers where a finger may grab, and that is always the
 * resting circle: by the time a handle has swung the pointer is captured and
 * nothing is hit-tested again. This answers the other question, and two things
 * ask it — the ghost hand in a guide's rehearsal, and the caption pointing at
 * one. A thumb drawn at the rest while the cord it is holding swings away is a
 * hand that has visibly let go.
 *
 * Each of the three comes out of the file that draws it, so the hand cannot
 * stand where the handle is not. Null wherever the handle is not on the field:
 * the wheel between rounds, a warden with no line, a wave with no eye in it.
 */
export function handleCircle(
  l: Layout,
  world: World,
  target: DragTarget,
  beatPhase: number,
  col?: number,
): Circle | null {
  const cfg = world.cfg;
  if (target === "choirLeft" || target === "choirRight") {
    // The two arrows are the one handle that is *placed* rather than found: a
    // membrane is on the field or it is not, and the arrows stand against the
    // walls either way they are drawn. `showsChoirArrows` is the same gate the
    // drawing and the hit test ask, so a ring can never be put round an arrow
    // nobody was shown — including on the navigator's screen, which has none.
    if (!showsChoirArrows(l, world.creatures)) return null;
    return choirArrowCircle(l, target === "choirLeft" ? -1 : 1);
  }
  if (target === "balloonLeft" || target === "balloonRight") {
    // THE BALLOON's two, and they are the reason this branch had to exist: a
    // target that fell through here landed in the **lid** lookup below and put
    // a ring round a body that was never there — silently, and pointing at the
    // wrong creature when one happened to be on the field. `choir-anchor.test.ts`
    // is the test that was written for exactly that shape of mistake.
    //
    // A handle is `handleUnder`'s resting circle while nobody has hold of it
    // and wherever the hand carried it once somebody has, which is the
    // distinction this function exists to draw.
    const side = target === "balloonLeft" ? -1 : 1;
    const c = world.creatures.find(
      (b) => b.kind === "balloon" && (col === undefined || occupiesCol(b, col)),
    );
    if (!c) return null;
    const rest = balloonHandleCircle(l, cfg, c, world.beat, beatPhase, side);
    const pull = balloonPull(c, balloonHandleSeat(side));
    return { ...rest, x: rest.x + (pull * l.tile) / 1000 };
  }
  if (target === "mazeString") {
    const m = world.boss?.kind === "maze" ? world.boss : null;
    if (m === null || m.phase !== "read") return null;
    const rest = mazeStringCircle(l, cfg);
    return { x: mazeStringHandle(l, cfg, m).x, y: rest.y, r: rest.r };
  }
  if (target === "wardenTether") {
    const b = world.boss?.kind === "warden" ? world.boss : null;
    if (b === null || b.tetherId === NO_TETHER) return null;
    const at = fieldPoint(l, wardenHandleMilli(world, b));
    return { x: at.x, y: at.y, r: handleRadius(l, cfg) };
  }
  // A cord hangs off a body, so which body has to be said: the one in the
  // column the film named, and otherwise the first on the field.
  const lid = world.creatures.find(
    (c) => c.kind === "lid" && (col === undefined || occupiesCol(c, col)),
  );
  if (!lid) return null;
  // Loose, it hangs beside the body and follows it down; held, it is the same
  // place plus the hand's pull — both `lid-string.ts`'s own answers.
  if (!lidIsHeld(lid)) return lidCordCircle(l, cfg, lid, beatPhase);
  const at = lidHandlePoint(l, cfg, lid, beatPhase);
  return { x: at.x, y: at.y, r: handleRadius(l, cfg) };
}
