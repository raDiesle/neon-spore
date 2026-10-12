import type { Point } from "@neon-spore/content";
import { text } from "./gestures-page.js";
import { labShell } from "./lab-shell.js";
import { COMBO_LAB, HOLD_LAB } from "./place.js";
import { autoDrive } from "./pull-lab-auto.js";
import { type LabState, labBar } from "./pull-lab-bar.js";
import { drawLab, fitCanvas, pointOn } from "./pull-lab-canvas.js";
import { readoutOf } from "./pull-lab-paint.js";
import {
  freshPull,
  type LabPull,
  lift,
  move,
  press,
  type ShortPull,
  tick,
} from "./pull-lab-rule.js";
import { type LampreyScene, sceneFor } from "./pull-lab-scene.js";
import { type LabShape, labShape, sized } from "./pull-lab-shapes.js";
import { labSheet } from "./pull-lab-sheet.js";
import type { Stray } from "./pull-lab-stray.js";
import { freshTune } from "./pull-lab-tune.js";
import { initialLab } from "./session.js";

/**
 * **THE PULL LAB** — the one generic PULL on an empty field, to be pulled by
 * hand (the owner, 10 October 2026): *"allow me to try the generic control on
 * an empty example in the different variants — pull straight, pull in either
 * direction, pull in a custom path (a curve)."*
 *
 * The choices on the bar, and nothing else on the screen to look at:
 *
 * - **the shape** (`pull-lab-shapes.ts`): down, up, either, signed, curve, S;
 * - **the look**: what every pull handle in the game draws today — the
 *   lab's own FIZZ, taken into the game on 11 October 2026 (the owner:
 *   *current version of "pull lab" "fizz" i like. build it into game*;
 *   `packages/render/src/goo-*.ts`) — and any VERSUS candidate that
 *   patches the knob or the channel (`PULL_KNOB`, `PULL_TRACK`), found by
 *   the records it patches, never by its slot's name;
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
 * seen coming in (`packages/render/src/goo-enter.ts`) — the owner: *give me a retry button
 * … so i can clearly see the appearing animation*.
 *
 * It opens on THE LAMPREY's tow (`pull-lab-scene.ts`), the drop over a real
 * wave, with its size and THE SLOW's loudness on the bar
 * (`pull-lab-tune.ts`); EMPTY FIELD is the field it was built on.
 *
 * With a `host` it stands on that page, beside its gesture's card; without
 * one, over everything (`lab-shell.ts`).
 */
export function openPullLab(
  first = "down",
  opts: { sheet?: boolean; host?: HTMLElement } = {},
): void {
  const shell = labShell(opts.host);
  const state: LabState = {
    shape: labShape(first),
    look: null,
    speed: 1,
    auto: true,
    sheet: opts.sheet === true,
    tune: freshTune(),
  };
  let scene: LampreyScene | null = sceneFor(state.tune.scene, () => state.speed);
  /** The shape the rule runs on this frame: the wave's, or the empty field's, at the bar's size. */
  const active = (): LabShape | null =>
    scene ? scene.shape(state.tune.size) : sized(state.shape, state.tune.size);
  /** The rule's three calls, on this frame's shape — none before a wave has laid one. */
  const on3 = (f: (s: LabShape) => void): void => {
    const s = active();
    if (s) f(s);
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

  const room = document.createElement("div");
  room.className = "pic-zoom-stage";
  const canvas = document.createElement("canvas");
  canvas.className = "pull-lab-canvas";
  room.appendChild(canvas);
  const like = text("p", "", "pull-lab-like");

  /** The room shows the live canvas, or the sheet of every look for this shape. */
  const show = (): void => {
    shell.place({ shape: state.shape.key, sheet: state.sheet });
    bar.paintSheet();
    room.classList.toggle("pull-lab-room-sheet", state.sheet);
    room.replaceChildren(state.sheet ? labSheet(state.shape) : canvas);
  };
  const reset = (): void => {
    pull = freshPull(active() ?? state.shape);
    autoTime = 0;
    // `show` writes the place too, so a new path is in the URL either way.
    if (state.sheet) show();
    else shell.place({ shape: state.shape.key, sheet: false });
  };
  const swap = (): void => {
    scene?.dispose();
    scene = sceneFor(state.tune.scene, () => state.speed);
    fit();
    reset();
  };
  const bar = labBar(state, { reset, show, scene: swap, close: shell.shut });
  bar.setAuto(true);

  const toLab = (e: PointerEvent): Point => pointOn(canvas, e, scene);
  const on = (type: string, f: (e: PointerEvent) => void): void =>
    canvas.addEventListener(type, f as EventListener, { signal: shell.signal });
  on("pointerdown", (e) => {
    if (state.auto) bar.setAuto(false);
    finger = e.pointerType === "touch";
    canvas.setPointerCapture(e.pointerId);
    on3((s) => press(s, pull, toLab(e)));
    thumb = { at: toLab(e), down: true };
  });
  on("pointermove", (e) => {
    if (state.auto) return;
    on3((s) => move(s, pull, toLab(e), stray, touch()));
    thumb = { at: toLab(e), down: e.buttons > 0 };
  });
  on("pointerup", (e) => {
    if (state.auto) return;
    on3((s) => lift(s, pull, short));
    thumb = { at: toLab(e), down: false };
  });

  const fit = (): void => fitCanvas(canvas, room, scene);

  let last = performance.now();
  const frame = (now: number): void => {
    const dt = Math.min(0.1, (now - last) / 1000) * state.speed;
    last = now;
    time += dt;
    const s = active();
    if (s) {
      if (state.auto) {
        // AUTO's thumb drives the rule exactly as a mouse would.
        autoTime += dt;
        thumb = autoDrive(s, pull, autoTime, thumb?.down ?? false, { stray, short });
      }
      tick(s, pull, dt);
      like.textContent = `${s.label} — stands for ${s.like}.`;
      bar.readout.textContent = readoutOf(s, pull, touch());
    }
    const { tune } = state;
    const lab = { shape: s ?? state.shape, pull, look: state.look, time, stray, touch: touch() };
    const f = { lab, size: tune.size, slow: tune.slow, dt };
    drawLab(canvas, scene, f);
  };

  shell.mount({ bar: bar.el, like, room, fit, frame, dispose: () => scene?.dispose() });
  show();
}

/**
 * The lab's door in the topbar, and the lab reopened where the URL left it
 * (`place.ts`'s `lab`): `?pulllab=<shape>` on that path, `&pullsheet=1` on its
 * sheet — a reload stays on the lab, and `bun run shot` photographs either with
 * no clicks. Run after every sheet has restored itself, so the lab opens over
 * the page it was opened from.
 */
export function bindPullLab(): void {
  document.getElementById("pullLabOpen")?.addEventListener("click", () => openPullLab());
  const asked = initialLab();
  if (asked && !asked.shape.startsWith(HOLD_LAB) && !asked.shape.startsWith(COMBO_LAB))
    openPullLab(asked.shape, { sheet: asked.sheet });
}
