import type { Point } from "@neon-spore/content";
import { coverPage } from "./cover.js";
import { choice, grouped } from "./field-try-bar.js";
import { text } from "./gestures-page.js";
import { GOO_HOLDS, HOLD_LOOKS } from "./hold-goo/index.js";
import type { HoldLook } from "./hold-goo/view.js";
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
import { HOLD_LAB } from "./place.js";
import { LAB_H, LAB_W } from "./pull-lab-shapes.js";
import { initialLab, placeLab } from "./session.js";

/**
 * **THE HOLD LAB** — the one generic HOLD on an empty field, to be held by
 * hand, as THE PULL LAB is the pull's (the owner, 11 October 2026: *make a
 * "hold lab" like we did with "pull lab" to create cool and very user
 * friendly usage and indicator of on screen hold control … aligned with
 * visuals and behavior … pull lab ("fizz") … the current "hold" is the
 * thumb visual, which should be also one kind of variant*).
 *
 * The choices on the bar:
 *
 * - **HOLD FOR** — how many beats the hold asks (`HOLD_ASKS`);
 * - **the look** — the game's own thumbprint mark AS SHIPPED, and the GOO
 *   holds (`hold-goo/`), FIZZ's drop and grab and ending with a different
 *   picture of the beats being held; the first GOO one when the lab opens.
 *
 * The rule is the pull's answers made a hold's (`hold-lab-rule.ts`): let go
 * early is refused, red; half a tile off the mark fails. AUTO's thumb
 * (`hold-lab-auto.ts`) plays a whole hold, an early one and a slipping one
 * on a loop; RETRY puts a fresh mark on the field, so it is seen coming in.
 */

/** Device pixels per lab pixel and per CSS pixel, at most, as the PULL LAB's. */
const MAX_DPR = 4;
const MAX_SCREEN_DPR = 2;

/** The lab on screen, shut by a second opening — there is only ever one. */
let shutOpen: (() => void) | null = null;

export function openHoldLab(first = "2", opts: { sheet?: boolean; look?: string } = {}): void {
  shutOpen?.();
  let ask: HoldAsk = holdAsk(first);
  let hold: LabHold = freshHold();
  let look: HoldLook =
    HOLD_LOOKS.find((l) => l.name === opts.look) ?? GOO_HOLDS[0] ?? (HOLD_LOOKS[0] as HoldLook);
  let auto = true;
  let speed = 1;
  let time = 0;
  let autoTime = 0;
  let down = false;

  const shade = document.createElement("div");
  shade.className = "pic-zoom try pull-lab";
  const bar = document.createElement("div");
  bar.className = "pic-zoom-bar";
  const room = document.createElement("div");
  room.className = "pic-zoom-stage";
  const canvas = document.createElement("canvas");
  canvas.className = "pull-lab-canvas";
  room.appendChild(canvas);
  const like = text("p", "", "pull-lab-like");
  const readout = text("span", "", "try-readout");
  const life = new AbortController();

  let sheet = opts.sheet === true;
  const sheetButton = text("button", "▤ EVERY LOOK, EVERY STATE");
  const place = (): void => placeLab({ shape: HOLD_LAB + ask.key, sheet });
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
  const close = text("button", "✕");
  close.addEventListener("click", () => shut());
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
      HOLD_LOOKS.map((l) => [l.name.toUpperCase(), l] as [string, HoldLook]),
      look,
      (l) => {
        look = l;
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
    canvas.addEventListener(type, f as EventListener, { signal: life.signal });
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

  const fit = (): void => {
    const box = room.getBoundingClientRect();
    const s = Math.min((box.width - 28) / LAB_W, (box.height - 14) / LAB_H);
    canvas.style.width = `${LAB_W * s}px`;
    canvas.style.height = `${LAB_H * s}px`;
    const dpr = Math.min(MAX_DPR, s * Math.min(MAX_SCREEN_DPR, window.devicePixelRatio || 1));
    canvas.width = Math.round(LAB_W * dpr);
    canvas.height = Math.round(LAB_H * dpr);
  };

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
    if (life.signal.aborted) return;
    const dt = Math.min(0.1, (now - last) / 1000) * speed;
    last = now;
    time += dt;
    if (auto) drive(dt);
    tick(hold, ask, dt);
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.setTransform(canvas.width / LAB_W, 0, 0, canvas.height / LAB_H, 0, 0);
      paintHoldLab(ctx, { hold, ask, look, time });
    }
    like.textContent = `${look.name.toUpperCase()} — ${look.sentence}.`;
    readout.textContent = holdReadout(hold);
    requestAnimationFrame(frame);
  };

  // Caught on the way down and stopped, as the PULL LAB's: one press shuts only the lab.
  const onKey = (e: KeyboardEvent): void => {
    if (e.key !== "Escape") return;
    e.stopPropagation();
    shut();
  };
  const shut = (): void => {
    if (life.signal.aborted) return;
    shutOpen = null;
    placeLab(null);
    life.abort();
    shade.remove();
    uncover();
    document.removeEventListener("keydown", onKey, { capture: true });
    window.removeEventListener("resize", fit);
  };
  shutOpen = shut;
  document.addEventListener("keydown", onKey, { capture: true });
  window.addEventListener("resize", fit);
  shade.append(bar, like, room);
  document.body.appendChild(shade);
  const uncover = coverPage(shade);
  fit();
  show();
  requestAnimationFrame(frame);
}

/**
 * The lab's door in the topbar, and the lab reopened where the URL left it
 * (`place.ts`'s `lab`, as `HOLD_LAB` and the beats): `?holdlab=<beats>`,
 * `&holdsheet=1` on its sheet — so a reload stays on the lab and `bun run
 * shot` photographs either with no clicks.
 */
export function bindHoldLab(): void {
  document.getElementById("holdLabOpen")?.addEventListener("click", () => openHoldLab());
  const asked = initialLab();
  if (asked?.shape.startsWith(HOLD_LAB))
    openHoldLab(asked.shape.slice(HOLD_LAB.length), { sheet: asked.sheet });
}
