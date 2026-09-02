import { buildPods, buildQueue, controlSetForWave } from "@neon-spore/content";
import { Canvas2DRenderer } from "@neon-spore/render";
import {
  createWorld,
  DEFAULT_CONFIG,
  guideHolds,
  mazeRound,
  PAIR_ON,
  resetClock,
  type SimEvent,
  step,
  ticksPerBeat,
} from "@neon-spore/sim";
import { mountBuildStamp } from "../../../tools/build-stamp.js";
import { bindAudio } from "./audio.js";
import { bindBriefing } from "./briefing.js";
import { demoRows, openDemonstration } from "./demo-menu.js";
import { bindGauge } from "./gauge.js";
import { installTestingHandle } from "./handle.js";
import { bindControls, InputBuffer } from "./input.js";
import { bindJoinScreen, type JoinScreen } from "./join.js";
import { createLink } from "./link.js";
import { startLoop } from "./loop.js";
import { bindMainMenu, menuRequested } from "./menu.js";
import { bindRasterBurst } from "./raster.js";
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
// `shotChargeBeats` sits beside it rather than inside it. Two forces set this
// number now. The original, two-device one still holds: a shot laid over half
// a beat is a press player 1 can *see happening*, not one that reaches him
// only as a result (`shot-charge.ts`). And since the mouth was adopted as a
// cloaca that strains, crowns and goes slack (`cannon-maw.ts`, `egg-curve.ts`)
// rather than a rim that merely tightened and cut, this is also the window
// that animation needs to read in — too short and the sequence goes by before
// an eye can follow it. Shortening it trades against both; feel out a smaller
// value on the director's TUNING → PAIR "Shot lay (testing)" slider rather
// than here. Off in `DEFAULT_CONFIG` so every replay keeps its timing exact.
const cfg = { ...DEFAULT_CONFIG, ...PAIR_ON, hullInvulnerable: true, shotChargeBeats: 0.5 };
const world = createWorld(cfg, 0, buildQueue(0, cfg.cols), buildPods(0, cfg.cols));
const renderer = new Canvas2DRenderer(canvas);
const buffer = new InputBuffer();
// `view` is built below this line; the getter is read on a frame, long after.
const audio = bindAudio(canvas, () => view.role());
const tpb = ticksPerBeat(cfg);
/** 0..1 within the beat. Both the picture and a finger on the field need it. */
const beatPhase = (): number => (world.tick % tpb) / tpb;

const view = bindViewSwitch(() => {
  // Nothing to rebuild: the layout is derived per frame and per event.
});
const { stage, layout } = bindViewport(renderer, cfg, () => view.role());
const progression = createWaveProgression({ world, cfg, audio, buffer });
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
  // THE MAZE's string is answered on the field like any other handle, so the
  // hit test has to know whether a wheel is up (`render/touch.ts`).
  maze: () => mazeRound(world),
  // And THE WARDEN's rope, for the same reason: its handle is a control drawn
  // on the field, and a hit test that did not know the boss was up would leave
  // the pilot pressing something that answers nothing.
  warden: () => (world.boss?.kind === "warden" ? world.boss : null),
  // Which panel is up follows from the wave, so a control the wave did not
  // ask for has no button and answers no thumb (`content/control-sets.ts`).
  controls: () => controlSetForWave(world.wave),
  creatures: () => world.creatures,
  beatPhase,
  // Space at the keyboard must not be able to do what a tap on the field
  // already can't: put the introduction away before its timer does. See the
  // guard in `keys.ts`.
  guideHolds: () => guideHolds(world),
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

// The baked burst, behind `?raster=1` — `raster.ts` and `docs/raster.md`.
void bindRasterBurst(renderer.sprites, location.href);

/**
 * Beat zero. Both devices land here within a few milliseconds of each other and
 * from here on the tick counter is the only clock either of them reads —
 * which is why the clock goes back to zero and not merely the run.
 */
function startTogether(): void {
  resetClock(world, 0);
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
    // Per device by design, not a value the two phones share — own-motion
    // (a shimmer, a wobble) is allowed to differ between them because it
    // touches nothing about the simulation. A shared clock would instead be
    // `(world.tick + alpha) / cfg.tickHz`, where `alpha` is the fractional
    // tick this frame lands on.
    time: performance.now() / 1000,
    dt,
    events: frameEvents,
    running,
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
    // The wave's name and sentence stand for a few seconds and pass on their
    // own — counted here, because nothing in `sim` may read a clock.
    progression.tickOpening(dt);
    paint(dt);
  },
);
