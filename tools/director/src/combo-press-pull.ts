import { drawPullKnob, drawPullTrack, pullTrackPoint, smoothstep } from "@neon-spore/render";
import { drawVerdictRing } from "../../../packages/render/src/grip-verdict.js";
import { drawMarkTheirs, drawMarkWait } from "../../../packages/render/src/mark-feedback.js";
import { drawMarkHeld } from "../../../packages/render/src/mark-progress.js";
import type { ComboRule, ThumbStep } from "./combo-kinds.js";
import { scriptedThumb } from "./combo-kinds.js";
import { downShape } from "./combo-lab-rule.js";
import { FRESH_AFTER } from "./hold-lab-rule.js";
import { afterOf, toneOf, VERDICT_WORDS } from "./pull-lab-paint.js";
import { freshPull, knobAt, type LabPull, lift, move, press, tick } from "./pull-lab-rule.js";
import { LAB_KNOB, LAB_TILE, LAB_W } from "./pull-lab-shapes.js";
import { strayReach } from "./pull-lab-stray.js";

/**
 * **PRESS, THEN PULL**, in THE COMBO LAB — THE LAMPREY's tail in a `plug`
 * (`sim/lamprey-plug.ts`): the partner presses their button, and only then
 * does this seat's pull appear, the PULL LAB's own, to be taken the whole
 * way. Before the press there is nothing to take. It replaces PULL ONCE THE
 * PARTNER HAS PRESSED, whose knob could be taken at once and was thrown back
 * if it got to the end first — the owner, 12 October 2026: *this logic should
 * just not exist in game as its too difficult to understand. instead the
 * player presses, than the visual of pull appears - easy like that.*
 *
 * The partner, the lab's hand, presses `PRESSES` seconds after each round
 * begins. Their button is drawn as the game draws a mark only the partner is
 * asked — the turning ring and the waiting clock — then green once pressed
 * (`drawMarkHeld`), and the knob comes in.
 */

interface PressPull {
  pull: LabPull;
  /** Seconds since the round began, and whether the partner has pressed in it. */
  wait: number;
  pressed: boolean;
  /** Seconds since the partner's press, for its flash. */
  since: number;
}

const PRESSES = 1.0;
const SHAPE = downShape(LAB_W * 0.3);
const BUTTON = { x: LAB_W * 0.72, y: LAB_TILE * 6 };
const STRAY = "half";

/** AUTO: a pull let go short, refused; then the whole way, counted. */
function loopOf(): ThumbStep[] {
  const at = (k: number) => {
    const q = pullTrackPoint(SHAPE.track, k);
    return { x: q.x, y: q.y };
  };
  const steps: [number, boolean, { x: number; y: number }][] = [
    [1.3, false, at(0)],
    [0.15, true, at(0)],
    [0.35, true, at(0.4)],
    [1.6, false, at(0)],
    [0.15, true, at(0)],
    [0.6, true, at(1)],
    [0.2, true, at(1)],
    [1.4, false, at(0)],
  ];
  let until = 0;
  return steps.map(([d, down, to]) => {
    until += d;
    return { until, down, to };
  });
}

const STEPS = loopOf();

export const PRESS_PULL: ComboRule<PressPull> = {
  key: "presspull",
  label: "PRESS, THEN PULL",
  says: "the partner presses their button, and only then does the pull appear, to be taken the whole way",
  like: "THE LAMPREY's tail in a plug, there once the partner has pressed back the button its teeth had",
  fresh: () => ({ pull: freshPull(SHAPE), wait: 0, pressed: false, since: 0 }),
  press(s, at) {
    if (s.pressed) press(SHAPE, s.pull, at);
  },
  move: (s, at) => move(SHAPE, s.pull, at, STRAY),
  lift: (s) => lift(SHAPE, s.pull, "refuse"),
  tick(s, dt) {
    tick(SHAPE, s.pull, dt);
    s.wait += dt;
    s.since += dt;
    const p = s.pull;
    if (!s.pressed && s.wait >= PRESSES) {
      // The press brings the knob: a fresh one, coming in now.
      s.pressed = true;
      s.since = 0;
      s.pull = { ...freshPull(SHAPE), counted: p.counted, refused: p.refused, strayed: p.strayed };
      return;
    }
    // Counted and let go: the next round, the button waiting again.
    if (s.pressed && p.last === "counted" && p.phase !== "full" && p.lifted >= FRESH_AFTER) {
      s.pressed = false;
      s.wait = 0;
    }
  },
  paint(ctx, s, _look, time) {
    const r = LAB_KNOB * 1.2;
    if (s.pressed) {
      drawMarkHeld(ctx, BUTTON.x, BUTTON.y, r, time);
      drawVerdictRing(ctx, BUTTON.x, BUTTON.y, r, { good: true, age: s.since });
    } else {
      drawMarkTheirs(ctx, BUTTON.x, BUTTON.y, r, time);
      drawMarkWait(ctx, BUTTON.x, BUTTON.y, r, time);
      return;
    }
    const p = s.pull;
    const tone = toneOf(p);
    const held = p.phase === "held" || p.phase === "full";
    const after = afterOf(p, strayReach(STRAY));
    const q = pullTrackPoint(SHAPE.track, p.at);
    drawPullTrack(ctx, SHAPE.track, { ...tone, held, origin: 0, at: p.at, time, after });
    drawPullKnob(ctx, knobAt(SHAPE, p), LAB_KNOB, {
      ...tone,
      held,
      time,
      way: { dx: q.dx, dy: q.dy },
      after,
    });
  },
  state(s) {
    if (!s.pressed) return "THE PARTNER HAS NOT PRESSED · NO PULL YET";
    if (s.pull.verdict) return VERDICT_WORDS[s.pull.verdict] ?? "";
    return s.pull.phase === "held" ? "PULLING" : "PRESSED · PULL IT";
  },
  tally: (s) => ({ counted: s.pull.counted, refused: s.pull.refused, strayed: s.pull.strayed }),
  thumb: (t) => scriptedThumb(STEPS, t, smoothstep),
  loop: STEPS[STEPS.length - 1]?.until ?? 1,
};
