import type { Point } from "@neon-spore/content";
import { type ComboRule, comboReadout } from "./combo-kinds.js";
import { COMBO_RULES, comboRuleOf } from "./combo-lab-combos.js";
import { choice, grouped } from "./field-try-bar.js";
import { text } from "./gestures-page.js";
import { SOAK_HOLD } from "./hold-goo/index.js";
import { labShell } from "./lab-shell.js";
import { COMBO_LAB } from "./place.js";
import { fitCanvas } from "./pull-lab-canvas.js";
import { paintField } from "./pull-lab-paint.js";
import { LAB_H, LAB_W } from "./pull-lab-shapes.js";
import { initialLab } from "./session.js";

/**
 * **THE COMBO LAB** — two gestures in one action, on an empty field, as THE
 * PULL LAB is the pull's and THE HOLD LAB the hold's (the owner, 12 October
 * 2026: *treat pull and hold as a new separate category of action, either to
 * wait for other player or just for some time … create another pull lab for
 * this category*).
 *
 * Its one choice on the bar is **COMBO** — what the action is (`COMBO_RULES`,
 * `combo-lab-combos.ts`): a pull held at its end, a hold while the partner
 * works, a pull the partner's press brings, a hold and then a pull in
 * its place. Every hold in a combo wears the HOLD LAB's SOAK and nothing else (the owner,
 * 12 October 2026: *all should follow "hold look" of "soak" to be consistent -
 * remove alternatives*); the pull is the game's own knob, FIZZ.
 *
 * Each combo is a `ComboRule` (`combo-kinds.ts`): its rule, its frame, and
 * AUTO's thumb, which plays one counted and at least one refused a loop.
 */

export function openComboLab(first = "partner", opts: { host?: HTMLElement } = {}): void {
  const shell = labShell(opts.host);
  let combo: ComboRule<unknown> = comboRuleOf(first);
  let state: unknown = combo.fresh();
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

  const reset = (): void => {
    state = combo.fresh();
    autoTime = 0;
    down = false;
    shell.place({ shape: COMBO_LAB + combo.key, sheet: false });
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
    text("b", "COMBO LAB · TWO GESTURES IN ONE ACTION, ON AN EMPTY FIELD"),
    close,
    choice(
      COMBO_RULES.map((c) => [c.label, c.key] as [string, string]),
      combo.key,
      (k) => {
        combo = comboRuleOf(k);
        reset();
        say();
      },
      "COMBO",
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
    combo.press(state, toLab(e));
  });
  on("pointermove", (e) => {
    if (!auto) combo.move(state, toLab(e));
  });
  on("pointerup", () => {
    if (!auto) combo.lift(state);
  });

  const say = (): void => {
    like.textContent = `${combo.label} — ${combo.says}. Stands for ${combo.like}.`;
  };
  const fit = (): void => fitCanvas(canvas, room, null);

  /** AUTO's thumb drives the rule exactly as a mouse would. */
  const drive = (dt: number): void => {
    autoTime += dt;
    const th = combo.thumb(autoTime);
    if (th.down && !down) combo.press(state, th.at);
    if (th.down) combo.move(state, th.at);
    if (!th.down && down) combo.lift(state);
    down = th.down;
  };

  let last = performance.now();
  const frame = (now: number): void => {
    const dt = Math.min(0.1, (now - last) / 1000) * speed;
    last = now;
    time += dt;
    if (auto) drive(dt);
    combo.tick(state, dt);
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.setTransform(canvas.width / LAB_W, 0, 0, canvas.height / LAB_H, 0, 0);
      paintField(ctx);
      combo.paint(ctx, state, SOAK_HOLD, time);
    }
    readout.textContent = comboReadout(combo, state);
  };

  shell.mount({ bar, like, room, fit, frame });
  say();
}

/**
 * The lab's door in the topbar, and the lab reopened where the URL left it
 * (`place.ts`'s `lab`, as `COMBO_LAB` and the combo): `?combolab=partner`, `?combolab=plug`.
 */
export function bindComboLab(): void {
  document.getElementById("comboLabOpen")?.addEventListener("click", () => openComboLab());
  const asked = initialLab();
  if (asked?.shape.startsWith(COMBO_LAB)) openComboLab(asked.shape.slice(COMBO_LAB.length));
}
