import { bossFromWave, controlSetForWave, podsFromWave, queueFromWave } from "@neon-spore/content";
import { Canvas2DRenderer, computeLayout, type Viewport, type ViewRole } from "@neon-spore/render";
import {
  createWorld,
  type SimConfig,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { bindKeys, type Keys } from "./keys.js";
import { bindStageAfterRun } from "./stage-afterrun.js";
import { bindStageGauge } from "./stage-gauge.js";
import { bindStageTouch } from "./stage-touch.js";
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
  /** The beat the field is holding, for a placement to land on. */
  beat(): number;
  /**
   * The world being played. A panel that reads the run — the balance sheet —
   * needs the live object, and `rebuild` swaps it for a new one, so the handle
   * has to be a call rather than a reference handed out once.
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

  // THE GAUGE draws slabs rather than a band, which `touchDown` below cannot
  // answer — see `stage-gauge.ts`.
  bindStageGauge({
    canvas,
    layout: () => computeLayout(viewport, cfg, role),
    role: () => role,
    world: () => world,
    push: (player, command) => keys.push(player, command),
  });
  bindStageTouch({
    canvas,
    layout: () => computeLayout(viewport, cfg, role),
    // Player 1's seat, because a mouse is one hand. G is the other player's —
    // see `keys.ts`.
    field: () => ({
      creatures: world.creatures,
      beatPhase: (world.tick % ticksPerBeat(cfg)) / ticksPerBeat(cfg),
      seat: 1,
      wardenRow: cfg.wardenRow,
      // The stage answers a finger the way the phone does, which now includes
      // answering only the controls this wave's panel actually carries.
      controls: controlSetForWave(world.wave),
    }),
    push: keys.push,
  });

  const rebuild = (): void => {
    const wave = currentWave(store);
    world = createWorld(cfg, store.index);
    if (!wave) return;
    startWave(
      world,
      store.index,
      queueFromWave(wave, cfg.cols),
      podsFromWave(wave, cfg.cols),
      bossFromWave(wave, cfg.cols),
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
      role,
      time: performance.now() / 1000,
      dt,
      events: frameEvents,
      running,
      banner: null,
    });
    frameEvents = [];
    onFrame();
  };

  // A local fixed-timestep loop rather than the game's: `apps/game` is an
  // application, not a package, and a tool reaching into its source would be a
  // dependency the workspace boundaries deliberately do not offer.
  let last = performance.now();
  let carry = 0;
  const frame = (now: number): void => {
    const dt = Math.min(0.25, (now - last) / 1000);
    last = now;
    carry += dt * cfg.tickHz;
    // A whole number of ticks, and never more than a second's worth: a tab
    // that was away comes back to the wave, not to a burst of catch-up.
    const steps = Math.min(Math.floor(carry), cfg.tickHz);
    for (let i = 0; i < steps; i++) advance();
    carry -= steps;

    paint(dt);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  const playBtn = document.getElementById("play");
  const paintPlay = (): void => {
    if (playBtn) playBtn.textContent = running ? "⏸" : "▶";
  };
  playBtn?.addEventListener("click", () => {
    running = !running;
    paintPlay();
  });
  document.getElementById("restart")?.addEventListener("click", rebuild);
  // The whole stage is the card's button on a phone (`apps/game/src/briefing.ts`);
  // here it is one button instead, since `bindStageTouch` above already spends
  // the canvas's own pointerdown on the cannon. Both acks unconditionally,
  // exactly like the game's own Space key — the command means nothing when no
  // card is up, so it costs nothing to send it whether or not one is. Without
  // this, turning `briefings` on (`pair-panel.ts`) freezes the stage on the
  // first wave forever: `startWave` opens the card and nothing else in the
  // director could ever put it away.
  document.getElementById("ackBrief")?.addEventListener("click", () => {
    keys.push(1, { kind: "brief" });
    keys.push(2, { kind: "brief" });
  });
  const afterRun = bindStageAfterRun({
    canvas,
    world: () => world,
    rebuild,
    setRunning: (r) => (running = r),
    paintPlay,
  });

  for (const button of document.querySelectorAll<HTMLElement>("button.role")) {
    button.addEventListener("click", () => {
      role = (button.dataset.role as ViewRole) ?? "test";
      for (const other of document.querySelectorAll("button.role")) {
        other.classList.toggle("on", other === button);
      }
    });
  }

  const seek = (beat: number): void => {
    rebuild();
    const ticks = beat * ticksPerBeat(cfg);
    for (let i = 0; i < ticks; i++) stepOnce();
    running = false;
    paintPlay();
  };

  paintPlay();
  rebuild();

  /**
   * Handle for headless checks. A hidden tab suspends requestAnimationFrame,
   * so a test that wants a picture has to be able to ask for one.
   */
  (window as unknown as { neonSporeDirector: unknown }).neonSporeDirector = {
    get world() {
      return world;
    },
    advance(ticks: number) {
      for (let i = 0; i < ticks; i++) stepOnce();
    },
    paint: () => paint(1 / 60),
  };

  return { rebuild, seek, beat: () => lastBeat, world: () => world };
}
