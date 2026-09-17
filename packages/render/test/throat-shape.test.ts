import { describe, expect, it } from "bun:test";
import {
  DEFAULT_CONFIG,
  midCol,
  type SimConfig,
  type ThroatState,
  throatMouthCol,
  throatMouthRow,
} from "@neon-spore/sim";
import { computeLayout, tileCY } from "../src/layout.js";
import { mouthX, ringSlack, ringSqueeze, rings } from "../src/throat-shape.js";

/**
 * The gullet's geometry, which is the half of THE THROAT's picture that had to
 * be *decided* rather than drawn.
 *
 * Three of the four things asserted here are conventions the simulation does
 * not hold and could not: which ring a choke took, which way the contraction
 * travels, and where the mouth is inside a beat. Each one is argued in
 * `throat-shape.ts`, and each one would be invisible to a frame test — a
 * canvas accepts a gullet whose rings go slack from the wrong end just as
 * happily as the right one.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const L = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, "p1");

function tube(over: Partial<ThroatState> = {}): ThroatState {
  return {
    kind: "throat",
    phase: "still",
    phaseBeat: 0,
    slack: 0,
    mouthFrom: midCol(CFG),
    chokedBeat: -1,
    fedBeat: -1,
    ...over,
  };
}

describe("which rings are slack", () => {
  it("takes them from the mouth upward", () => {
    // A choke lands at the mouth, so the ring nearest it is the first to go.
    expect(ringSlack(CFG, tube({ slack: 1 }), CFG.throatRings - 1)).toBe(1);
    expect(ringSlack(CFG, tube({ slack: 1 }), 0)).toBe(0);
  });

  it("gives back the one furthest from the mouth first", () => {
    // Which falls out of the rule above without a second one: a swallow drops
    // the count, so the highest slack ring is the one that tightens again, and
    // a heal visibly undoes the last hit.
    const before = tube({ slack: 3 });
    const after = tube({ slack: 2 });
    const top = CFG.throatRings - 3;
    expect(ringSlack(CFG, before, top)).toBe(1);
    expect(ringSlack(CFG, after, top)).toBe(0);
    expect(ringSlack(CFG, after, CFG.throatRings - 1)).toBe(1);
  });

  it("marks every ring once the tube is spent", () => {
    const spent = tube({ slack: CFG.throatRings });
    for (let i = 0; i < CFG.throatRings; i++) expect(ringSlack(CFG, spent, i)).toBe(1);
  });
});

describe("the gulp", () => {
  it("starts at the mouth on the inhale and climbs away from the field", () => {
    const b = tube();
    const bottom = CFG.throatRings - 1;
    // On the inhale beat the contraction is in the ring above the mouth and
    // nowhere else; a beat later it has moved one ring up, not down.
    expect(ringSqueeze(CFG, b, bottom, 0, 0)).toBe(1);
    expect(ringSqueeze(CFG, b, bottom - 1, 0, 0)).toBe(0);
    expect(ringSqueeze(CFG, b, bottom - 1, 1, 0)).toBe(1);
    expect(ringSqueeze(CFG, b, bottom, 1, 0)).toBe(0);
  });

  it("is out of the tube before the next inhale", () => {
    // Which is what keeps it a receipt rather than a countdown: there is a
    // stretch of beats with nothing in the gullet at all, and it ends when
    // the throat takes something and not a fixed number of beats before.
    const b = tube();
    const quiet = CFG.throatRings;
    for (let i = 0; i < CFG.throatRings; i++) {
      expect(ringSqueeze(CFG, b, i, quiet, 0)).toBe(0);
    }
  });

  it("squeezes a ring once when two gulps overlap", () => {
    // Phase `open` inhales every beat, so several are in the tube at once.
    const b = tube({ phase: "open" });
    for (let i = 0; i < CFG.throatRings; i++) {
      expect(ringSqueeze(CFG, b, i, 8, 0)).toBeLessThanOrEqual(1);
    }
  });
});

describe("the tube", () => {
  it("keeps every ring however many have gone slack", () => {
    // The silhouette is the health bar: a choked gullet has to read as weaker
    // and never as shorter, so a limp ring still has a station.
    for (const slack of [0, 2, CFG.throatRings]) {
      expect(rings(L, CFG, tube({ slack }), 0, 0)).toHaveLength(CFG.throatRings);
    }
  });

  it("hangs straight from the root while it is whole and sags once it is not", () => {
    const b = tube({ phase: "quick", mouthFrom: 0 });
    const off = throatMouthCol(CFG, b, 0);
    if (off === midCol(CFG)) throw new Error("the mouth is not off centre to lean toward");
    const whole = rings(L, CFG, b, 0, 1)[1];
    const worn = rings(L, CFG, tube({ ...b, slack: CFG.throatRings - 1 }), 0, 1)[1];
    if (whole === undefined || worn === undefined) throw new Error("no second ring");
    // The second ring from the root: near its home column while the muscles
    // hold, dragged most of the way toward the mouth once they do not.
    expect(Math.abs(worn.x - whole.x)).toBeGreaterThan(L.tile * 0.2);
  });

  it("puts the mouth in the column the hit test will use", () => {
    // The whole of why the mouth snaps rather than slides: `throatMouthCol`
    // says it *is* in this column for the whole beat and a fling is swept
    // against that, so by a third of the way in the picture has to agree.
    const b = tube({ phase: "quick", phaseBeat: 0 });
    const at = 3;
    const want = throatMouthCol(CFG, b, at);
    for (const phase of [0.4, 0.7, 0.99]) {
      expect(mouthX(L, CFG, b, at, phase)).toBeCloseTo(
        mouthX(L, CFG, tube({ ...b, phase: "still", mouthFrom: want }), at, 0),
        6,
      );
    }
  });

  it("ends the stack above the mouth's own row", () => {
    // The lip has to sit at the end of the tube rather than inside the lowest
    // ring: the mouth is the thing a gum is aimed at, and a ring drawn over it
    // would be a target with a hoop across it.
    const low = rings(L, CFG, tube(), 0, 0)[CFG.throatRings - 1];
    if (low === undefined) throw new Error("no lowest ring");
    expect(low.y + low.ry).toBeLessThan(tileCY(L, throatMouthRow(CFG)));
  });
});
