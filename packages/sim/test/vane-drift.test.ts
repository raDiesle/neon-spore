import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  type SimConfig,
  startWave,
  type VaneState,
  vaneDriftCol,
  vaneGuardedAt,
  vanePivotAt,
  vanePivotCol,
  vaneSplitCol,
  vaneTipAt,
  type World,
} from "../src/index.js";
import { vaneGuarded } from "../src/vane-guard.js";

/**
 * **THE VANE's last form walks** (`vaneDriftCol`, `docs/spec/bosses.md` §11.5,
 * *Four forms*). The owner, 30 September 2026: *The boss in later levels should
 * probably start to move around*. Checked here: the pivot stays home until the
 * last form, walks one column a cycle out to `vaneDriftCols` either side and
 * back, starts the form at home, stands still under a pin, and takes the tip,
 * the split and the guards with it.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG };
const HOME = vanePivotCol(CFG);
const LAST = CFG.vaneForms - 1;
const CYCLE = 12;
const SPAN = CYCLE * 4 * CFG.vaneDriftCols * 2;

function open(): World {
  const world = createWorld({ ...CFG }, 1);
  startWave(world, 0, [], [], { kind: "vane" });
  return world;
}

const vane = (world: World): VaneState => {
  const b = world.boss;
  if (b === null || b.kind !== "vane") throw new Error("no vane");
  return b;
};

const beats = (n: number) => Array.from({ length: n }, (_, i) => i);

describe("the walk", () => {
  it("keeps the pivot home in every form but the last", () => {
    for (let form = 0; form < LAST; form++)
      for (const beat of beats(SPAN)) expect(vaneDriftCol(CFG, form, 0, beat)).toBe(HOME);
  });

  it("starts the last form at home, wherever the wave's beat is", () => {
    for (const formBeat of [0, 7, 30, 101])
      expect(vaneDriftCol(CFG, LAST, formBeat, formBeat)).toBe(HOME);
  });

  it("walks out to the drift either side and no further, on the grid", () => {
    const at = beats(SPAN).map((beat) => vaneDriftCol(CFG, LAST, 0, beat));
    expect(Math.min(...at)).toBe(HOME - CFG.vaneDriftCols);
    expect(Math.max(...at)).toBe(HOME + CFG.vaneDriftCols);
    for (const col of at) {
      expect(col).toBeGreaterThanOrEqual(1);
      expect(col).toBeLessThanOrEqual(CFG.cols - 2);
    }
  });

  it("moves at most one column a beat, and only between cycles", () => {
    for (const beat of beats(SPAN).slice(1)) {
      const step = vaneDriftCol(CFG, LAST, 0, beat) - vaneDriftCol(CFG, LAST, 0, beat - 1);
      expect(Math.abs(step)).toBeLessThanOrEqual(1);
      if ((beat - 1) % CYCLE !== 0) expect(step).toBe(0);
    }
  });

  it("stays home with no drift configured", () => {
    const still = { ...CFG, vaneDriftCols: 0 };
    for (const beat of beats(SPAN)) expect(vaneDriftCol(still, LAST, 0, beat)).toBe(HOME);
  });
});

describe("what walks with it", () => {
  /** The last form on its second cycle's first beat, where the pivot has left home. */
  function walked(): World {
    const world = open();
    Object.assign(vane(world), { form: LAST, formBeat: 0, pins: 3 });
    world.waveBeat = CYCLE + 1;
    return world;
  }

  it("holds the pivot where the pin found it while the pin stands", () => {
    const world = walked();
    const b = vane(world);
    const pivot = vanePivotAt(CFG, b, world.beat, world.waveBeat);
    expect(pivot).not.toBe(HOME);
    Object.assign(b, { pinBeat: world.beat, pinCol: pivot + 1, pinSide: 1, pinPivot: pivot });
    for (let i = 0; i < CFG.vanePinBeats; i++)
      expect(vanePivotAt(CFG, b, world.beat + i, world.waveBeat + CYCLE * (i + 1))).toBe(pivot);
  });

  it("keeps the tip on the grid through a whole walk", () => {
    const world = walked();
    const b = vane(world);
    for (const pins of [1, 2, 3]) {
      b.pins = pins;
      for (const beat of beats(SPAN)) {
        const tip = vaneTipAt(CFG, b, 0, beat);
        expect(tip).toBeGreaterThanOrEqual(0);
        expect(tip).toBeLessThan(CFG.cols);
      }
    }
  });

  it("splits the housing beside the pivot it has walked to", () => {
    const world = walked();
    const b = vane(world);
    const pivot = vanePivotAt(CFG, b, world.beat, world.waveBeat);
    Object.assign(b, { pinBeat: world.beat, pinCol: pivot - 1, pinSide: -1, pinPivot: pivot });
    expect(vaneSplitCol(world, b)).toBe(pivot + 1);
  });

  it("turns its guards across the mouths beside the walked pivot", () => {
    const world = walked();
    const b = vane(world);
    const pivot = vanePivotAt(CFG, b, world.beat, world.waveBeat);
    for (const beat of beats(CYCLE)) {
      world.waveBeat = CYCLE + 1 + beat;
      const now = vanePivotAt(CFG, b, world.beat, world.waveBeat);
      expect(vaneGuarded(world, b, now + 1)).toBe(
        vaneGuardedAt(CFG, b, now + 1, world.waveBeat, now),
      );
      expect(vaneGuarded(world, b, now)).toBe(false);
    }
    expect(pivot).not.toBe(HOME);
  });

  it("puts where the form began and where the pin held it in the hash", () => {
    for (const field of ["formBeat", "pinPivot"] as const) {
      const a = open();
      const b = open();
      vane(b)[field] = 9;
      expect(hashWorld(a)).not.toBe(hashWorld(b));
    }
  });
});
