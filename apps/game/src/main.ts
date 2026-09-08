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
  ticksPerBeat,
} from "@neon-spore/sim";
import { mountBuildStamp } from "../../../tools/build-stamp.js";
import { bindAudio } from "./audio.js";
import { bindBriefing } from "./briefing.js";
import { openDemonstration } from "./demo-menu.js";
import { startFrames } from "./frame.js";
import { bindTesting } from "./handle.js";
import { bindHaptics } from "./haptics.js";
import { bindControls, InputBuffer } from "./input.js";
import { interpolationRequested } from "./interpolate.js";
import { bindIntro } from "./intro.js";
import { menuIdleHz } from "./menu-idle.js";
import { bindRasterBurst } from "./raster.js";
import { bindRounds } from "./rounds.js";
import { createRunState } from "./run-state.js";
import { bindShake } from "./shake.js";
import { bindShell } from "./shell.js";
import { bindTestControls } from "./testing.js";
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
const cfg = { ...DEFAULT_CONFIG, ...PAIR_ON, shotChargeBeats: 0.5 };
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
const tpb = ticksPerBeat(cfg);
/** 0..1 within the beat. Both the picture and a finger on the field need it. */
const beatPhase = (): number => (world.tick % tpb) / tpb;

const view = bindViewSwitch(() => {
  // Nothing to rebuild: the layout is derived per frame and per event.
});
const { layout, inStage, onStage } = bindViewport(canvas, renderer, cfg, () => view.role());
const progression = createWaveProgression({ world, cfg, audio, buffer });
const jumpToWave = progression.jumpToWave;

/**
 * Whether the world ticks, and who is holding it still — a thumb, the menu,
 * the tuning panel or a tab that went away. One owner, four named holds, so
 * that closing one of them cannot resume a game another is still covering
 * (`run-state.ts`).
 */
const run = createRunState();

/**
 * The six pages that say what this game is, over the top of the frame.
 *
 * Bound here rather than in `shell.ts` because it needs the two things only
 * this file has — the canvas's own context and the frame that has just been
 * painted — and because a build opened with `?play=1` has no shell at all and
 * still has to be able to not show it.
 */
const intro = bindIntro({
  sheet: document.getElementById("introTap"),
  layout,
  inStage,
  onStage,
  // The same hold the menu takes: somebody reading page two is not somebody
  // who wants a wave arriving underneath them (`run-state.ts`).
  hold: (on) => run.hold("menu", on),
});

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
  malfunction: () => world.malfunction,
  creatures: () => world.creatures,
  // The ship answers a finger where it is drawn, not only on the strips below.
  cannonCol: () => world.cannonCol,
  shieldCol: () => world.shieldCol,
  opening: () => briefingHolds(world),
  beatPhase,
  beat: () => world.beat,
  // Space at the keyboard must not be able to do what a tap on the field
  // already can't: put the introduction away before its timer does. See the
  // guard in `keys.ts`.
  guideHolds: () => guideHolds(world),
  onPauseToggle: () => run.hold("hand", !run.held("hand")),
  onWaveStep: (delta) => jumpToWave(world.wave + delta),
  onGuideReplay: () => renderer.replayGuide(),
});

// THE CHOIR's own control, and the only input in the game that is not a finger
// on the glass. It is bound unconditionally and never behind a capability
// check — there is no reliable way to ask a browser whether a shake can be
// reported, so the game offers this *and* the two arrows on the field and lets
// the pilot use whichever their phone answers (`shake.ts`).
bindShake(buffer);

const brief = bindBriefing({
  canvas,
  buffer,
  world,
  layout,
  inStage,
  role: () => view.role(),
  replay: () => renderer.replayGuide(),
});
// Every round that is not the field brings its own buttons, on its own
// listener — neither player's band is the answer (`rounds.ts`).
bindRounds({ canvas, buffer, world, layout, inStage, role: () => view.role() });
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
  intro,
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

/**
 * Every tick and every frame, from here on (`frame.ts`). Everything above this
 * line is what the app is made of; everything the loop does is one subject and
 * lives in one file.
 */
const frames = startFrames({
  world,
  tickHz: cfg.tickHz,
  buffer,
  run,
  renderer,
  ctx,
  audio,
  haptics,
  intro,
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
    dismissBriefing: brief.dismiss,
    progression,
    frames,
    renderer,
  },
  location.href,
);
