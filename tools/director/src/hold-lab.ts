import type { Point } from "@neon-spore/content";
import { choice, grouped } from "./field-try-bar.js";
import { text } from "./gestures-page.js";
import { SOAK_HOLD } from "./hold-goo/index.js";
import { autoThumb } from "./hold-lab-auto.js";
import { holdReadout, paintHoldLab } from "./hold-lab-paint.js";
import {
  freshHold,
  HOLD_ASKS,
  type HoldAsk,
  holdAsk,
  type LabHold,
  lift,
  move,
  press,
  tick,
} from "./hold-lab-rule.js";
import { holdSheet } from "./hold-lab-sheet.js";
import { labShell } from "./lab-shell.js";
import { HOLD_LAB } from "./place.js";
import { fitCanvas } from "./pull-lab-canvas.js";
import { LAB_H, LAB_W } from "./pull-lab-shapes.js";
import { initialLab } from "./session.js";

/**
 * **THE HOLD LAB** — the one generic HOLD on an empty field, to be held by
 * hand, as THE PULL LAB is the pull's (the owner, 11 October 2026: *make a
 * "hold lab" like we did with "pull lab" to create cool and very user
 * friendly usage and indicator of on screen hold control … aligned with
 * visuals and behavior … pull lab ("fizz") … the current "hold" is the
 * thumb visual, which should be also one kind of variant*).
 *
 * Its one choice on the bar is **HOLD FOR** — how many beats the hold asks
 * (`HOLD_ASKS`). The hold wears SOAK and nothing else, as every hold in THE
 * COMBO LAB does, with the same waiting clock on its shoulder while held (the
 * owner, 13 October 2026: *"hold lab": use "look" : "soak" … general visuals
 * the user expects for consistency are always consistent*). The six other
 * looks the LOOK picker once offered are gone.
 *
 * The rule is the pull's answers made a hold's (`hold-lab-rule.ts`): let go
 * early is refused, red; half a tile off the mark fails. AUTO's thumb
 * (`hold-lab-auto.ts`) plays a whole hold, an early one and a slipping one
 * on a loop; RETRY puts a fresh mark on the field, so it is seen coming in.
 */

export function openHoldLab(first = "2", opts: { sheet?: boolean; host?: HTMLElement } = {}): void {
  const shell = labShell(opts.host);
  let ask: HoldAsk = holdAsk(first);
  let hold: LabHold = freshHold();
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
  room.appendChild(canvas);
  const like = text("p", "", "pull-lab-like");
  const readout = text("span", "", "try-readout");

  let sheet = opts.sheet === true;
  const sheetButton = text("button", "▤ EVERY STATE");
  const place = (): void => shell.place({ shape: HOLD_LAB + ask.key, sheet });
  const show = (): void => {
    place();
    sheetButton.classList.toggle("on", sheet);
    room.classList.toggle("pull-lab-room-sheet", sheet);
    room.replaceChildren(sheet ? holdSheet(ask) : canvas);
  };
  sheetButton.addEventListener("click", () => {
    sheet = !sheet;
    show();
  });
  const reset = (): void => {
    hold = freshHold();
    autoTime = 0;
    down = false;
    if (sheet) show();
    else place();
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
    text("b", "HOLD LAB · THE ONE GENERIC HOLD, ON AN EMPTY FIELD"),
    close,
    choice(
      HOLD_ASKS.map((a) => [a.label, a.key] as [string, string]),
      ask.key,
      (k) => {
        ask = holdAsk(k);
        reset();
      },
      "HOLD FOR",
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
    press(hold, toLab(e));
  });
  on("pointermove", (e) => {
    if (!auto) move(hold, toLab(e));
  });
  on("pointerup", () => {
    if (!auto) lift(hold);
  });

  const fit = (): void => fitCanvas(canvas, room, null);

  /** AUTO's thumb drives the rule exactly as a mouse would. */
  const drive = (dt: number): void => {
    autoTime += dt;
    const th = autoThumb(ask, autoTime);
    if (th.down && !down) press(hold, th.at);
    if (th.down) move(hold, th.at);
    if (!th.down && down) lift(hold);
    down = th.down;
  };

  let last = performance.now();
  const frame = (now: number): void => {
    const dt = Math.min(0.1, (now - last) / 1000) * speed;
    last = now;
    time += dt;
    if (auto) drive(dt);
    tick(hold, ask, dt);
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.setTransform(canvas.width / LAB_W, 0, 0, canvas.height / LAB_H, 0, 0);
      paintHoldLab(ctx, { hold, ask, time });
    }
    readout.textContent = holdReadout(hold);
  };

  shell.mount({ bar, like, room, fit, frame });
  like.textContent = `${SOAK_HOLD.name.toUpperCase()} — ${SOAK_HOLD.sentence}.`;
  show();
}

/**
 * The lab reopened where the URL left it
 * (`place.ts`'s `lab`, as `HOLD_LAB` and the beats): `?holdlab=<beats>`,
 * `&holdsheet=1` on its sheet — so a reload stays on the lab and `bun run
 * shot` photographs either with no clicks.
 */
export function bindHoldLab(): void {
  const asked = initialLab();
  if (asked?.shape.startsWith(HOLD_LAB))
    openHoldLab(asked.shape.slice(HOLD_LAB.length), { sheet: asked.sheet });
}
