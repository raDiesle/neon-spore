import { controlSetForWave, seatedSet } from "@neon-spore/content";
import {
  Canvas2DRenderer,
  computeLayout,
  computeStage,
  handedLayout,
  pointerSeats,
  pointOnStage,
  type ViewRole,
} from "@neon-spore/render";
import { type Command, framePhase, type SimEvent, step, type World } from "@neon-spore/sim";
import type { FieldControlDef } from "./field-control-def.js";
import { controlRect, type Rect, touchArea } from "./field-focus.js";
import { paintTouchArea } from "./field-touch-paint.js";
import { type TryBar, tryBar } from "./field-try-bar.js";
import { TryLog } from "./field-try-log.js";
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
 * after the lift can be watched; RESTART stands the pose up again; SCREEN
 * draws either seat's screen. Under it, what the hand sent and what the game
 * answered — its events and the sounds its own mixer played (`field-try-log.ts`).
 */

/**
 * Most device pixels a live frame is drawn at. The whole phone is drawn every
 * frame however little of it the window shows, and at four it is five
 * megapixels — sixty frames a second on a desk (9 October 2026); the still
 * card's six (`field-focus-art.ts`) is drawn once.
 */
const MAX_DPR = 4;
/** Frames between two sweeps for the TOUCH AREA outline: each is about ten
 * milliseconds (`field-focus.ts`), too dear for every frame. */
const OUTLINE_EVERY = 6;
export function openTry(title: string, pose: Pose, rows: readonly FieldControlDef[]): void {
  const cfg = pose.build().cfg;
  let world: World = pose.build();
  const shade = document.createElement("div");
  shade.className = "pic-zoom try";
  const room = document.createElement("div");
  room.className = "pic-zoom-stage";
  const view = document.createElement("div");
  view.className = "try-window";
  const canvas = document.createElement("canvas");
  // Over the frame and under nothing: the outline of where a press answers,
  // drawn every few frames while TOUCH AREA is on.
  const outline = document.createElement("canvas");
  outline.className = "try-outline";
  view.append(canvas, outline);
  room.appendChild(view);
  const log = new TryLog();
  const life = new AbortController();
  /** Whose screen is drawn: the pose's own, until SCREEN picks another. */
  const role = (): ViewRole => bar.screen();
  const renderer = new Canvas2DRenderer(canvas);
  const stage = computeStage(PHONE);
  const layout = () =>
    handedLayout(
      computeLayout({ width: stage.width, height: stage.height, dpr: PHONE.dpr }, cfg, role()),
      world,
    );
  const controls = () => seatedSet(controlSetForWave(world.wave), world);
  // The cut is read off the pose as it was opened, per screen: a seat's
  // screen lays the band out its own way.
  const first = pose.build();
  const cuts = new Map<ViewRole, { focus: Rect; whole: Rect }>();
  const cut = (r: ViewRole) => {
    const known = cuts.get(r);
    if (known) return known;
    const made = {
      focus: controlRect(first, r, rows) ?? poseCropRect(pose, first, r, PHONE),
      whole: poseCropRect({ ...pose, crop: "full" }, first, r, PHONE),
    };
    cuts.set(r, made);
    return made;
  };

  let pending: { player: 1 | 2; command: Command }[] = [];
  const push = (player: 1 | 2, command: Command): void => {
    pending.push({ player, command });
    log.sent(player, command);
  };
  const bar: TryBar = tryBar(title, pose.role ?? "test", {
    restart: () => {
      world = pose.build();
      pending = [];
      events = [];
      log.reset();
    },
    sound: (on) => log.setSound(on),
    fit: () => fit(),
    stepOnce: () => stepOnce(),
    close: () => close(),
  });
  const touch = bindStageTouch({
    canvas,
    at: (e) => pointOnStage(e, canvas.getBoundingClientRect(), PHONE, stage),
    layout,
    field: (seat) => stageField(world, role(), controls(), cfg, seat ?? bar.seat(), renderer.skinY),
    seats: () => pointerSeats(role(), bar.seat()),
    push,
    world: () => world,
    role,
    replay: () => renderer.replayGuide(),
    signal: life.signal,
  });

  /** The phone drawn `s` times its size, moved so `rect` fills the window. */
  const fit = (): void => {
    const { focus, whole } = cut(role());
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
    for (const k of ["width", "height", "left", "top"] as const) outline.style[k] = canvas.style[k];
    outline.width = canvas.width;
    outline.height = canvas.height;
    scaled = s;
  };
  let scaled = 1;

  /** The outline again, off the world as it stands (`field-touch-paint.ts`). */
  const paintOutline = (): void => {
    const ctx = outline.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, outline.width, outline.height);
    if (!bar.touch()) return;
    const area = touchArea(world, role(), rows, renderer.skinY);
    const ui = outline.width / (PHONE.width * scaled);
    paintTouchArea(ctx, area, { k: scaled * ui, ox: -stage.left, oy: -stage.top, ui });
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
  let frames = 0;
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
      role: role(),
      time: world.tick / cfg.tickHz,
      dt,
      events,
      running: bar.running(),
      controls: controls(),
      guide: null,
      hand: touch.hand(),
      pointer: touch.pointer(),
    });
    log.frame(world, events, role());
    events = [];
    if (++frames % OUTLINE_EVERY === 0) paintOutline();
    bar.readout(`TICK ${world.tick} · BEAT ${world.waveBeat}${world.over ? " · OVER" : ""}`);
    requestAnimationFrame(frame);
  };

  const onKey = (e: KeyboardEvent): void => {
    if (e.key === "Escape") close();
  };
  const close = (): void => {
    life.abort();
    renderer.dispose();
    log.dispose();
    shade.remove();
    window.removeEventListener("keydown", onKey);
    window.removeEventListener("resize", fit);
  };
  window.addEventListener("keydown", onKey);
  window.addEventListener("resize", fit);
  // Sound needs a press before a browser lets it play.
  canvas.addEventListener("pointerdown", () => log.unlock(), { signal: life.signal });
  shade.append(bar.element, room, log.element);
  document.body.appendChild(shade);
  fit();
  requestAnimationFrame(frame);
}
