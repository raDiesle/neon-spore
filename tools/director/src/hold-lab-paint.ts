import { PALETTE } from "@neon-spore/render";
import { type HoldLook, viewOf } from "./hold-goo/view.js";
import { HOLD_AT, type HoldAsk, type LabHold, SLIP_REACH } from "./hold-lab-rule.js";
import { paintField } from "./pull-lab-paint.js";

/**
 * One frame of the HOLD LAB (`hold-lab.ts`): the PULL LAB's empty field, the
 * look's mark in its middle, and — for a look with no picture of its own for
 * the limit — the faint ring a thumb must stay inside, red while a slip is
 * shown. No finger over it and no word on the field, as in the PULL LAB: the
 * bar's readout says the verdict.
 */

export interface HoldFrame {
  hold: LabHold;
  ask: HoldAsk;
  look: HoldLook;
  time: number;
}

export function paintHoldLab(ctx: CanvasRenderingContext2D, f: HoldFrame): void {
  paintField(ctx);
  if (!f.look.ownsEdge) paintLimit(ctx, f.hold);
  ctx.save();
  f.look.paint(viewOf(ctx, f.hold, f.ask, f.time));
  ctx.restore();
}

function paintLimit(ctx: CanvasRenderingContext2D, h: LabHold): void {
  const slipped = h.verdict === "slipped";
  ctx.save();
  ctx.strokeStyle = slipped ? PALETTE.red : PALETTE.dim;
  ctx.globalAlpha = slipped ? 0.4 : 0.22;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 4]);
  ctx.beginPath();
  ctx.arc(HOLD_AT.x, HOLD_AT.y, SLIP_REACH, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
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
