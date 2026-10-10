import type { Point } from "@neon-spore/content";
import type { Variant } from "../../versus/variant.js";
import { choice } from "./field-try-bar.js";
import { text } from "./gestures-page.js";
import { GOO_LOOKS } from "./pull-goo/index.js";
import { autoThumb } from "./pull-lab-auto.js";
import { labLooks, paintLab, readoutOf } from "./pull-lab-paint.js";
import {
  freshPull,
  type LabPull,
  lift,
  move,
  press,
  type ShortPull,
  type Stray,
  tick,
} from "./pull-lab-rule.js";
import { LAB_H, LAB_SHAPES, LAB_W, type LabShape, labShape } from "./pull-lab-shapes.js";
import { labSheet } from "./pull-lab-sheet.js";

/**
 * **THE PULL LAB** — the one generic PULL on an empty field, to be pulled by
 * hand (the owner, 10 October 2026): *"allow me to try the generic control on
 * an empty example in the different variants — pull straight, pull in either
 * direction, pull in a custom path (a curve)."*
 *
 * Three choices on the bar, and nothing else on the screen to look at:
 *
 * - **the shape** (`pull-lab-shapes.ts`): down, up, either, signed, a curve,
 *   an S, a rope that goes any way;
 * - **the look**: what every pull handle in the game draws today, any
 *   VERSUS candidate that patches the knob or the channel (`PULL_KNOB`,
 *   `PULL_TRACK`) — found by the records it patches, never by its slot's
 *   name — and the lab's own GOO looks (`pull-goo/`), the first of them
 *   picked when the lab opens;
 * - **a short pull**: refused red, or ignored (`pull-lab-rule.ts`);
 * - **a thumb off the path**: free, as today, or a failure past one tile or
 *   half a tile, with the band drawn (`Stray`) — one tile when it opens.
 *
 * AUTO's thumb (`pull-lab-auto.ts`) plays a whole pull and a short one on a
 * loop until the mouse takes over.
 */

/** Device pixels per lab pixel, at most: the knob's rim is a line of 1.6. */
const MAX_DPR = 4;

export function openPullLab(first = "down", opts: { sheet?: boolean } = {}): void {
  let shape: LabShape = labShape(first);
  let pull: LabPull = freshPull(shape);
  let look: Variant | null = GOO_LOOKS[0] ?? null;
  let short: ShortPull = "refuse";
  let stray: Stray = "tile";
  let auto = true;
  let speed = 1;
  let time = 0;
  let autoTime = 0;
  let thumb: { at: Point; down: boolean } | null = null;

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
  /** The room shows the live canvas, or the sheet of every look for this shape. */
  const show = (): void => {
    sheetButton.classList.toggle("on", sheet);
    room.classList.toggle("pull-lab-room-sheet", sheet);
    room.replaceChildren(sheet ? labSheet(shape) : canvas);
  };
  sheetButton.addEventListener("click", () => {
    sheet = !sheet;
    show();
  });
  const reset = (): void => {
    pull = freshPull(shape);
    autoTime = 0;
    if (sheet) show();
  };
  const autoButton = text("button", "", "");
  const setAuto = (on: boolean): void => {
    auto = on;
    autoButton.textContent = on ? "◉ AUTO" : "○ AUTO";
    autoButton.classList.toggle("on", on);
    reset();
  };
  autoButton.addEventListener("click", () => setAuto(!auto));
  const close = text("button", "✕");
  close.addEventListener("click", () => shut());
  bar.append(
    text("b", "PULL LAB · THE ONE GENERIC PULL, ON AN EMPTY FIELD"),
    choice(
      LAB_SHAPES.map((s) => [s.label, s.key] as [string, string]),
      shape.key,
      (k) => {
        shape = labShape(k);
        reset();
      },
    ),
    choice(
      [
        ["AS SHIPPED", null] as [string, Variant | null],
        ...labLooks().map((v) => [v.name.toUpperCase(), v] as [string, Variant]),
      ],
      look,
      (v) => {
        look = v;
      },
    ),
    choice(
      [
        ["SHORT · RED", "refuse"],
        ["SHORT · IGNORED", "ignore"],
      ] as [string, ShortPull][],
      short,
      (v) => {
        short = v;
      },
    ),
    choice(
      [
        ["OFF PATH · FREE", "free"],
        ["OFF PATH · FAILS PAST 1 TILE", "tile"],
        ["OFF PATH · FAILS PAST ½ TILE", "half"],
      ] as [string, Stray][],
      stray,
      (v) => {
        stray = v;
        reset();
      },
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
    ),
    autoButton,
    sheetButton,
    readout,
    close,
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
    press(shape, pull, toLab(e));
    thumb = { at: toLab(e), down: true };
  });
  on("pointermove", (e) => {
    if (auto) return;
    move(shape, pull, toLab(e), stray);
    thumb = { at: toLab(e), down: e.buttons > 0 };
  });
  on("pointerup", (e) => {
    if (auto) return;
    lift(shape, pull, short);
    thumb = { at: toLab(e), down: false };
  });

  const fit = (): void => {
    const box = room.getBoundingClientRect();
    const s = Math.min((box.width - 28) / LAB_W, (box.height - 14) / LAB_H);
    canvas.style.width = `${LAB_W * s}px`;
    canvas.style.height = `${LAB_H * s}px`;
    const dpr = Math.min(MAX_DPR, s * (window.devicePixelRatio || 1));
    canvas.width = Math.round(LAB_W * dpr);
    canvas.height = Math.round(LAB_H * dpr);
  };

  /** AUTO's thumb drives the rule exactly as a mouse would. */
  const drive = (dt: number): void => {
    const was = thumb?.down ?? false;
    autoTime += dt;
    thumb = autoThumb(shape, autoTime, stray !== "free");
    if (thumb.down && !was) press(shape, pull, thumb.at);
    if (thumb.down) move(shape, pull, thumb.at, stray);
    if (!thumb.down && was) lift(shape, pull, short);
  };

  let last = performance.now();
  const frame = (now: number): void => {
    if (life.signal.aborted) return;
    const dt = Math.min(0.1, (now - last) / 1000) * speed;
    last = now;
    time += dt;
    if (auto) drive(dt);
    tick(shape, pull, dt);
    draw();
    like.textContent = `${shape.label} — stands for ${shape.like}.`;
    readout.textContent = readoutOf(shape, pull);
    requestAnimationFrame(frame);
  };

  const draw = (): void => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(canvas.width / LAB_W, 0, 0, canvas.height / LAB_H, 0, 0);
    paintLab(ctx, { shape, pull, look, time, thumb, stray });
  };

  const onKey = (e: KeyboardEvent): void => {
    if (e.key === "Escape") shut();
  };
  const shut = (): void => {
    life.abort();
    shade.remove();
    window.removeEventListener("keydown", onKey);
    window.removeEventListener("resize", fit);
  };
  window.addEventListener("keydown", onKey);
  window.addEventListener("resize", fit);
  shade.append(bar, like, room);
  document.body.appendChild(shade);
  fit();
  show();
  requestAnimationFrame(frame);
}

/** `?pulllab=<shape>` opens the lab as the page loads, and `&pullsheet=1` on
 * its sheet — so `bun run shot` can photograph either with no clicks. */
export function openPullLabAsked(search: string): void {
  const params = new URLSearchParams(search);
  const shape = params.get("pulllab");
  if (shape !== null) openPullLab(shape, { sheet: params.get("pullsheet") === "1" });
}
