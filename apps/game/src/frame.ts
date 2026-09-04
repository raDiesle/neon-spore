import type { Canvas2DRenderer } from "@neon-spore/render";
import { type SimEvent, step, type World } from "@neon-spore/sim";
import type { GameAudio } from "./audio.js";
import type { InputBuffer } from "./input.js";
import type { Intro } from "./intro.js";
import { startLoop } from "./loop.js";
import type { RunState } from "./run-state.js";
import { throttledTally } from "./tally.js";

/**
 * WHAT HAPPENS EVERY TICK, AND WHAT HAPPENS EVERY FRAME.
 *
 * Split out of `main.ts` when that file reached its 250-line limit — CLAUDE.md
 * says split rather than grow, and this was the seam already there. `main.ts`
 * is *what the app is made of*: a world, a renderer, the listeners, the shell.
 * This is the one thing that then happens over and over, and none of it is
 * construction.
 *
 * The two clocks are the reason it is one file rather than two functions in
 * different places. A tick is the simulation's and is lockstep's to allow; a
 * frame is this device's own and answers to nothing. They are read together
 * exactly once, here, and everything that has to be true across both — the
 * events a frame collects from several ticks, the wave-opening clock that no
 * `sim` file may hold — sits between them where it can be seen.
 */

/** Everything the loop reads. Handed in rather than imported, because every
 * one of these is built in `main.ts` and half of them close over each other. */
export interface FrameParts {
  world: World;
  tickHz: number;
  buffer: InputBuffer;
  run: RunState;
  renderer: Canvas2DRenderer;
  /** The canvas's own context, for what is drawn *over* a frame. */
  ctx: CanvasRenderingContext2D;
  audio: GameAudio;
  haptics: { frame: (events: readonly SimEvent[]) => void };
  intro: Intro;
  /** The seat this screen is showing, and where it is in the beat. */
  role: () => Parameters<Canvas2DRenderer["draw"]>[0]["role"];
  beatPhase: () => number;
  /** The ring round whatever this device's finger has hold of. */
  hand: { current: Parameters<Canvas2DRenderer["draw"]>[0]["hand"] };
  pointer: () => { x: number; y: number } | undefined;
  /** The keyboard's per-tick call (`keys.ts`). */
  tickKeys: () => void;
  /** The link, whichever way it is: solo answers all of these too. */
  link: {
    mayTick: () => boolean;
    drain: () => Parameters<typeof step>[1];
    checkpoint: () => void;
    frame: (ms: number) => void;
    tally: (wave: number, score: number) => void;
    status: () => { names: Parameters<Canvas2DRenderer["draw"]>[0]["names"] };
  };
  /** The wave's own clock and its event handler (`waves.ts`). */
  progression: { tickOpening: (seconds: number) => void; handle: (events: SimEvent[]) => void };
}

export interface Frames {
  /** One frame, on demand — what a headless caller drives (`handle.ts`). */
  paint: (dt: number) => void;
  /** Where a frame's events are collected between ticks. */
  collect: (events: readonly SimEvent[]) => void;
}

export function startFrames(p: FrameParts): Frames {
  /** How far this device has got, up to the room now and then (`tally.ts`). */
  const tellTally = throttledTally((wave, score) => p.link.tally(wave, score));

  // Events are cleared every tick and a frame covers several ticks, so they are
  // collected here rather than read off the world.
  let frameEvents: SimEvent[] = [];
  let lastFrame = performance.now();

  const paint = (dt: number): void => {
    p.audio.frame(p.world, frameEvents);
    p.haptics.frame(frameEvents);
    p.renderer.draw({
      world: p.world,
      beatPhase: p.beatPhase(),
      role: p.role(),
      // Per device by design, not a value the two phones share — own-motion
      // (a shimmer, a wobble) is allowed to differ between them because it
      // touches nothing about the simulation.
      time: performance.now() / 1000,
      dt,
      events: frameEvents,
      running: p.run.running(),
      hand: p.hand.current,
      pointer: p.pointer(),
      names: p.link.status().names,
    });
    // Over the frame rather than instead of it: the field goes on moving behind
    // the intro's pages, which is why they are drawn on this canvas at all.
    p.intro.over(p.ctx, dt);
    frameEvents = [];
  };

  startLoop(
    p.tickHz,
    () => {
      // Paused: drop whatever was pressed rather than letting it pile up for the
      // moment play resumes. A finished run is not paused — its commands still
      // go through, otherwise the restart tap would never arrive.
      if (!p.run.running() && !p.world.over) {
        p.buffer.drain(p.world.tick);
        return;
      }
      // Lockstep: a tick may only run once the other device has promised that
      // nothing more is coming for it. Solo, this is always true.
      if (!p.link.mayTick()) return;
      p.tickKeys();
      step(p.world, p.link.drain());
      if (p.world.events.length) {
        frameEvents.push(...p.world.events);
        p.progression.handle(p.world.events);
      }
      p.link.checkpoint();
    },
    () => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;
      p.link.frame(dt * 1000);
      tellTally(p.world.wave, p.world.score);
      // The wave's name and sentence stand for a few seconds and pass on their
      // own — counted here, because nothing in `sim` may read a clock.
      p.progression.tickOpening(dt);
      paint(dt);
    },
  );

  return { paint, collect: (events) => frameEvents.push(...events) };
}
