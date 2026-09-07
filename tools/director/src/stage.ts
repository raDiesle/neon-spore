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
import { stageGeometry } from "./stage-point.js";
import { bindStageRounds } from "./stage-rounds.js";
import { bindStageTouch, pointerSeat } from "./stage-touch.js";
import { bindStageTransport } from "./stage-transport.js";
import { buildStageWorld } from "./stage-world.js";
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
  /**
   * Stand the boss on a numbered round and **hold it there**.
   *
   * A round-played boss opens on its first round and the only thing that moves
   * it on is *winning*, which nobody does while judging a sheet — so picking
   * STAGE 4 in the boss panel used to redraw the panel and leave the field on
   * stage 1. It goes through `setBossRound`, which is the fight's own way into
   * a round, so what the stage plays is the round the pair would have reached
   * (`sim/boss-round.ts`). Says nothing for a boss that is not played in
   * rounds; the panels that offer the choice are the ones that have them.
   *
   * **It is a wanted round rather than one click's doing**, and that is the
   * whole of the fix. It used to be applied once, to the world a rebuild had
   * just stood up, which worked only because the click ran `onEdit` first —
   * so *anything else* that rebuilt the stage put the fight back on round 0
   * while the tab still read STAGE 4. A tuning slider, a pair switch, a jump
   * to another wave and back: the panel then named a sheet the field was not
   * playing, which is exactly the disagreement this was made to end. `rebuild`
   * re-applies it, so the two cannot come apart again.
   */
  openRound(round: number): void;
  /**
   * Let the field go back to opening on its first round.
   *
   * The wave picker's, because a round belongs to the boss that was being
   * judged: standing a different wave's fight on the fourth sheet of the last
   * one is the same disagreement with the numbers swapped.
   */
  closeRound(): void;
  /** The round the field is being held on, for the panel that offers the
   * choice to mark — one answer, read rather than kept twice. */
  round(): number;
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
