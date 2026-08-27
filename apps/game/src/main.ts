import { buildBoss, buildPods, buildQueue, WAVES } from "@neon-spore/content";
import { Canvas2DRenderer } from "@neon-spore/render";
import {
  createWorld,
  DEFAULT_CONFIG,
  resetClock,
  resetRun,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
} from "@neon-spore/sim";
import { bindAudio } from "./audio.js";
import { bindBriefing } from "./briefing.js";
import { bindControls, InputBuffer } from "./input.js";
import { bindJoinScreen, type JoinScreen } from "./join.js";
import { createLink } from "./link.js";
import { startLoop } from "./loop.js";
import { bindMainMenu, menuRequested } from "./menu.js";
import { bindTestControls } from "./testing.js";
import { bindViewSwitch } from "./view.js";
import { bindViewport } from "./viewport.js";

const canvas = document.getElementById("stage") as HTMLCanvasElement | null;
if (!canvas) throw new Error("canvas #stage missing");

// The hull holds by default here, and only here: this is the test build, and a
// wave that is being looked at should be allowed to finish. The switch is in
// the test panel; `packages/sim` still ships with the hull breakable.
// Briefings and THE FORK are on here and off by default: both want two people.
const cfg = { ...DEFAULT_CONFIG, hullInvulnerable: true, briefings: true, forkBetweenWaves: true };
const world = createWorld(cfg, 0, buildQueue(0, cfg.cols), buildPods(0, cfg.cols));
const renderer = new Canvas2DRenderer(canvas);
const buffer = new InputBuffer();
const audio = bindAudio(canvas);
const tpb = ticksPerBeat(cfg);
/** 0..1 within the beat. Both the picture and a finger on the field need it. */
const beatPhase = (): number => (world.tick % tpb) / tpb;

const view = bindViewSwitch(() => {
  // Nothing to rebuild: the layout is derived per frame and per event.
});
const { stage, layout } = bindViewport(renderer, cfg, () => view.role());

/**
 * How long the wave's name and hint stand. Long enough to read a short one
 * twice: at 2.6 s the hint was gone before anyone had finished it, which made
 * every wave feel like it started mid-sentence.
 */
const BANNER_SECONDS = 5.5;
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
    startWave(
      world,
      e.wave,
      buildQueue(e.wave, cfg.cols),
      buildPods(e.wave, cfg.cols),
      buildBoss(e.wave, cfg.cols),
    );
    banner = openingBanner(e.wave);
  }
}

/** Jump to a wave in the test build: a fresh run, not a continuation. */
function jumpToWave(wave: number): void {
  const target = Math.max(0, wave);
  resetRun(world);
  // The tick counter goes back to zero with the run, so anything remembered
  // against it — in render/ and in audio/ alike — is about to be read as this
  // run's own. See CLAUDE.md on `world.beat` not being monotonic.
  audio.restarted();
  startWave(
    world,
    target,
    buildQueue(target, cfg.cols),
    buildPods(target, cfg.cols),
    buildBoss(target, cfg.cols),
  );
  banner = openingBanner(target);
}

let running = true;
const setRunning = (next: boolean): void => {
  running = next;
};

const tickKeys = bindControls({
  canvas,
  buffer,
  layout,
  stage,
  isOver: () => world.over,
  // The seat decides whose hand a finger on the field is. `test` is both
  // halves on one screen, so it grips as player 1 and G grips as player 2.
  player: () => (view.role() === "p2" ? 2 : 1),
  cfg: world.cfg,
  creatures: () => world.creatures,
  beatPhase,
  onPauseToggle: () => setRunning(!running),
  onWaveStep: (delta) => jumpToWave(world.wave + delta),
});

const brief = bindBriefing({ canvas, buffer, world });
const testPanel = bindTestControls({
  world,
  jumpToWave,
  isRunning: () => running,
  setRunning,
});

/**
 * Two devices. Solo until a room is joined, and joining is the only thing that
 * changes: the same world, the same `step`, the same commands — they simply
 * arrive from two phones instead of two thumbs.
 */
let joinScreen: JoinScreen | null = null;
const link = createLink({
  cfg,
  world,
  buffer,
  onStart: (player) => {
    // The room hands out the seat, so the view follows it rather than whatever
    // this device was last left on.
    view.set(player === 1 ? "p1" : "p2");
    startTogether();
  },
  onStatus: (status) => joinScreen?.update(status),
});
joinScreen = bindJoinScreen({
  join: (room) => link.join(room),
  leave: () => link.leave(),
});

/**
 * The main menu, and only when it was asked for: a build that was opened to
 * look at a wave goes straight to the field. See `menu.ts`.
 */
if (menuRequested(location.href)) {
  bindMainMenu({
    jumpToWave,
    setRunning,
    seat: () => view.role(),
    setSeat: (role) => view.set(role),
    openRoom: () => joinScreen?.open(true),
    openTuning: () => testPanel.open(),
  });
}

/**
 * Beat zero. Both devices land here within a few milliseconds of each other and
 * from here on the tick counter is the only clock either of them reads —
 * which is why the clock goes back to zero and not merely the run.
 */
function startTogether(): void {
  resetClock(world, 0);
  // The one moment that is a genuinely fresh pair, so the one that forgets.
  brief.forget();
  jumpToWave(0);
  running = true;
}

// Events are cleared every tick and a frame covers several ticks, so they are
// collected here rather than read off the world.
let frameEvents: SimEvent[] = [];
let lastFrame = performance.now();

const paint = (dt: number): void => {
  audio.frame(world, frameEvents);
  renderer.draw({
    world,
    beatPhase: beatPhase(),
    role: view.role(),
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
  // A headless check has no thumbs, and a card waits for two of them.
  dismissBriefing: brief.dismiss,
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
    // Lockstep: a tick may only run once the other device has promised that
    // nothing more is coming for it. Solo, this is always true.
    if (!link.mayTick()) return;
    tickKeys();
    step(world, link.drain());
    if (world.events.length) {
      frameEvents.push(...world.events);
      handle(world.events);
    }
    link.checkpoint();
  },
  () => {
    const now = performance.now();
    const dt = Math.min(0.05, (now - lastFrame) / 1000);
    lastFrame = now;
    link.frame(dt * 1000);
    // The wave name waits behind the card; five seconds is less than reading it.
    if (banner.remaining > 0 && !brief.holds()) banner.remaining -= dt;
    paint(dt);
  },
);
