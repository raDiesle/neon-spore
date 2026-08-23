import { buildQueue, WAVES } from "@neon-spore/content";
import { Canvas2DRenderer, computeLayout } from "@neon-spore/render";
import {
  createWorld,
  DEFAULT_CONFIG,
  resetRun,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
} from "@neon-spore/sim";
import { bindControls, InputBuffer } from "./input.js";
import { startLoop } from "./loop.js";
import { bindTestControls } from "./testing.js";

const canvas = document.getElementById("stage") as HTMLCanvasElement | null;
if (!canvas) throw new Error("canvas #stage missing");

const cfg = { ...DEFAULT_CONFIG };
const world = createWorld(cfg, 0, buildQueue(0, cfg.cols));
const renderer = new Canvas2DRenderer(canvas);
const buffer = new InputBuffer();

let viewport = { width: 0, height: 0, dpr: 1 };
let layout = computeLayout({ width: 1, height: 1, dpr: 1 }, cfg);
const resize = (): void => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  // A zero-sized viewport happens for real: a hidden tab, and on a phone the
  // moment the address bar animates. Sizing the canvas to it once would leave
  // it at zero for good, because no further resize event need follow.
  if (width < 1 || height < 1) return;
  viewport = { width, height, dpr: Math.min(window.devicePixelRatio || 1, 2) };
  renderer.resize(viewport);
  layout = computeLayout(viewport, cfg);
};
window.addEventListener("resize", resize);
new ResizeObserver(resize).observe(document.documentElement);
resize();

/** Wave name and hint, shown for a moment at the start of a wave. */
const BANNER_SECONDS = 2.6;
let banner = openingBanner(0);

function openingBanner(wave: number): { title: string; hint: string; remaining: number } {
  const w = WAVES[wave];
  return w
    ? { title: w.name, hint: w.hint, remaining: BANNER_SECONDS }
    : { title: `WAVE ${wave + 1}`, hint: "Beyond the authored waves.", remaining: BANNER_SECONDS };
}

/**
 * The simulation asks for a queue; it cannot fetch one itself, because waves
 * live in `content/` and nothing points back into the sim. This is the only
 * place the two meet.
 */
function handle(events: readonly SimEvent[]): void {
  for (const e of events) {
    if (e.type !== "needWave") continue;
    startWave(world, e.wave, buildQueue(e.wave, cfg.cols));
    banner = openingBanner(e.wave);
  }
}

/** Jump to a wave in the test build: a fresh run, not a continuation. */
function jumpToWave(wave: number): void {
  const target = Math.max(0, wave);
  resetRun(world);
  startWave(world, target, buildQueue(target, cfg.cols));
  banner = openingBanner(target);
}

let running = true;
const setRunning = (next: boolean): void => {
  running = next;
};

bindControls({
  canvas,
  buffer,
  layout: () => layout,
  isOver: () => world.over,
  onPauseToggle: () => setRunning(!running),
});

bindTestControls({
  world,
  jumpToWave,
  isRunning: () => running,
  setRunning,
});

// Events are cleared every tick and a frame covers several ticks, so they are
// collected here rather than read off the world.
let frameEvents: SimEvent[] = [];
const tpb = ticksPerBeat(cfg);
let lastFrame = performance.now();

const paint = (dt: number): void => {
  renderer.draw({
    world,
    beatPhase: (world.tick % tpb) / tpb,
    player: 1,
    time: performance.now() / 1000,
    dt,
    events: frameEvents,
    running,
    banner,
  });
  frameEvents = [];
};

/**
 * The testing handle. A hidden tab suspends requestAnimationFrame, so a check
 * that wants a picture has to be able to ask for one. It also lets a headless
 * check advance the world without touching the loop — the Director Mode
 * recorder will want the same two verbs.
 */
(window as unknown as { neonSpore: unknown }).neonSpore = {
  world,
  jumpToWave,
  advance(ticks: number) {
    for (let i = 0; i < ticks; i++) {
      step(world, buffer.drain(world.tick));
      if (world.events.length) {
        frameEvents.push(...world.events);
        handle(world.events);
      }
    }
  },
  paint: () => paint(1 / 60),
};

startLoop(
  cfg.tickHz,
  () => {
    // Paused: drop whatever was pressed rather than letting it pile up for the
    // moment play resumes. A finished run is not paused — its commands still
    // go through, otherwise the restart tap would never arrive.
    if (!running && !world.over) {
      buffer.drain(world.tick);
      return;
    }
    step(world, buffer.drain(world.tick));
    if (world.events.length) {
      frameEvents.push(...world.events);
      handle(world.events);
    }
  },
  () => {
    const now = performance.now();
    const dt = Math.min(0.05, (now - lastFrame) / 1000);
    lastFrame = now;
    if (banner.remaining > 0) banner.remaining -= dt;
    paint(dt);
  },
);
