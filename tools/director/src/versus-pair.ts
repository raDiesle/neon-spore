import type { ViewRole, ViewState } from "@neon-spore/render";
import { beatPhase, type SimEvent, step, type World } from "@neon-spore/sim";
import { seedRandom } from "../../versus/seed.js";
import { type Applied, apply, restore, type Variant } from "../../versus/variant.js";
import { cadenceElapsed, type Pose } from "./pose-kit.js";
import { runStageLoop } from "./stage-loop.js";
import { type CropSide, CropWindow, makeCropSide } from "./versus-crop.js";
import { hashCanvas } from "./versus-hash.js";
import { FREEZE_STRIDE, Freeze } from "./versus-pair-freeze.js";

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
export interface Pair {
  /** Left is what the game draws today; right is the same code, patched. Each
   * is the *crop window* (`pose-art.ts`'s `poseCropRect`) with the phone's
   * canvas positioned inside it — not the canvas itself. */
  readonly left: HTMLElement;
  readonly right: HTMLElement;
  setRunning(on: boolean): void;
  setRate(rate: number): void;
  /** CSS pixels per phone pixel: 1 is true size, 2 is a magnifier. */
  setZoom(n: number): void;
  setBlink(on: boolean): void;
  /** Stop advancing for good, still repainting. `setRunning` can be undone. */
  freeze(): void;
  stop(): void;
}

export interface PairHooks {
  /** `true` when the two sides came back byte-identical. Once per settle, and
   * again after every rebuild. */
  onSettled(identical: boolean): void;
  /** Which side BLINK shows, so a corner tag can name it. */
  onBlink(side: "left" | "right"): void;
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
  /** Stop after this many simulated seconds, for a camera (`versus-pair-freeze.ts`). */
  freezeSeconds?: number | null;
}

/** Start the loop. Both canvases are drawn every frame, BLINK or not. */
export function startPair(opts: PairOptions, hooks: PairHooks): Pair {
  const { pose, role, variant } = opts;
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const left = makeCropSide(PAIR_PHONE, dpr);
  const right = makeCropSide(PAIR_PHONE, dpr);

  let world = pose.build();
  // Both sides stay whole phones; only what is *shown* of them is cut, to the
  // pose's own rectangle, and a tile crop follows its body (`versus-crop.ts`).
  const crop = new CropWindow([left, right], PAIR_PHONE, pose, role, world);
  let running = true;
  const freeze = new Freeze(opts.freezeSeconds, world.cfg.tickHz);
  let rate = 1;
  let blink = false;
  let showing: "left" | "right" = "left";
  // Seeded from the world `build()` handed back, not from `[]` — see `advance`.
  let events: SimEvent[] = [...world.events];
  /** Own-motion's clock, advanced by the loop and not read off the wall, so
   * pausing freezes the wobble and the rate slows it. */
  let clock = 0;
  let blinkAt = 0;
  let frames = 0;
  let sinceChange = 0;
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
    // **Always true, whether or not the pair is moving.** A stopped game gets
    // PAUSED under a grey scrim (`hud.ts`) — right for a phone somebody put
    // down, and here a wash over the very thing being compared, on a page where
    // pausing is how a reader looks harder. Gone at the owner's word, 9 Sep 2026.
    running: true,
  };

  /** One side, with the patch held for exactly the length of `draw` and put
   * back in a `finally`. `seed` is the same for both sides of a frame. */
  const drawSide = (side: CropSide, patched: boolean, seed: number): void => {
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
    view.world = world;
    // The window before the frame, off the same world both sides are drawn from.
    crop.follow(world);
    view.beatPhase = beatPhase(world.cfg, world.tick);
    view.time = clock;
    view.dt = dt;
    view.events = events;

    const seed = freeze.seed(frames);
    drawSide(left, false, seed);
    drawSide(right, true, seed);

    frames++;
    sinceChange++;
    if (sinceChange === SETTLE) {
      hooks.onSettled(hashCanvas(left.canvas) === hashCanvas(right.canvas));
    }
  };

  /** Whether the world is moving at all — the pause, and the freeze. */
  const stepping = (): boolean => running && !freeze.frozen;

  // `stage.ts`'s loop, called rather than copied. What this pair differed by
  // is the two hooks: a rate that scales real seconds into simulated ones, and
  // a `paint` that also wants the real ones for the blink's own clock.
  const loop = runStageLoop({
    tickHz: () => world.cfg.tickHz,
    // `frozen` holds `dt` at 0 the way `!running` does, and neither reaches the
    // drawing. A pending freeze runs on the tick, not the wall (`Freeze`).
    scale: (real) =>
      freeze.pending ? FREEZE_STRIDE / world.cfg.tickHz : stepping() ? real * rate : 0,
    advance: () => {
      // Own-motion's clock joins the simulated axis as the freeze lands.
      if (!freeze.step()) {
        clock = freeze.stepped / world.cfg.tickHz;
        freeze.mark(left.frame, right.frame);
        return;
      }
      const next = advance(world, () => pose.build(), pose);
      if (next.world !== world) rebuiltTo(next.world);
      events = next.events;
    },
    paint: (dt, real) => {
      if (stepping()) {
        clock += dt;
        // The one place a cadenced pose ever rebuilds.
        if (cadenceElapsed(pose, clock)) rebuiltTo(pose.build());
      } else {
        // Not running, or frozen: a non-empty `events` replayed on every static
        // tick would re-ingest a `fire` or a `deflect` again and again.
        events = [];
      }
      paint(dt);

      if (!blink) return;
      blinkAt += real;
      if (blinkAt < BLINK_SECONDS) return;
      blinkAt = 0;
      showing = showing === "left" ? "right" : "left";
      left.frame.style.opacity = showing === "left" ? "1" : "0";
      right.frame.style.opacity = showing === "right" ? "1" : "0";
      hooks.onBlink(showing);
    },
  });

  return {
    left: left.frame,
    right: right.frame,
    setRunning(on) {
      running = on;
    },
    setRate(next) {
      rate = next;
    },
    setZoom: (n) => crop.setZoom(n),
    setBlink(on) {
      blink = on;
      blinkAt = 0;
      showing = "left";
      // Out of BLINK both sides are opaque again; in it, left leads.
      left.frame.style.opacity = "1";
      right.frame.style.opacity = on ? "0" : "1";
      hooks.onBlink("left");
    },
    freeze() {
      freeze.frozen = true;
    },
    stop() {
      loop.stop();
      left.renderer.dispose();
      right.renderer.dispose();
    },
  };
}
