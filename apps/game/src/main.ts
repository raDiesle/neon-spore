import { buildPods, buildQueue, controlSetForWave } from "@neon-spore/content";
import { Canvas2DRenderer } from "@neon-spore/render";
import {
  createWorld,
  DEFAULT_CONFIG,
  PAIR_ON,
  resetClock,
  type SimEvent,
  step,
  ticksPerBeat,
} from "@neon-spore/sim";
import { bindAudio } from "./audio.js";
import { bindBriefing } from "./briefing.js";
import { demoRows, openDemonstration } from "./demo-menu.js";
import { bindGauge } from "./gauge.js";
import { bindControls, InputBuffer } from "./input.js";
import { bindJoinScreen, type JoinScreen } from "./join.js";
import { createLink } from "./link.js";
import { startLoop } from "./loop.js";
import { bindMainMenu, menuRequested } from "./menu.js";
import { bindTestControls } from "./testing.js";
import { bindViewSwitch } from "./view.js";
import { bindViewport } from "./viewport.js";
import { createWaveProgression } from "./waves.js";

const canvas = document.getElementById("stage") as HTMLCanvasElement | null;
if (!canvas) throw new Error("canvas #stage missing");

// The hull holds by default here, and only here: this is the test build, and a
// wave that is being looked at should be allowed to finish. The switch is in
// the test panel; `packages/sim` still ships with the hull breakable.
// `PAIR_ON` is the other switch: briefings and THE FORK, on here and off by
// default, because both want two people. See `config-pair.ts`.
//
// `shotChargeBeats` sits beside it rather than inside it. It is on here for a
// two-device reason — a shot that is laid over half a beat is a press player 1
// can *see*, where a press that was instantly a bullet reached him only as a
// result (`shot-charge.ts`) — but unlike those three switches it stops nothing
// and blocks no headless caller. It is off in `DEFAULT_CONFIG` so that every
// replay keeps its timing to the tick, which is a different argument from
// needing two thumbs, and a different argument belongs in a different place.
const cfg = { ...DEFAULT_CONFIG, ...PAIR_ON, hullInvulnerable: true, shotChargeBeats: 0.5 };
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
const progression = createWaveProgression({ world, cfg, audio });
const jumpToWave = progression.jumpToWave;

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
  // Which panel is up follows from the wave, so a control the wave did not
  // ask for has no button and answers no thumb (`content/control-sets.ts`).
  controls: () => controlSetForWave(world.wave),
  creatures: () => world.creatures,
  beatPhase,
  onPauseToggle: () => setRunning(!running),
  onWaveStep: (delta) => jumpToWave(world.wave + delta),
});

const brief = bindBriefing({ canvas, buffer, world });
// THE GAUGE brings its own controls, on its own listener — neither player's
// band is the answer, and the two seats do not get the same one
// (`gauge.ts`, docs/spec/interludes.md).
bindGauge({ canvas, buffer, world, layout, stage, role: () => view.role() });
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
    demos: demoRows(),
    openDemo: (id) => openDemonstration(id, cfg, jumpToWave),
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
    banner: progression.banner(),
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
        progression.handle(world.events);
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
      progression.handle(world.events);
    }
    link.checkpoint();
  },
  () => {
    const now = performance.now();
    const dt = Math.min(0.05, (now - lastFrame) / 1000);
    lastFrame = now;
    link.frame(dt * 1000);
    // The wave name waits behind the card; five seconds is less than reading it.
    progression.tickBanner(dt, brief.holds());
    paint(dt);
  },
);
