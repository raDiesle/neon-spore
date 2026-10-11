import { text } from "./gestures-page.js";
import { HOLD_LOOKS } from "./hold-goo/index.js";
import type { HoldLook } from "./hold-goo/view.js";
import { autoThumb, loopOf } from "./hold-lab-auto.js";
import { paintHoldLab } from "./hold-lab-paint.js";
import {
  freshHold,
  HOLD_AT,
  HOLD_R,
  type HoldAsk,
  type LabHold,
  lift,
  move,
  press,
  SLIP_REACH,
  tick,
} from "./hold-lab-rule.js";

/**
 * **EVERY LOOK, EVERY STATE** — the HOLD LAB's comparison sheet, as the PULL
 * LAB's (`pull-lab-sheet.ts`): one row per look, one column per moment of
 * AUTO's loop, each cell the lab's own frame run from a fresh hold at a fixed
 * step — the same every time it is drawn, and never a mock.
 */

/** The moments of `ask`'s loop the sheet shows, and what each is. */
export function holdMoments(ask: HoldAsk): { at: number; label: string }[] {
  const l = loopOf(ask);
  return [
    { at: 0.06, label: "COMING IN" },
    { at: 0.7, label: "WAITING" },
    { at: l.take + 0.1, label: "TAKEN · SQUISH" },
    { at: l.take + l.T * 0.5, label: "HELD · HALF" },
    { at: l.take + l.T * 0.9, label: "HELD · NEARLY" },
    { at: l.counted + 0.1, label: "COUNTED · FIZZING" },
    { at: l.counted + 0.45, label: "BOILING AWAY" },
    { at: l.letGo + 0.6, label: "A FRESH ONE IN" },
    { at: l.early + 0.08, label: "LET GO EARLY" },
    { at: l.early + 0.4, label: "DRAINING RED" },
    { at: l.sliding, label: "SLIDING OFF" },
    { at: l.slipAt + 0.15, label: "OFF THE MARK" },
  ];
}

const STEP = 1 / 60;

/** The hold as AUTO leaves it `seconds` into `ask`'s loop. */
export function holdAt(ask: HoldAsk, seconds: number): LabHold {
  const h = freshHold();
  let down = false;
  for (let t = 0; t < seconds; t += STEP) {
    const th = autoThumb(ask, t);
    if (th.down && !down) press(h, th.at);
    if (th.down) move(h, th.at);
    if (!th.down && down) lift(h);
    down = th.down;
    tick(h, ask, STEP);
  }
  return h;
}

/** The box round the mark, with room for the limit and a bubble rising. */
const PAD = SLIP_REACH + HOLD_R * 0.4;
const CROP = { x: HOLD_AT.x - PAD, y: HOLD_AT.y - PAD * 1.15, w: PAD * 2, h: PAD * 2.15 };

function cell(ask: HoldAsk, look: HoldLook, seconds: number, cssW: number): HTMLCanvasElement {
  const s = cssW / CROP.w;
  const dpr = Math.min(4, 2 * (window.devicePixelRatio || 1));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(CROP.w * s * dpr);
  canvas.height = Math.round(CROP.h * s * dpr);
  canvas.style.width = `${CROP.w * s}px`;
  canvas.style.height = `${CROP.h * s}px`;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const k = s * dpr;
  ctx.setTransform(k, 0, 0, k, -CROP.x * k, -CROP.y * k);
  paintHoldLab(ctx, { hold: holdAt(ask, seconds), ask, look, time: seconds });
  return canvas;
}

/** The whole sheet for one hold length, `cssW` wide per cell. */
export function holdSheet(ask: HoldAsk, cssW = 110): HTMLElement {
  const moments = holdMoments(ask);
  const grid = document.createElement("div");
  grid.className = "pull-lab-sheet";
  grid.style.gridTemplateColumns = `auto repeat(${moments.length}, ${cssW}px)`;
  grid.appendChild(text("span", ask.label, "pull-lab-sheet-corner"));
  for (const m of moments) grid.appendChild(text("span", m.label, "pull-lab-sheet-head"));
  for (const look of HOLD_LOOKS) {
    grid.appendChild(text("span", look.name.toUpperCase(), "pull-lab-sheet-look"));
    for (const m of moments) grid.appendChild(cell(ask, look, m.at, cssW));
  }
  return grid;
}
