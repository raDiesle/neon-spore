import { bossFromWave, controlSet, podsFromWave, queueFromWave, WAVES } from "@neon-spore/content";
import { Canvas2DRenderer, computeLayout, loadAtlas, type Viewport } from "@neon-spore/render";
import {
  type Command,
  createWorld,
  DEFAULT_CONFIG,
  mazeRound,
  type SimConfig,
  type SimEvent,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import stripUrl from "../../../assets/raster/burst-strip.webp";
import { runStageLoop } from "./stage-loop.js";
import { bindStageTouch, cardRenderRole, pointerSeat } from "./stage-touch.js";

/**
 * A real wave, playable, with the baked burst on a switch.
 *
 * Every other picture on the RASTER tab answers "what does the animation look
 * like". This one answers the only question that decides whether it ships:
 * **what does it look like when a shot you fired kills something.** A burst is
 * 640 ms long and the field is 26 px objects on a dark ground — nothing on a
 * card the size of a card can tell you whether that reads.
 *
 * So it is the shipping renderer against a real `World`, stepped at the real
 * tick rate, answering a finger through the same `touch.ts` the phone calls —
 * the arrangement `stage.ts` uses and for the same reason. What it is *not* is
 * a second copy of the editor: no wave list, no transport, no placement, no
 * seek. One wave, playing, and a switch.
 *
 * The config mirrors `apps/game/src/main.ts` rather than importing it, the way
 * `keys.ts` copies the game's key table and says so: `apps/game` is an
 * application, and a tool reaching into its source would be a dependency the
 * workspace does not offer. If the two disagree, the game is right.
 */
const CFG: SimConfig = {
  ...DEFAULT_CONFIG,
  hullInvulnerable: true,
  shotChargeBeats: 0.5,
};

/** A wave with plenty to shoot at, so the burst fires more than twice a minute. */
export const DEFAULT_WAVE = WAVES.findIndex((w) => w.name === "CROWDED");

export interface RasterField {
  /** Play a different wave, from its first beat. */
  setWave(index: number): void;
  /** Draw the baked burst, or fall back to the sparks that shipped. */
  setBaked(on: boolean): void;
  /** Same wave, from the start. */
  restart(): void;
}

export function bindRasterField(canvas: HTMLCanvasElement): RasterField {
  const renderer = new Canvas2DRenderer(canvas);
  let waveIndex = DEFAULT_WAVE < 0 ? 0 : DEFAULT_WAVE;
  let world: World = createWorld(CFG, waveIndex);
  let frameEvents: SimEvent[] = [];
  let pending: TimedCommand[] = [];
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

  const wave = (): (typeof WAVES)[number] | undefined => WAVES[waveIndex];
  const controls = (): ReturnType<typeof controlSet> => controlSet(wave()?.controls);

  /**
   * A fresh world every time, and **no guide**. The game opens a wave on its
   * introduction and then on a guide that waits for both players to hold; that
   * is right in the game and wrong here, where somebody has tapped a tab to
   * look at an explosion and would meet a gate asking for two thumbs first.
   */
  const build = (): void => {
    const w = wave();
    world = createWorld(CFG, waveIndex);
    pending = [];
    if (!w) return;
    startWave(
      world,
      waveIndex,
      queueFromWave(w, CFG.cols),
      podsFromWave(w, CFG.cols),
      bossFromWave(w, CFG.cols),
      false,
    );
  };

  // The pointer is the only hand here — no keyboard. `keys.ts` binds the
  // document, and a second binding of it would drive the editor's own stage
  // underneath this sheet as well as this field.
  const push = (player: 1 | 2, command: Command): void => {
    pending.push({ tick: world.tick, player, command });
  };

  bindStageTouch({
    canvas,
    layout: () => computeLayout(viewport, CFG, "test"),
    field: () => ({
      creatures: world.creatures,
      beatPhase: (world.tick % ticksPerBeat(CFG)) / ticksPerBeat(CFG),
      seat: pointerSeat("test"),
      cfg: CFG,
      maze: mazeRound(world),
      warden: world.boss?.kind === "warden" ? world.boss : null,
      controls: controls(),
    }),
    push,
    world: () => world,
    role: () => "test",
    cardStep: () => 0,
    setCardStep: () => {},
  });

  // A cleared wave plays again rather than advancing: watching this one is the
  // whole reason the field is on the page — the same answer `stage.ts` gives.
  const stepOnce = (): void => {
    const commands = pending;
    pending = [];
    step(world, commands);
    if (world.events.length) {
      frameEvents.push(...world.events);
      for (const e of world.events) if (e.type === "needWave") build();
    }
  };

  const paint = (dt: number): void => {
    const tpb = ticksPerBeat(CFG);
    renderer.draw({
      world,
      beatPhase: (world.tick % tpb) / tpb,
      role: cardRenderRole("test", world, 0),
      time: performance.now() / 1000,
      dt,
      events: frameEvents,
      running: true,
      controls: controls(),
    });
    frameEvents = [];
  };

  void loadAtlas(stripUrl).then((atlas) => {
    if (atlas) renderer.sprites.install(atlas);
  });

  build();
  // `stage.ts`'s loop, called rather than copied — the copy that used to sit
  // here said so in a comment and then re-typed the catch-up cap. `alive` is
  // the one thing it differed by: a sheet the page has closed stops stepping a
  // world nobody can see.
  runStageLoop({
    tickHz: () => CFG.tickHz,
    advance: stepOnce,
    paint,
    alive: () => canvas.isConnected,
  });

  /**
   * Handle for a headless check, the same one `stage.ts` hangs on
   * `neonSporeDirector` and for the same reason: a hidden tab suspends
   * `requestAnimationFrame`, and a check that wants to fire a shot and see the
   * burst that follows cannot wait for frames that are not coming. `advance`
   * hands back what those ticks produced, so a check can assert that a
   * `destroy` actually happened rather than assuming the shot connected.
   */
  (window as unknown as { neonSporeRasterField: unknown }).neonSporeRasterField = {
    get world() {
      return world;
    },
    push,
    /** Whether the atlas actually arrived — a check's first question when no
     * burst appears, and the difference between a broken wiring and a fetch. */
    get atlasReady(): boolean {
      return renderer.sprites.installed;
    },
    advance(ticks: number): SimEvent[] {
      const seen: SimEvent[] = [];
      for (let i = 0; i < ticks; i++) {
        stepOnce();
        seen.push(...world.events);
      }
      return seen;
    },
    paint: () => paint(1 / 60),
  };

  return {
    setWave(index: number): void {
      waveIndex = index;
      build();
    },
    setBaked: (on) => renderer.sprites.setEnabled(on),
    restart: build,
  };
}
