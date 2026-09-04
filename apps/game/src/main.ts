import { buildPods, buildQueue, controlSetForWave } from "@neon-spore/content";
import { Canvas2DRenderer } from "@neon-spore/render";
import {
  briefingHolds,
  createWorld,
  DEFAULT_CONFIG,
  guideHolds,
  mazeRound,
  PAIR_ON,
  resetClock,
  type SimEvent,
  snakeHolds,
  step,
  ticksPerBeat,
} from "@neon-spore/sim";
import { mountBuildStamp } from "../../../tools/build-stamp.js";
import { bindAudio } from "./audio.js";
import { bindBriefing } from "./briefing.js";
import { openDemonstration } from "./demo-menu.js";
import { bindGauge } from "./gauge.js";
import { installTestingHandle } from "./handle.js";
import { bindHaptics } from "./haptics.js";
import { bindControls, InputBuffer } from "./input.js";
import { startLoop } from "./loop.js";
import { bindPinball } from "./pinball.js";
import { bindRasterBurst } from "./raster.js";
import { createRunState } from "./run-state.js";
import { bindShell } from "./shell.js";
import { bindSnake } from "./snake.js";
import { throttledTally } from "./tally.js";
import { bindTestControls } from "./testing.js";
import { bindViewSwitch } from "./view.js";
import { bindViewport } from "./viewport.js";
import { createWaveProgression } from "./waves.js";

mountBuildStamp();

const canvas = document.getElementById("stage") as HTMLCanvasElement | null;
if (!canvas) throw new Error("canvas #stage missing");

// The hull holds by default here, and only here: this is the test build, and a
// wave that is being looked at should be allowed to finish. The switch is in
// the test panel; `packages/sim` still ships with the hull breakable.
// `PAIR_ON` is the other switch: the wave opening, on here and off by
// default, because it wants two people. See `config-pair.ts`.
//
// `shotChargeBeats` sits beside it rather than inside it. Two forces set it: a
// shot laid over half a beat is a press player 1 can *see happening* rather
// than one that reaches him as a result (`shot-charge.ts`), and it is also the
// window the mouth's own sequence needs to read in (`cannon-maw.ts`). Shorten
// it on the director's TUNING → PAIR slider rather than here. Off in
// `DEFAULT_CONFIG` so every replay keeps its timing exact.
const cfg = { ...DEFAULT_CONFIG, ...PAIR_ON, hullInvulnerable: true, shotChargeBeats: 0.5 };
const world = createWorld(cfg, 0, buildQueue(0, cfg.cols), buildPods(0, cfg.cols));
const renderer = new Canvas2DRenderer(canvas);
const buffer = new InputBuffer();
// `view` is built below this line; the getter is read on a frame, long after.
const audio = bindAudio(canvas, () => view.role());
// The same frame's events the mixer gets, read for the two a hand should feel
// rather than hear (`haptics.ts`). Off unless a player has asked for it.
const haptics = bindHaptics();
const tpb = ticksPerBeat(cfg);
/** 0..1 within the beat. Both the picture and a finger on the field need it. */
const beatPhase = (): number => (world.tick % tpb) / tpb;

const view = bindViewSwitch(() => {
  // Nothing to rebuild: the layout is derived per frame and per event.
});
const { layout, inStage } = bindViewport(canvas, renderer, cfg, () => view.role());
const progression = createWaveProgression({ world, cfg, audio, buffer });
const jumpToWave = progression.jumpToWave;

/**
 * Whether the world ticks, and who is holding it still — a thumb, the menu,
 * the tuning panel or a tab that went away. One owner, four named holds, so
 * that closing one of them cannot resume a game another is still covering
 * (`run-state.ts`).
 */
const run = createRunState();

// `hand` is the ring round the swelling this phone's finger has hold of and
// `pointer` is where a desk's mouse rests: written below, read by the frame.
const {
  tick: tickKeys,
  hand,
  pointer,
} = bindControls({
  canvas,
  buffer,
  layout,
  inStage,
  isOver: () => world.over,
  // The seat decides whose hand a finger on the field is. `test` is both
  // halves on one screen, so it grips as player 1 and G grips as player 2.
  player: () => (view.role() === "p2" ? 2 : 1),
  cfg: world.cfg,
  // THE MAZE's string is answered on the field like any other handle, so the
  // hit test has to know whether a wheel is up (`render/touch.ts`).
  maze: () => mazeRound(world),
  // And THE WARDEN's rope, for the same reason: its handle is a control drawn
  // on the field, and a hit test that did not know the boss was up would leave
  // the pilot pressing something that answers nothing.
  warden: () => (world.boss?.kind === "warden" ? world.boss : null),
  // Which panel is up follows from the wave (`content/control-sets.ts`).
  controls: () => controlSetForWave(world.wave),
  creatures: () => world.creatures,
  // The ship answers a finger where it is drawn, not only on the strips below.
  cannonCol: () => world.cannonCol,
  shieldCol: () => world.shieldCol,
  opening: () => briefingHolds(world),
  beatPhase,
  // Space at the keyboard must not be able to do what a tap on the field
  // already can't: put the introduction away before its timer does. See the
  // guard in `keys.ts`.
  guideHolds: () => guideHolds(world),
  // The arrows are the body's while it is moving, and the rig's otherwise
  // (`keys.ts`).
  snakeHolds: () => snakeHolds(world),
  onPauseToggle: () => run.hold("hand", !run.held("hand")),
  onWaveStep: (delta) => jumpToWave(world.wave + delta),
  onGuideReplay: () => renderer.replayGuide(),
});

const brief = bindBriefing({
  canvas,
  buffer,
  world,
  layout,
  inStage,
  role: () => view.role(),
  replay: () => renderer.replayGuide(),
});
// THE GAUGE brings its own controls, on its own listener — neither player's
// band is the answer, and the two seats differ (`gauge.ts`, interludes.md).
bindGauge({ canvas, buffer, world, layout, inStage, role: () => view.role() });
// SNAKE brings its own six, on its own listener, for the same reason
// (`snake.ts`). Neither round's listener can fire while the other is up: the
// simulation only holds one boss at a time and each asks whether it is theirs.
bindSnake({ canvas, buffer, world, layout, inStage, role: () => view.role() });
bindPinball({ canvas, buffer, world, layout, inStage, role: () => view.role() });
const testPanel = bindTestControls({ world, jumpToWave, run });

/**
 * Two devices. Solo until a room is joined, and joining is the only thing that
 * changes: the same world, the same `step`, the same commands — they simply
 * arrive from two phones instead of two thumbs.
 *
 * The menu, the room screen and the bad-line card come up with it: they are
 * one knot around the link and they are tied in `shell.ts`.
 */
const link = bindShell({
  setSound: (on) => audio.setSound(on),
  cfg,
  world,
  buffer,
  run,
  jumpToWave,
  seat: () => view.role(),
  setSeat: (role) => view.set(role),
  openTuning: () => testPanel.open(),
  openDemo: (id) => openDemonstration(id, cfg, jumpToWave),
  onStart: () => startTogether(),
});

// The baked burst, behind `?raster=1` — `raster.ts` and `docs/raster.md`.
void bindRasterBurst(renderer.sprites, location.href);

/**
 * Beat zero. Both devices land here within a few milliseconds of each other,
 * and from here the tick counter is the only clock either reads — which is why
 * the clock goes back to zero and not merely the run.
 */
function startTogether(): void {
  resetClock(world, 0);
  jumpToWave(0);
}

/** How far this device has got, up to the room now and then (`tally.ts`). */
const tellTally = throttledTally((wave, score) => link.tally(wave, score));

// Events are cleared every tick and a frame covers several ticks, so they are
// collected here rather than read off the world.
let frameEvents: SimEvent[] = [];
let lastFrame = performance.now();

const paint = (dt: number): void => {
  audio.frame(world, frameEvents);
  haptics.frame(frameEvents);
  renderer.draw({
    world,
    beatPhase: beatPhase(),
    role: view.role(),
    // Per device by design, not a value the two phones share — own-motion
    // (a shimmer, a wobble) is allowed to differ between them because it
    // touches nothing about the simulation.
    time: performance.now() / 1000,
    dt,
    events: frameEvents,
    running: run.running(),
    hand: hand.current,
    pointer: pointer(),
    names: link.status().names,
  });
  frameEvents = [];
};

installTestingHandle({
  world,
  buffer,
  jumpToWave,
  dismissBriefing: brief.dismiss,
  progression,
  collect: (events) => frameEvents.push(...events),
  paint,
});

startLoop(
  cfg.tickHz,
  () => {
    // Paused: drop whatever was pressed rather than letting it pile up for the
    // moment play resumes. A finished run is not paused — its commands still
    // go through, otherwise the restart tap would never arrive.
    if (!run.running() && !world.over) {
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
    tellTally(world.wave, world.score);
    // The wave's name and sentence stand for a few seconds and pass on their
    // own — counted here, because nothing in `sim` may read a clock.
    progression.tickOpening(dt);
    paint(dt);
  },
);
