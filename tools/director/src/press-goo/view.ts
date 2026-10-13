import type { Point } from "@neon-spore/content";
import { smoothstep } from "@neon-spore/render";
import { ENDING } from "../../../../packages/render/src/goo-moment.js";
import { clamp01 } from "../../../../packages/render/src/goo-noise.js";
import {
  type LabPress,
  nearLapse,
  PRESS_AT,
  PRESS_R,
  type PressAsk,
  VERDICT_SECONDS,
} from "../press-lab-rule.js";

/**
 * **What a PRESS LAB look is told**, read once a frame from the rule's state
 * (`press-lab-rule.ts`), as `hold-goo/view.ts` is the HOLD LAB's. A look draws
 * from this and nothing else, so the sheet and the live lab draw the same thing.
 */
export interface PressView {
  readonly ctx: CanvasRenderingContext2D;
  readonly at: Point;
  readonly r: number;
  readonly time: number;
  readonly ask: PressAsk;
  /** The mark is on the field to be pressed. */
  readonly mark: boolean;
  /** Presses to show done, whole — what is pressed, or a lapse draining back to none. */
  readonly done: number;
  /** The same, smooth: a press steps it up over `STEP`, a lapse drains it over `DRAIN`. */
  readonly shown: number;
  /** Seconds since the last press landed, for its pop. */
  readonly pressed: number;
  /** How near the presses are to lapsing, 0..1. */
  readonly near: number;
  /** Seconds since the mark came in. */
  readonly born: number;
  /** Seconds into a count's ending (FIZZ), while it plays; `null` otherwise. */
  readonly ending: number | null;
  /** Seconds into a lapse, while it is shown; `null` otherwise. */
  readonly failure: number | null;
}

/** Seconds a press takes to step the count shown up, and a lapse to drain it. */
export const STEP = 0.12;
export const DRAIN = 0.5;

/** A look for the one generic press. */
export interface PressLook {
  readonly key: string;
  readonly name: string;
  readonly sentence: string;
  paint(v: PressView): void;
}

export function viewOf(
  ctx: CanvasRenderingContext2D,
  h: LabPress,
  ask: PressAsk,
  time: number,
): PressView {
  const failing = h.last === "lapsed" && h.age < VERDICT_SECONDS;
  const counting = h.last === "counted" && h.age < ENDING;
  let done = h.done;
  let shown = h.done > 0 ? h.done - 1 + smoothstep(clamp01(h.pressed / STEP)) : 0;
  if (failing) {
    shown = h.from * (1 - smoothstep(clamp01(h.age / DRAIN)));
    done = Math.ceil(shown - 1e-6);
  }
  return {
    ctx,
    at: PRESS_AT,
    r: PRESS_R,
    time,
    ask,
    mark: !h.waiting,
    done,
    shown,
    pressed: h.pressed,
    near: nearLapse(h),
    born: h.born,
    ending: counting ? h.age : null,
    failure: failing ? h.age : null,
  };
}
