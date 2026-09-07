import { controlSet } from "@neon-spore/content";
import { Canvas2DRenderer, type ViewRole } from "@neon-spore/render";
import {
  createWorld,
  mazeRound,
  type SimConfig,
  type SimEvent,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { bindKeyHelp } from "./key-help.js";
import { bindKeys, type Keys } from "./keys.js";
import { bindStageAfterRun } from "./stage-afterrun.js";
import { exposeStageHandle } from "./stage-handle.js";
import { runStageLoop } from "./stage-loop.js";
import type { StagePanel } from "./stage-panel.js";
import { stageGeometry } from "./stage-point.js";
import { bindStageRounds } from "./stage-rounds.js";
import { bindStageTouch, pointerSeat } from "./stage-touch.js";
import { bindStageTransport } from "./stage-transport.js";
import { buildStageWorld } from "./stage-world.js";
import { currentWave, type Store } from "./state.js";

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
  let frameEvents: SimEvent[] = [];
  let lastBeat = -1;

  // The renderer draws into a phone-shaped rectangle inside this canvas, so a
  // layout built from the canvas answers every control somewhere the picture
  // is not — `stage-point.ts` owns the measuring and the whole of that.
  const { layout, at } = stageGeometry(
    canvas,
    cfg,
    () => role,
    (v) => renderer.resize(v),
  );

  // The stage plays `store.waves` (the draft), not the shipped `WAVES` — the
  // panel comes from the wave's own `controls` field, the one `rail.ts`'s picker
  // writes, never an index. Read fresh, since the picker changes it under us.
  const currentControlSet = () => controlSet(currentWave(store)?.controls);
  // The keyboard is that panel too: a key is a seat and a slot on it, and the
  // stage is the one panel that knows which wave it is standing on
  // (`keys.ts`). Handed the call rather than the set, for the same reason
  // everything else on this line is.
  const keys: Keys = bindKeys(cfg, () => world.creatures, currentControlSet);
  // Every round draws slabs, which `touchDown` cannot answer (`stage-rounds.ts`).
  bindStageRounds({
    canvas,
    at,
    layout,
    role: () => role,
    world: () => world,
    controls: currentControlSet,
    push: (player, command) => keys.push(player, command),
  });
  const touch = bindStageTouch({
    canvas,
    at,
    layout,
    field: () => ({
      creatures: world.creatures,
      // The ship answers a finger where it is drawn, so the hit test needs
      // both lobes' columns (`render/touch-ship.ts`).
      cannonCol: world.cannonCol,
      shieldCol: world.shieldCol,
      beatPhase: (world.tick % ticksPerBeat(cfg)) / ticksPerBeat(cfg),
      beat: world.beat,
      seat: pointerSeat(role),
      cfg,
      maze: mazeRound(world),
      warden: world.boss?.kind === "warden" ? world.boss : null,
      controls: currentControlSet(),
      malfunction: world.malfunction,
    }),
    push: keys.push,
    world: () => world,
    role: () => role,
    replay: () => renderer.replayGuide(),
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
    lastBeat = 0;
    onBeat(0);
    afterRun.paint(); // a fresh world is never over
  };

  /**
   * A cleared wave restarts instead of advancing. The game answers `needWave`
   * with the next wave; here the next wave is the one being edited, because
   * watching it again is the entire loop the editor exists for.
   */
  const handle = (events: readonly SimEvent[]): void => {
    for (const e of events) {
      if (e.type === "needWave") rebuild();
    }
  };

  const stepOnce = (): void => {
    step(world, keys.drain(world.tick));
    if (world.events.length) {
      frameEvents.push(...world.events);
      handle(world.events);
    }
    const beat = Math.floor(world.tick / ticksPerBeat(cfg));
    if (beat !== lastBeat) {
      lastBeat = beat;
      onBeat(beat);
    }
  };

  const advance = (): void => {
    if (!running) {
      keys.drain(world.tick);
      return;
    }
    stepOnce();
  };

  const paint = (dt: number): void => {
    const tpb = ticksPerBeat(cfg);
    renderer.draw({
      world,
      beatPhase: (world.tick % tpb) / tpb,
      role,
      time: performance.now() / 1000,
      dt,
      events: frameEvents,
      running,
      controls: currentControlSet(),
      hand: touch.hand(),
      pointer: touch.pointer(), // whatever a desk's mouse is resting on
    });
    frameEvents = [];
    onFrame();
  };

  runStageLoop({ tickHz: () => cfg.tickHz, advance, paint });

  const playBtn = document.getElementById("play");
  const paintPlay = (): void => {
    if (playBtn) playBtn.textContent = running ? "⏸" : "▶";
  };
  const afterRun = bindStageAfterRun({
    canvas,
    world: () => world,
    rebuild,
    setRunning: (r) => (running = r),
    paintPlay,
  });
  bindStageTransport({
    rebuild,
    onPlayToggle: () => {
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

  const seek = (beat: number): void => {
    rebuild();
    const ticks = beat * ticksPerBeat(cfg);
    for (let i = 0; i < ticks; i++) stepOnce();
    running = false;
    paintPlay();
  };

  paintPlay();
  rebuild();

  exposeStageHandle({
    world: () => world,
    advance: (ticks) => {
      for (let i = 0; i < ticks; i++) stepOnce();
    },
    paint: () => paint(1 / 60),
  });

  return {
    rebuild,
    seek,
    play,
    openRound,
    closeRound,
    round: () => wantedRound,
    beat: () => lastBeat,
    world: () => world,
  };
}

/**
 * The contract is `stage-panel.ts` next door, cut out when this file went over
 * its ceiling. Re-exported because every panel that touches the stage reached
 * for the type through here, and a split is not a reason to make them move.
 */
export type { StagePanel } from "./stage-panel.js";
