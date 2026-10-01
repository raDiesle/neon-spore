import { describe, expect, it } from "bun:test";
import {
  DEFAULT_CONFIG,
  hullRow,
  type SimConfig,
  type ThroatState,
  throatHomeCol,
} from "@neon-spore/sim";
import { computeLayout, tileCX, tileCY } from "../src/layout.js";
import { evertedRings, evertShare } from "../src/throat-evert.js";
import { mouthX, mouthY, ringSlack, ringSqueeze, rings } from "../src/throat-shape.js";

/**
 * The gullet's geometry, which is the half of THE THROAT's picture that had to
 * be *decided* rather than drawn.
 *
 * Two of the things asserted here are conventions the simulation does not hold
 * and could not: which ring a swallow spent, and which way the contraction
 * travels. Each one is argued in `throat-shape.ts`, and each one would be
 * invisible to a frame test — a canvas accepts a gullet whose rings go slack
 * from the wrong end just as happily as the right one.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const L = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, "p1");
const HOME = throatHomeCol(CFG);

function tube(over: Partial<ThroatState> = {}): ThroatState {
  return {
    kind: "throat",
    phase: "sucks",
    phaseBeat: 0,
    slack: 0,
    fedBeat: -1,
    refusedTick: -1,
    refusedId: -1,
    aimXMilli: HOME * 1000,
    aimYMilli: (hullRow(CFG) - 3) * 1000,
    aimFromXMilli: -1,
    aimFromYMilli: -1,
    mode: "red",
    pumpDir: 0,
    pumpFromYMilli: 0,
    pumpMilli: 0,
    ...over,
  };
}

describe("which rings are slack", () => {
  it("takes them from the mouth downward", () => {
    // A swallow is taken at the mouth, so the ring nearest it is the first to go.
    expect(ringSlack(CFG, tube({ slack: 1 }), CFG.throatRings - 1)).toBe(1);
    expect(ringSlack(CFG, tube({ slack: 1 }), 0)).toBe(0);
  });

  it("marks every ring once the tube is spent", () => {
    const spent = tube({ slack: CFG.throatRings });
    for (let i = 0; i < CFG.throatRings; i++) expect(ringSlack(CFG, spent, i)).toBe(1);
  });
});

describe("the gulp", () => {
  it("starts under the mouth on a swallow and runs down into the ship", () => {
    const b = tube({ fedBeat: 4 });
    const top = CFG.throatRings - 1;
    expect(ringSqueeze(CFG, b, top, 4, 0)).toBe(1);
    expect(ringSqueeze(CFG, b, top - 1, 4, 0)).toBe(0);
    expect(ringSqueeze(CFG, b, top - 1, 5, 0)).toBe(1);
    expect(ringSqueeze(CFG, b, top, 5, 0)).toBe(0);
  });

  it("is nothing before the first swallow, and out of the tube after", () => {
    for (let i = 0; i < CFG.throatRings; i++) {
      expect(ringSqueeze(CFG, tube(), i, 3, 0)).toBe(0);
      expect(ringSqueeze(CFG, tube({ fedBeat: 0 }), i, CFG.throatRings, 0)).toBe(0);
    }
  });
});

describe("the tube", () => {
  it("keeps every ring however many have gone slack", () => {
    // The silhouette is the health bar: a spent gullet has to read as weaker
    // and never as shorter, so a limp ring still has a station.
    for (const slack of [0, 2, CFG.throatRings]) {
      expect(rings(L, CFG, tube({ slack }), 0, 0)).toHaveLength(CFG.throatRings);
    }
  });

  it("is rooted in the hull at the cannon's place, wherever the mouth goes", () => {
    for (const aimXMilli of [500, HOME * 1000, (CFG.cols - 1) * 1000]) {
      const root = rings(L, CFG, tube({ aimXMilli }), 0, 0)[0];
      if (root === undefined) throw new Error("no root ring");
      expect(root.x).toBeCloseTo(tileCX(L, HOME), 0);
      expect(root.y).toBeGreaterThan(L.hullY);
    }
  });

  it("puts the mouth exactly where the navigator carried it", () => {
    const b = tube({ aimXMilli: 1500, aimYMilli: 4250 });
    expect(mouthX(L, b)).toBeCloseTo(tileCX(L, 1.5), 6);
    expect(mouthY(L, b)).toBeCloseTo(tileCY(L, 4.25), 6);
  });

  it("hangs straight from the root while it is whole and sags once it is not", () => {
    const b = tube({ aimXMilli: 0 });
    const whole = rings(L, CFG, b, 0, 0)[1];
    const worn = rings(L, CFG, tube({ ...b, slack: CFG.throatRings - 1 }), 0, 0)[1];
    if (whole === undefined || worn === undefined) throw new Error("no second ring");
    expect(Math.abs(worn.x - whole.x)).toBeGreaterThan(L.tile * 0.2);
  });

  it("ends the stack under the mouth, never across it", () => {
    // The lip sits at the end of the tube rather than inside the top ring: a
    // ring drawn over the mouth would be a target with a hoop across it.
    const b = tube();
    const top = rings(L, CFG, b, 0, 0)[CFG.throatRings - 1];
    if (top === undefined) throw new Error("no top ring");
    expect(top.y - top.ry).toBeGreaterThan(mouthY(L, b));
  });
});

describe("the eversion", () => {
  it("feeds one ring through for each share of its beats", () => {
    const b = tube({ phase: "everts", phaseBeat: 0 });
    expect(evertedRings(CFG, b, 0, 0)).toBe(0);
    expect(evertedRings(CFG, b, CFG.throatEvertBeats, 0)).toBeCloseTo(CFG.throatRings, 6);
  });

  it("is over when the simulation says the boss is", () => {
    const b = tube({ phase: "everts", phaseBeat: 0 });
    expect(evertShare(CFG, b, CFG.throatEvertBeats + 4, 0)).toBe(1);
  });
});
