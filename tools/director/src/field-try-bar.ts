import { text } from "./gestures-page.js";

/**
 * The bar over a TRY view (`field-try.ts`): what is being tried, and the
 * transport that lets a look be watched before, during and after a press —
 * restart, hold and step, the speed, whose hand the mouse is, and how much of
 * the phone is shown. The view asks it for each value as it needs it.
 */

export interface TryBar {
  element: HTMLElement;
  running(): boolean;
  /** Game seconds per real second. */
  speed(): number;
  /** The seat the mouse is, or undefined for whichever the press finds
   * (`render/desk-grab.ts`). */
  seat(): 1 | 2 | undefined;
  /** The whole phone rather than the box round the control. */
  whole(): boolean;
  readout(line: string): void;
}

export interface TryActions {
  restart(): void;
  /** The window is cut again — the view changed. */
  fit(): void;
  stepOnce(): void;
  close(): void;
}

/** A row of buttons of which one is lit; `pick` hears the one pressed. */
function choice<T>(
  options: readonly [string, T][],
  first: T,
  pick: (value: T) => void,
): HTMLElement {
  const group = document.createElement("span");
  group.className = "try-choice";
  const buttons = options.map(([label, value]) => {
    const b = text("button", label);
    b.classList.toggle("on", value === first);
    b.addEventListener("click", () => {
      for (const o of buttons) o.classList.toggle("on", o === b);
      pick(value);
    });
    return b;
  });
  group.append(...buttons);
  return group;
}

export function tryBar(title: string, act: TryActions): TryBar {
  let running = true;
  let speed = 1;
  let seat: 1 | 2 | undefined;
  let whole = false;
  const bar = document.createElement("div");
  bar.className = "pic-zoom-bar";
  bar.appendChild(text("b", `TRY · ${title}`));
  const button = (label: string, on: () => void): HTMLElement => {
    const b = text("button", label);
    b.addEventListener("click", on);
    return b;
  };
  const play = button("⏸ HOLD", () => {
    running = !running;
    play.textContent = running ? "⏸ HOLD" : "▶ RUN";
  });
  const readout = text("span", "", "try-readout");
  bar.append(
    button("↺ RESTART", act.restart),
    play,
    button("+1 TICK", () => {
      if (!running) act.stepOnce();
    }),
    choice(
      [
        ["1×", 1],
        ["½×", 0.5],
        ["¼×", 0.25],
        ["⅛×", 0.125],
      ],
      speed,
      (v) => {
        speed = v;
      },
    ),
    choice<1 | 2 | undefined>(
      [
        ["EITHER SEAT", undefined],
        ["P1", 1],
        ["P2", 2],
      ],
      seat,
      (v) => {
        seat = v;
      },
    ),
    choice(
      [
        ["THE CONTROL", false],
        ["WHOLE PHONE", true],
      ],
      whole,
      (v) => {
        whole = v;
        act.fit();
      },
    ),
    readout,
    button("✕", act.close),
  );
  return {
    element: bar,
    running: () => running,
    speed: () => speed,
    seat: () => seat,
    whole: () => whole,
    readout: (line) => {
      readout.textContent = line;
    },
  };
}
