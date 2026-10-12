import { drawPullKnob, drawPullTrack, pullTrackPoint, smoothstep } from "@neon-spore/render";
import { drawVerdictRing } from "../../../packages/render/src/grip-verdict.js";
import { drawMarkTheirs, drawMarkWait } from "../../../packages/render/src/mark-feedback.js";
import { drawMarkHeld } from "../../../packages/render/src/mark-progress.js";
import type { ComboRule, ThumbStep } from "./combo-kinds.js";
import { scriptedThumb } from "./combo-kinds.js";
import { downShape } from "./combo-lab-rule.js";
import { afterOf, toneOf, VERDICT_WORDS } from "./pull-lab-paint.js";
import { freshPull, knobAt, type LabPull, lift, move, press, tick } from "./pull-lab-rule.js";
import { LAB_KNOB, LAB_TILE, LAB_W } from "./pull-lab-shapes.js";
import { strayReach } from "./pull-lab-stray.js";

/**
 * **PULL ONCE THE PARTNER HAS PRESSED**, in THE COMBO LAB — THE LAMPREY's
 * tail in a `plug` (`sim/lamprey-plug.ts`): the pull is the PULL LAB's own,
 * but the whole way only counts once the partner has pressed their button;
 * there before them, the pull is thrown back, refused, and the thumb must
 * lift and take the knob again. So the thumb waits part of the way, holding,
 * for the partner — the pull and the hold in the other order.
 *
 * The partner, the lab's hand, presses `PRESSES` seconds after the knob is
 * taken. Their button is drawn as the game draws a mark only the partner is
 * asked: the turning ring and the waiting clock, then a green ring once it is
 * pressed (`drawMarkHeld`).
 */

interface Plug {
  pull: LabPull;
  /** Seconds since the knob was taken, and whether the partner has pressed since. */
  taken: number;
  pressed: boolean;
  /** Pulls thrown back for coming before the press. */
  early: number;
  /** Seconds since the partner's press, for its flash. */
  since: number;
}

const PRESSES = 1.2;
const SHAPE = downShape(LAB_W * 0.3);
const BUTTON = { x: LAB_W * 0.72, y: LAB_TILE * 6 };
const STRAY = "half";

/** Thrown back from the end: refused, and home slowly, the thumb's hold on it lost. */
function throwBack(p: LabPull): void {
  p.counted--;
  p.phase = "home";
  p.verdict = "refused";
  p.last = "refused";
  p.since = 0;
  p.age = 0;
  p.from = { at: p.at, off: { ...p.off } };
  p.slow = true;
  p.lifted = 0;
}

/** AUTO: one pull straight through before the press, thrown back; one that waits halfway for it. */
function loopOf(): ThumbStep[] {
  const at = (k: number) => {
    const q = pullTrackPoint(SHAPE.track, k);
    return { x: q.x, y: q.y };
  };
  return [
    { until: 0.8, down: false, to: at(0) },
    { until: 1.4, down: true, to: at(1) },
    { until: 1.6, down: true, to: at(1) },
    { until: 3.2, down: false, to: at(0) },
    { until: 3.7, down: true, to: at(0.55) },
    { until: 4.6, down: true, to: at(0.55) },
    { until: 5.0, down: true, to: at(1) },
    { until: 5.4, down: true, to: at(1) },
    { until: 6.8, down: false, to: at(0) },
  ];
}

const STEPS = loopOf();

export const PLUG: ComboRule<Plug> = {
  key: "plug",
  label: "PULL ONCE THE PARTNER HAS PRESSED",
  says: "pulled the whole way only after the partner has pressed their button; there first, it is thrown back",
  like: "THE LAMPREY's tail in a plug, pulled once the partner has pressed back the button its teeth had",
  fresh: () => ({ pull: freshPull(SHAPE), taken: 0, pressed: false, early: 0, since: 0 }),
  press(s, at) {
    if (!press(SHAPE, s.pull, at)) return;
    s.taken = 0;
    s.pressed = false;
  },
  move(s, at) {
    move(SHAPE, s.pull, at, STRAY);
    if (s.pull.phase !== "full" || s.pressed) return;
    throwBack(s.pull);
    s.early++;
  },
  lift: (s) => lift(SHAPE, s.pull, "refuse"),
  tick(s, dt) {
    tick(SHAPE, s.pull, dt);
    s.since += dt;
    if (s.pull.phase !== "held") return;
    s.taken += dt;
    if (!s.pressed && s.taken >= PRESSES) {
      s.pressed = true;
      s.since = 0;
    }
  },
  paint(ctx, s, _look, time) {
    const r = LAB_KNOB * 1.2;
    const asking = s.pull.phase === "held" || s.pull.phase === "full";
    if (s.pressed && asking) {
      drawMarkHeld(ctx, BUTTON.x, BUTTON.y, r, time);
      drawVerdictRing(ctx, BUTTON.x, BUTTON.y, r, { good: true, age: s.since });
    } else {
      drawMarkTheirs(ctx, BUTTON.x, BUTTON.y, r, time);
      drawMarkWait(ctx, BUTTON.x, BUTTON.y, r, time);
    }
    const p = s.pull;
    const tone = toneOf(p);
    const after = afterOf(p, strayReach(STRAY));
    const q = pullTrackPoint(SHAPE.track, p.at);
    drawPullTrack(ctx, SHAPE.track, { ...tone, held: asking, origin: 0, at: p.at, time, after });
    drawPullKnob(ctx, knobAt(SHAPE, p), LAB_KNOB, {
      ...tone,
      held: asking,
      time,
      way: { dx: q.dx, dy: q.dy },
      after,
    });
  },
  state(s) {
    if (s.pull.verdict === "refused" && s.pull.from.at > 0.9)
      return "BEFORE THE PRESS · THROWN BACK";
    if (s.pull.verdict) return VERDICT_WORDS[s.pull.verdict] ?? "";
    if (s.pull.phase !== "held") return "WAITING";
    return s.pressed ? "PULLING · PRESSED" : "PULLING · THE PARTNER HAS NOT PRESSED";
  },
  tally: (s) => ({
    counted: s.pull.counted,
    refused: s.pull.refused + s.early,
    strayed: s.pull.strayed,
  }),
  thumb: (t) => scriptedThumb(STEPS, t, smoothstep),
  loop: STEPS[STEPS.length - 1]?.until ?? 1,
};
