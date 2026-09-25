import {
  Canvas2DRenderer,
  DeskSeat,
  handedLayout,
  pointerSeats,
  type ViewRole,
} from "@neon-spore/render";
import {
  createWorld,
  type SimConfig,
  ticksPerBeat,
  toGuidePage,
  type World,
} from "@neon-spore/sim";
import { bindKeyHelp } from "./key-help.js";
import { bindKeys, type Keys } from "./keys.js";
import { bindStageAfterRun } from "./stage-afterrun.js";
import { stageAutopilot } from "./stage-autopilot.js";
import { draftControlSet, draftGuide } from "./stage-draft.js";
import { stageField } from "./stage-field.js";
import { exposeStageHandle } from "./stage-handle.js";
import { runStageLoopWhileSeen, stageTickHz } from "./stage-loop.js";
import type { StagePanel } from "./stage-panel.js";
import { stageGeometry } from "./stage-point.js";
import { bindStageRepeat } from "./stage-repeat.js";
import { stageStep } from "./stage-step.js";
import { bindStageTouch } from "./stage-touch.js";
import { bindStageTrail } from "./stage-trail.js";
import { bindStageTransport } from "./stage-transport.js";
import { buildStageWorld } from "./stage-world.js";
import type { Store } from "./state.js";

export function bindStage(
  store: Store,
  cfg: SimConfig,
  onBeat: (beat: number) => void,
  onFrame: () => void = () => {},
): StagePanel {
  const canvas = document.getElementById("stage") as HTMLCanvasElement | null;
  if (!canvas) throw new Error("canvas #stage missing");

  const renderer = new Canvas2DRenderer(canvas);
  let world: World = createWorld(cfg, store.index);
  let role: ViewRole = "test";
  let running = true;

  // The renderer draws into a phone-shaped rectangle inside this canvas, so a
  // layout built from the canvas answers every control somewhere the picture
  // is not — `stage-point.ts` owns the measuring and the whole of that.
  const { layout, at, viewport, stage } = stageGeometry(
    canvas,
    cfg,
    () => role,
    (v) => renderer.resize(v),
  );

  // What the wave being edited says, read fresh (`stage-draft.ts`).
  const currentControlSet = () => draftControlSet(store);
  const currentGuide = () => draftGuide(store);
  // The keyboard is that panel too: a key is a seat and a slot on it, and the
  // stage is the one panel that knows which wave it is standing on
  // (`keys.ts`). Handed the call rather than the set, for the same reason
  // everything else on this line is.
  // And the two seat keys, which say whose hand the mouse is under TEST
  // (`render/desk-seat.ts`): held here by the keyboard, read by every hit test.
  const desk = new DeskSeat();
  const keys: Keys = bindKeys(cfg, () => world.creatures, currentControlSet, desk);
  // Ink off the end of a mouse, over the field and nowhere else, and none of
  // it on a phone (`stage-trail.ts`).
  bindStageTrail(canvas);
  // What a hit test is handed, read fresh on every press (`stage-field.ts`).
  const fieldFor = (seat?: 1 | 2) =>
    stageField(world, role, currentControlSet(), cfg, seat ?? desk.seat(), renderer.skinY);
  // AUTO: a boss's hand on the seats the row names (`stage-autopilot.ts`).
  const auto = stageAutopilot(
    { layout: () => handedLayout(layout(), world), field: fieldFor },
    document,
  );
  const touch = bindStageTouch({
    canvas,
    at,
    layout: () => handedLayout(layout(), world), // answered where it is drawn.
    // A seat may be asked for: with neither key held the press is run for one
    // seat and then the other until one of them answers (`render/desk-grab.ts`).
    field: fieldFor,
    seats: () => auto.seats(pointerSeats(role, desk.seat())),
    push: keys.push,
    world: () => world,
    role: () => role,
    replay: () => renderer.replayGuide(),
  });

  // One tick and one frame, and everything either of them reads
  // (`stage-step.ts`). `repeat` is stood up below and asked for by call, which
  // is the only order this file has left to get wrong.
  const stepper = stageStep({
    cfg,
    world: () => world,
    renderer: {
      draw: (seen) => {
        renderer.draw(seen);
        auto.paint(canvas, viewport(), stage(), world); // AUTO's fingers, over the frame
      },
    },
    keys,
    auto: auto.commands,
    cueTick: touch.cueTick, // `3`'s held thumbs move into the tick that follows them
    running: () => running,
    role: () => role,
    controls: currentControlSet,
    guide: currentGuide,
    hand: touch.hand,
    pointer: touch.pointer,
    onBeat,
    onFrame,
    onNeedWave: (retry) => (retry ? repeat.answer() : repeat.ask()),
  });

  /**
   * The round a panel is holding the fight on, re-applied to every world this
   * stage builds. Zero is the fight's own opening round, which is what a boss
   * with no panel and every wave with no boss wants.
   */
  let wantedRound = 0;

  // A fresh world every time, built from the draft — `stage-world.ts` has why.
  const rebuild = (): void => {
    // The round goes in with the build rather than after it: a world standing
    // on the wrong sheet is a world the panel is already lying about, and the
    // two used to be two statements a caller had to put in the right order.
    world = buildStageWorld(store, cfg, wantedRound);
    auto.reset();
    stepper.opened();
    afterRun.paint(); // a fresh world is never over
    repeat.hide();
  };

  // Only while the canvas is on screen: a phone showing WAVE or MAP, or a
  // desk with the GAME column collapsed, pays nothing for the stage.
  runStageLoopWhileSeen(canvas, {
    tickHz: () => stageTickHz(world),
    advance: stepper.advance,
    paint: stepper.paint,
  });

  const playBtn = document.getElementById("play");
  const paintPlay = (): void => {
    if (playBtn) playBtn.textContent = running ? "⏸" : "▶";
  };
  const setRunning = (r: boolean): void => {
    running = r;
  };
  const afterRun = bindStageAfterRun({
    canvas,
    world: () => world,
    rebuild,
    setRunning,
    paintPlay,
  });
  const veil = document.getElementById("repeatWave");
  if (!veil) throw new Error("#repeatWave missing");
  const repeat = bindStageRepeat({ veil, doc: document, rebuild, setRunning, paintPlay });
  bindStageTransport({
    rebuild,
    onPlayToggle: () => {
      if (repeat.asking()) return repeat.answer(); // P is yes, while it asks
      running = !running;
      paintPlay();
    },
    setRole: (r) => {
      role = r;
    },
  });
  bindKeyHelp(currentControlSet);

  const play = (): void => {
    running = true;
    paintPlay();
  };

  // Written down first and stood up second, so the caller needs no ordering of
  // its own — `rebuild` is what puts the fight on it, here and everywhere else.
  const openRound = (round: number): void => {
    wantedRound = round;
    rebuild();
    play();
  };

  const closeRound = (): void => {
    wantedRound = 0;
  };

  // A fresh run held on one page of its guide, both seats on it (`stage-panel.ts`).
  const openPage = (page: number): void => {
    rebuild();
    toGuidePage(world, 1, page);
    toGuidePage(world, 2, page);
    play();
  };

  const seek = (beat: number): void => {
    rebuild();
    const ticks = beat * ticksPerBeat(cfg);
    for (let i = 0; i < ticks; i++) stepper.stepOnce();
    running = false;
    paintPlay();
  };

  paintPlay();
  rebuild();

  exposeStageHandle({
    world: () => world,
    advance: (ticks) => {
      for (let i = 0; i < ticks; i++) stepper.stepOnce();
    },
    paint: () => stepper.paint(1 / 60),
  });

  return {
    rebuild,
    seek,
    play,
    openRound,
    closeRound,
    openPage,
    round: () => wantedRound,
    beat: stepper.beat,
    world: () => world,
  };
}

/** The contract is `stage-panel.ts`; re-exported because every panel reaches for it here. */
export type { StagePanel } from "./stage-panel.js";
