import { type FirstGesture, thenPull } from "./combo-then-pull.js";
import { STEPS_PRESS } from "./press-goo/index.js";
import { viewOf } from "./press-goo/view.js";
import {
  freshPress,
  type LabPress,
  lift,
  type PressAsk,
  press,
  pressAsk,
  tick,
} from "./press-lab-rule.js";

/**
 * **PRESS, THEN PULL**, in THE COMBO LAB — a `chain` (`combo-then-pull.ts`),
 * as HOLD, THEN PULL is: a mark pressed once, the PRESS LAB's rule and look,
 * counted and gone; then a pull knob comes in where it was. The owner, 14
 * October 2026, of the press that was the partner's: *visual and from user
 * action it is the same* as a plain pull — *it should be first showing a
 * "press" and then it disappears finishing it and then showing a new
 * independant "pull" next*.
 *
 * In the game the two are THE LAMPREY's plug (`sim/lamprey-plug.ts`): the
 * press is the worker's, the pull the holder's, and the press is what brings
 * the pull. Each is still a whole gesture on its own.
 */

const ONCE: PressAsk = pressAsk("1");

const PRESS: FirstGesture<LabPress> = {
  fresh: freshPress,
  again: ({ lapsed, missed }) => ({ ...freshPress(), lapsed, missed }),
  press: (h, at) => {
    press(h, ONCE, at);
  },
  move: () => {},
  lift,
  tick,
  counted: (h) => h.waiting,
  paint(ctx, h, _look, time, alone) {
    const v = viewOf(ctx, h, ONCE, time);
    ctx.save();
    if (alone) STEPS_PRESS.paint(v);
    else if (v.ending !== null) STEPS_PRESS.paint({ ...v, mark: false });
    ctx.restore();
  },
  state: (h) => (h.down ? "PRESSING" : "WAITING"),
  refused: (h) => h.lapsed,
  strayed: (h) => h.missed,
  word: "PRESSED",
  // A press, and the thumb off.
  steps: [
    [0.8, false],
    [0.12, true],
    [0.7, false],
  ],
};

export const PRESS_PULL = thenPull(PRESS, {
  key: "presspull",
  label: "PRESS, THEN PULL",
  says: "a mark pressed once, and then a pull that comes in where it was, taken the whole way",
  like: "THE LAMPREY's tail in a plug, there once the button its teeth had is pressed back — the press the worker's, the pull the holder's",
});
