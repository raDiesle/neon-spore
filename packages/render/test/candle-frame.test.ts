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
import type { ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
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
 * whose control made them and on no other, and that the field is black and
 * nothing else once the last step has gone.
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
