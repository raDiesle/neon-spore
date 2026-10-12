import type { Point } from "@neon-spore/content";
import type { HoldLook } from "./hold-goo/view.js";

/**
 * **What every combo in THE COMBO LAB is**, whatever its two gestures are:
 * a rule the lab's pointer drives, a frame it paints, a readout for the bar
 * and AUTO's thumb for a loop of it — so the lab (`combo-lab.ts`) knows none
 * of them by name. The registry is `combo-lab-combos.ts`.
 *
 * Each one counts the same three things, so the bar and the tests read them
 * alike: counted, refused (let go too soon, too short, or the wrong way), and
 * off — the thumb off the path or off the mark.
 */
export interface ComboTally {
  counted: number;
  refused: number;
  strayed: number;
}

export interface ComboRule<S = unknown> {
  key: string;
  label: string;
  /** What the action is, in a sentence, and which rows of the CONTROLS page ask it. */
  says: string;
  like: string;
  fresh(): S;
  press(s: S, at: Point): void;
  move(s: S, at: Point): void;
  lift(s: S): void;
  tick(s: S, dt: number): void;
  /** Over the empty field, which the lab paints first. */
  paint(ctx: CanvasRenderingContext2D, s: S, look: HoldLook, time: number): void;
  /** The state, in two or three words, before the tallies. */
  state(s: S): string;
  tally(s: S): ComboTally;
  /** AUTO's thumb `t` seconds into its loop, and how long the loop is. */
  thumb(t: number): { at: Point; down: boolean };
  loop: number;
}

/** The bar's readout: the state, then what the tries have come to. */
export function comboReadout<S>(rule: ComboRule<S>, s: S): string {
  const t = rule.tally(s);
  return `${rule.state(s)} · COUNTED ${t.counted} · REFUSED ${t.refused} · OFF ${t.strayed}`;
}

/** One step of an AUTO loop: until when, whether the thumb is down, and where it is by the end. */
export interface ThumbStep {
  until: number;
  down: boolean;
  to: Point;
}

/**
 * Where a scripted thumb is at `t` in a loop of `steps`: carried smoothly from
 * where the step before left it, wandering a pixel the way a real one does.
 */
export function scriptedThumb(
  steps: readonly ThumbStep[],
  t: number,
  ease: (u: number) => number,
): { at: Point; down: boolean } {
  const end = steps[steps.length - 1]?.until ?? 1;
  const s = ((t % end) + end) % end;
  let start = 0;
  let from = steps[0]?.to ?? { x: 0, y: 0 };
  let step = steps[0] as ThumbStep;
  for (const st of steps) {
    step = st;
    if (s < st.until) break;
    start = st.until;
    from = st.to;
  }
  const u = ease(Math.min(1, (s - start) / Math.max(0.001, step.until - start)));
  const begin = step.down ? from : step.to;
  return {
    at: {
      x: begin.x + (step.to.x - begin.x) * u + 1.2 * Math.sin(s * 3.1),
      y: begin.y + (step.to.y - begin.y) * u + Math.cos(s * 2.3),
    },
    down: step.down,
  };
}
