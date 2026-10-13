import type { Point } from "@neon-spore/content";
import { choice, grouped } from "./field-try-bar.js";
import { text } from "./gestures-page.js";
import { labShell } from "./lab-shell.js";
import { PRESS_LAB } from "./place.js";
import { PRESS_LOOKS, pressLook } from "./press-goo/index.js";
import type { PressLook } from "./press-goo/view.js";
import { autoFinger } from "./press-lab-auto.js";
import { paintPressLab, pressReadout } from "./press-lab-paint.js";
import {
  freshPress,
  type LabPress,
  lift,
  onMark,
  PRESS_ASKS,
  type PressAsk,
  press,
  pressAsk,
  tick,
} from "./press-lab-rule.js";
import { pressSheet } from "./press-lab-sheet.js";
import { fitCanvas } from "./pull-lab-canvas.js";
import { LAB_H, LAB_W } from "./pull-lab-shapes.js";
import { initialLab } from "./session.js";

/**
 * **THE PRESS LAB** — the one generic PRESS on an empty field, to be pressed
 * by hand, as THE HOLD LAB is the hold's (the owner, 13 October 2026: *like
 * "hold lab" i want a "press" lab. visual should be same as decided in "hold"
 * but we need somehow to distinguish between them that its clear for user to
 * press one or multiple times … maybe also on pc the mouse cursor
 * differentiation can help … provide to me several variants*).
 *
 * Its choices on the bar are **PRESS** — how many presses the mark asks
 * (`PRESS_ASKS`) — and **LOOK**, the five ways of saying so on THE HOLD LAB's
 * drop (`press-goo/`). On a computer the pointer over the mark is the
 * pointing hand, where a hold's is the open one (`grab`, the labs' canvas).
 *
 * The rule (`press-lab-rule.ts`): a press counts as it lands; a resting finger
 * counts once; a gap of two beats loses the count, red. AUTO's finger
 * (`press-lab-auto.ts`) presses a whole mark, then half of one and rests on
 * it until it lapses; RETRY puts a fresh mark on the field.
 */

/** `key` is the presses and the look, `5-pips`: what `PRESS_LAB` carries in the URL. */
const keyOf = (ask: PressAsk, look: PressLook): string => `${ask.key}-${look.key}`;

export function openPressLab(
  first = "5-pips",
  opts: { sheet?: boolean; host?: HTMLElement } = {},
): void {
  const shell = labShell(opts.host);
  const [askKey = "5", lookKey = "pips"] = first.split("-");
  let ask: PressAsk = pressAsk(askKey);
  let look: PressLook = pressLook(lookKey);
  let mark: LabPress = freshPress();
  let auto = true;
  let speed = 1;
  let time = 0;
  let autoTime = 0;
  let down = false;

  const bar = document.createElement("div");
  bar.className = "pic-zoom-bar";
  const room = document.createElement("div");
  room.className = "pic-zoom-stage";
  const canvas = document.createElement("canvas");
  canvas.className = "pull-lab-canvas";
  canvas.style.cursor = "default";
  room.appendChild(canvas);
  const like = text("p", "", "pull-lab-like");
  const readout = text("span", "", "try-readout");

  let sheet = opts.sheet === true;
  const sheetButton = text("button", "▤ EVERY LOOK, EVERY STATE");
  const place = (): void => shell.place({ shape: PRESS_LAB + keyOf(ask, look), sheet });
  const show = (): void => {
    place();
    like.textContent = `${look.name.toUpperCase()} — ${look.sentence}.`;
    sheetButton.classList.toggle("on", sheet);
    room.classList.toggle("pull-lab-room-sheet", sheet);
    room.replaceChildren(sheet ? pressSheet(ask) : canvas);
  };
  sheetButton.addEventListener("click", () => {
    sheet = !sheet;
    show();
  });
  const reset = (): void => {
    mark = freshPress();
    autoTime = 0;
    down = false;
    show();
  };
  const autoButton = text("button", "", "");
  const setAuto = (on: boolean): void => {
    auto = on;
    autoButton.textContent = on ? "◉ AUTO" : "○ AUTO";
    autoButton.classList.toggle("on", on);
    reset();
  };
  autoButton.addEventListener("click", () => setAuto(!auto));
  const retry = text("button", "↻ RETRY");
  retry.addEventListener("click", reset);
  const close = text("button", "✕", "lab-close");
  close.addEventListener("click", shell.shut);
  bar.append(
    text("b", "PRESS LAB · THE ONE GENERIC PRESS, ON AN EMPTY FIELD"),
    close,
    choice(
      PRESS_ASKS.map((a) => [a.label, a.key] as [string, string]),
      ask.key,
      (k) => {
        ask = pressAsk(k);
        reset();
      },
      "PRESS",
    ),
    choice(
      PRESS_LOOKS.map((l) => [l.name.toUpperCase(), l.key] as [string, string]),
      look.key,
      (k) => {
        look = pressLook(k);
        show();
      },
      "LOOK",
    ),
    choice(
      [
        ["1×", 1],
        ["½×", 0.5],
        ["¼×", 0.25],
      ],
      speed,
      (v) => {
        speed = v;
      },
      "SPEED",
    ),
    grouped("PLAY", autoButton, retry),
    grouped("SHOW", sheetButton),
    readout,
  );
  setAuto(true);

  const toLab = (e: PointerEvent): Point => {
    const box = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - box.left) / box.width) * LAB_W,
      y: ((e.clientY - box.top) / box.height) * LAB_H,
    };
  };
  const on = (type: string, f: (e: PointerEvent) => void): void =>
    canvas.addEventListener(type, f as EventListener, { signal: shell.signal });
  on("pointerdown", (e) => {
    if (auto) setAuto(false);
    canvas.setPointerCapture(e.pointerId);
    press(mark, ask, toLab(e));
  });
  // The pointing hand over the mark: a press, where a hold's mark shows the open one.
  on("pointermove", (e) => {
    canvas.style.cursor = onMark(toLab(e)) ? "pointer" : "default";
  });
  on("pointerup", () => {
    if (!auto) lift(mark);
  });

  const fit = (): void => fitCanvas(canvas, room, null);

  /** AUTO's finger drives the rule exactly as a mouse would. */
  const drive = (dt: number): void => {
    autoTime += dt;
    const f = autoFinger(ask, autoTime);
    if (f.down && !down) press(mark, ask, f.at);
    if (!f.down && down) lift(mark);
    down = f.down;
  };

  let last = performance.now();
  const frame = (now: number): void => {
    const dt = Math.min(0.1, (now - last) / 1000) * speed;
    last = now;
    time += dt;
    if (auto) drive(dt);
    tick(mark, dt);
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.setTransform(canvas.width / LAB_W, 0, 0, canvas.height / LAB_H, 0, 0);
      paintPressLab(ctx, { press: mark, ask, look, time });
    }
    readout.textContent = pressReadout(mark, ask);
  };

  shell.mount({ bar, like, room, fit, frame });
  show();
}

/**
 * The lab's door in the topbar, and the lab reopened where the URL left it
 * (`place.ts`'s `lab`, as `PRESS_LAB` and its key): `?presslab=5-pips`,
 * `&presssheet=1` on its sheet — so a reload stays on the lab and `bun run
 * shot` photographs either with no clicks.
 */
export function bindPressLab(): void {
  document.getElementById("pressLabOpen")?.addEventListener("click", () => openPressLab());
  const asked = initialLab();
  if (asked?.shape.startsWith(PRESS_LAB))
    openPressLab(asked.shape.slice(PRESS_LAB.length), { sheet: asked.sheet });
}
