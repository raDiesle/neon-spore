import type { Point } from "@neon-spore/content";
import { type ComboRule, comboReadout } from "./combo-kinds.js";
import { COMBO_RULES, comboRuleOf } from "./combo-lab-combos.js";
import { coverPage } from "./cover.js";
import { choice, grouped } from "./field-try-bar.js";
import { text } from "./gestures-page.js";
import { GOO_HOLDS, HOLD_LOOKS } from "./hold-goo/index.js";
import type { HoldLook } from "./hold-goo/view.js";
import { COMBO_LAB } from "./place.js";
import { paintField } from "./pull-lab-paint.js";
import { LAB_H, LAB_W } from "./pull-lab-shapes.js";
import { initialLab, placeLab } from "./session.js";

/**
 * **THE COMBO LAB** — two gestures in one action, on an empty field, as THE
 * PULL LAB is the pull's and THE HOLD LAB the hold's (the owner, 12 October
 * 2026: *treat pull and hold as a new separate category of action, either to
 * wait for other player or just for some time … create another pull lab for
 * this category*).
 *
 * The choices on the bar:
 *
 * - **COMBO** — what the action is (`COMBO_RULES`, `combo-lab-combos.ts`):
 *   a pull held at its end, a hold while the partner works, a pull that
 *   waits on the partner's press, a hold loosed by a swipe;
 * - **the hold's look** — the HOLD LAB's looks, the one every hold in a
 *   combo wears; the pull is the game's own knob, FIZZ.
 *
 * Each combo is a `ComboRule` (`combo-kinds.ts`): its rule, its frame, and
 * AUTO's thumb, which plays one counted and at least one refused a loop.
 */

/** Device pixels per lab pixel and per CSS pixel, at most, as the HOLD LAB's. */
const MAX_DPR = 4;
const MAX_SCREEN_DPR = 2;

/** The lab on screen, shut by a second opening — there is only ever one. */
let shutOpen: (() => void) | null = null;

export function openComboLab(first = "partner"): void {
  shutOpen?.();
  let combo: ComboRule<unknown> = comboRuleOf(first);
  let state: unknown = combo.fresh();
  let look: HoldLook = GOO_HOLDS[0] ?? (HOLD_LOOKS[0] as HoldLook);
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

  const reset = (): void => {
    state = combo.fresh();
    autoTime = 0;
    down = false;
    placeLab({ shape: COMBO_LAB + combo.key, sheet: false });
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
      HOLD_LOOKS.map((l) => [l.name.toUpperCase(), l] as [string, HoldLook]),
      look,
      (l) => {
        look = l;
      },
      "HOLD LOOK",
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
    canvas.addEventListener(type, f as EventListener, { signal: life.signal });
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
    const th = combo.thumb(autoTime);
    if (th.down && !down) combo.press(state, th.at);
    if (th.down) combo.move(state, th.at);
    if (!th.down && down) combo.lift(state);
    down = th.down;
  };

  let last = performance.now();
  const frame = (now: number): void => {
    if (life.signal.aborted) return;
    const dt = Math.min(0.1, (now - last) / 1000) * speed;
    last = now;
    time += dt;
    if (auto) drive(dt);
    combo.tick(state, dt);
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.setTransform(canvas.width / LAB_W, 0, 0, canvas.height / LAB_H, 0, 0);
      paintField(ctx);
      combo.paint(ctx, state, look, time);
    }
    readout.textContent = comboReadout(combo, state);
    requestAnimationFrame(frame);
  };

  // Caught on the way down and stopped, as the other labs': one press shuts only the lab.
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
    resized.disconnect();
  };
  shutOpen = shut;
  document.addEventListener("keydown", onKey, { capture: true });
  // The sentence and the readout take a line more or less as they change: the field fits what is left.
  const resized = new ResizeObserver(fit);
  shade.append(bar, like, room);
  document.body.appendChild(shade);
  const uncover = coverPage(shade);
  say();
  fit();
  resized.observe(room);
  requestAnimationFrame(frame);
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
