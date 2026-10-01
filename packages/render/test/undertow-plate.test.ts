import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import { createWorld, type Scar, startWave, step, ticksPerBeat, type World } from "@neon-spore/sim";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { plateGaps } from "../src/plate-gap.js";
import { UndertowFx } from "../src/undertow-fx.js";
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
 * THE UNDERTOW's two leftovers from the design, as pictures: the plate a
 * tall lobe takes with it, drawn as a hole in the hull's outline rather than
 * as a crack (`plate-gap.ts`), and the moments `undertow-fx.ts` remembers
 * past the tick a lobe leaves the world: the plate closing over it, and the
 * burst of one left tall.
 *
 * The scars are **set** rather than earned, for `undertow-frame.test.ts`'
 * reason: `sim/test/undertow.test.ts` proves which lobe leaves which scar.
 * What this file asks is whether a plate scar is drawn as something other
 * than a crack, whether two of them from one lobe are one hole, and whether
 * the close and the burst are drawn on both screens — a lobe is answered from
 * either seat now.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
/** The colour every crack is stroked in (`scars.ts`). */
const CRACK = "#150E28";

function opened(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("undertow");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  return world;
}

function scar(col: number, beat: number, plate: boolean): Scar {
  return plate ? { col, beat, kind: "slick", plate: true } : { col, beat, kind: "slick" };
}

/** Every colour a screen set over a run of frames, as one string. */
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

describe("the plate a tall lobe takes", () => {
  const l = computeLayout(VIEWPORT, CFG, "p1");
  const skinAt = (x: number) => ({ x, y: l.hullY });

  it("joins two neighbouring plates gone on one beat into one hole, two columns wide", () => {
    const gaps = plateGaps(l, [scar(3, 7, true), scar(4, 7, true)], skinAt);
    expect(gaps).toHaveLength(1);
    expect(gaps[0]?.cols).toEqual([3, 4]);
    const width = (gaps[0]?.right ?? 0) - (gaps[0]?.left ?? 0);
    expect(width).toBeGreaterThan(l.tile * 1.8);
    expect(width).toBeLessThan(l.tile * 2);
  });

  it("keeps two losses apart when they are not one lobe's", () => {
    // Different beats, or a column between: two holes, not one.
    expect(plateGaps(l, [scar(3, 7, true), scar(4, 9, true)], skinAt)).toHaveLength(2);
    expect(plateGaps(l, [scar(2, 7, true), scar(4, 7, true)], skinAt)).toHaveLength(2);
    // The order the scars were laid in does not decide it.
    expect(plateGaps(l, [scar(4, 7, true), scar(3, 7, true)], skinAt)).toHaveLength(1);
  });

  it("finds no hole in a scar that only cracked", () => {
    expect(plateGaps(l, [scar(3, 7, false)], skinAt)).toHaveLength(0);
  });

  for (const role of ROLES) {
    it(`draws a plate gone as a hole and not as a crack for ${role}`, () => {
      const cracked = opened();
      cracked.scars.push(scar(4, cracked.beat, false));
      const gone = opened();
      gone.scars.push(scar(4, gone.beat, true), scar(5, gone.beat, true));
      const a = drawn(cracked, role, TPB);
      const b = drawn(gone, role, TPB);
      expect(b.calls).toBeGreaterThan(500);
      expect(b.text).not.toBe(a.text);
      // A crack is stroked in its own dark; a hole is not a crack, so a hull
      // with only plates gone strokes none of it.
      expect(count(a.text, CRACK)).toBeGreaterThan(0);
      expect(count(b.text, CRACK)).toBe(0);
    });
  }
});

describe("the plate closing over a lobe taken, and the burst", () => {
  /** The harness leaves the stepping to this when it is given: step, then add the one event. */
  const stepThen =
    (type: "undertowTaken" | "undertowBurst", col: number) => (tick: number, world: World) => {
      step(world, []);
      if (tick === 0) world.events.push({ type, col });
    };

  for (const role of ROLES) {
    it(`draws a lobe taken and a burst on ${role}'s screen`, () => {
      const quiet = drawn(opened(), role, TPB).text;
      const closed = drawn(opened(), role, TPB, stepThen("undertowTaken", 4)).text;
      const burst = drawn(opened(), role, TPB, stepThen("undertowBurst", 4)).text;
      expect(closed).not.toBe(quiet);
      expect(burst).not.toBe(quiet);
      expect(burst).not.toBe(closed);
    });
  }

  it("settles and is gone, and a reset forgets it", () => {
    const l = computeLayout(VIEWPORT, CFG, "p1");
    const fx = new UndertowFx();
    fx.ingest([{ type: "undertowEbb", col: 4 }], l, CFG, 0.5);
    fx.update(0.1);
    expect(fx).not.toEqual(new UndertowFx());
    fx.update(1);
    expect(fx).toEqual(new UndertowFx());
    fx.ingest([{ type: "undertowBurst", col: 4 }], l, CFG, 0.5);
    fx.clear();
    expect(fx).toEqual(new UndertowFx());
  });
});
