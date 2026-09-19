import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  type CandleState,
  candleBoss,
  createWorld,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { candleDarkAt } from "../src/candle-dark.js";
import { candleGlowY } from "../src/candle-glow.js";
import { candleWickAt, candleWickReach, candleWickRest } from "../src/candle-grip.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE CANDLE's dark, on both screens.
 *
 * The glow's phases are **set** rather than waited for, which is
 * `undertow-frame.test.ts`' arrangement and for its reason: where the glow
 * drifts is the rng's and `sim/test/candle.test.ts` already proves the clock.
 * What this file asks is whether every branch of the picture is one a canvas
 * accepts, and the three things nothing else in the suite could catch: that
 * the black is there at all, that the lights are on the screen of the seat
 * whose control made them and on no other, that the field is black and
 * nothing else once the last step has gone, and that the dark comes in from
 * the corner light's side rather than falling evenly (the design's step 1).
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const BLACK = "#000000";
/** The washes a lit column is seen through: `rgba(hex, a)` with no spaces. */
const VIOLET = "rgba(192,92,255,";
const RED = "rgba(255,59,107,";
const AMBER = "rgba(255,194,74,";

function opened(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("candle");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  return world;
}

function glow(world: World): CandleState {
  const c = candleBoss(world);
  if (c === null) throw new Error("the candle wave installed no glow");
  return c;
}

/** A wave with no candle in it, for the amount of black an ordinary field has. */
function lit(): World {
  const world = createWorld(CFG, 5);
  startWave(world, 0, buildQueue(0, CFG.cols), [], null);
  return world;
}

/** Past the four dark beats: the black is all the way down. */
function darkened(world: World): void {
  for (let i = 0; i < (CFG.candleDarkBeats + 1) * TPB; i++) step(world, []);
  if (glow(world).phase === "dark") throw new Error("the dark never came down");
}

/** Every colour and fill a screen set over a run of frames, as one string. */
function drawn(
  world: World,
  role: ViewRole,
  ticks: number,
  onTick?: (tick: number, world: World) => void,
): { calls: number; text: string } {
  const log: string[] = [];
  const { ctx } = runFrames(world, role, ticks, {
    every: 3,
    onTick,
    onCanvas: (c) => {
      c.log = log;
    },
  });
  return { calls: ctx.calls, text: log.join("|") };
}

function count(text: string, colour: string): number {
  return text.split(colour).length - 1;
}

/**
 * The alpha of every black fill over the field in one frame's log, by the
 * stage x it starts at: `fillCols` sets the alpha, then the colour, then
 * fills, and nothing else in the frame fills black through an alpha.
 */
function blackAlphaByX(text: string): Map<number, number> {
  const out = new Map<number, number>();
  const re =
    /set globalAlpha=([\d.]+)\|set fillStyle=#000000\|fillRect\(([\d.]+), 0, [\d.]+, [\d.]+\)/g;
  for (const m of text.matchAll(re)) out.set(Number(m[2]), Number(m[1]));
  return out;
}

describe("THE CANDLE's dark", () => {
  it.each(ROLES)("draws the field black under a glow, on %s", (role) => {
    const world = opened();
    const plain = drawn(lit(), role, 2 * TPB);
    const dark = drawn(world, role, (CFG.candleDarkBeats + 2) * TPB);
    expect(dark.calls).toBeGreaterThan(500);
    expect(count(dark.text, BLACK)).toBeGreaterThan(count(plain.text, BLACK));
    // The halos go through `drawImage` of a cached disc (`glow.ts`); the
    // flame's arc is the one fill of the glow that names its colour.
    expect(dark.text).toContain(PALETTE.podRim);
  });

  it("draws less of the glow as it dims, and none of it once it is out", () => {
    const full = opened();
    darkened(full);
    const last = opened();
    darkened(last);
    glow(last).glow = 1;
    glow(last).phase = "last";
    expect(drawn(full, "p1", 3).text).not.toBe(drawn(last, "p1", 3).text);
    const out = opened();
    darkened(out);
    glow(out).glow = 0;
    glow(out).phase = "out";
    const gone = drawn(out, "p1", 3).text;
    expect(gone).not.toContain(PALETTE.podRim);
    expect(count(gone, BLACK)).toBeGreaterThan(0);
  });

  it("shows the pilot which column the glow faces, and not the navigator", () => {
    // The log keeps a path's fills and not its points (`canvas-stub.ts`), so
    // the tell is the cone's own wash rather than where it points.
    const world = opened();
    darkened(world);
    const c = glow(world);
    c.phase = "eating";
    c.phaseBeat = world.beat;
    expect(count(drawn(world, "p1", 3).text, AMBER)).toBeGreaterThan(0);
    expect(count(drawn(world, "test", 3).text, AMBER)).toBeGreaterThan(0);
    expect(count(drawn(world, "p2", 3).text, AMBER)).toBe(0);
    // And on nobody's while the glow stands still: a cone from a light that
    // is not going anywhere would be a tell about nothing.
    c.phase = "last";
    expect(count(drawn(world, "p1", 3).text, AMBER)).toBe(0);
  });

  it("lights the navigator's own shot on the navigator's screen, and not on the pilot's", () => {
    const fire = (tick: number, w: World) => {
      if (tick === 0)
        step(w, [{ tick: w.tick, player: 2, command: { kind: "fire", color: "red" } }]);
      else step(w, []);
    };
    const quiet = opened();
    darkened(quiet);
    const shot = opened();
    darkened(shot);
    const navigator = drawn(shot, "p2", 3, fire);
    expect(count(navigator.text, RED)).toBeGreaterThan(count(drawn(quiet, "p2", 3).text, RED));
    const pilot = opened();
    darkened(pilot);
    expect(count(drawn(pilot, "p1", 3, fire).text, RED)).toBe(0);
  });

  it("lights the pilot's guard window on the pilot's screen, and not on the navigator's", () => {
    const armed = opened();
    darkened(armed);
    step(armed, [{ tick: armed.tick, player: 1, command: { kind: "guard" } }]);
    expect(count(drawn(armed, "p1", 3).text, VIOLET)).toBeGreaterThan(0);
    const other = opened();
    darkened(other);
    step(other, [{ tick: other.tick, player: 1, command: { kind: "guard" } }]);
    expect(count(drawn(other, "p2", 3).text, VIOLET)).toBe(0);
  });

  it("brings the dark in from the corner light's side, column by column", () => {
    // The front, on its own: half way through the count the corner's column
    // is black, the far one untouched, and the ones between run in order.
    expect(candleDarkAt(0.5, CFG.cols - 1, CFG.cols)).toBe(1);
    expect(candleDarkAt(0.5, 0, CFG.cols)).toBe(0);
    for (let col = 1; col < CFG.cols; col++) {
      expect(candleDarkAt(0.5, col, CFG.cols)).toBeGreaterThan(
        candleDarkAt(0.5, col - 1, CFG.cols),
      );
    }
    expect(candleDarkAt(1, 0, CFG.cols)).toBe(1);
    // And on the pilot's screen, two beats into the four: the black over the
    // right of the field is full, the left of it not yet drawn at all.
    const world = opened();
    for (let i = 0; i < 2 * TPB; i++) step(world, []);
    if (glow(world).phase !== "dark") throw new Error("the dark came down early");
    const frame = drawn(world, "p1", 1, () => {}).text;
    const fills = [...blackAlphaByX(frame).entries()].sort((a, b) => a[0] - b[0]);
    expect(fills.length).toBeGreaterThan(2);
    const leftmost = fills[0] as [number, number];
    const rightmost = fills[fills.length - 1] as [number, number];
    expect(rightmost[1]).toBe(1);
    expect(leftmost[1]).toBeLessThan(rightmost[1]);
    // Past the count, the whole field is under one black.
    darkened(world);
    const even = [...blackAlphaByX(drawn(world, "p1", 1, () => {}).text).values()];
    expect(even.length).toBeGreaterThan(0);
    expect(Math.min(...even)).toBe(1);
  });

  it("lifts the black over a beat once the sim takes the glow away", () => {
    const world = opened();
    darkened(world);
    const log: string[] = [];
    const frames: string[] = [];
    runFrames(world, "p1", 3 * TPB, {
      every: 3,
      onCanvas: (c) => {
        c.log = log;
      },
      onTick: (tick, w) => {
        if (tick === TPB) w.boss = null;
        step(w, []);
      },
      onDrawn: () => {
        frames.push(log.splice(0).join("|"));
      },
    });
    const perBeat = TPB / 3;
    const plain = count(drawn(lit(), "p1", 3).text, BLACK);
    // Under the glow, black; the frame after it went, still black, going;
    // two beats on, the field an ordinary wave has.
    const at = (i: number) => count(frames[i] ?? "", BLACK);
    expect(at(perBeat - 1)).toBeGreaterThan(plain);
    expect(at(perBeat + 1)).toBeGreaterThan(plain);
    expect(at(frames.length - 1)).toBe(plain);
  });
});

/**
 * The wick, the flame on it and the ember after it — the last step's own
 * picture (`candle-grip.ts`).
 *
 * The travel is checked as arithmetic rather than off the log, because the
 * stub keeps a path's fills and not its points: where the ring is standing is
 * a function of the depth, and the one thing that would break it silently is
 * the reach coming from somewhere other than `candlePinchMilli`. What the
 * frames are asked is the other half — that the stem and its ring are on the
 * screen at all at `last`, on both seats, and that at `smoking` there is an
 * ember where the flame was and no flame anywhere.
 */
describe("THE CANDLE's wick", () => {
  it("carries the flame the thumb's own distance, and no further", () => {
    const l = computeLayout(VIEWPORT, CFG, "p1");
    const world = opened();
    const c = glow(world);
    c.phase = "last";
    c.glow = 1;
    c.pinchMilli = 0;
    expect(candleWickAt(l, CFG, c).y).toBe(candleGlowY(l));
    c.pinchMilli = CFG.candlePinchMilli;
    const rest = candleWickRest(l, CFG, c);
    expect(candleWickAt(l, CFG, c).y).toBeCloseTo(rest.y + candleWickReach(l, CFG), 6);
    // Half way down is half the reach: one-to-one with the thumb, which is
    // the whole reason the wick is `candlePinchMilli` long in the picture.
    c.pinchMilli = Math.round(CFG.candlePinchMilli / 2);
    expect(candleWickAt(l, CFG, c).y - rest.y).toBeCloseTo(candleWickReach(l, CFG) / 2, 3);
  });

  it.each(ROLES)("draws the stem and its ring at the last step, on %s", (role) => {
    const before = opened();
    darkened(before);
    glow(before).glow = 1;
    const plain = drawn(before, role, 3).text;
    expect(plain).not.toContain(PALETTE.emberRim);
    const world = opened();
    darkened(world);
    const c = glow(world);
    c.glow = 1;
    c.phase = "last";
    c.phaseBeat = world.beat;
    c.pinchMilli = Math.round(CFG.candlePinchMilli / 2);
    const held = drawn(world, role, 3).text;
    // The stem is `ember`; the ring under a thumb strokes `emberRim` and runs
    // its dial in it, and the flame is still there in front of both.
    expect(held).toContain(PALETTE.ember);
    expect(held).toContain(PALETTE.emberRim);
    expect(held).toContain(PALETTE.podRim);
  });

  it("leaves an ember and no flame once the flame is off the wick", () => {
    const world = opened();
    darkened(world);
    const c = glow(world);
    c.glow = 1;
    c.phase = "smoking";
    c.phaseBeat = world.beat;
    c.pinchMilli = 0;
    const smoke = drawn(world, "p2", 3).text;
    expect(smoke).toContain(PALETTE.emberRim);
    expect(smoke).not.toContain(PALETTE.podRim);
    expect(count(smoke, BLACK)).toBeGreaterThan(0);
  });
});
