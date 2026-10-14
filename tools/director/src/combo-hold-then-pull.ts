import { type FirstGesture, thenPull } from "./combo-then-pull.js";
import { viewOf } from "./hold-goo/view.js";
import { drawHoldClock } from "./hold-goo/wait.js";
import {
  BEAT_SECONDS,
  freshHold,
  HOLD_AT,
  HOLD_R,
  type HoldAsk,
  holdAsk,
  type LabHold,
  lift,
  move,
  press,
  tick,
} from "./hold-lab-rule.js";

/**
 * **HOLD, THEN PULL**, in THE COMBO LAB — a `chain` (`combo-then-pull.ts`): a
 * mark held for its beats, the HOLD LAB's rule and look, counted as a hold;
 * once its count has played, a pull knob comes in where the mark was. Let go
 * of the hold early, it is refused and the hold is asked again. The mark
 * wears the waiting clock from the moment it is up, as every hold does.
 */

const ASK: HoldAsk = holdAsk("2");
const T = ASK.beats * BEAT_SECONDS;

const HOLD: FirstGesture<LabHold> = {
  fresh: freshHold,
  again: ({ refused, slipped }) => ({ ...freshHold(), refused, slipped }),
  press: (h, at) => {
    press(h, at);
  },
  move,
  lift,
  tick: (h, dt) => tick(h, ASK, dt),
  counted: (h) => h.phase === "done",
  paint(ctx, h, look, time, alone) {
    const v = viewOf(ctx, h, ASK, time);
    ctx.save();
    if (alone) look.paint({ ...v, r: HOLD_R });
    else if (v.ending !== null) look.paint({ ...v, r: HOLD_R, mark: false });
    ctx.restore();
    if (alone && !h.waiting) drawHoldClock(ctx, HOLD_AT, HOLD_R, 1, time);
  },
  state(h) {
    if (h.verdict === "refused") return "LET GO EARLY · REFUSED";
    if (h.verdict === "slipped") return "OFF THE MARK";
    return h.phase === "held" ? "HOLDING" : "WAITING";
  },
  refused: (h) => h.refused,
  strayed: (h) => h.slipped,
  word: "HELD",
  // A hold let go early; a hold for its beats.
  steps: [
    [0.8, false],
    [0.6, true],
    [1.0, false],
    [T + 0.15, true],
    [0.7, false],
  ],
};

export const HOLD_THEN_PULL = thenPull(HOLD, {
  key: "thenpull",
  label: "HOLD, THEN PULL",
  says: "a mark held for two beats, and then a pull that comes in where it was, taken the whole way",
  like: "THE SLING's cords, drawn for their beats — the game looses them with a swipe today",
});
