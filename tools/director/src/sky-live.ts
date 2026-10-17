import { Canvas2DRenderer, computeLayout, computeStage, type ViewRole } from "@neon-spore/render";
import { framePhase, type World } from "@neon-spore/sim";
import { PHONE } from "./pose-frame.js";

/**
 * **A sky card that moves**: the field of a world drawn by the shipping
 * renderer every frame, at the phone's own size, with own-motion's clock
 * running — so the giant's bands turn, the aurora folds and the remnant's
 * core flashes the way they do in the game.
 *
 * The world is never ticked. Nothing on the field advances; only what the
 * renderer moves on `time` alone does, which is the whole of a sky.
 *
 * The renderer draws straight onto the canvas the card shows, and the card is
 * a window the height of the field onto it, so a frame is one `draw` and no
 * copy. Only cards on screen are drawn, and a card taken out of the page is
 * dropped from the loop.
 */

interface Live {
  readonly box: HTMLElement;
  readonly draw: (time: number) => void;
  seen: boolean;
}

const live: Live[] = [];
let running = false;
let watcher: IntersectionObserver | null = null;
const byBox = new WeakMap<Element, Live>();

function tick(): void {
  let kept = 0;
  const t = performance.now() / 1000;
  for (const l of live) {
    if (!l.box.isConnected) continue;
    live[kept++] = l;
    if (l.seen) l.draw(t);
  }
  live.length = kept;
  if (kept === 0) {
    running = false;
    return;
  }
  requestAnimationFrame(tick);
}

/** The field of `world`, live, in a box exactly its size. */
export function liveField(world: World, role: ViewRole): HTMLElement {
  const cfg = world.cfg;
  const canvas = document.createElement("canvas");
  const renderer = new Canvas2DRenderer(canvas);
  renderer.resize(PHONE);
  const stage = computeStage(PHONE);
  const layout = computeLayout(
    { width: stage.width, height: stage.height, dpr: PHONE.dpr },
    cfg,
    role,
  );
  canvas.style.width = `${PHONE.width}px`;
  canvas.style.height = `${PHONE.height}px`;
  canvas.style.marginLeft = `${-stage.left}px`;

  const box = document.createElement("div");
  box.className = "sky-live";
  box.style.width = `${layout.width}px`;
  box.style.height = `${Math.round(layout.bandTop)}px`;
  box.appendChild(canvas);

  const base = { world, beatPhase: framePhase(world), role, running: true, banner: null };
  const draw = (time: number) => renderer.draw({ ...base, time, dt: 1 / 60, events: [] });
  // Settled, as a still is (`pose-frame.ts`): the eased pose walked to where
  // it belongs, and a first frame on screen before any animation fires.
  for (let i = 0; i < 40; i++) renderer.draw({ ...base, time: 0, dt: 1 / 20, events: [] });
  draw(0);

  const entry: Live = { box, draw, seen: typeof IntersectionObserver !== "function" };
  live.push(entry);
  byBox.set(box, entry);
  if (typeof IntersectionObserver === "function") {
    watcher ??= new IntersectionObserver((entries) => {
      for (const e of entries) {
        const l = byBox.get(e.target);
        if (l) l.seen = e.isIntersecting;
      }
    });
    watcher.observe(box);
  }
  if (!running) {
    running = true;
    requestAnimationFrame(tick);
  }
  return box;
}
