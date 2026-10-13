import { text } from "./gestures-page.js";
import { HOLD_R, SLIP_REACH } from "./hold-lab-rule.js";
import { PRESS_LOOKS } from "./press-goo/index.js";
import { autoFinger, loopOf, TAP_GAP } from "./press-lab-auto.js";
import { paintPressLab } from "./press-lab-paint.js";
import {
  freshPress,
  type LabPress,
  lift,
  PRESS_AT,
  type PressAsk,
  press,
  tick,
} from "./press-lab-rule.js";

/**
 * **EVERY LOOK, EVERY STATE** — THE PRESS LAB's sheet, as THE HOLD LAB's was
 * while it still had looks to pick from: one row per look, one column per
 * moment of AUTO's loop, each cell the lab's own frame run from a fresh mark
 * at a fixed step — the same every time it is drawn, and never a mock. The
 * first two columns are the ones the owner asked about: what the mark says,
 * untouched, about how many presses it wants.
 */

/** The moments of `ask`'s loop the sheet shows, and what each is. */
export function pressMoments(ask: PressAsk): { at: number; label: string }[] {
  const l = loopOf(ask);
  const n = ask.times;
  const after = (i: number, s: number) => l.take + i * TAP_GAP + s;
  const moments = [
    { at: 0.06, label: "COMING IN" },
    { at: 0.38, label: "WAITING · CALLING" },
    { at: after(0, 0.02), label: "1ST PRESS · POP" },
  ];
  if (n > 1)
    moments.push({ at: after(Math.floor(n / 2) - 1, 0.2), label: `${Math.floor(n / 2)} DONE` });
  if (n > 2) moments.push({ at: after(n - 2, 0.2), label: "ONE LEFT" });
  moments.push(
    { at: l.counted + 0.1, label: "COUNTED · FIZZING" },
    { at: l.counted + 0.45, label: "BOILING AWAY" },
    { at: l.second - 0.05, label: "A FRESH ONE IN" },
  );
  if (n > 1)
    moments.push(
      { at: l.lapseAt - 0.2, label: "RESTING · NEARLY LAPSED" },
      { at: l.lapseAt + 0.08, label: "LAPSED" },
      { at: l.lapseAt + 0.35, label: "DRAINING RED" },
    );
  return moments;
}

const STEP = 1 / 60;

/** The mark as AUTO leaves it `seconds` into `ask`'s loop. */
export function pressAt(ask: PressAsk, seconds: number): LabPress {
  const h = freshPress();
  let down = false;
  for (let t = 0; t < seconds; t += STEP) {
    const f = autoFinger(ask, t);
    if (f.down && !down) press(h, ask, f.at);
    if (!f.down && down) lift(h);
    down = f.down;
    tick(h, STEP);
  }
  return h;
}

/** The box round the mark, with room for PIPS' ring, a pop and a bubble rising. */
const PAD = SLIP_REACH + HOLD_R * 0.4;
const CROP = { x: PRESS_AT.x - PAD, y: PRESS_AT.y - PAD * 1.15, w: PAD * 2, h: PAD * 2.15 };

function cell(ask: PressAsk, look: number, seconds: number, cssW: number): HTMLCanvasElement {
  const s = cssW / CROP.w;
  const dpr = Math.min(4, 2 * (window.devicePixelRatio || 1));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(CROP.w * s * dpr);
  canvas.height = Math.round(CROP.h * s * dpr);
  canvas.style.width = `${CROP.w * s}px`;
  canvas.style.height = `${CROP.h * s}px`;
  const ctx = canvas.getContext("2d");
  const l = PRESS_LOOKS[look];
  if (!ctx || !l) return canvas;
  const k = s * dpr;
  ctx.setTransform(k, 0, 0, k, -CROP.x * k, -CROP.y * k);
  paintPressLab(ctx, { press: pressAt(ask, seconds), ask, look: l, time: seconds });
  return canvas;
}

/** The whole sheet for one number of presses, `cssW` wide per cell. */
export function pressSheet(ask: PressAsk, cssW = 110): HTMLElement {
  const moments = pressMoments(ask);
  const grid = document.createElement("div");
  grid.className = "pull-lab-sheet";
  grid.style.gridTemplateColumns = `auto repeat(${moments.length}, ${cssW}px)`;
  grid.appendChild(text("span", ask.label, "pull-lab-sheet-corner"));
  for (const m of moments) grid.appendChild(text("span", m.label, "pull-lab-sheet-head"));
  PRESS_LOOKS.forEach((look, i) => {
    grid.appendChild(text("span", look.name.toUpperCase(), "pull-lab-sheet-look"));
    for (const m of moments) grid.appendChild(cell(ask, i, m.at, cssW));
  });
  return grid;
}
