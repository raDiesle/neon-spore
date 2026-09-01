import { Canvas2DRenderer, type ViewRole, type ViewState } from "@neon-spore/render";
import { type SimEvent, step, ticksPerBeat, type World } from "@neon-spore/sim";
import { seedRandom } from "../../versus/seed.js";
import { type Applied, apply, restore, type Variant } from "../../versus/variant.js";
import { cadenceElapsed, type Pose } from "./pose-kit.js";
import { hashCanvas } from "./versus-hash.js";

/**
 * One phone pair, one world, one frame — the engine half of the ALTERNATIVES sheet.
 *
 * Everything here serves one claim: **the two sides differ only by the patch.** One `World`,
 * stepped once per frame, and one `ViewState` — literally the same object handed to both
 * renderers — keep the tick, beat phase, clock own-motion, `dt` and events identical by
 * construction. One seeded `Math.random` per side per frame, restored in a `finally`, does the
 * same for `sparks.ts` and `deflect.ts`'s per-spawn randomness: without it two *identical*
 * looks would draw different pictures — fatal for the claim, and for BLINK, where noise moving
 * is all the eye sees.
 *
 * `onSettled` hashes both canvases once settled: two byte-equal sides under a non-empty patch
 * mean the swap did not take, rather than a vote offered on a difference nobody made.
 *
 * A pair is built for exactly one pose, one seat and one candidate — no slot, seat or candidate
 * picker, and with them no `setPose`/`setVariant`. `versus-page.ts` decides all three before a
 * `Pair` starts; `versus-seat.ts` decides the seat.
 */

/** The phone both sides are drawn at — uncapped, never fitted to a column. */
const PAIR_PHONE = { width: 380, height: 820 } as const;

/** Frames before hashing — the renderer eases, so an immediate hash compares two unsettled pictures. */
const SETTLE = 40;

/** How long each side is showing in BLINK, in seconds. One flip per second. */
const BLINK_SECONDS = 1;
interface Side {
  canvas: HTMLCanvasElement;
  renderer: Canvas2DRenderer;
}
export interface Pair {
  /** Left is what the game draws today; right is the same code, patched. */
  readonly left: HTMLCanvasElement;
  readonly right: HTMLCanvasElement;
  setRunning(on: boolean): void;
  setRate(rate: number): void;
  /** CSS pixels per phone pixel: 1 is true size, 2 is a magnifier. */
  setZoom(n: number): void;
  setBlink(on: boolean): void;
  /** Stop advancing for good, but keep repainting the same frame — a still
   * with no `hud.ts` "PAUSED" overlay, unlike `setRunning(false)`. No `unfreeze`. */
  freeze(): void;
  stop(): void;
}

export interface PairHooks {
  /** `true` when the two sides came back byte-identical. Called once per
   * settle, and again after every rebuild. */
  onSettled(identical: boolean): void;
  /** Which side BLINK shows, so a corner tag can name it. */
  onBlink(side: "left" | "right"): void;
}

function makeSide(dpr: number): Side {
  const canvas = document.createElement("canvas");
  const renderer = new Canvas2DRenderer(canvas);
  renderer.resize({ ...PAIR_PHONE, dpr });
  return { canvas, renderer };
}

/**
 * One tick, rebuilding on `needWave` rather than discarding what the fresh
 * world carries. `pose-kit.ts`'s `runUntil` returns on the exact tick its
 * named state arrives, so a rebuilt world's own `events` already holds the
 * `fire` or `deflect` that moment produced — a shield candidate's shockwave
 * is drawn from that event alone, since the rock it caught left no scar and
 * no lasting body. Handing back `[]` here, as this file used to on every
 * rebuild and the first frame, is why that shockwave never played: the event
 * that would have started it was thrown away before a renderer saw it.
 * `test/versus-loop.test.ts` pins the fix with no canvas needed. `pose`, given, matters only
 * if `cadenceSeconds` is set: `needWave` is left unhandled rather than racing `startPair`.
 */
type StepResult = { world: World; events: SimEvent[] };
export function advance(world: World, build: () => World, pose?: Pose): StepResult {
  step(world, []);
  if (pose?.cadenceSeconds === undefined && world.events.some((e) => e.type === "needWave")) {
    const rebuilt = build();
    return { world: rebuilt, events: [...rebuilt.events] };
  }
  return { world, events: [...world.events] };
}

export interface PairOptions {
  pose: Pose;
  /** Overrides `pose.role` — a pair is drawn for one named seat. */
  role: ViewRole;
  variant: Variant;
}

/** Start the loop. Both canvases are drawn every frame, BLINK or not. */
export function startPair(opts: PairOptions, hooks: PairHooks): Pair {
  const { pose, role, variant } = opts;
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const left = makeSide(dpr);
  const right = makeSide(dpr);

  let world = pose.build();
  let running = true;
  let frozen = false;
  let rate = 1;
  let blink = false;
  let showing: "left" | "right" = "left";
  // Seeded from the world `build()` handed back, not from `[]` — see `advance`.
  let events: SimEvent[] = [...world.events];
  /** Own-motion's clock, advanced by the loop rather than read off the wall,
   * so pausing freezes the wobble and the rate slows it. */
  let clock = 0;
  let blinkAt = 0;
  let frames = 0;
  let sinceChange = 0;
  let raf = 0;
  /** A rebuilt world resets its events, the settle window, side-noise seed and cadence clock. */
  const rebuiltTo = (w: World): void => {
    world = w;
    events = [...w.events];
    frames = 0;
    sinceChange = 0;
    clock = 0;
  };

  // One object, handed to both. Its fields are rewritten in place every frame:
  // a fresh literal per side would be two objects that happen to agree.
  const view: ViewState = {
    world,
    beatPhase: 0,
    role,
    time: 0,
    dt: 0,
    events,
    running,
  };

  /** One side, with the patch held for exactly the length of `draw` and put
   * back in a `finally`. `seed` is the same for both sides of a frame. */
  const drawSide = (side: Side, patched: boolean, seed: number): void => {
    const unseed = seedRandom(seed);
    let applied: Applied | null = null;
    try {
      if (patched) applied = apply(variant);
      side.renderer.draw(view);
    } finally {
      if (applied) restore(applied);
      unseed();
    }
  };

  const paint = (dt: number): void => {
    const tpb = ticksPerBeat(world.cfg);
    view.world = world;
    view.beatPhase = (world.tick % tpb) / tpb;
    view.time = clock;
    view.dt = dt;
    view.events = events;
    view.running = running;

    const seed = frames + 1;
    drawSide(left, false, seed);
    drawSide(right, true, seed);

    frames++;
    sinceChange++;
    if (sinceChange === SETTLE) {
      hooks.onSettled(hashCanvas(left.canvas) === hashCanvas(right.canvas));
    }
  };

  let last = performance.now();
  let carry = 0;
  const frame = (now: number): void => {
    raf = requestAnimationFrame(frame);
    const real = Math.min(0.25, (now - last) / 1000);
    last = now;
    // `frozen` holds `dt` at 0 like `!running` does, but leaves `running` —
    // and so `view.running`, and so the pause overlay — untouched.
    const dt = running && !frozen ? real * rate : 0;

    if (running && !frozen) {
      clock += dt;
      carry += dt * world.cfg.tickHz;
      const steps = Math.min(Math.floor(carry), world.cfg.tickHz);
      for (let i = 0; i < steps; i++) {
        const next = advance(world, () => pose.build(), pose);
        if (next.world !== world) rebuiltTo(next.world);
        events = next.events;
      }
      carry -= steps;
      // The one place a cadenced pose ever rebuilds.
      if (cadenceElapsed(pose, clock)) rebuiltTo(pose.build());
    } else {
      // Not running, or frozen: replaying a non-empty `events` on every
      // static tick would re-ingest a `fire` or `deflect` again and again.
      events = [];
    }
    paint(dt);

    if (!blink) return;
    blinkAt += real;
    if (blinkAt < BLINK_SECONDS) return;
    blinkAt = 0;
    showing = showing === "left" ? "right" : "left";
    left.canvas.style.opacity = showing === "left" ? "1" : "0";
    right.canvas.style.opacity = showing === "right" ? "1" : "0";
    hooks.onBlink(showing);
  };
  raf = requestAnimationFrame(frame);

  const zoom = (n: number): void => {
    for (const side of [left, right]) {
      side.canvas.style.width = `${PAIR_PHONE.width * n}px`;
      side.canvas.style.height = `${PAIR_PHONE.height * n}px`;
    }
  };

  return {
    left: left.canvas,
    right: right.canvas,
    setRunning(on) {
      running = on;
    },
    setRate(next) {
      rate = next;
    },
    setZoom: zoom,
    setBlink(on) {
      blink = on;
      blinkAt = 0;
      showing = "left";
      // Out of BLINK both sides are opaque again; in it, left leads.
      left.canvas.style.opacity = "1";
      right.canvas.style.opacity = on ? "0" : "1";
      hooks.onBlink("left");
    },
    freeze() {
      frozen = true;
    },
    stop() {
      cancelAnimationFrame(raf);
      left.renderer.dispose();
      right.renderer.dispose();
    },
  };
}
