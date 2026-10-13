import { text } from "./gestures-page.js";
import { HOLD_R, SLIP_REACH } from "./hold-lab-rule.js";
import { RUB_LOOKS } from "./rub-goo/index.js";
import { freshDriving, loopOf, stepAuto } from "./rub-lab-auto.js";
import { paintRubLab } from "./rub-lab-paint.js";
import { freshRub, type LabRub, RUB_AT, type RubAsk, type RubSeats, tick } from "./rub-lab-rule.js";

/**
 * **EVERY LOOK, EVERY STATE** — THE RUB LAB's sheet, as THE PRESS LAB's is:
 * one row per look, one column per moment of AUTO's loop, each cell the lab's
 * own frame run from a fresh mark at a fixed step — the same every time it is
 * drawn, and never a mock. The moments are found by running the loop, not
 * written down, so they land on the turn they name whatever its timing.
 */

const STEP = 1 / 60;

/** The mark as AUTO leaves it `seconds` into `ask`'s loop. */
export function rubAt(ask: RubAsk, seats: RubSeats, seconds: number): LabRub {
  const h = freshRub();
  const d = freshDriving();
  for (let t = 0; t < seconds; t += STEP) {
    stepAuto(h, ask, seats, t, STEP, d);
    tick(h, STEP);
  }
  return h;
}

/** When each thing first happens in one run of the loop. */
function landmarks(ask: RubAsk, seats: RubSeats) {
  const h = freshRub();
  const d = freshDriving();
  const at: Record<string, number> = {};
  const loop = loopOf(ask, seats);
  const half = Math.max(1, Math.floor(ask.turns / 2));
  for (let t = 0; t < loop.end; t += STEP) {
    const was = { done: h.done, counted: h.counted, lapsed: h.lapsed, alone: h.alone };
    stepAuto(h, ask, seats, t, STEP, d);
    tick(h, STEP);
    const first = (k: string) => {
      at[k] ??= t;
    };
    if (h.done === 1 && was.done === 0 && h.counted === 0) first("one");
    if (h.done === half && was.done < half && h.counted === 0) first("half");
    if (h.done === ask.turns - 1 && was.done < ask.turns - 1) first("left");
    if (h.counted > was.counted) first("counted");
    if (h.alone > was.alone) first("alone");
    if (h.lapsed > was.lapsed) first("lapsed");
  }
  return at;
}

/** The moments of `ask`'s loop the sheet shows, and what each is. */
export function rubMoments(ask: RubAsk, seats: RubSeats): { at: number; label: string }[] {
  const l = loopOf(ask, seats);
  const m = landmarks(ask, seats);
  const moments = [
    { at: 0.06, label: "COMING IN" },
    { at: 0.46, label: "WAITING · WAGGING" },
  ];
  const put = (k: string, dt: number, label: string) => {
    const t = m[k];
    if (t !== undefined) moments.push({ at: t + dt, label });
  };
  put("one", 0.04, "1ST TURN · SWISH");
  if (ask.turns > 2) put("half", 0.1, `${Math.floor(ask.turns / 2)} DONE`);
  put("left", 0.1, "ONE LEFT");
  put("counted", 0.1, "COUNTED · FIZZING");
  put("counted", 0.45, "BOILING AWAY");
  moments.push({ at: l.second - 0.05, label: "A FRESH ONE IN" });
  if (seats === "both") put("alone", 0.03, "ALONE · COUNTS NOTHING");
  put("lapsed", -0.2, "STILL · NEARLY LAPSED");
  put("lapsed", 0.08, "LAPSED");
  put("lapsed", 0.35, "DRAINING RED");
  return moments.sort((a, b) => a.at - b.at);
}

/** The box round the mark, with room for the swishes, the notches and the seat lights. */
const PAD = SLIP_REACH + HOLD_R * 0.6;
const CROP = { x: RUB_AT.x - PAD, y: RUB_AT.y - PAD * 1.4, w: PAD * 2, h: PAD * 2.4 };

function cell(ask: RubAsk, seats: RubSeats, look: number, seconds: number, cssW: number) {
  const s = cssW / CROP.w;
  const dpr = Math.min(4, 2 * (window.devicePixelRatio || 1));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(CROP.w * s * dpr);
  canvas.height = Math.round(CROP.h * s * dpr);
  canvas.style.width = `${CROP.w * s}px`;
  canvas.style.height = `${CROP.h * s}px`;
  const ctx = canvas.getContext("2d");
  const l = RUB_LOOKS[look];
  if (!ctx || !l) return canvas;
  const k = s * dpr;
  ctx.setTransform(k, 0, 0, k, -CROP.x * k, -CROP.y * k);
  paintRubLab(ctx, { rub: rubAt(ask, seats, seconds), ask, seats, look: l, time: seconds });
  return canvas;
}

/** The whole sheet for one number of turns, `cssW` wide per cell. */
export function rubSheet(ask: RubAsk, seats: RubSeats, cssW = 110): HTMLElement {
  const moments = rubMoments(ask, seats);
  const grid = document.createElement("div");
  grid.className = "pull-lab-sheet";
  grid.style.gridTemplateColumns = `auto repeat(${moments.length}, ${cssW}px)`;
  grid.appendChild(text("span", ask.label, "pull-lab-sheet-corner"));
  for (const m of moments) grid.appendChild(text("span", m.label, "pull-lab-sheet-head"));
  RUB_LOOKS.forEach((look, i) => {
    grid.appendChild(text("span", look.name.toUpperCase(), "pull-lab-sheet-look"));
    for (const m of moments) grid.appendChild(cell(ask, seats, i, m.at, cssW));
  });
  return grid;
}
