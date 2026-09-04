import { bossFromWave, controlSet, podsFromWave, queueFromWave } from "@neon-spore/content";
import { Canvas2DRenderer, computeLayout, type Viewport, type ViewRole } from "@neon-spore/render";
import {
  createWorld,
  mazeRound,
  type SimConfig,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { bindKeyHelp } from "./key-help.js";
import { bindKeys, type Keys } from "./keys.js";
import { bindStageAfterRun } from "./stage-afterrun.js";
import { exposeStageHandle } from "./stage-handle.js";
import { runStageLoop } from "./stage-loop.js";
import { bindStageRounds } from "./stage-rounds.js";
import { bindStageTouch, cardRenderRole, pointerSeat } from "./stage-touch.js";
import { bindStageTransport } from "./stage-transport.js";
import { currentWave, type Store } from "./state.js";

/**
 * The wave, playing, in the shape the phone draws it in.
 *
 * It runs the shipping renderer against a real `World` — not a preview of the
 * grid. The whole reason the editor is worth building is the question the data
 * cannot answer: whether the cannon has time to get there. A second drawing of
 * the same numbers would answer nothing.
 */
export interface StagePanel {
  /** Fresh run of the wave being edited. Called whenever its shape changes. */
  rebuild(): void;
  /** Replay the wave from its start up to `beat`, then hold there. */
  seek(beat: number): void;
  /** Let the field run from where it is — what a wave opened to be *watched*
   * needs, since the transport keeps whatever it was last left at. */
  play(): void;
  /** The beat the field is holding, for a placement to land on. */
  beat(): number;
  /**
   * The world being played. `rebuild` swaps it for a new one, so a panel
   * reading the run needs a call rather than a reference handed out once.
   */
  world(): World;
}

export function bindStage(
  store: Store,
  cfg: SimConfig,
  onBeat: (beat: number) => void,
  onFrame: () => void = () => {},
): StagePanel {
  const canvas = document.getElementById("stage") as HTMLCanvasElement | null;
  if (!canvas) throw new Error("canvas #stage missing");

  const renderer = new Canvas2DRenderer(canvas);
  const keys: Keys = bindKeys(
    () => cfg.cols,
    () => world.creatures,
  );
  let world: World = createWorld(cfg, store.index);
  let role: ViewRole = "test";
  // Which half of a `test`-mode card is up — director state beside `role`,
  // never the world's; stepped by `bindStageTouch`, read by `cardRenderRole`.
  let cardStep: 0 | 1 | 2 = 0;
  let running = true;
  let frameEvents: SimEvent[] = [];
  let lastBeat = -1;
  let viewport: Viewport = { width: 0, height: 0, dpr: 1 };

  const resize = (): void => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    viewport = {
      width: rect.width,
      height: rect.height,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    };
    renderer.resize(viewport);
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  // The stage plays `store.waves` (the draft), not the shipped `WAVES` — the
  // panel comes from the wave's own `controls` field, the one `rail.ts`'s picker
  // writes, never an index. Read fresh, since the picker changes it under us.
  const currentControlSet = () => controlSet(currentWave(store)?.controls);
  // Every round draws slabs, which `touchDown` cannot answer (`stage-rounds.ts`).
  bindStageRounds({
    canvas,
    layout: () => computeLayout(viewport, cfg, role),
    role: () => role,
    world: () => world,
    controls: currentControlSet,
    push: (player, command) => keys.push(player, command),
  });
  const touch = bindStageTouch({
    canvas,
    layout: () => computeLayout(viewport, cfg, role),
    field: () => ({
      creatures: world.creatures,
      // The ship answers a finger where it is drawn, so the hit test needs
      // both lobes' columns (`render/touch-ship.ts`).
      cannonCol: world.cannonCol,
      shieldCol: world.shieldCol,
      beatPhase: (world.tick % ticksPerBeat(cfg)) / ticksPerBeat(cfg),
      seat: pointerSeat(role),
      cfg,
      maze: mazeRound(world),
      warden: world.boss?.kind === "warden" ? world.boss : null,
      controls: currentControlSet(),
    }),
    push: keys.push,
    world: () => world,
    role: () => role,
    cardStep: () => cardStep,
    setCardStep: (s) => (cardStep = s),
  });

  // `createWorld` always returns a fresh `Briefings` (`met: 0`), and `rebuild`
  // throws the old `world` away rather than reusing it — so every `↺ WAVE`
  // asks "what would a pair who has met nothing see", never "what has this
  // run already taught", which is also why editing wave 9 alone can show a
  // card wave 2 already raised: no `met` bitmask carries forward.
  const rebuild = (): void => {
    const wave = currentWave(store);
    world = createWorld(cfg, store.index);
    cardStep = 0; // unstepped, the same as a fresh `role`
    if (!wave) return;
    startWave(
      world,
      store.index,
      queueFromWave(wave, cfg.cols),
      podsFromWave(wave, cfg.cols),
      bossFromWave(wave, cfg.cols),
      wave.guide !== undefined,
    );
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
      role: cardRenderRole(role, world, cardStep),
      time: performance.now() / 1000,
      dt,
      events: frameEvents,
      running,
      controls: currentControlSet(),
      // The cup over the swelling this stage's one mouse is on or holding.
      hand: touch.hand(),
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
  bindKeyHelp();

  const play = (): void => {
    running = true;
    paintPlay();
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

  return { rebuild, seek, play, beat: () => lastBeat, world: () => world };
}
