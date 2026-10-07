import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type SurgeState,
  startWave,
  step,
  surgeBoss,
  ticksPerBeat,
} from "@neon-spore/sim";
import { computeLayout } from "../src/layout.js";
import { surgeGripCircle } from "../src/surge-grip.js";
import { surgeBulbCentre, surgeBulbRx, surgeBulbRy } from "../src/surge-shape.js";
import { SURGE_ROLL, surgeRoll } from "../src/surge-sway.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE SURGE's rock (`surge-sway.ts`): the bulb rolls far enough that a flank
 * lifts and dips by more than half a tile, never past its cap; the grip mark
 * rides the flank; and the roll is gone once the bulb has everted or is out,
 * and hushed under THE SLOW.
 */

const L = computeLayout(VIEWPORT, CFG, "p1");
const QUARTERS = Array.from({ length: 4 * 240 }, (_, q) => q);

function bulb(): SurgeState {
  const world = createWorld(CFG, 7);
  const index = waveWith("surge");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < ticksPerBeat(CFG); i++) step(world, []);
  const s = surgeBoss(world);
  if (s === null) throw new Error("no bulb");
  return s;
}

const rolled = (s: SurgeState) =>
  QUARTERS.map((q) => surgeRoll(CFG, s, Math.floor(q / 4), (q % 4) / 4));

describe("THE SURGE rocks where it hangs", () => {
  it("lifts and dips a flank by more than half a tile, and never past its cap", () => {
    const roll = rolled(bulb());
    const rx = surgeBulbRx(L, CFG) / L.tile;
    expect(Math.max(...roll.map((a) => rx * Math.sin(a)))).toBeGreaterThan(0.5);
    expect(Math.min(...roll.map((a) => rx * Math.sin(a)))).toBeLessThan(-0.5);
    expect(Math.max(...roll.map(Math.abs))).toBeLessThanOrEqual(SURGE_ROLL);
  });

  it("carries each grip mark round the middle with the flank", () => {
    const s = bulb();
    const c = surgeBulbCentre(L, CFG, s);
    const rx = surgeBulbRx(L, CFG);
    const ry = surgeBulbRy(L);
    for (const side of [-1, 1] as const) {
      const rest = surgeGripCircle(L, CFG, c, rx, ry, side);
      const tipped = surgeGripCircle(L, CFG, c, rx, ry, side, SURGE_ROLL);
      expect(Math.hypot(tipped.x - c.x, tipped.y - c.y)).toBeCloseTo(
        Math.hypot(rest.x - c.x, rest.y - c.y),
        6,
      );
      // Clockwise on the screen: the right flank dips, the left one lifts.
      expect(Math.sign(tipped.y - rest.y)).toBe(side);
    }
  });

  it("is still once the bulb has everted or is out, and hushed under THE SLOW", () => {
    const s = bulb();
    expect(Math.max(...rolled({ ...s, outBeat: 0 }).map(Math.abs))).toBe(0);
    const everted = { ...s, evertBeat: 0 };
    const late = QUARTERS.filter((q) => q >= 4 * Math.max(1, CFG.surgeEvertBeats));
    for (const q of late) expect(surgeRoll(CFG, everted, Math.floor(q / 4), (q % 4) / 4)).toBe(0);
    const slow = { slowFromBeat: 0, slowToBeat: 1000 };
    const hushed = QUARTERS.map((q) => surgeRoll(CFG, s, Math.floor(q / 4), (q % 4) / 4, slow));
    expect(Math.max(...hushed.slice(8).map(Math.abs))).toBeLessThanOrEqual(0.1 * SURGE_ROLL + 1e-9);
  });
});
