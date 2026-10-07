import {
  midCol,
  type TrapezeState,
  trapezeAims,
  trapezeFrozen,
  trapezeLitStep,
  type World,
} from "@neon-spore/sim";
import { CUE_FRAME_WIDE, cueFrame } from "./boss-cue-frame.js";
import type { BossCue } from "./boss-cue-shape.js";
import { fieldX } from "./field-flip.js";
import type { Layout } from "./layout.js";
import { trapezeMarks } from "./trapeze-marks.js";
import { trapezeSpindleAt, trapezeSpindleTall } from "./trapeze-shape.js";

/**
 * **What THE TRAPEZE is asking for**: page forty of the readings. Both screens
 * draw the flag, the ring and the track (`trapeze-draw.ts`), so nothing a word
 * could stand on is a secret, and `cueSeen` keeps each word to the thumb that
 * can act on it. The words stand on `trapezeMarks`, the one placement the
 * grips are pressed on too (`trapeze-grip.ts`).
 *
 * **`TAP` on the ring, to the step's freezer**, while a catch or a recatch is
 * lit and the flag still swings. It goes the moment the flag is frozen: a
 * word over a flag already still could only say *again*. On a recatch the
 * freezer is either seat, so the word is both seats'. It never says *when*.
 * The flag coming over the mark is what the pair are there to call.
 *
 * **`SWIPE` on the track, to the seat that draws**, under the kind `HOLD`,
 * because the draw wants its beats before the lift. On a recatch both seats
 * may draw until one of them has frozen the flag, then only the other may. The
 * swipe's side is not said: the track runs from the pivot toward the lit
 * column, and the side is on the glass already.
 *
 * **`FIRE` at the hull under the middle column on a fire step, once the
 * spindle is lit**, to either seat. The step's colour is never named. Nothing
 * is said between steps. **It rings the spindle**, as tall as it is drawn
 * (`trapezeSpindleAt`).
 */

export function trapezeCues(l: Layout, world: World, s: TrapezeState): readonly BossCue[] {
  const frame = cueFrame(l, CUE_FRAME_WIDE);
  const step = trapezeLitStep(s);
  if (step === null) return [];
  if (step.ask === "fire") {
    if (!s.spindleLit) return [];
    const x = fieldX(l, midCol(world.cfg));
    const aim = { ...trapezeSpindleAt(l, world.cfg), r: trapezeSpindleTall(l) };
    return [{ seat: null, kind: "PRESS", word: "FIRE", x, y: l.hullY, ...frame, aim, seed: 164 }];
  }
  const { ring, from, to } = trapezeMarks(l, world.cfg, step);
  const said: BossCue[] = [];
  if (!trapezeFrozen(s)) {
    const seat = step.freezer === "either" ? null : step.freezer;
    said.push({ seat, kind: "PRESS", word: "TAP", x: ring.x, y: ring.y, ...frame, seed: 165 });
  }
  const p1 = trapezeAims(s, 0);
  const p2 = trapezeAims(s, 1);
  if (p1 || p2) {
    const seat = p1 && p2 ? null : p1 ? 1 : 2;
    const x = (from.x + to.x) / 2;
    said.push({ seat, kind: "HOLD", word: "SWIPE", x, y: from.y, ...frame, seed: 166 });
  }
  return said;
}
