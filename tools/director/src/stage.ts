import { podsFromWave, queueFromWave } from "@neon-spore/content";
import { Canvas2DRenderer, type ViewRole } from "@neon-spore/render";
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
}

export function bindStage(store: Store, cfg: SimConfig): StagePanel {
  const canvas = document.getElementById("stage") as HTMLCanvasElement | null;
  if (!canvas) throw new Error("canvas #stage missing");

  const renderer = new Canvas2DRenderer(canvas);
  const keys: Keys = bindKeys(() => cfg.cols);
  let world: World = createWorld(cfg, store.index);
  let role: ViewRole = "test";
  let running = true;
  let frameEvents: SimEvent[] = [];

  const resize = (): void => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    renderer.resize({
      width: rect.width,
      height: rect.height,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    });
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  const rebuild = (): void => {
    const wave = currentWave(store);
    world = createWorld(cfg, store.index);
    if (!wave) return;
    startWave(
      world,
      store.index,
      queueFromWave(wave, store.index, cfg.cols),
      podsFromWave(wave, cfg.cols),
    );
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

  for (const button of document.querySelectorAll<HTMLElement>("button.role")) {
    button.addEventListener("click", () => {
      role = (button.dataset.role as ViewRole) ?? "test";
      for (const other of document.querySelectorAll("button.role")) {
        other.classList.toggle("on", other === button);
      }
    });
  }

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

  return { rebuild };
}
