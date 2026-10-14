import { PALETTE } from "@neon-spore/render";
import { SHADE } from "../../../packages/render/src/goo-press.js";
import { paintField } from "./pull-lab-paint.js";
import { ZIGZAG_RUB } from "./rub-goo/index.js";
import type { RubView } from "./rub-goo/view.js";
import { viewOf } from "./rub-goo/view.js";
import { LAPSE, type LabRub, type RubAsk, type RubSeats, TOGETHER } from "./rub-lab-rule.js";

/**
 * One frame of THE RUB LAB (`rub-lab.ts`): the PULL LAB's empty field and
 * ZIGZAG's drop in its middle. No finger over it and no word on the field, as
 * in THE PRESS LAB — but for BOTH AT ONCE, whose two seat lights stand over
 * the drop, each lit while its seat is rubbing, so the eye can see the other
 * seat a turn has to be made with.
 */

export interface RubFrame {
  rub: LabRub;
  ask: RubAsk;
  seats: RubSeats;
  time: number;
}

export function paintRubLab(ctx: CanvasRenderingContext2D, f: RubFrame): void {
  paintField(ctx);
  ctx.save();
  const v = viewOf(ctx, f.rub, f.ask, f.seats, f.time);
  ZIGZAG_RUB.paint(v);
  if (f.seats === "both") seatLights(v, rubbingNow(f.rub));
  ctx.restore();
}

/** Whether this seat's thumb is rubbing now: on the mark and turning. */
const rubbingNow = (h: LabRub): boolean =>
  h.down && h.onIt && Math.min(h.turned, h.lonely) < TOGETHER;

/** The two seats over the drop, lit while each rubs, and the bar between them
 * lit while both are. */
function seatLights(v: RubView, mine: boolean): void {
  const { ctx, at, r } = v;
  const y = at.y - r * 2.7;
  const seats = [
    { x: at.x - r * 1.5, lit: mine ? 1 : 0, word: "YOU" },
    { x: at.x + r * 1.5, lit: v.partner, word: "OTHER" },
  ];
  const both = Math.min(seats[0]?.lit ?? 0, seats[1]?.lit ?? 0);
  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = both > 0.5 ? PALETTE.good : PALETTE.dim;
  ctx.globalAlpha = 0.4 + 0.6 * both;
  ctx.lineWidth = Math.max(1, r * 0.12);
  ctx.beginPath();
  ctx.moveTo(at.x - r * 1.0, y);
  ctx.lineTo(at.x + r * 1.0, y);
  ctx.stroke();
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.font = `700 ${(r * 0.42).toFixed(1)}px "Courier New",monospace`;
  for (const s of seats) {
    ctx.globalAlpha = 1;
    ctx.fillStyle = s.lit > 0.5 ? PALETTE.good : SHADE;
    ctx.strokeStyle = s.lit > 0.5 ? PALETTE.goodRim : PALETTE.dim;
    ctx.lineWidth = Math.max(1, r * 0.08);
    ctx.beginPath();
    ctx.arc(s.x, y, r * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = s.lit > 0.5 ? PALETTE.good : PALETTE.dim;
    ctx.fillText(s.word, s.x, y + r * 0.6);
  }
  ctx.restore();
}

/** The bar's readout: the state, how many turns are done, and what the marks have come to. */
export function rubReadout(h: LabRub, ask: RubAsk, seats: RubSeats): string {
  const alone = seats === "both" && h.down && h.onIt && h.lonely < 0.3 && h.turned > 0.3;
  const state =
    h.verdict === "counted"
      ? "COUNTED"
      : h.verdict === "lapsed"
        ? "TOO SLOW · LAPSED"
        : alone
          ? "ALONE · THE OTHER SEAT IS NOT RUBBING"
          : h.down && h.onIt && h.turned > LAPSE / 2 && h.done > 0
            ? "STILL · KEEP RUBBING"
            : h.down && h.onIt
              ? "RUBBING"
              : "WAITING";
  const n = h.waiting ? ask.turns : h.done;
  const lonely = seats === "both" ? ` · ALONE ${h.alone}` : "";
  return `${state} · ${n}/${ask.turns} · COUNTED ${h.counted} · LAPSED ${h.lapsed}${lonely} · OFF MARK ${h.missed}`;
}
