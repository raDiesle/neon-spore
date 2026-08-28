import { Canvas2DRenderer, type ViewRole, type ViewState } from "@neon-spore/render";
import { type SimEvent, step, ticksPerBeat } from "@neon-spore/sim";
import { seedRandom } from "../../versus/seed.js";
import { type Applied, apply, restore, type Variant } from "../../versus/variant.js";
import type { Pose } from "./pose-kit.js";

/**
 * Two phones, one world, one frame — the engine half of the VERSUS tab.
 *
 * Everything here serves one claim: **the two sides differ only by the
 * patch.** Three mechanisms hold it, and none is optional. One `World`,
 * stepped once per frame — two worlds from the same seed are two objects that
 * agree until the day they do not. One `ViewState`, literally the same object
 * handed to both renderers, so the tick, the beat phase, the wall-clock `time`
 * own-motion runs on, the `dt` and the events are the same values by
 * construction. And one seeded `Math.random` per side per frame, restored in a
 * `finally`: `sparks.ts` and `deflect.ts` randomise four values per spawn each,
 * so without it two *identical* looks draw two different pictures — fatal for
 * the claim, and fatal for BLINK, where noise moving is all the eye would see.
 *
 * Then the guard that proves none of it quietly failed: `onSettled` hashes both
 * canvases once the frame has settled. Two byte-equal sides under a non-empty
 * patch mean the swap did not take, and the page says so instead of offering a
 * vote on a difference nobody made.
 */

/** The phone both sides are drawn at — uncapped, never fitted to a column. */
const PAIR_PHONE = { width: 380, height: 820 } as const;

/** Frames before the sides are hashed: the renderer eases, so an immediate
 * hash compares two pictures both still on their way somewhere. */
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
  setPose(pose: Pose): void;
  setVariant(variant: Variant | null): void;
  setRunning(on: boolean): void;
  setRate(rate: number): void;
  /** CSS pixels per phone pixel: 1 is true size, 2 is a magnifier. */
  setZoom(n: number): void;
  setBlink(on: boolean): void;
  stop(): void;
}

export interface PairHooks {
  /** `true` when the two sides came back byte-identical. Called once per
   * settle, and again after every pose or candidate change. */
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
/** FNV-1a over every byte. Not a cryptographic claim — the question is only
 * whether two renders of one world came out the same. */
function hash(canvas: HTMLCanvasElement): string {
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let h = 0x811c9dc5;
  for (let i = 0; i < data.length; i++) {
    h ^= data[i] ?? 0;
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}

/** Start the loop. Both canvases are drawn every frame, BLINK or not. */
export function startPair(pose: Pose, hooks: PairHooks): Pair {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const left = makeSide(dpr);
  const right = makeSide(dpr);

  let current = pose;
  let world = current.build();
  let variant: Variant | null = null;
  let running = true;
  let rate = 1;
  let blink = false;
  let showing: "left" | "right" = "left";
  let events: SimEvent[] = [];
  /** Own-motion's clock, advanced by the loop rather than read off the wall,
   * so pausing freezes the wobble and the rate slows it. */
  let clock = 0;
  let blinkAt = 0;
  let frames = 0;
  /** Counted from the last change, so a new candidate is hashed again rather
   * than keeping the verdict of the one before it. */
  let sinceChange = 0;
  let raf = 0;

  const role = (): ViewRole => current.role ?? "p1";

  // One object, handed to both. Its fields are rewritten in place every frame:
  // a fresh literal per side would be two objects that happen to agree.
  const view: ViewState = {
    world,
    beatPhase: 0,
    role: role(),
    time: 0,
    dt: 0,
    events,
    running,
    banner: null,
  };

  const rebuild = (): void => {
    world = current.build();
    events = [];
    frames = 0;
    sinceChange = 0;
    clock = 0;
  };
  /** A cleared wave starts over rather than ending — the pair is a loop. */
  const stepOnce = (): void => {
    step(world, []);
    if (world.events.length === 0) return;
    events.push(...world.events);
    for (const e of world.events) if (e.type === "needWave") rebuild();
  };

  /** One side, with the patch held for exactly the length of `draw` and put
   * back in a `finally`. `seed` is the same for both sides of a frame. */
  const drawSide = (side: Side, patched: boolean, seed: number): void => {
    const unseed = seedRandom(seed);
    let applied: Applied | null = null;
    try {
      if (patched && variant) applied = apply(variant);
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
    view.role = role();
    view.time = clock;
    view.dt = dt;
    view.events = events;
    view.running = running;

    const seed = frames + 1;
    drawSide(left, false, seed);
    drawSide(right, true, seed);
    events = [];

    frames++;
    sinceChange++;
    if (sinceChange === SETTLE) {
      hooks.onSettled(variant !== null && hash(left.canvas) === hash(right.canvas));
    }
  };

  let last = performance.now();
  let carry = 0;
  const frame = (now: number): void => {
    raf = requestAnimationFrame(frame);
    const real = Math.min(0.25, (now - last) / 1000);
    last = now;
    const dt = running ? real * rate : 0;

    if (running) {
      clock += dt;
      carry += dt * world.cfg.tickHz;
      const steps = Math.min(Math.floor(carry), world.cfg.tickHz);
      for (let i = 0; i < steps; i++) stepOnce();
      carry -= steps;
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

  // Handle for headless checks. A hidden tab suspends requestAnimationFrame,
  // so a check that wants a settled pair has to be able to ask for one — the
  // same handle `stage.ts` carries, for the same reason.
  (window as unknown as { neonSporeVersus: unknown }).neonSporeVersus = {
    advance: (ticks: number) => {
      for (let i = 0; i < ticks; i++) stepOnce();
    },
    paint: () => paint(1 / 60),
  };

  const zoom = (n: number): void => {
    for (const side of [left, right]) {
      side.canvas.style.width = `${PAIR_PHONE.width * n}px`;
      side.canvas.style.height = `${PAIR_PHONE.height * n}px`;
    }
  };

  return {
    left: left.canvas,
    right: right.canvas,
    setPose(next) {
      current = next;
      rebuild();
    },
    setVariant(next) {
      variant = next;
      sinceChange = 0;
    },
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
    stop() {
      cancelAnimationFrame(raf);
      left.renderer.dispose();
      right.renderer.dispose();
    },
  };
}
