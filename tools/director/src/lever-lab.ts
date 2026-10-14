import type { Point } from "@neon-spore/content";
import { choice, grouped } from "./field-try-bar.js";
import { text } from "./gestures-page.js";
import { HOLD_ASKS, holdAsk } from "./hold-lab-rule.js";
import { labShell } from "./lab-shell.js";
import { leverThumb } from "./lever-lab-auto.js";
import { paintLeverLab } from "./lever-lab-paint.js";
import { leverReadout } from "./lever-lab-readout.js";
import { freshLever, type LabLever, lift, move, press, tick } from "./lever-lab-rule.js";
import { LEVER_ASKS, LEVER_GROOVES, LEVER_PAIRS, leverSetup, setupKey } from "./lever-lab-setup.js";
import { LEVER_LAB } from "./place.js";
import { fitCanvas } from "./pull-lab-canvas.js";
import { LAB_H, LAB_W } from "./pull-lab-shapes.js";
import { initialLab } from "./session.js";

/**
 * **THE LEVER LAB** — the one generic LEVER on an empty field, to be carried
 * by hand, as THE PULL LAB is the pull's: the owner, 14 October 2026, *create
 * new "lab" for "LEVER — CARRY TO A DEPTH AND HOLD", which follows visual
 * ideas from "pull" but needs to be enhanced for "lever" requirements*.
 *
 * The knob and its channel are the PULL LAB's FIZZ; what a lever adds — the
 * depth as a value, a zone on the groove, a hold in it, a spring back, a
 * partner — is the rule's (`lever-lab-rule.ts`) and the paint's
 * (`lever-lab-paint.ts`). The bar's four choices are the SUGGESTED line's
 * open questions, to be felt before one is taken:
 *
 * - **ASKS**: DEPTH ONLY · PAST A GRIP · IN A BAND;
 * - **GROOVE**: DOWN · SIDEWAYS, EITHER WAY;
 * - **SEATS**: ONE · TWO, EACH · TWO, SUMMED — the partner's lever played by the lab;
 * - **HOLD FOR**: the HOLD LAB's beats.
 *
 * AUTO's thumb (`lever-lab-auto.ts`) plays a whole hold, an early lift and a
 * wrong depth on a loop; RETRY puts a fresh lever on the field.
 */
export function openLeverLab(first = "grip", opts: { host?: HTMLElement } = {}): void {
  const shell = labShell(opts.host);
  let setup = leverSetup(first);
  let lever: LabLever = freshLever(setup);
  let auto = true;
  let speed = 1;
  let time = 0;
  let autoTime = 0;
  let down = false;
  let finger = matchMedia("(pointer: coarse)").matches;
  const touch = (): boolean => finger && !auto;

  const bar = document.createElement("div");
  bar.className = "pic-zoom-bar";
  const room = document.createElement("div");
  room.className = "pic-zoom-stage";
  const canvas = document.createElement("canvas");
  canvas.className = "pull-lab-canvas";
  room.appendChild(canvas);
  const like = text("p", "", "pull-lab-like");
  const readout = text("span", "", "try-readout");

  const reset = (): void => {
    lever = freshLever(setup);
    autoTime = 0;
    down = false;
    shell.place({ shape: LEVER_LAB + setupKey(setup), sheet: false });
  };
  const pick = (part: string, k: string): void => {
    const keys = {
      ask: setup.ask.key,
      groove: setup.groove,
      pair: setup.pair,
      beats: setup.beats.key,
    };
    setup = leverSetup(Object.values({ ...keys, [part]: k }).join("-"));
    reset();
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
  const options = <T extends { key: string; label: string }>(all: readonly T[]) =>
    all.map((a) => [a.label, a.key] as [string, string]);
  bar.append(
    text("b", "LEVER LAB · THE ONE GENERIC LEVER, ON AN EMPTY FIELD"),
    close,
    choice(options(LEVER_ASKS), setup.ask.key, (k) => pick("ask", k), "ASKS"),
    choice(options(LEVER_GROOVES), setup.groove, (k) => pick("groove", k), "GROOVE"),
    choice(options(LEVER_PAIRS), setup.pair, (k) => pick("pair", k), "SEATS"),
    choice(options(HOLD_ASKS), setup.beats.key, (k) => pick("beats", holdAsk(k).key), "HOLD FOR"),
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
    finger = e.pointerType === "touch";
    canvas.setPointerCapture(e.pointerId);
    press(setup, lever, toLab(e));
  });
  on("pointermove", (e) => {
    if (!auto) move(setup, lever, toLab(e), touch());
  });
  on("pointerup", () => {
    if (!auto) lift(setup, lever);
  });

  /** AUTO's thumb drives the rule exactly as a mouse would. */
  const drive = (dt: number): void => {
    autoTime += dt;
    const th = leverThumb(setup, autoTime);
    if (th.down && !down) press(setup, lever, th.at);
    if (th.down) move(setup, lever, th.at);
    if (!th.down && down) lift(setup, lever);
    down = th.down;
  };

  let last = performance.now();
  const frame = (now: number): void => {
    const dt = Math.min(0.1, (now - last) / 1000) * speed;
    last = now;
    time += dt;
    if (auto) drive(dt);
    tick(setup, lever, dt);
    const f = { setup, lever, time, touch: touch() };
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.setTransform(canvas.width / LAB_W, 0, 0, canvas.height / LAB_H, 0, 0);
      paintLeverLab(ctx, f);
    }
    readout.textContent = leverReadout(f);
    const pair = LEVER_PAIRS.find((p) => p.key === setup.pair);
    like.textContent = `${setup.ask.label} — stands for ${setup.ask.like}${pair && setup.pair !== "one" ? `; ${pair.like}` : ""}.`;
  };

  shell.mount({ bar, like, room, fit: () => fitCanvas(canvas, room, null), frame });
}

/**
 * The lab reopened where the URL left it (`place.ts`'s `lab`, as
 * `LEVER_LAB` and its setup): `?leverlab=grip-down-one-2`, so a reload stays
 * on the lab and `bun run shot` photographs it with no clicks.
 */
export function bindLeverLab(): void {
  const asked = initialLab();
  if (asked?.shape.startsWith(LEVER_LAB)) openLeverLab(asked.shape.slice(LEVER_LAB.length));
}
