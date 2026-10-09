import { controlSetForWave, seatedSet } from "@neon-spore/content";
import { Canvas2DRenderer, computeLayout, computeStage, handedLayout } from "@neon-spore/render";
import { framePhase, type SimEvent, ticksPerBeat } from "@neon-spore/sim";
import { AutopilotGhosts } from "./autopilot-ghost.js";
import type { FieldControlDef } from "./field-control-def.js";
import { focusOf } from "./field-focus.js";
import { cardArea } from "./field-focus-art.js";
import { autoTick, stillTicks } from "./field-stills.js";
import { text } from "./gestures-page.js";
import { poseCropRect } from "./pose-art.js";
import { cutCard, PHONE } from "./pose-frame.js";
import type { Pose } from "./pose-kit.js";
import { stageField } from "./stage-field.js";

/**
 * A card's strip of stills, drawn: its pose played forward with AUTO's hand,
 * every tick drawn by the shipping renderer so each effect runs its course,
 * and the six moments `field-stills.ts` names cut to the control with AUTO's
 * finger over them (`autopilot-ghost.ts`, the stage's own AUTO finger).
 *
 * A run is a few hundred frames, so the strip fills in as it goes and the
 * page keeps answering: the element comes back at once, and a frame is
 * added each time one is ready.
 */

/** Most device pixels the run is drawn at; every tick is a whole phone. */
const MAX_DPR = 3;
/** Frames spent settling the pose's eased look before the run starts. */
const SETTLE = 20;
/** Ticks drawn between two yields to the page. */
const YIELD_EVERY = 40;

const nextFrame = (): Promise<void> => new Promise((r) => requestAnimationFrame(() => r()));

/** The strip, `frame` CSS pixels a still and no taller than `cap`; a line
 * saying so where AUTO cannot reach the card's control. */
export function stillsStrip(
  pose: Pose,
  rows: readonly FieldControlDef[],
  frame: number,
  cap: number,
): HTMLElement {
  const box = document.createElement("div");
  box.className = "stills";
  const moments = stillTicks(pose.build(), rows);
  if (!moments) {
    box.appendChild(
      text("p", "AUTO does not reach this control — play it with ▶ TRY IT.", "stills-none"),
    );
    return box;
  }
  void fill(box, pose, rows, moments, frame, cap);
  return box;
}

async function fill(
  box: HTMLElement,
  pose: Pose,
  rows: readonly FieldControlDef[],
  moments: readonly { label: string; at: number }[],
  frame: number,
  cap: number,
): Promise<void> {
  const world = pose.build();
  const role = pose.role ?? "test";
  const cfg = world.cfg;
  const tpb = ticksPerBeat(cfg);
  const rect = focusOf(cardArea(pose, rows)) ?? poseCropRect(pose, world, role, PHONE);
  const wide = Math.min(frame, (cap * rect.w) / rect.h);
  const dpr = Math.max(1, Math.min(MAX_DPR, (wide * (window.devicePixelRatio || 1)) / rect.w));
  const off = document.createElement("canvas");
  const renderer = new Canvas2DRenderer(off);
  renderer.resize({ ...PHONE, dpr });
  const stage = computeStage(PHONE);
  const layout = () =>
    handedLayout(
      computeLayout({ width: stage.width, height: stage.height, dpr: PHONE.dpr }, cfg, role),
      world,
    );
  const controls = () => seatedSet(controlSetForWave(world.wave), world);
  const field = (seat: 1 | 2) => stageField(world, role, controls(), cfg, seat, renderer.skinY);
  const ghosts = new AutopilotGhosts();
  let events: SimEvent[] = [];
  let since = 0;
  const draw = (dt: number): void =>
    renderer.draw({
      world,
      beatPhase: framePhase(world),
      role,
      time: world.tick / cfg.tickHz,
      dt,
      events,
      running: true,
      controls: controls(),
      guide: null,
    });
  // Once the strip is on the page; a strip whose view was closed stops.
  await nextFrame();
  for (let i = 0; i < SETTLE; i++) draw(1 / 20);
  const last = Math.max(...moments.map((m) => m.at));
  for (let t = 0; t <= last && box.isConnected; t++) {
    const sent = autoTick(world);
    events.push(...world.events);
    ghosts.observe(layout(), field, world.tick, tpb, sent);
    since++;
    const kept = moments.filter((m) => m.at === t);
    if (kept.length === 0 && since < 2) continue;
    draw(since / cfg.tickHz);
    events = [];
    since = 0;
    for (const m of kept) {
      const ctx = off.getContext("2d");
      if (ctx) {
        ctx.save();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.translate(stage.left, stage.top);
        ghosts.paint(ctx, layout(), world.tick, tpb);
        ctx.restore();
      }
      const figure = document.createElement("figure");
      figure.appendChild(
        cutCard({ canvas: off, layout: layout(), stage, dpr }, rect, frame, cap).canvas,
      );
      figure.appendChild(text("figcaption", m.label));
      box.appendChild(figure);
    }
    if (t % YIELD_EVERY === 0) await nextFrame();
  }
  renderer.dispose();
}
