import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { midCol, type SimEvent } from "@neon-spore/sim";
import { FlueFx } from "../src/flue-fx.js";
import { flueSightAt } from "../src/flue-shape.js";
import {
  FLUE_STRINGS,
  flueDroop,
  flueHang,
  flueHung,
  flueStringFoot,
  flueStringsCut,
  flueStringsGrown,
} from "../src/flue-strings.js";
import { computeLayout } from "../src/layout.js";
import { BOLT, posed, stood } from "./flue-harness.js";
import { CFG, FRAME_TIMEOUT_MS, ROLES, VIEWPORT } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE FLUE hanging on its shots (`flue-strings.ts`): a string cut for every
 * shot spent, the flue drooping on the cut side and dropping on none, the
 * cut ones grown back over the rest after a level cleared, and the sight —
 * where every shot is met — never moved by any of it.
 */

const L = computeLayout(VIEWPORT, CFG, "test");
const MID = midCol(CFG);

function flue(shots: number, phase: "lit" | "rest" | "spent" = "lit") {
  const world = stood();
  const s = posed(world, BOLT, 0, (b) => {
    b.shots = shots;
    b.phase = phase;
  });
  return { world, s };
}

describe("THE FLUE's strings", () => {
  it("hangs on as many strings as a level has shots", () => {
    expect(FLUE_STRINGS as number).toBe(CFG.flueShots);
  });

  it("cuts one for every shot spent, and none once spent", () => {
    expect([3, 2, 1, 0].map((n) => flueStringsCut(flue(n).s))).toEqual([0, 1, 2, 3]);
    expect(flueStringsCut(flue(1, "spent").s)).toBe(0);
  });

  it("grows the cut ones back over the rest after a clear, and not after the last shot", () => {
    const { world, s } = flue(1, "rest");
    s.phaseBeat = world.beat;
    expect(flueStringsGrown(s, CFG, world.beat, 0)).toBe(0);
    expect(flueStringsGrown(s, CFG, world.beat + CFG.fluePauseBeats, 0)).toBe(1);
    s.shots = 0;
    expect(flueStringsGrown(s, CFG, world.beat + CFG.fluePauseBeats, 0)).toBe(0);
    expect(flueStringsGrown(flue(1).s, CFG, world.beat + 9, 0)).toBe(0);
  });

  it.each(ROLES)("droops the side of the first string cut, on %s", (role) => {
    const l = computeLayout(VIEWPORT, CFG, role);
    const sight = flueSightAt(l, CFG);
    const foot = flueStringFoot(l, CFG, 0);
    const hung = flueHung(foot, sight, flueDroop(l, CFG, 1), 0);
    expect(hung.y).toBeGreaterThan(foot.y);
    expect(flueDroop(l, CFG, 0)).toBe(0);
  });

  it("never moves the sight, however it hangs", () => {
    const sight = flueSightAt(L, CFG);
    for (const shots of [3, 2, 1]) {
      const { world, s } = flue(shots);
      const hang = flueHang(L, CFG, s, world.beat, 0, 1.7, 0.03);
      const at = flueHung(sight, sight, hang.tilt, hang.drop);
      expect(at.x).toBeCloseTo(sight.x, 6);
      expect(at.y).toBeCloseTo(sight.y, 6);
    }
  });

  it("drops once the last string is cut, and hangs whole at the start of a level", () => {
    const lost = flue(0);
    expect(flueHang(L, CFG, lost.s, lost.world.beat, 0, 0, 0).drop).toBeGreaterThan(0);
    const fresh = flue(3);
    const hang = flueHang(L, CFG, fresh.s, fresh.world.beat, 0, 0, 0);
    expect(hang.tilt).toBe(0);
    expect(hang.whole).toEqual([1, 1, 1]);
  });
});

describe("THE FLUE's swing", () => {
  const miss = (shots: number): SimEvent => ({
    type: "flueMiss",
    shots,
    why: "wide",
    col: MID,
    late: false,
    emberMilli: 0,
  });

  it("sets the flue swinging from its old hang as a string is cut, and lets it settle", () => {
    const fx = new FlueFx();
    expect(fx.swing).toBe(0);
    const thrown: string[] = [];
    fx.ingest([miss(2)], L, CFG, 0.5, (_x, _y, _n, hex) => thrown.push(hex));
    // It starts at the hang it had, so the flue does not jump.
    expect(fx.swing).toBeCloseTo(flueDroop(L, CFG, 0) - flueDroop(L, CFG, 1), 6);
    expect(thrown.length).toBe(2);
    for (let i = 0; i < 300; i++) fx.update(1 / 60);
    expect(fx.swing).toBe(0);
  });

  it("is gone on a clear", () => {
    const fx = new FlueFx();
    fx.ingest([miss(1)], L, CFG, 0.5, () => {});
    expect(fx.swing).not.toBe(0);
    fx.clear();
    expect(fx.swing).toBe(0);
  });
});
