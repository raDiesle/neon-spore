import { STEPS_PRESS } from "./press-goo/index.js";
import { viewOf } from "./press-goo/view.js";
import type { LabPress, PressAsk } from "./press-lab-rule.js";
import { paintField } from "./pull-lab-paint.js";

/**
 * One frame of THE PRESS LAB (`press-lab.ts`): the PULL LAB's empty field and
 * STEPS' drop in its middle. No finger over it and no word on the field,
 * as in THE HOLD LAB: the bar's readout says the verdict.
 */

export interface PressFrame {
  press: LabPress;
  ask: PressAsk;
  time: number;
}

export function paintPressLab(ctx: CanvasRenderingContext2D, f: PressFrame): void {
  paintField(ctx);
  ctx.save();
  STEPS_PRESS.paint(viewOf(ctx, f.press, f.ask, f.time));
  ctx.restore();
}

/** The bar's readout: the state, how many are pressed, and what the marks have come to. */
export function pressReadout(h: LabPress, ask: PressAsk): string {
  const state =
    h.verdict === "counted"
      ? "COUNTED"
      : h.verdict === "lapsed"
        ? "TOO SLOW · LAPSED"
        : h.down && h.done > 0
          ? "RESTING · LIFT AND PRESS AGAIN"
          : "WAITING";
  const n = h.waiting ? ask.times : h.done;
  return `${state} · ${n}/${ask.times} · COUNTED ${h.counted} · LAPSED ${h.lapsed} · OFF MARK ${h.missed}`;
}
