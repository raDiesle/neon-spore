import type { Point } from "@neon-spore/content";
import { choice, grouped } from "./field-try-bar.js";
import { text } from "./gestures-page.js";
import { labShell } from "./lab-shell.js";
import { RUB_LAB } from "./place.js";
import { fitCanvas } from "./pull-lab-canvas.js";
import { LAB_H, LAB_W } from "./pull-lab-shapes.js";
import { RUB_LOOKS, rubLook } from "./rub-goo/index.js";
import type { RubLook } from "./rub-goo/view.js";
import { freshDriving, handPartner, stepAuto, stepPartner } from "./rub-lab-auto.js";
import { paintRubLab, rubReadout } from "./rub-lab-paint.js";
import {
  freshRub,
  type LabRub,
  lift,
  move,
  onMark,
  press,
  RUB_ASKS,
  RUB_SEATS,
  type RubAsk,
  type RubSeats,
  rubAsk,
  tick,
} from "./rub-lab-rule.js";
import { rubSheet } from "./rub-lab-sheet.js";
import { initialLab } from "./session.js";

/**
 * **THE RUB LAB** — the one generic RUB on an empty field, to be rubbed by
 * hand, as THE PRESS LAB is the press's (the owner, 13 October 2026: *for me
 * "controls" "on the field" to "rub" is a special separate category of way of
 * control. which we need a special visual for it. also build me a lab for it*).
 *
 * Its choices on the bar are **TURNS** — how many times the thumb has to turn
 * back (`RUB_ASKS`) — **SEATS**, one seat or both at once (THE CHOIR's rub,
 * the same day), and **LOOK**, the four ways of saying so on THE HOLD LAB's
 * drop (`rub-goo/`). On a computer the pointer over the mark is the
 * left-right arrow, where a press's is the pointing hand and a hold's the open one.
 *
 * The rule (`rub-lab-rule.ts`): a turn counts as the thumb comes back; a lift
 * keeps the count; a gap of two beats loses it, red. AUTO's finger
 * (`rub-lab-auto.ts`) scrubs a whole mark, then half of one and stops on it
 * until it lapses; RETRY puts a fresh mark on the field.
 */

/** `key` is the turns, the seats and the look, `8-one-zigzag`: what `RUB_LAB` carries in the URL. */
const keyOf = (ask: RubAsk, seats: RubSeats, look: RubLook): string =>
  `${ask.key}-${seats}-${look.key}`;

export function openRubLab(
  first = "8-one-zigzag",
  opts: { sheet?: boolean; host?: HTMLElement } = {},
): void {
  const shell = labShell(opts.host);
  const [askKey = "8", seatKey = "one", lookKey = "zigzag"] = first.split("-");
  let ask: RubAsk = rubAsk(askKey);
  let seats: RubSeats = seatKey === "both" ? "both" : "one";
  let look: RubLook = rubLook(lookKey);
  let mark: LabRub = freshRub();
  let auto = true;
  let speed = 1;
  let time = 0;
  let autoTime = 0;
  let grab: Point = { x: 0, y: 0 };
  let driving = freshDriving();

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
  const place = (): void => shell.place({ shape: RUB_LAB + keyOf(ask, seats, look), sheet });
  const show = (): void => {
    place();
    like.textContent = `${look.name.toUpperCase()} — ${look.sentence}.`;
    sheetButton.classList.toggle("on", sheet);
    room.classList.toggle("pull-lab-room-sheet", sheet);
    room.replaceChildren(sheet ? rubSheet(ask, seats) : canvas);
  };
  sheetButton.addEventListener("click", () => {
    sheet = !sheet;
    show();
  });
  const reset = (): void => {
    mark = freshRub();
    autoTime = 0;
    driving = freshDriving();
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
    text("b", "RUB LAB · THE ONE GENERIC RUB, ON AN EMPTY FIELD"),
    close,
    choice(
      RUB_ASKS.map((a) => [a.label, a.key] as [string, string]),
      ask.key,
      (k) => {
        ask = rubAsk(k);
        reset();
      },
      "TURNS",
    ),
    choice(
      RUB_SEATS,
      seats,
      (k) => {
        seats = k;
        reset();
      },
      "SEATS",
    ),
    choice(
      RUB_LOOKS.map((l) => [l.name.toUpperCase(), l.key] as [string, string]),
      look.key,
      (k) => {
        look = rubLook(k);
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
    grab = toLab(e);
    press(mark, grab);
  });
  // The left-right arrow over the mark: a rub, where a press shows the pointing hand.
  on("pointermove", (e) => {
    const at = toLab(e);
    if (!auto && mark.down) move(mark, ask, seats, at, grab);
    canvas.style.cursor = onMark(at) || (mark.down && mark.onIt) ? "ew-resize" : "default";
  });
  on("pointerup", () => {
    if (!auto) lift(mark);
  });

  const fit = (): void => fitCanvas(canvas, room, null);

  let last = performance.now();
  const frame = (now: number): void => {
    const dt = Math.min(0.1, (now - last) / 1000) * speed;
    last = now;
    time += dt;
    if (auto) {
      autoTime += dt;
      stepAuto(mark, ask, seats, autoTime, dt, driving);
    } else if (seats === "both") stepPartner(mark, handPartner(time), dt, driving);
    tick(mark, dt);
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.setTransform(canvas.width / LAB_W, 0, 0, canvas.height / LAB_H, 0, 0);
      paintRubLab(ctx, { rub: mark, ask, seats, look, time });
    }
    readout.textContent = rubReadout(mark, ask, seats);
  };

  shell.mount({ bar, like, room, fit, frame });
  show();
}

/**
 * The lab reopened where the URL left it (`place.ts`'s `lab`, as `RUB_LAB`
 * and its key): `?rublab=8-one-zigzag`, `&rubsheet=1` on its sheet — so a
 * reload stays on the lab and `bun run shot` photographs either with no
 * clicks. Its door in the topbar opens its card on ON THE FIELD (`lab-door.ts`).
 */
export function bindRubLab(): void {
  const asked = initialLab();
  if (asked?.shape.startsWith(RUB_LAB))
    openRubLab(asked.shape.slice(RUB_LAB.length), { sheet: asked.sheet });
}
