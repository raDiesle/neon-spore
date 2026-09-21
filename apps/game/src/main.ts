import { buildPods, buildQueue } from "@neon-spore/content";
import { Canvas2DRenderer } from "@neon-spore/render";
import {
  createWorld,
  DEFAULT_CONFIG,
  DIFFICULTY_BPM,
  type Difficulty,
  framePhase,
  PAIR_ON,
  resetClock,
} from "@neon-spore/sim";
import { mountBuildStamp } from "../../../tools/build-stamp.js";
import { bindAudio } from "./audio.js";
import { bindAwake } from "./awake.js";
import { bindCanvasSheets } from "./canvas-sheets.js";
import { bindFieldInput } from "./field-input.js";
import { startFrames } from "./frame.js";
import { bindTesting } from "./handle.js";
import { bindHaptics } from "./haptics.js";
import { InputBuffer } from "./input.js";
import { interpolationRequested } from "./interpolate.js";
import { shellWiring } from "./main-shell.js";
import { menuIdleHz } from "./menu-idle.js";
import { readProgress } from "./progress.js";
import { pressQuit } from "./quit.js";
import { bindRasterBurst, bindRasterClasp } from "./raster.js";
import { createRunState } from "./run-state.js";
import { bindShell } from "./shell.js";
import { bindTestControls } from "./testing.js";
import { bindSplashTrail } from "./trail.js";
import { bindViewSwitch } from "./view.js";
import { bindViewport } from "./viewport.js";
import { createWaveProgression } from "./waves.js";

mountBuildStamp();

const canvas = document.getElementById("stage") as HTMLCanvasElement | null;
if (!canvas) throw new Error("canvas #stage missing");

// **The hull breaks here like it does anywhere else.** It used to be held by
// default in this build so a wave being looked at could finish, and the owner
// asked for that off — it made the one thing a player is meant to feel
// invisible: a wave of sound went through the ship and the bar did not move,
// so a mistake read as nothing having happened. The switch is still in the
// test panel for whoever wants to sit and watch a wave, off until it is asked
// for.
// `PAIR_ON` is the other switch: the wave opening, on here and off by
// default, because it wants two people. See `config-pair.ts`.
//
// `shotChargeBeats` sits beside it rather than inside it. Two forces set it: a
// shot laid over half a beat is a press player 1 can *see happening* rather
// than one that reaches him as a result (`shot-charge.ts`), and it is also the
// window the mouth's own sequence needs to read in (`cannon-maw.ts`). Shorten
// it on the director's TUNING → PAIR slider rather than here. Off in
// `DEFAULT_CONFIG` so every replay keeps its timing exact.
// And the tempo this device last played at, which is the whole of a difficulty
// (`sim/difficulty.ts`). Medium for a device that has never chosen, which is
// `DEFAULT_CONFIG.bpm` and therefore no change at all.
const cfg = { ...DEFAULT_CONFIG, ...PAIR_ON, shotChargeBeats: 0.5 };
cfg.bpm = DIFFICULTY_BPM[readProgress().level];
const world = createWorld(cfg, 0, buildQueue(0, cfg.cols), buildPods(0, cfg.cols));
const renderer = new Canvas2DRenderer(canvas);
// The same context the renderer draws through: a second `getContext` on one
// canvas hands back the one that is already there, so the intro paints over
// the frame rather than onto a second surface nobody would see.
const ctx = canvas.getContext("2d");
if (!ctx) throw new Error("canvas 2d context unavailable");
const buffer = new InputBuffer();
// `view` is built below this line; the getter is read on a frame, long after.
const audio = bindAudio(canvas, () => view.role());
// The same frame's events the mixer gets, read for the two a hand should feel
// rather than hear (`haptics.ts`). Off unless a player has asked for it.
const haptics = bindHaptics();
/** 0..1 within the beat. Both the picture and a finger on the field need it —
 * and both stop while a hit holds the field, which is what `framePhase` is:
 * a press should answer for the body where it is drawn (`sim/wave-fail.ts`). */
const beatPhase = (): number => framePhase(world);

/**
 * Whether the world ticks, and who is holding it still — a thumb, the menu,
 * the tuning panel or a tab that went away. One owner, four named holds, so
 * that closing one of them cannot resume a game another is still covering
 * (`run-state.ts`).
 */
const run = createRunState();
// The phone's own idle timer counts taps, and a wave is played in long
// holds — so the screen is asked to stay on for as long as the world is
// ticking, and let go the moment anything holds it still (`awake.ts`).
bindAwake(run);

const view = bindViewSwitch(() => {
  // Nothing to rebuild: the layout is derived per frame and per event.
});
// `run`, because the stage's height is frozen for a wave's length (`viewport.ts`).
const { layout, inStage, onStage, toClient } = bindViewport(
  canvas,
  renderer,
  cfg,
  () => view.role(),
  run,
);
const progression = createWaveProgression({ world, cfg, audio, buffer });
const jumpToWave = progression.jumpToWave;

/**
 * The intro's six pages and the welcome before a device's first tutorial,
 * both painted on this canvas over the frame (`canvas-sheets.ts`).
 */
const { intro, welcome } = bindCanvasSheets({
  layout,
  inStage,
  onStage,
  world,
  run,
  role: () => view.role(),
  url: location.href,
});

// `hand` is the ring round the swelling this phone's finger has hold of and
// `pointer` is where a desk's mouse rests: written below, read by the frame.
// Every listener on the canvas, as one knot — the field, a shake, the guide's
// pages and a round's own buttons (`field-input.ts`).
const input = bindFieldInput({
  canvas,
  buffer,
  world,
  run,
  layout,
  inStage,
  role: () => view.role(),
  beatPhase,
  jumpToWave,
  replayGuide: () => renderer.replayGuide(),
  nudgeGuide: () => renderer.nudgeGuide(),
});
const { tick: tickKeys, hand, pointer } = input;

const testPanel = bindTestControls({ world, jumpToWave, run });

/**
 * Two devices. Solo until a room is joined, and joining is the only thing that
 * changes: the same world, the same `step`, the same commands — they simply
 * arrive from two phones instead of two thumbs.
 *
 * The menu, the room screen and the bad-line card come up with it: they are
 * one knot around the link and they are tied in `shell.ts`.
 */
const link = bindShell(
  shellWiring({
    setSound: (on) => audio.setSound(on),
    cfg,
    world,
    buffer,
    run,
    jumpToWave,
    view,
    testPanel,
    startTogether,
    playAt,
    // The one thing `shell.ts` cannot reach for itself: the buffer is this
    // file's, and the question the back gesture asks is one of the two places
    // a run is left (`quit.ts`, `back-ask.ts`).
    quit: () => pressQuit(buffer),
    intro,
  }),
);

// The baked burst and THE CLASP's hand-painted shield, both behind
// `?raster=1` — `raster.ts` and `docs/raster.md`. Neither is fetched at all
// without the flag, so the shipped field is byte for byte the shipped field.
void bindRasterBurst(renderer.sprites, location.href);
void bindRasterClasp(renderer.claspShield, location.href);
// Ink off the end of a mouse, and nothing at all on a phone (`trail.ts`).
// Full size while a sheet is up and much smaller on the field: the "menu" hold
// is exactly "something is covering the game", which is the question asked.
bindSplashTrail({ onField: () => !run.held("menu") });

/**
 * Beat zero. Both devices land here within a few milliseconds of each other,
 * and from here the tick counter is the only clock either reads — which is why
 * the clock goes back to zero and not merely the run.
 *
 * **On the wave the room names**, which is the furthest the pair has reached
 * rather than the first (`link-types.ts`). It is the same number on both
 * phones because it arrived on the same message, and it opens on that wave's
 * guide if it has one, because `jumpToWave` is the door a wave is chosen
 * through everywhere else (`waves.ts`).
 */
function startTogether(wave: number): void {
  resetClock(world, 0);
  jumpToWave(wave);
}

/**
 * The tempo the run is played at, which is the whole of a difficulty.
 *
 * Written onto the config the world already holds rather than into a second
 * one: `SimConfig` is read live by everything in the simulation, so a new `bpm`
 * takes effect on the next tick — which is why every caller of this restarts
 * the run in the same breath. A beat that changed under a wave already falling
 * would leave the arrivals timed against a beat that no longer exists.
 */
function playAt(level: Difficulty): void {
  cfg.bpm = DIFFICULTY_BPM[level];
}

/**
 * Every tick and every frame, from here on (`frame.ts`). Everything above this
 * line is what the app is made of; everything the loop does is one subject and
 * lives in one file.
 */
const frames = startFrames({
  world,
  buffer,
  run,
  renderer,
  ctx,
  audio,
  haptics,
  intro,
  welcome,
  role: () => view.role(),
  beatPhase,
  // `?interpolate=1` — offered rather than the shipped default
  // (`interpolate.ts`).
  interpolate: interpolationRequested(location.href),
  // `?menuidle=<hz>` — offered beside painting every frame (`menu-idle.ts`).
  menuIdle: menuIdleHz(location.href),
  hand,
  pointer,
  tickKeys,
  link,
  progression,
});

// `window.neonSpore`, and the `?perf=1` sweep that is its one caller inside
// the app (`handle.ts`).
bindTesting(
  {
    world,
    buffer,
    jumpToWave,
    input,
    toClient,
    progression,
    frames,
    renderer,
  },
  location.href,
);
