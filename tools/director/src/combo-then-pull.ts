import type { Point } from "@neon-spore/content";
import {
  drawPullKnob,
  drawPullTrack,
  PULL_TRACK_W,
  pullTrackPoint,
  smoothstep,
} from "@neon-spore/render";
import type { ComboRule, ThumbStep } from "./combo-kinds.js";
import { scriptedThumb } from "./combo-kinds.js";
import type { HoldLook } from "./hold-goo/view.js";
import { FRESH_AFTER, HOLD_AT } from "./hold-lab-rule.js";
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
 * **One gesture, then a pull in its place** — THE COMBO LAB's `chain` kind
 * (`combo-kinds.ts`): two gestures one after the other, each whole on its own
 * (the owner, 12 October 2026, of HOLD, THEN SWIPE: *should be a separate
 * "hold", then another "pull" appears after it on same place*; 14 October, of
 * PRESS, THEN PULL: *first showing a "press" and then it disappears finishing
 * it and then showing a new independant "pull" next*).
 *
 * The first gesture — a hold, a press — is its own lab's rule and look, on
 * the mark in the middle of the field. Once it is counted its ending plays
 * out and it is gone; a pull knob comes in where the mark was, and a fresh
 * press takes it to the right, the PULL LAB's rule. The whole way counts the
 * action. The first refused is asked again; a short pull is refused and the
 * knob waits where it came in. After a count a fresh first gesture is asked.
 */

/** The gesture before the pull: its own rule, its own look. */
export interface FirstGesture<F> {
  fresh(): F;
  /** A fresh one with `old`'s tallies kept. */
  again(old: F): F;
  press(f: F, at: Point): void;
  move(f: F, at: Point): void;
  lift(f: F): void;
  tick(f: F, dt: number): void;
  /** Counted: the pull's turn. */
  counted(f: F): boolean;
  /** `alone` in its own turn, the mark up; otherwise only its count playing out under the knob. */
  paint(ctx: CanvasRenderingContext2D, f: F, look: HoldLook, time: number, alone: boolean): void;
  /** The state in its own turn, in two or three words. */
  state(f: F): string;
  refused(f: F): number;
  strayed(f: F): number;
  /** The word the bar puts before the pull's: HELD, PRESSED. */
  word: string;
  /** AUTO, on the mark, until one is counted and the thumb is off: seconds, and whether down. */
  steps: readonly [number, boolean][];
}

export interface Chain<F> {
  stage: "first" | "pull" | "done";
  first: F;
  pull: LabPull;
  /** Seconds since the first was counted, for the knob coming in. */
  since: number;
}

/** A straight pull right from the mark, three and a half tiles. */
export const THEN_PULL_SHAPE: LabShape = {
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
const SHAPE = THEN_PULL_SHAPE;
const STRAY = "half";

/** The knob has come in where the mark was, and can be taken. */
const knobIn = <F>(s: Chain<F>): boolean => s.stage !== "first" && s.since >= FRESH_AFTER;

/** AUTO: the first gesture's own steps; then a short pull, and the pull again, the whole way. */
function loopOf(first: readonly [number, boolean][]): ThumbStep[] {
  const at = (k: number) => {
    const q = pullTrackPoint(SHAPE.track, k);
    return { x: q.x, y: q.y };
  };
  const h = at(0);
  const steps: [number, boolean, Point][] = [
    ...first.map(([d, down]): [number, boolean, Point] => [d, down, h]),
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

export function thenPull<F>(
  first: FirstGesture<F>,
  meta: { key: string; label: string; says: string; like: string },
): ComboRule<Chain<F>> {
  const steps = loopOf(first.steps);
  return {
    ...meta,
    kind: "chain",
    fresh: () => ({ stage: "first", first: first.fresh(), pull: freshPull(SHAPE), since: 0 }),
    press(s, at) {
      if (s.stage === "first") first.press(s.first, at);
      else if (s.stage === "pull" && knobIn(s)) pressPull(SHAPE, s.pull, at);
    },
    move(s, at) {
      if (s.stage === "first") first.move(s.first, at);
      else movePull(SHAPE, s.pull, at, STRAY);
      if (s.stage === "pull" && s.pull.phase === "full") s.stage = "done";
    },
    lift(s) {
      first.lift(s.first);
      liftPull(SHAPE, s.pull, "refuse");
    },
    tick(s, dt) {
      first.tick(s.first, dt);
      tickPull(SHAPE, s.pull, dt);
      s.since += dt;
      if (s.stage === "pull" && s.since >= FRESH_AFTER && s.since - dt < FRESH_AFTER)
        s.pull.born = 0;
      if (s.stage === "first" && first.counted(s.first)) {
        // The first is whole on its own; the pull comes in after its count.
        const { counted, refused, strayed } = s.pull;
        s.stage = "pull";
        s.since = 0;
        s.pull = { ...freshPull(SHAPE), counted, refused, strayed };
        return;
      }
      if (s.stage === "done" && s.pull.phase !== "full" && s.pull.lifted >= FRESH_AFTER) {
        s.stage = "first";
        s.first = first.again(s.first);
      }
    },
    paint(ctx, s, look, time) {
      first.paint(ctx, s.first, look, time, s.stage === "first");
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
      if (s.stage === "first") return first.state(s.first);
      if (s.pull.verdict) return VERDICT_WORDS[s.pull.verdict] ?? "";
      if (!knobIn(s)) return `${first.word} · THE PULL COMES IN`;
      return s.pull.phase === "held" ? "PULLING" : `${first.word} · PULL IT`;
    },
    tally: (s) => ({
      counted: s.pull.counted,
      refused: first.refused(s.first) + s.pull.refused,
      strayed: first.strayed(s.first) + s.pull.strayed,
    }),
    thumb: (t) => scriptedThumb(steps, t, smoothstep),
    loop: steps[steps.length - 1]?.until ?? 1,
  };
}
