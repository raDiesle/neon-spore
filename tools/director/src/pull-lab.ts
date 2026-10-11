import type { Point } from "@neon-spore/content";
import { text } from "./gestures-page.js";
import { GOO_LOOKS } from "./pull-goo/index.js";
import { autoThumb } from "./pull-lab-auto.js";
import { type LabState, labBar } from "./pull-lab-bar.js";
import { paintLab, readoutOf } from "./pull-lab-paint.js";
import {
  freshPull,
  type LabPull,
  lift,
  move,
  press,
  type ShortPull,
  tick,
} from "./pull-lab-rule.js";
import { LAB_H, LAB_W, labShape } from "./pull-lab-shapes.js";
import { labSheet } from "./pull-lab-sheet.js";
import type { Stray } from "./pull-lab-stray.js";

/**
 * **THE PULL LAB** — the one generic PULL on an empty field, to be pulled by
 * hand (the owner, 10 October 2026): *"allow me to try the generic control on
 * an empty example in the different variants — pull straight, pull in either
 * direction, pull in a custom path (a curve)."*
 *
 * The choices on the bar, and nothing else on the screen to look at:
 *
 * - **the shape** (`pull-lab-shapes.ts`): down, up, either, signed, curve, S;
 * - **the look**: what every pull handle in the game draws today, any
 *   VERSUS candidate that patches the knob or the channel (`PULL_KNOB`,
 *   `PULL_TRACK`) — found by the records it patches, never by its slot's
 *   name — and the lab's own GOO looks (`pull-goo/`), the first picked when
 *   the lab opens; for those, a flat drop or a 3D ball (`drop-look.ts`);
 *
 * A short pull is refused, red, and a thumb half a tile off the path fails:
 * the owner's picks of the rule's answers (10 October 2026: *for the
 * tolerance variants i prefer "short * red" so remove the others*, and
 * before it *i prefer "off path * fails past 1/2 tile"*) — a whole tile for
 * a finger (`TOUCH_SLACK`). The rule still knows the others
 * (`pull-lab-rule.ts`, `pull-lab-stray.ts`).
 *
 * AUTO's thumb (`pull-lab-auto.ts`) plays a whole pull and a straying one on
 * a loop. RETRY puts a fresh pull on the field, so the drop and its path are
 * seen coming in (`pull-goo/enter.ts`) — the owner: *give me a retry button
 * … so i can clearly see the appearing animation*.
 */

/** Device pixels per lab pixel, at most: the knob's rim is a line of 1.6. */
const MAX_DPR = 4;

export function openPullLab(first = "down", opts: { sheet?: boolean } = {}): void {
  const state: LabState = {
    shape: labShape(first),
    look: GOO_LOOKS[0] ?? null,
    speed: 1,
    auto: true,
    sheet: opts.sheet === true,
  };
  let pull: LabPull = freshPull(state.shape);
  const short: ShortPull = "refuse";
  const stray: Stray = "half";
  let time = 0;
  let autoTime = 0;
  let thumb: { at: Point; down: boolean } | null = null;
  /** The last press was a finger (`TOUCH_SLACK`); AUTO's thumb is never one. */
  let finger = matchMedia("(pointer: coarse)").matches;
  const touch = (): boolean => finger && !state.auto;

  const shade = document.createElement("div");
  shade.className = "pic-zoom try pull-lab";
  const room = document.createElement("div");
  room.className = "pic-zoom-stage";
  const canvas = document.createElement("canvas");
  canvas.className = "pull-lab-canvas";
  room.appendChild(canvas);
  const like = text("p", "", "pull-lab-like");
  const life = new AbortController();

  /** The room shows the live canvas, or the sheet of every look for this shape. */
  const show = (): void => {
    bar.paintSheet();
    room.classList.toggle("pull-lab-room-sheet", state.sheet);
    room.replaceChildren(state.sheet ? labSheet(state.shape) : canvas);
  };
  const reset = (): void => {
    pull = freshPull(state.shape);
    autoTime = 0;
    if (state.sheet) show();
  };
  const bar = labBar(state, { reset, show, close: () => shut() });
  bar.setAuto(true);

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
    if (state.auto) bar.setAuto(false);
    finger = e.pointerType === "touch";
    canvas.setPointerCapture(e.pointerId);
    press(state.shape, pull, toLab(e));
    thumb = { at: toLab(e), down: true };
  });
  on("pointermove", (e) => {
    if (state.auto) return;
    move(state.shape, pull, toLab(e), stray, touch());
    thumb = { at: toLab(e), down: e.buttons > 0 };
  });
  on("pointerup", (e) => {
    if (state.auto) return;
    lift(state.shape, pull, short);
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
    // Its second pull strays: the half tile catches it.
    thumb = autoThumb(state.shape, autoTime, true);
    if (thumb.down && !was) press(state.shape, pull, thumb.at);
    if (thumb.down) move(state.shape, pull, thumb.at, stray);
    if (!thumb.down && was) lift(state.shape, pull, short);
  };

  let last = performance.now();
  const frame = (now: number): void => {
    if (life.signal.aborted) return;
    const dt = Math.min(0.1, (now - last) / 1000) * state.speed;
    last = now;
    time += dt;
    if (state.auto) drive(dt);
    tick(state.shape, pull, dt);
    draw();
    like.textContent = `${state.shape.label} — stands for ${state.shape.like}.`;
    bar.readout.textContent = readoutOf(state.shape, pull, touch());
    requestAnimationFrame(frame);
  };

  const draw = (): void => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(canvas.width / LAB_W, 0, 0, canvas.height / LAB_H, 0, 0);
    paintLab(ctx, { shape: state.shape, pull, look: state.look, time, stray, touch: touch() });
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
  shade.append(bar.el, like, room);
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
