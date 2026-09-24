import { describe, expect, it } from "bun:test";
import {
  DEFAULT_CONFIG,
  type SimConfig,
  type UndertowBreach,
  type UndertowState,
} from "@neon-spore/sim";
import {
  BODY_TILES,
  bodyHeight,
  bodyPass,
  bowLift,
  breachHalf,
  edgeLight,
  LAST_TILES,
  LOBE_TILES,
  lobeHeight,
  PLATE_HALF,
  TALL_TILES,
} from "../src/undertow-shape.js";

/**
 * THE UNDERTOW's geometry, which is the half of its picture that had to be
 * decided rather than drawn: how far a plate has risen at a given beat, how
 * high a lobe stands, and when the whole edge lights. Each is a convention
 * the simulation does not hold — it counts beats and says *bowing* or
 * *standing* — and each would be invisible to a frame test, which accepts a
 * plate that rose in one frame as happily as one that took four beats.
 */

const CFG: SimConfig = DEFAULT_CONFIG;

function breach(over: Partial<UndertowBreach> = {}): UndertowBreach {
  return {
    col: 3,
    stage: "bowing",
    stageBeat: 10,
    tall: false,
    widthMilli: 0,
    widened: false,
    ...over,
  };
}

function floor(over: Partial<UndertowState> = {}): UndertowState {
  return {
    kind: "undertow",
    phase: "one",
    phaseBeat: 0,
    push: 1,
    restBeat: -1,
    breaches: [],
    taken: 0,
    scars: 0,
    unseatedUntil: -1,
    hold: 0,
    slid: 0,
    pinCol: -1,
    freeHeld: false,
    freed: 0,
    ...over,
  };
}

describe("the bow", () => {
  it("rises from nothing to the whole plate over the phase's bow beats", () => {
    const u = floor();
    const b = breach();
    expect(bowLift(CFG, u, b, 10, 0)).toBe(0);
    const mid = bowLift(CFG, u, b, 10 + CFG.undertowBowBeats / 2, 0);
    expect(mid).toBeGreaterThan(0.3);
    expect(mid).toBeLessThan(0.7);
    expect(bowLift(CFG, u, b, 10 + CFG.undertowBowBeats, 0)).toBe(1);
  });

  it("is a shorter count under the seat, because that push is seen rather than called", () => {
    const u = floor({ phase: "seat" });
    expect(bowLift(CFG, u, breach(), 10 + CFG.undertowUnseatBeats, 0)).toBe(1);
  });

  it("is full for as long as the lobe stands", () => {
    expect(bowLift(CFG, floor(), breach({ stage: "standing" }), 10, 0)).toBe(1);
  });
});

describe("the lobe", () => {
  it("stands nothing while the plate is bowing", () => {
    expect(lobeHeight(CFG, floor(), breach(), 12, 0.5)).toBe(0);
  });

  it("comes up a tile over the beat it stands on", () => {
    const b = breach({ stage: "standing" });
    expect(lobeHeight(CFG, floor(), b, 10, 0)).toBe(0);
    expect(lobeHeight(CFG, floor(), b, 11, 0)).toBe(LOBE_TILES);
    expect(lobeHeight(CFG, floor(), b, 13, 0.5)).toBe(LOBE_TILES);
  });

  it("comes up fast and three tiles high when it is tall", () => {
    const b = breach({ stage: "standing", tall: true });
    expect(lobeHeight(CFG, floor(), b, 10, 0.5)).toBe(TALL_TILES);
  });

  it("keeps growing for as long as the last one stands", () => {
    const u = floor({ phase: "last" });
    const b = breach({ stage: "standing" });
    expect(lobeHeight(CFG, u, b, 11, 0)).toBeGreaterThan(LOBE_TILES);
    expect(lobeHeight(CFG, u, b, 11, 0)).toBeLessThan(LAST_TILES);
    expect(lobeHeight(CFG, u, b, 10 + CFG.undertowLastBeats, 0)).toBe(LAST_TILES);
  });
});

describe("the breach", () => {
  it("is a plate wide, and wider by what it has spread", () => {
    expect(breachHalf(breach())).toBe(PLATE_HALF);
    expect(breachHalf(breach({ widthMilli: CFG.undertowWideMilli }))).toBe(
      PLATE_HALF + CFG.undertowWideMilli / 1000,
    );
  });
});

describe("the edge", () => {
  it("is dark through the first four parts", () => {
    for (const phase of ["one", "two", "hard", "seat"] as const) {
      expect(edgeLight(CFG, floor({ phase, breaches: [breach()] }), 12, 0.5)).toBe(0);
    }
  });

  it("lights with the rise before the last lobe and stays lit while it stands", () => {
    const u = floor({ phase: "last", breaches: [breach()] });
    expect(edgeLight(CFG, u, 10, 0)).toBe(0);
    expect(edgeLight(CFG, u, 10 + CFG.undertowRiseBeats, 0)).toBe(1);
    u.breaches = [breach({ stage: "standing", stageBeat: 14 })];
    expect(edgeLight(CFG, u, 20, 0.3)).toBe(1);
  });

  it("goes out as the body goes down", () => {
    const u = floor({ phase: "taken", phaseBeat: 20 });
    expect(edgeLight(CFG, u, 20, 0)).toBe(1);
    expect(edgeLight(CFG, u, 20 + CFG.undertowDownBeats, 0)).toBe(0);
  });
});

describe("the body", () => {
  it("passes only while the boss is being taken", () => {
    expect(bodyPass(CFG, floor({ phase: "last" }), 20, 0)).toBe(-1);
    const u = floor({ phase: "taken", phaseBeat: 20 });
    expect(bodyPass(CFG, u, 20, 0)).toBe(0);
    expect(bodyPass(CFG, u, 20 + CFG.undertowDownBeats, 0)).toBe(1);
  });

  it("stands nothing above the hull at either end and most in the middle", () => {
    expect(bodyHeight(-1)).toBe(0);
    expect(bodyHeight(0)).toBe(0);
    expect(bodyHeight(0.5)).toBe(BODY_TILES);
    expect(bodyHeight(1)).toBeCloseTo(0, 6);
  });
});
