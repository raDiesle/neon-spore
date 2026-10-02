import { describe, expect, it } from "bun:test";
import { gaugeBearingMilli } from "../src/gauge-hand.js";
import {
  GAUGE_FULL,
  type GaugeState,
  gaugeJammed,
  gaugeSettling,
  step,
  type World,
} from "../src/index.js";
import { CFG, call, callable, heard, needle, playing, TPB } from "./gauge-rig.js";

/**
 * **THE GAUGE's two states and the two thumbs that answer them**
 * (`src/gauge-hand.ts`, `.claude/skills/new-boss` §6.2).
 *
 * The round shipped with one state in it: turn, talk, call, for ninety
 * seconds. What is proved here is that the two it gained are both entered by
 * the pair's *own* last answer — a tooth pulled wrong sticks the valve, a
 * mark winds the band — and that each costs the seat that did not cause it nothing it has to
 * guess at. Neither is a timer, and a lane that made either of them fire on a
 * clock would fail the two cases that name the call.
 *
 * The dial's bearing, the jam and the settle are here; the bind and what
 * happens to both hands when the play ends are in `gauge-bind.test.ts`. The
 * helpers both files share are in `gauge-rig.ts`.
 */

describe("the dial's bearing", () => {
  it("reads the top half of the circle end to end, and nothing else", () => {
    expect(gaugeBearingMilli(750)).toBe(0);
    expect(gaugeBearingMilli(0)).toBe(GAUGE_FULL / 2);
    expect(gaugeBearingMilli(250)).toBe(GAUGE_FULL);
  });

  it("takes a finger below the rim to the end it is nearer, and never across the face", () => {
    expect(gaugeBearingMilli(400)).toBe(GAUGE_FULL);
    expect(gaugeBearingMilli(600)).toBe(0);
  });

  it("is a bearing and not a displacement: it wraps both ways", () => {
    expect(gaugeBearingMilli(-250)).toBe(gaugeBearingMilli(750));
    expect(gaugeBearingMilli(1750)).toBe(gaugeBearingMilli(750));
  });
});

/**
 * The valve jammed the way a wrong tooth jams it (`src/gauge-tooth.ts`). A
 * miss did until 2 October 2026, and opens the mouth now (`gauge-gape.test.ts`).
 */
function jam(world: World, g: GaugeState): void {
  g.jamBeat = world.beat;
}

describe("the jam", () => {
  it("is a dead valve under his thumb", () => {
    const { world, g } = playing();
    heard(world, 1, { kind: "valve", on: true, dir: 1 });
    jam(world, g);
    expect(gaugeJammed(g)).toBe(true);
    // The valve is still held — what a seat is holding is a fact about the
    // seat — and the needle no longer answers it.
    expect(g.valve).toBe(1);
    const was = g.needleMilli;
    for (let i = 0; i < TPB; i++) step(world, []);
    expect(g.needleMilli).toBe(was);
  });

  it("hands him the needle itself, and only him, and only while it is dead", () => {
    const { world, g } = playing();
    heard(world, 1, needle(true, 250));
    expect(g.handOn).toBe(false);
    jam(world, g);
    // Hers is ignored rather than refused: there is no needle drawn under her
    // thumb to have taken hold of.
    heard(world, 2, needle(true, 250));
    expect(g.handOn).toBe(false);
    heard(world, 1, needle(true, 250));
    expect(g.handOn).toBe(true);
    expect(g.needleMilli).toBe(GAUGE_FULL);
  });

  it("puts the needle where the finger points, in one gesture rather than a walk", () => {
    const { world, g } = playing();
    jam(world, g);
    heard(world, 1, needle(true, 750));
    expect(g.needleMilli).toBe(0);
    heard(world, 1, needle(true, 0));
    expect(g.needleMilli).toBe(GAUGE_FULL / 2);
  });

  it("clears the instant a call lands, and the valve picks up where it was held", () => {
    const { world, g } = playing();
    heard(world, 1, { kind: "valve", on: true, dir: -1 });
    jam(world, g);
    expect(gaugeJammed(g)).toBe(true);
    g.needleMilli = g.markMilli;
    callable(world, g);
    heard(world, 2, call(world));
    expect(g.marks).toBe(1);
    expect(gaugeJammed(g)).toBe(false);
    const was = g.needleMilli;
    for (let i = 0; i < TPB; i++) step(world, []);
    expect(g.needleMilli).toBeLessThan(was);
  });
});

describe("the settle", () => {
  it("runs from the lift and refuses the call without charging her a miss", () => {
    const { world, g } = playing();
    jam(world, g);
    const missed = g.misses;
    heard(world, 1, needle(true, 0));
    heard(world, 1, needle(false, 0));
    expect(g.handOn).toBe(false);
    expect(gaugeSettling(CFG, g, world.beat)).toBe(true);
    g.needleMilli = g.markMilli;
    callable(world, g);
    heard(world, 2, call(world));
    expect(g.marks).toBe(0);
    expect(g.misses).toBe(missed);
    // And it lands the moment the needle has stood still long enough.
    g.liftBeat = world.beat - CFG.gaugeSettleBeats;
    expect(gaugeSettling(CFG, g, world.beat)).toBe(false);
    heard(world, 2, call(world));
    expect(g.marks).toBe(1);
  });

  it("starts on a thumb that landed and never moved: a hand is a hand", () => {
    const { world, g } = playing();
    jam(world, g);
    const was = g.needleMilli;
    // `NO_BEARING`: a hand that has landed and not yet said where.
    heard(world, 1, needle(true, -1));
    expect(g.handOn).toBe(true);
    expect(g.needleMilli).toBe(was);
    heard(world, 1, needle(false, -1));
    expect(gaugeSettling(CFG, g, world.beat)).toBe(true);
  });
});
