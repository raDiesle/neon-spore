import { SOAK_HOLD } from "./hold-goo/index.js";
import { viewOf } from "./hold-goo/view.js";
import { drawHoldClock } from "./hold-goo/wait.js";
import { HOLD_AT, HOLD_R, type HoldAsk, type LabHold } from "./hold-lab-rule.js";
import { paintField } from "./pull-lab-paint.js";

/**
 * One frame of the HOLD LAB (`hold-lab.ts`): the PULL LAB's empty field and
 * SOAK's drop in its middle — the one look every hold in the labs wears — with
 * the waiting clock on its shoulder from the moment it is up, as THE COMBO LAB's holds
 * have it (`drawHoldClock`). SOAK draws its own picture of the slip limit, the
 * drop leaning and reddening, so no ring is drawn round it. No finger over it
 * and no word on the field, as in the PULL LAB: the bar's readout says the verdict.
 */

export interface HoldFrame {
  hold: LabHold;
  ask: HoldAsk;
  time: number;
}

export function paintHoldLab(ctx: CanvasRenderingContext2D, f: HoldFrame): void {
  paintField(ctx);
  ctx.save();
  SOAK_HOLD.paint(viewOf(ctx, f.hold, f.ask, f.time));
  ctx.restore();
  if (!f.hold.waiting) drawHoldClock(ctx, HOLD_AT, HOLD_R, 1, f.time);
}

const VERDICT_WORDS: Readonly<Record<string, string>> = {
  counted: "COUNTED",
  refused: "LET GO EARLY · REFUSED",
  slipped: "OFF THE MARK",
};

/** The bar's readout: the state, how much is held, and what the holds have come to. */
export function holdReadout(h: LabHold): string {
  const state = h.verdict ? VERDICT_WORDS[h.verdict] : h.phase === "held" ? "HELD" : "WAITING";
  const done = Math.round(h.fill * 100);
  return `${state} · ${done}% · COUNTED ${h.counted} · REFUSED ${h.refused} · OFF MARK ${h.slipped}`;
}
