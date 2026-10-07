import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  type SinewState,
  sinewBoss,
  startWave,
  step,
  ticksPerBeat,
} from "@neon-spore/sim";
import { computeLayout } from "../src/layout.js";
import { sinewCollarBox } from "../src/sinew-band.js";
import { sinewHandleCircle } from "../src/sinew-handles.js";
import { sinewMassCentre } from "../src/sinew-shape.js";
import { SINEW_SWAY, sinewSway } from "../src/sinew-sway.js";

/**
 * THE SINEW's swing (`sinew-sway.ts`): the mass swings by more than half a
 * tile each way and never past its cap, the collar above it holds still, the
 * handle a thumb is tested against rides the swing, and the mass is still
 * once it falls and once it has landed.
 */

const CFG = DEFAULT_CONFIG;
const L = computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "p1");
const QUARTERS = Array.from({ length: 4 * 240 }, (_, q) => q);

function tendon(): SinewState {
  const world = createWorld(CFG, 12, []);
  startWave(world, 9, [], [], { kind: "sinew" });
  const settled = ticksPerBeat(CFG) * (CFG.sinewEnterBeats + 1);
  for (let t = 0; t < settled; t++) step(world, []);
  const s = sinewBoss(world);
  if (s === null) throw new Error("no tendon was installed");
  return s;
}

const swung = (s: SinewState) =>
  QUARTERS.map((q) => sinewSway(CFG, s, Math.floor(q / 4), (q % 4) / 4).x);

describe("THE SINEW's mass swings on its tendon", () => {
  it("swings by more than half a tile each way, and never past its cap", () => {
    const x = swung(tendon());
    expect(Math.max(...x)).toBeGreaterThan(0.5);
    expect(Math.min(...x)).toBeLessThan(-0.5);
    expect(Math.max(...x.map(Math.abs))).toBeLessThanOrEqual(SINEW_SWAY);
  });

  it("moves the mass and the handle with it, and leaves the collar where it hangs", () => {
    const s = tendon();
    const at = QUARTERS.map((q) => {
      const beat = Math.floor(q / 4);
      const phase = (q % 4) / 4;
      return {
        mass: sinewMassCentre(L, CFG, s, beat, phase).x,
        handle: sinewHandleCircle(L, CFG, s, beat, phase, 1).x,
        collar: sinewCollarBox(L, CFG, s, beat, phase).x,
      };
    });
    const spread = (xs: number[]) => (Math.max(...xs) - Math.min(...xs)) / L.tile;
    expect(spread(at.map((a) => a.mass))).toBeGreaterThan(1);
    expect(spread(at.map((a) => a.handle))).toBeGreaterThan(1);
    expect(spread(at.map((a) => a.collar))).toBe(0);
  });

  it("is still half a beat into the fall, and once it has landed", () => {
    const s = tendon();
    const falling = { ...s, fallBeat: 0 };
    for (const q of QUARTERS.filter((q) => q >= 2)) {
      expect(sinewSway(CFG, falling, Math.floor(q / 4), (q % 4) / 4).x).toBe(0);
    }
    expect(Math.max(...swung({ ...s, outBeat: 0 }).map(Math.abs))).toBe(0);
  });
});
