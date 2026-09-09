import { WAVES } from "@neon-spore/content";
import {
  BATCH,
  BETWEEN_BATCHES_MS,
  FRAME_STEP_MS,
  PEAK_SEARCH_STEP,
  PEAK_SEARCH_TICKS,
  POSE_CLOCK_START,
  peakTick,
  SAMPLES,
  type Sample,
  summarise,
  TICKS_PER_FRAME,
  WARMUP,
} from "../../../tools/perf/sweep-timing.js";

/**
 * The performance sweep, run **inside the page**, on the device the game is
 * for.
 *
 * `bun run perf` measures every wave in a headless Chrome with the CPU
 * throttled to DevTools' mid-tier-mobile setting, and `docs/performance.md`
 * says what that is worth: a good proxy, and not a phone. This is the half that
 * needs no proxy — the owner opens `?perf=1` on the phone and reads the table
 * off the screen.
 *
 * It is the *same* measurement: the sampling numbers and the arithmetic come
 * from `tools/perf/sweep-timing.ts`, which both callers import, so a phone row
 * and a desktop row differ only in the machine under them. What it is not is
 * comparable to a throttled desktop run — there is no throttle here to be
 * comparable to, which is why the readout says so and records none.
 */

/** The verbs a sweep drives the game by — `handle.ts`'s, narrowed to these. */
export interface PerfHandle {
  world: {
    wave: number;
    creatures: readonly unknown[];
    brief: { phase?: number };
    /** The round in play, or nothing. Asked about and never read into: a wave
     * with a round on it keeps its whole picture here and puts no bodies on the
     * field, so a body count cannot find its busiest tick (`peakTick`). */
    boss?: unknown;
  };
  jumpToWave(wave: number): void;
  dismissBriefing(): void;
  advanceOpening(seconds: number): void;
  advance(ticks: number): void;
  paint(): void;
}

/** One wave's row, as this page reports it. */
export interface PhoneCost extends Sample {
  /** 1-based, the number a player would say. */
  wave: number;
  name: string;
  /** Creatures on the field at the tick this was measured. */
  bodies: number;
}

const PERF_PARAM = "perf";

/** Pure, so the rule can be tested without a browser — `raster.ts`'s shape. */
export function perfRequested(url: string): boolean {
  const value = new URL(url, "http://game.invalid/").searchParams.get(PERF_PARAM);
  return value !== null && value !== "0";
}

/**
 * More seconds than `INTRO_SECONDS` could be tuned up to, and more ticks than
 * a ready gate's fill could ask for. Generous allowances rather than the real
 * numbers, so neither goes stale the day one is retuned — `tools/frames`
 * clears an opening the same way over a wire, with the same reasoning and its
 * own copies, because that file loads playwright and this one is bundled into
 * the game.
 */
const INTRO_SECONDS_ENOUGH = 60;
const GATE_TICKS_ENOUGH = 1200;
/** The phase a wave opens into once nothing is holding it (`sim/briefing.ts`). */
const OPENING_PLAY = 0;

/** Put a wave on the field with its introduction and its guide out of the way. */
function enter(ns: PerfHandle, wave: number): void {
  ns.jumpToWave(wave);
  ns.advanceOpening(INTRO_SECONDS_ENOUGH);
  ns.dismissBriefing();
  for (let i = 0; i < GATE_TICKS_ENOUGH && ns.world.brief.phase !== OPENING_PLAY; i++) {
    ns.advance(1);
  }
}

/**
 * Step a wave to the tick it is measured at.
 *
 * Searched once and then replayed, as `measure.ts` does it: stopping at the
 * peak the first time round is not the same thing, because the search has to
 * run *past* a peak to know it was one.
 *
 * Which tick that is, is `peakTick`'s answer and not a second copy of it — the
 * whole reason `sweep-timing.ts` exists is that the two sweeps must sample
 * identically or their numbers are not comparable, and a boss round measured
 * at its count-in here and inside its song over the wire would be exactly that
 * failure.
 */
function toPeak(ns: PerfHandle, wave: number): number {
  enter(ns, wave);
  const round = ns.world.boss !== null && ns.world.boss !== undefined;
  let best = { tick: 0, bodies: ns.world.creatures.length };
  let ran = 0;
  for (let t = PEAK_SEARCH_STEP; t <= PEAK_SEARCH_TICKS; t += PEAK_SEARCH_STEP) {
    ns.advance(PEAK_SEARCH_STEP);
    // The wave moved on; anything past here belongs to the next one.
    if (ns.world.wave !== wave) break;
    ran = t;
    const bodies = ns.world.creatures.length;
    if (bodies > best.bodies) best = { tick: t, bodies };
  }
  const at = peakTick({ ...best, round, ran });
  enter(ns, wave);
  if (at > 0) ns.advance(at);
  return best.bodies;
}

/**
 * Time one wave's paint, in milliseconds per paint per batch.
 *
 * The game's own clock is held still and stepped by hand for the same reason
 * `measure.ts` does it: `paint` is handed `performance.now()`, so every
 * shimmer and eased pose is a function of the wall clock, and two runs would
 * otherwise sample the animations at whatever phases they landed on. The real
 * clock is kept in a closure the stub cannot reach and put back in a `finally`
 * — a page left with a frozen `performance.now` measures every later wave as
 * zero.
 *
 * `startAt` is where that clock picks up, and the sweep carries it from one
 * wave to the next rather than restarting at nought: the clock is absolute, a
 * transient in `Effects` reads its age back as `time - began`, and a wave that
 * started over handed the wave before it a negative one. `POSE_CLOCK_START` in
 * `sweep-timing.ts` carries the whole of that.
 */
async function timePaints(ns: PerfHandle, startAt: number): Promise<Sample & { endedAt: number }> {
  const realNow = performance.now.bind(performance);
  let posed = startAt;
  performance.now = () => posed;
  const taken: number[] = [];
  try {
    for (let i = 0; i < WARMUP; i++) {
      posed += FRAME_STEP_MS;
      ns.paint();
    }
    for (let i = 0; i < SAMPLES; i++) {
      // Between batches, never inside one: the pause lets the GPU queue drain,
      // which is what keeps this a measurement of one frame's work rather than
      // of the browser's back-pressure.
      await new Promise((resolve) => setTimeout(resolve, BETWEEN_BATCHES_MS));
      const started = realNow();
      for (let b = 0; b < BATCH; b++) {
        posed += FRAME_STEP_MS;
        ns.advance(TICKS_PER_FRAME);
        ns.paint();
      }
      taken.push((realNow() - started) / BATCH);
    }
  } finally {
    performance.now = realNow;
  }
  return { ...summarise(taken), endedAt: posed };
}

/** How many waves a full sweep walks. */
export const WAVE_COUNT = WAVES.length;

/** The name a player would call a wave, or its number when it has none. */
export function waveName(index: number): string {
  return WAVES[index]?.name ?? `WAVE ${index + 1}`;
}

/**
 * Every wave, in play order, each at its own busiest tick. `onWave` is told
 * after each one, because a whole sweep is minutes on a phone and a screen
 * that says nothing for minutes is a screen somebody closes.
 */
export async function sweepInPage(
  ns: PerfHandle,
  onWave?: (cost: PhoneCost) => void,
): Promise<PhoneCost[]> {
  const out: PhoneCost[] = [];
  const round = (v: number): number => Math.round(v * 100) / 100;
  // One clock for the whole sweep — `POSE_CLOCK_START`.
  let clock = POSE_CLOCK_START;
  for (let index = 0; index < WAVES.length; index++) {
    const bodies = toPeak(ns, index);
    const sample = await timePaints(ns, clock);
    clock = sample.endedAt;
    const cost: PhoneCost = {
      wave: index + 1,
      name: waveName(index),
      bodies,
      typical: round(sample.typical),
      mean: round(sample.mean),
      p90: round(sample.p90),
      jitter: Math.round(sample.jitter * 1000) / 1000,
    };
    out.push(cost);
    onWave?.(cost);
  }
  return out;
}
