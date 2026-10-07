import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  midCol,
  type StareState,
  stareBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { computeLayout, tileCX } from "../src/layout.js";
import { stareEye } from "../src/stare-shape.js";
import { stareStopper } from "../src/stare-stop.js";
import { STARE_ROLL, stareRoll } from "../src/stare-sway.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE STARE's roll (`stare-sway.ts`): the cowl's horns, 2.7 tiles out, lift
 * and dip by more than half a tile and the roll never passes its cap; a bolt
 * meets the glass where the rolled dome is drawn; and the eye is still while
 * it charges, rises and calms.
 */

const L = computeLayout(VIEWPORT, CFG, "p1");
const QUARTERS = Array.from({ length: 4 * 240 }, (_, q) => q);
const HORN = 2.7;

function hung(): { world: World; s: StareState } {
  const world = createWorld(CFG, 3);
  const index = waveWith("stare");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < ticksPerBeat(CFG) * 4; i++) step(world, []);
  const s = stareBoss(world);
  if (s === null) throw new Error("the stare wave hung no eye");
  return { world, s: { ...s, phase: "live", phaseBeat: 0 } };
}

const rolled = (world: World, s: StareState) =>
  QUARTERS.map((q) => stareRoll(world, s, Math.floor(q / 4), (q % 4) / 4));

describe("THE STARE rolls in its socket", () => {
  it("lifts and dips the cowl's horns by more than half a tile, never past its cap", () => {
    const { world, s } = hung();
    const horn = rolled(world, s).map((a) => HORN * Math.sin(a));
    expect(Math.max(...horn)).toBeGreaterThan(0.5);
    expect(Math.min(...horn)).toBeLessThan(-0.5);
    expect(Math.max(...rolled(world, s).map(Math.abs))).toBeLessThanOrEqual(STARE_ROLL);
  });

  it("stops a bolt on the rolled glass: lower on the side that dips", () => {
    const { world } = hung();
    const socket = stareEye(L, CFG);
    const col = midCol(CFG) + 2;
    const x = tileCX(L, col);
    const at = (roll: number) => stareStopper(world, socket, roll)(col, x, "red")?.y ?? 0;
    expect(at(0)).toBeGreaterThan(0);
    // Clockwise, the right-hand side of the glass dips toward the field.
    expect(at(STARE_ROLL)).toBeGreaterThan(at(0));
    expect(at(-STARE_ROLL)).toBeLessThan(at(0));
  });

  it("is still while it charges, rises and calms", () => {
    const { world, s } = hung();
    for (const phase of ["rise", "calm"] as const) {
      expect(Math.max(...rolled(world, { ...s, phase }).map(Math.abs))).toBe(0);
    }
    const charging = { ...world, slowFromBeat: 0, slowToBeat: 1000 };
    const held = rolled(charging, { ...s, phase: "charge" })
      .slice(4)
      .map(Math.abs);
    expect(Math.max(...held)).toBe(0);
  });
});
