import {
  drawPullKnob,
  drawPullTrack,
  PULL_TRACK_W,
  pullTrackPoint,
  smoothstep,
} from "@neon-spore/render";
import type { ComboRule, ThumbStep } from "./combo-kinds.js";
import { scriptedThumb } from "./combo-kinds.js";
import { viewOf } from "./hold-goo/view.js";
import {
  FRESH_AFTER,
  freshHold,
  HOLD_AT,
  HOLD_R,
  type HoldAsk,
  holdAsk,
  type LabHold,
  lift as liftHold,
  move as moveHold,
  press as pressHold,
  tick as tickHold,
} from "./hold-lab-rule.js";
import { afterOf, toneOf, VERDICT_WORDS } from "./pull-lab-paint.js";
import {
  freshPull,
  knobAt,
  type LabPull,
  lift as liftPull,
  move as movePull,
  press as pressPull,
  tick as tickPull,
} from "./pull-lab-rule.js";
import { LAB_KNOB, LAB_TILE, type LabShape } from "./pull-lab-shapes.js";
import { strayReach } from "./pull-lab-stray.js";

/**
 * **HOLD, THEN PULL**, in THE COMBO LAB — two gestures one after the other,
 * each whole on its own (the owner, 12 October 2026, of HOLD, THEN SWIPE:
 * *should be a separate "hold", then another "pull" appears after it on same
 * place*). A mark held for its beats — the HOLD LAB's rule and look — is
 * counted as a hold; once its count has played, a pull knob comes in where the
 * mark was, and a fresh press takes it the asked way, the PULL LAB's rule.
 * The whole way counts the action. Let go of the hold early, it is refused
 * and the hold is asked again; a short pull is refused and the knob waits
 * where it came in.
 */

interface HoldThenPull {
  stage: "hold" | "pull" | "done";
  hold: LabHold;
  pull: LabPull;
  /** Seconds since the hold was counted, for the knob coming in. */
  since: number;
}

const ASK: HoldAsk = holdAsk("2");
/** A straight pull right from the mark, three and a half tiles. */
const SHAPE: LabShape = {
  key: "right",
  label: "RIGHT",
  direction: "path",
  like: "",
  track: {
    pts: [HOLD_AT, { x: HOLD_AT.x + LAB_TILE * 3.5, y: HOLD_AT.y }],
    w: LAB_KNOB * PULL_TRACK_W,
  },
  origin: 0,
};
const STRAY = "half";

const fresh = (): HoldThenPull => ({
  stage: "hold",
  hold: freshHold(),
  pull: freshPull(SHAPE),
  since: 0,
});

/** The knob has come in where the mark was, and can be taken. */
const knobIn = (s: HoldThenPull): boolean => s.stage !== "hold" && s.since >= FRESH_AFTER;

/** AUTO: a hold let go early; a hold, then a short pull; the pull again, the whole way. */
function loopOf(): ThumbStep[] {
  const T = ASK.beats * (60 / 96);
  const at = (k: number) => {
    const q = pullTrackPoint(SHAPE.track, k);
    return { x: q.x, y: q.y };
  };
  const h = at(0);
  const steps: [number, boolean, { x: number; y: number }][] = [
    [0.8, false, h],
    [0.6, true, h],
    [1.0, false, h],
    [T + 0.15, true, h],
    [0.7, false, h],
    [0.15, true, h],
    [0.35, true, at(0.45)],
    [1.6, false, h],
    [0.15, true, h],
    [0.6, true, at(1)],
    [0.2, true, at(1)],
    [1.2, false, h],
  ];
  let until = 0;
  return steps.map(([d, down, to]) => {
    until += d;
    return { until, down, to };
  });
}

const STEPS = loopOf();

export const HOLD_THEN_PULL: ComboRule<HoldThenPull> = {
  key: "thenpull",
  label: "HOLD, THEN PULL",
  says: "a mark held for two beats, and then a pull that comes in where it was, taken the whole way",
  like: "THE SLING's cords, drawn for their beats — the game looses them with a swipe today",
  fresh,
  press(s, at) {
    if (s.stage === "hold") pressHold(s.hold, at);
    else if (s.stage === "pull" && knobIn(s)) pressPull(SHAPE, s.pull, at);
  },
  move(s, at) {
    if (s.stage === "hold") moveHold(s.hold, at);
    else movePull(SHAPE, s.pull, at, STRAY);
    if (s.stage === "pull" && s.pull.phase === "full") s.stage = "done";
  },
  lift(s) {
    liftHold(s.hold);
    liftPull(SHAPE, s.pull, "refuse");
  },
  tick(s, dt) {
    tickHold(s.hold, ASK, dt);
    tickPull(SHAPE, s.pull, dt);
    s.since += dt;
    if (s.stage === "pull" && s.since >= FRESH_AFTER && s.since - dt < FRESH_AFTER) s.pull.born = 0;
    if (s.stage === "hold" && s.hold.phase === "done") {
      // The hold is whole on its own; the pull comes in after its count.
      s.stage = "pull";
      s.since = 0;
      s.pull = {
        ...freshPull(SHAPE),
        counted: s.pull.counted,
        refused: s.pull.refused,
        strayed: s.pull.strayed,
      };
      return;
    }
    if (s.stage === "done" && s.pull.phase !== "full" && s.pull.lifted >= FRESH_AFTER) {
      const { refused, slipped } = s.hold;
      s.stage = "hold";
      s.hold = { ...freshHold(), refused, slipped };
    }
  },
  paint(ctx, s, look, time) {
    const v = viewOf(ctx, s.hold, ASK, time);
    ctx.save();
    // In the pull's turn only the hold's count is left, playing out under the knob.
    if (s.stage === "hold") look.paint({ ...v, r: HOLD_R });
    else if (v.ending !== null) look.paint({ ...v, r: HOLD_R, mark: false });
    ctx.restore();
    if (!knobIn(s)) return;
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
    const h = s.hold;
    if (s.stage === "hold") {
      if (h.verdict === "refused") return "LET GO EARLY · REFUSED";
      if (h.verdict === "slipped") return "OFF THE MARK";
      return h.phase === "held" ? "HOLDING" : "WAITING";
    }
    if (s.pull.verdict) return VERDICT_WORDS[s.pull.verdict] ?? "";
    if (!knobIn(s)) return "HELD · THE PULL COMES IN";
    return s.pull.phase === "held" ? "PULLING" : "HELD · PULL IT";
  },
  tally: (s) => ({
    counted: s.pull.counted,
    refused: s.hold.refused + s.pull.refused,
    strayed: s.hold.slipped + s.pull.strayed,
  }),
  thumb: (t) => scriptedThumb(STEPS, t, smoothstep),
  loop: STEPS[STEPS.length - 1]?.until ?? 1,
};
