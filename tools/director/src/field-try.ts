import { controlSetForWave, seatedSet } from "@neon-spore/content";
import {
  Canvas2DRenderer,
  computeLayout,
  computeStage,
  handedLayout,
  pointerSeats,
  pointOnStage,
} from "@neon-spore/render";
import { type Command, framePhase, type SimEvent, step, type World } from "@neon-spore/sim";
import type { FieldControlDef } from "./field-control-def.js";
import { controlRect, type Rect } from "./field-focus.js";
import { type TryBar, tryBar } from "./field-try-bar.js";
import { text } from "./gestures-page.js";
import { poseCropRect } from "./pose-art.js";
import { PHONE } from "./pose-frame.js";
import type { Pose } from "./pose-kit.js";
import { stageField } from "./stage-field.js";
import { bindStageTouch } from "./stage-touch.js";

/**
 * **A control on its own, played** — the owner, 9 October 2026, on CONTROLS ›
 * ON THE FIELD: *"I would also need to see the animation before and after the
 * action is ongoing and completed … the best would be I can try myself with
 * the control standalone."*
 *
 * The card's pose, built fresh and run live: the shipping renderer drawing the
 * real world, a mouse answered by the director stage's own binding
 * (`stage-touch.ts`, so `touch.ts` decides what a press means here exactly as
 * on the phone), and the window cut to the box round the control
 * (`field-focus.ts`) and blown up to fill the screen. Slowed to an eighth, or
 * held and stepped a tick at a time, the look before a press, under it and
 * after the lift can be watched; RESTART stands the pose up again. The last
 * commands the hand sent are listed under it, for what the control *says*.
 */

/**
 * Most device pixels a live frame is drawn at. The whole phone is drawn every
 * frame however little of it the window shows, and at four it is five
 * megapixels — sixty frames a second on a desk (9 October 2026); the still
 * card's six (`field-focus-art.ts`) is drawn once.
 */
const MAX_DPR = 4;
/** Commands kept in the readout. */
const LOG = 6;

function say(c: Command): string {
  const { kind, ...rest } = c as Command & Record<string, unknown>;
  const parts = Object.entries(rest).map(([k, v]) => `${k} ${String(v)}`);
  return [kind, ...parts].join(" · ");
}

export function openTry(title: string, pose: Pose, rows: readonly FieldControlDef[]): void {
  const role = pose.role ?? "test";
  const cfg = pose.build().cfg;
  let world: World = pose.build();
  const shade = document.createElement("div");
  shade.className = "pic-zoom try";
  const room = document.createElement("div");
  room.className = "pic-zoom-stage";
  const view = document.createElement("div");
  view.className = "try-window";
  const canvas = document.createElement("canvas");
  view.appendChild(canvas);
  room.appendChild(view);
  const log = text("p", "", "try-log");
  const life = new AbortController();
  const renderer = new Canvas2DRenderer(canvas);
  const stage = computeStage(PHONE);
  const layout = () =>
    handedLayout(
      computeLayout({ width: stage.width, height: stage.height, dpr: PHONE.dpr }, cfg, role),
      world,
    );
  const controls = () => seatedSet(controlSetForWave(world.wave), world);
  const focus: Rect = controlRect(world, role, rows) ?? poseCropRect(pose, world, role, PHONE);
  const whole: Rect = poseCropRect({ ...pose, crop: "full" }, world, role, PHONE);

  let pending: { player: 1 | 2; command: Command }[] = [];
  const sent: string[] = [];
  const push = (player: 1 | 2, command: Command): void => {
    pending.push({ player, command });
    sent.unshift(`P${player} ${say(command)}`);
    sent.length = Math.min(sent.length, LOG);
    log.textContent = sent.join("\n");
  };
  const bar: TryBar = tryBar(title, {
    restart: () => {
      world = pose.build();
      pending = [];
      events = [];
    },
    fit: () => fit(),
    stepOnce: () => stepOnce(),
    close: () => close(),
  });
  const touch = bindStageTouch({
    canvas,
    at: (e) => pointOnStage(e, canvas.getBoundingClientRect(), PHONE, stage),
    layout,
    field: (seat) => stageField(world, role, controls(), cfg, seat ?? bar.seat(), renderer.skinY),
    seats: () => pointerSeats(role, bar.seat()),
    push,
    world: () => world,
    role: () => role,
    replay: () => renderer.replayGuide(),
    signal: life.signal,
  });

  /** The phone drawn `s` times its size, moved so `rect` fills the window. */
  const fit = (): void => {
    const rect = bar.whole() ? whole : focus;
    const box = room.getBoundingClientRect();
    const s = Math.min((box.width - 28) / rect.w, (box.height - 14) / rect.h);
    view.style.width = `${rect.w * s}px`;
    view.style.height = `${rect.h * s}px`;
    canvas.style.width = `${PHONE.width * s}px`;
    canvas.style.height = `${PHONE.height * s}px`;
    canvas.style.left = `${-rect.x * s}px`;
    canvas.style.top = `${-rect.y * s}px`;
    const dpr = Math.min(MAX_DPR, Math.max(1, s * (window.devicePixelRatio || 1)));
    renderer.resize({ ...PHONE, dpr });
  };

  let events: SimEvent[] = [];
  const stepOnce = (): void => {
    const tick = world.tick;
    step(
      world,
      pending.map((p) => ({ tick, ...p })),
    );
    pending = [];
    events.push(...world.events);
  };

  let carried = 0;
  let last = performance.now();
  const frame = (now: number): void => {
    if (life.signal.aborted) return;
    const dt = Math.min(0.1, (now - last) / 1000) * bar.speed();
    last = now;
    if (bar.running()) {
      carried += dt * cfg.tickHz;
      for (; carried >= 1; carried--) stepOnce();
    }
    renderer.draw({
      world,
      beatPhase: framePhase(world),
      role,
      time: world.tick / cfg.tickHz,
      dt,
      events,
      running: bar.running(),
      controls: controls(),
      guide: null,
      hand: touch.hand(),
      pointer: touch.pointer(),
    });
    events = [];
    bar.readout(`TICK ${world.tick} · BEAT ${world.waveBeat}${world.over ? " · OVER" : ""}`);
    requestAnimationFrame(frame);
  };

  const onKey = (e: KeyboardEvent): void => {
    if (e.key === "Escape") close();
  };
  const close = (): void => {
    life.abort();
    renderer.dispose();
    shade.remove();
    window.removeEventListener("keydown", onKey);
    window.removeEventListener("resize", fit);
  };
  window.addEventListener("keydown", onKey);
  window.addEventListener("resize", fit);
  shade.append(bar.element, room, log);
  document.body.appendChild(shade);
  fit();
  requestAnimationFrame(frame);
}
