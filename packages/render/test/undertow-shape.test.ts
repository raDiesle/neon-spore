import { describe, expect, it } from "bun:test";
import {
  DEFAULT_CONFIG,
  type SimConfig,
  type UndertowLobe,
  type UndertowState,
} from "@neon-spore/sim";
import { computeLayout } from "../src/layout.js";
import {
  bowLift,
  ebbLeft,
  LOBE_TILES,
  lobeHeight,
  TALL_TILES,
  undertowEdgeBox,
} from "../src/undertow-shape.js";

/**
 * THE UNDERTOW's geometry, which is the half of its picture that had to be
 * decided rather than drawn: how far a plate has risen at a given beat, how
 * high a lobe stands, and how far the level's ebb has drawn it back. Each is
 * a convention the simulation does not hold — it counts beats and says
 * *bowing*, *standing* or *tall* — and each would be invisible to a frame
 * test, which accepts a plate that rose in one frame as happily as one that
 * took four beats.
 */

const CFG: SimConfig = DEFAULT_CONFIG;

function lobe(over: Partial<UndertowLobe> = {}): UndertowLobe {
  return { col: 3, stage: "bowing", stageBeat: 10, answer: "maw", ...over };
}

function floor(over: Partial<UndertowState> = {}): UndertowState {
  return {
    kind: "undertow",
    phase: "one",
    phaseBeat: 0,
    restBeat: -1,
    ebbBeat: -1,
    taken: 0,
    lobes: [],
    ...over,
  };
}

describe("the bow", () => {
  it("rises from nothing to the whole plate over the bow beats", () => {
    const b = lobe();
    expect(bowLift(CFG, b, 10, 0)).toBe(0);
    const mid = bowLift(CFG, b, 10 + CFG.undertowBowBeats / 2, 0);
    expect(mid).toBeGreaterThan(0.3);
    expect(mid).toBeLessThan(0.7);
    expect(bowLift(CFG, b, 10 + CFG.undertowBowBeats, 0)).toBe(1);
  });

  it("is full for as long as the lobe stands", () => {
    expect(bowLift(CFG, lobe({ stage: "standing" }), 10, 0)).toBe(1);
  });
});

describe("the lobe", () => {
  it("stands nothing while the plate is bowing", () => {
    expect(lobeHeight(CFG, floor(), lobe(), 12, 0.5)).toBe(0);
  });

  it("comes up twice the old tile over the beat it stands on", () => {
    const b = lobe({ stage: "standing" });
    expect(LOBE_TILES).toBe(2);
    expect(lobeHeight(CFG, floor(), b, 10, 0)).toBe(0);
    expect(lobeHeight(CFG, floor(), b, 11, 0)).toBe(LOBE_TILES);
    expect(lobeHeight(CFG, floor(), b, 13, 0.5)).toBe(LOBE_TILES);
  });

  it("grows from the standing height to twice it when it is tall", () => {
    const b = lobe({ stage: "tall" });
    expect(lobeHeight(CFG, floor(), b, 10, 0)).toBe(LOBE_TILES);
    const mid = lobeHeight(CFG, floor(), b, 10, 0.5);
    expect(mid).toBeGreaterThan(LOBE_TILES);
    expect(mid).toBeLessThan(TALL_TILES);
    expect(lobeHeight(CFG, floor(), b, 11, 0)).toBe(TALL_TILES);
  });

  it("falls from tall to the standing height when a tap shrinks it, never to nothing", () => {
    const b = lobe({ stage: "standing", tapped: true });
    expect(lobeHeight(CFG, floor(), b, 10, 0)).toBe(TALL_TILES);
    const mid = lobeHeight(CFG, floor(), b, 10, 0.5);
    expect(mid).toBeGreaterThan(LOBE_TILES);
    expect(mid).toBeLessThan(TALL_TILES);
    expect(lobeHeight(CFG, floor(), b, 11, 0)).toBe(LOBE_TILES);
  });
});

describe("the ebb", () => {
  it("is whole until the level's clock runs out", () => {
    expect(ebbLeft(CFG, floor(), 40, 0.5)).toBe(1);
  });

  it("shrinks every lobe still up back to nothing over the ebb beats", () => {
    const u = floor({ ebbBeat: 48 });
    const b = lobe({ stage: "tall", stageBeat: 30 });
    expect(lobeHeight(CFG, u, b, 48, 0)).toBe(TALL_TILES);
    const mid = lobeHeight(CFG, u, b, 48 + CFG.undertowEbbBeats / 2, 0);
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(TALL_TILES);
    expect(lobeHeight(CFG, u, b, 48 + CFG.undertowEbbBeats, 0)).toBe(0);
  });
});

describe("the edge a caption stands round", () => {
  const l = computeLayout({ width: 390, height: 844, dpr: 1 }, CFG, "p1");

  it("is nothing with no lobe in it", () => {
    expect(undertowEdgeBox(l, CFG, floor(), [], 12, 0)).toBeNull();
  });

  it("reaches higher over a tall lobe than over a standing one", () => {
    const standing = lobe({ stage: "standing" });
    const tall = lobe({ stage: "tall", stageBeat: 0 });
    const low = undertowEdgeBox(l, CFG, floor(), [standing], 20, 0);
    const high = undertowEdgeBox(l, CFG, floor(), [tall], 20, 0);
    expect(low).not.toBeNull();
    expect(high).not.toBeNull();
    expect(high?.ry ?? 0).toBeGreaterThan(low?.ry ?? 0);
    expect(high?.y ?? 0).toBeLessThan(low?.y ?? 0);
  });
});
