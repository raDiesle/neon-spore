import { Canvas2DRenderer } from "@neon-spore/render";
import { framePhase } from "@neon-spore/sim";
import { mountBuildStamp } from "../../../tools/build-stamp.js";
import { bindAudio } from "./audio.js";
import { gameAutopilot } from "./autopilot.js";
import { bindAwake } from "./awake.js";
import { bindCanvasSheets } from "./canvas-sheets.js";
import { bindFieldInput } from "./field-input.js";
import { startFrames } from "./frame.js";
import { bindTesting } from "./handle.js";
import { bindHaptics } from "./haptics.js";
import { bindHiddenHold } from "./hidden-hold.js";
import { InputBuffer } from "./input.js";
import { interpolationRequested } from "./interpolate.js";
import { shellWiring } from "./main-shell.js";
import { openWorld } from "./main-world.js";
import { menuIdleHz } from "./menu-idle.js";
import { refusePinch } from "./no-pinch.js";
import { bindPressLag } from "./press-lag-page.js";
import { pressQuit } from "./quit.js";
import { bindRasterBurst, bindRasterClasp } from "./raster.js";
import { createRunState } from "./run-state.js";
import { bindShell } from "./shell.js";
import { bindTestControls } from "./testing.js";
import { bindSplashTrail } from "./trail.js";
import { bindViewSwitch } from "./view.js";
import { bindViewport } from "./viewport.js";

mountBuildStamp();

const canvas = document.getElementById("stage") as HTMLCanvasElement | null;
if (!canvas) throw new Error("canvas #stage missing");

const buffer = new InputBuffer();
// `?lag=1`: how long a thumb waits for the field, in the corner (`press-lag.ts`).
bindPressLag(location.href, buffer);
// `view` is built below this line; the getter is read on a frame, long after.
const audio = bindAudio(canvas, () => view.role());
// The config, the world on it, and the three ways a run starts (`main-world.ts`).
const { cfg, world, progression, jumpToWave, startTogether, playAt } = openWorld(audio, buffer);
const renderer = new Canvas2DRenderer(canvas);
// The same context the renderer draws through: a second `getContext` on one
// canvas hands back the one that is already there, so the intro paints over
// the frame rather than onto a second surface nobody would see.
const ctx = canvas.getContext("2d");
if (!ctx) throw new Error("canvas 2d context unavailable");
// The same frame's events the mixer gets, read for the two a hand should feel
// rather than hear (`haptics.ts`). Off unless a player has asked for it.
const haptics = bindHaptics();
/** 0..1 within the beat. Both the picture and a finger on the field need it —
 * and both stop while a hit holds the field, which is what `framePhase` is:
 * a press should answer for the body where it is drawn (`sim/wave-fail.ts`). */
const beatPhase = (): number => framePhase(world);

/**
 * Whether the world ticks, and who is holding it still — a thumb, the menu,
 * the tuning panel, the back question or a tab that went away. Five named holds, so
 * that closing one of them cannot resume a game another is still covering
 * (`run-state.ts`).
 */
const run = createRunState();
// The phone's own idle timer counts taps, and a wave is played in long
// holds — so the screen is asked to stay on for as long as the world is
// ticking, and let go the moment anything holds it still (`awake.ts`).
bindAwake(run);
// And a tab in the background holds it still, then lets go on the way back
// (`hidden-hold.ts`).
bindHiddenHold(run);

// Safari zooms on a pinch whatever the viewport tag says (`no-pinch.ts`).
refusePinch();

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
  skinY: () => renderer.skinY,
  jumpToWave,
  replayGuide: () => renderer.replayGuide(),
  nudgeGuide: () => renderer.nudgeGuide(),
});
const { tick: tickKeys, hand, pointer } = input;

// AUTO under the TEST panel: the hand presses into the same buffer, on the
// tick, just after the keyboard has (`autopilot.ts`).
const auto = gameAutopilot();
const testPanel = bindTestControls({ world, jumpToWave, run, auto });

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
  tickKeys: () => {
    tickKeys();
    auto.press(world, buffer);
  },
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
    auto,
  },
  location.href,
);
