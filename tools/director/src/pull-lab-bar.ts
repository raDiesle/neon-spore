import type { Variant } from "../../versus/variant.js";
import { choice, grouped } from "./field-try-bar.js";
import { text } from "./gestures-page.js";
import { labLooks } from "./pull-lab-paint.js";
import { LAB_SHAPES, type LabShape, labShape } from "./pull-lab-shapes.js";
import { type LabTune, tuneChoices } from "./pull-lab-tune.js";

/**
 * The PULL LAB's bar (`pull-lab.ts`): the shape, the look, the speed, what
 * it is tried on and how (`pull-lab-tune.ts`), AUTO and RETRY, and the sheet
 * of every look. It writes its choices into one
 * `LabState` and calls back; `openPullLab` keeps the canvas, the pointer, the
 * clock and the frame, and reads the state each frame.
 */

/** What the bar chooses, read by the lab every frame. */
export interface LabState {
  shape: LabShape;
  look: Variant | null;
  speed: number;
  auto: boolean;
  /** The room shows the sheet of every look rather than the live canvas. */
  sheet: boolean;
  /** The wave it is tried on, the control's size, THE SLOW's loudness. */
  tune: LabTune;
}

/** What the lab does when the bar is pressed. */
export interface LabActions {
  /** A fresh pull on the field: a new shape, AUTO switched, RETRY. */
  reset(): void;
  /** The room drawn again: the live canvas, or the sheet. */
  show(): void;
  /** Another wave, or the empty field, to try the pull on. */
  scene(): void;
  close(): void;
}

export interface LabBar {
  el: HTMLElement;
  readout: HTMLElement;
  /** AUTO on or off, its button lit to match, and a fresh pull. */
  setAuto(on: boolean): void;
  /** The sheet button lit to match `state.sheet`. */
  paintSheet(): void;
}

export function labBar(state: LabState, act: LabActions): LabBar {
  const el = document.createElement("div");
  el.className = "pic-zoom-bar";
  const readout = text("span", "", "try-readout");

  const sheetButton = text("button", "▤ EVERY LOOK, EVERY STATE");
  sheetButton.addEventListener("click", () => {
    state.sheet = !state.sheet;
    act.show();
  });
  const autoButton = text("button", "", "");
  const setAuto = (on: boolean): void => {
    state.auto = on;
    autoButton.textContent = on ? "◉ AUTO" : "○ AUTO";
    autoButton.classList.toggle("on", on);
    act.reset();
  };
  autoButton.addEventListener("click", () => setAuto(!state.auto));
  const retry = text("button", "↻ RETRY");
  retry.addEventListener("click", act.reset);
  const close = text("button", "✕", "lab-close");
  close.addEventListener("click", act.close);

  el.append(
    text("b", "PULL LAB · THE ONE GENERIC PULL"),
    close,
    choice(
      LAB_SHAPES.map((s) => [s.label, s.key] as [string, string]),
      state.shape.key,
      (k) => {
        state.shape = labShape(k);
        act.reset();
      },
      "PATH",
    ),
    choice(
      [
        ["AS SHIPPED", null] as [string, Variant | null],
        ...labLooks().map((v) => [v.name.toUpperCase(), v] as [string, Variant]),
      ],
      state.look,
      (v) => {
        state.look = v;
      },
      "LOOK",
    ),
    choice(
      [
        ["1×", 1],
        ["½×", 0.5],
        ["¼×", 0.25],
      ],
      state.speed,
      (v) => {
        state.speed = v;
      },
      "SPEED",
    ),
    ...tuneChoices(state.tune, act.scene),
    grouped("PLAY", autoButton, retry),
    grouped("SHOW", sheetButton),
    readout,
  );
  return {
    el,
    readout,
    setAuto,
    paintSheet: () => sheetButton.classList.toggle("on", state.sheet),
  };
}
