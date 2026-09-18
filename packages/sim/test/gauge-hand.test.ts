import { describe, expect, it } from "bun:test";
import { gaugeBearingMilli } from "../src/gauge-hand.js";
import { gaugeRoundHeard } from "../src/gauge-round.js";
import {
  type Command,
  createWorld,
  DEFAULT_CONFIG,
  GAUGE_FULL,
  type GaugeState,
  gaugeBound,
  gaugeJammed,
  gaugeRound,
  gaugeSeated,
  gaugeSettling,
  gaugeSpanNow,
  hashWorld,
  type SimConfig,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "../src/index.js";

/**
 * **THE GAUGE's two states and the two thumbs that answer them**
 * (`src/gauge-hand.ts`, `.claude/skills/new-boss` §6.2).
 *
 * The round shipped with one state in it: turn, talk, call, for ninety
 * seconds. What is proved here is that the two it gained are both entered by
 * the pair's *own* last answer — a miss sticks the valve, a mark winds the
 * band — and that each costs the seat that did not cause it nothing it has to
 * guess at. Neither is a timer, and a lane that made either of them fire on a
 * clock would fail the two cases that name the call.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const WAVE = 4;

/** The round, already past its lead-in and taking commands. */
function playing(seed = 5): { world: World; g: GaugeState } {
  const world = createWorld(CFG, seed);
  startWave(world, WAVE, [], [], { kind: "gauge" });
  const g = gaugeRound(world);
  if (g === null) throw new Error("the gauge's wave installed no gauge");
  let guard = 0;
  while (g.phase !== "play" && guard++ < 40 * TPB) step(world, []);
  if (g.phase !== "play") throw new Error("the round never reached its play");
  return { world, g };
}

function heard(world: World, player: 1 | 2, command: Command): void {
  gaugeRoundHeard(world, player, command);
}

function needle(on: boolean, fromMilli: number): Command {
  return { kind: "drag", target: "gaugeNeedle", on, fromMilli };
}

function band(on: boolean): Command {
  return { kind: "drag", target: "gaugeBand", on, fromMilli: 0 };
}

/** A call that is allowed to land: the rest between calls already spent. */
function callable(world: World, g: GaugeState): void {
  g.calledBeat = world.beat - CFG.gaugeCallRestBeats;
}

/** A call that will miss: the needle as far from the band as the dial allows. */
function offBand(g: GaugeState): void {
  g.needleMilli = g.markMilli > GAUGE_FULL / 2 ? 0 : GAUGE_FULL;
}

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

describe("the jam", () => {
  it("is a miss, and the valve goes dead under his thumb", () => {
    const { world, g } = playing();
    callable(world, g);
    offBand(g);
    heard(world, 1, { kind: "valve", on: true, dir: 1 });
    heard(world, 2, { kind: "call" });
    expect(g.misses).toBe(1);
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
    callable(world, g);
    offBand(g);
    heard(world, 2, { kind: "call" });
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
    callable(world, g);
    offBand(g);
    heard(world, 2, { kind: "call" });
    heard(world, 1, needle(true, 750));
    expect(g.needleMilli).toBe(0);
    heard(world, 1, needle(true, 0));
    expect(g.needleMilli).toBe(GAUGE_FULL / 2);
  });

  it("clears the instant a call lands, and the valve picks up where it was held", () => {
    const { world, g } = playing();
    callable(world, g);
    offBand(g);
    heard(world, 1, { kind: "valve", on: true, dir: -1 });
    heard(world, 2, { kind: "call" });
    expect(gaugeJammed(g)).toBe(true);
    g.needleMilli = g.markMilli;
    callable(world, g);
    heard(world, 2, { kind: "call" });
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
    callable(world, g);
    offBand(g);
    heard(world, 2, { kind: "call" });
    const missed = g.misses;
    heard(world, 1, needle(true, 0));
    heard(world, 1, needle(false, 0));
    expect(g.handOn).toBe(false);
    expect(gaugeSettling(CFG, g, world.beat)).toBe(true);
    g.needleMilli = g.markMilli;
    callable(world, g);
    heard(world, 2, { kind: "call" });
    expect(g.marks).toBe(0);
    expect(g.misses).toBe(missed);
    // And it lands the moment the needle has stood still long enough.
    g.liftBeat = world.beat - CFG.gaugeSettleBeats;
    expect(gaugeSettling(CFG, g, world.beat)).toBe(false);
    heard(world, 2, { kind: "call" });
    expect(g.marks).toBe(1);
  });

  it("starts on a thumb that landed and never moved: a hand is a hand", () => {
    const { world, g } = playing();
    callable(world, g);
    offBand(g);
    heard(world, 2, { kind: "call" });
    const was = g.needleMilli;
    // `NO_BEARING`: a hand that has landed and not yet said where.
    heard(world, 1, needle(true, -1));
    expect(g.handOn).toBe(true);
    expect(g.needleMilli).toBe(was);
    heard(world, 1, needle(false, -1));
    expect(gaugeSettling(CFG, g, world.beat)).toBe(true);
  });
});

describe("the bind", () => {
  it("winds on every other mark and lets go on the one after", () => {
    const { world, g } = playing();
    for (let n = 1; n <= 3; n++) {
      g.needleMilli = g.markMilli;
      callable(world, g);
      heard(world, 2, { kind: "call" });
      expect(g.marks).toBe(n);
      expect(gaugeBound(g)).toBe(n % CFG.gaugeBindMarks === 0);
    }
  });

  it("narrows the window the round is judged against, and her thumb gives it back", () => {
    const { world, g } = playing();
    g.boundBeat = world.beat;
    expect(gaugeSpanNow(CFG, g)).toBe(CFG.gaugeBoundSpanMilli);
    g.needleMilli = g.markMilli + CFG.gaugeSpanMilli;
    expect(gaugeSeated(world, g)).toBe(false);
    heard(world, 2, band(true));
    expect(gaugeSpanNow(CFG, g)).toBe(CFG.gaugeSpanMilli);
    expect(gaugeSeated(world, g)).toBe(true);
  });

  it("stops the band walking while she holds it, and it walks again when she lets go", () => {
    const { world, g } = playing();
    g.boundBeat = world.beat;
    heard(world, 2, band(true));
    const held = g.markMilli;
    for (let i = 0; i < 2 * TPB; i++) step(world, []);
    expect(g.markMilli).toBe(held);
    heard(world, 2, band(false));
    for (let i = 0; i < 2 * TPB; i++) step(world, []);
    expect(g.markMilli).not.toBe(held);
  });

  it("costs her the call, and refuses it rather than charging a miss", () => {
    const { world, g } = playing();
    g.boundBeat = world.beat;
    g.needleMilli = g.markMilli;
    heard(world, 2, band(true));
    callable(world, g);
    heard(world, 2, { kind: "call" });
    expect(g.marks).toBe(0);
    expect(g.misses).toBe(0);
    heard(world, 2, band(false));
    heard(world, 2, { kind: "call" });
    expect(g.marks).toBe(1);
  });

  it("is hers alone, and there is nothing to hold while the band is loose", () => {
    const { world, g } = playing();
    g.boundBeat = world.beat;
    heard(world, 1, band(true));
    expect(g.openThumb).toBe(false);
    heard(world, 2, band(true));
    expect(g.openThumb).toBe(true);
    heard(world, 2, band(false));
    g.boundBeat = -1;
    heard(world, 2, band(true));
    expect(g.openThumb).toBe(false);
  });
});

describe("both hands", () => {
  it("come off when the round leaves its play", () => {
    const { world, g } = playing();
    g.jamBeat = world.beat;
    g.boundBeat = world.beat;
    heard(world, 1, needle(true, 250));
    heard(world, 2, band(true));
    expect(g.handOn).toBe(true);
    expect(g.openThumb).toBe(true);
    g.marks = CFG.gaugeMarks;
    step(world, []);
    expect(g.phase).toBe("verdict");
    expect(g.handOn).toBe(false);
    expect(g.openThumb).toBe(false);
    // What the pair *did* is not undone: the verdict's picture may show it.
    expect(gaugeJammed(g)).toBe(true);
    expect(gaugeBound(g)).toBe(true);
  });

  it("reach nothing outside the play at all", () => {
    const { world, g } = playing();
    g.jamBeat = world.beat;
    g.boundBeat = world.beat;
    g.phase = "verdict";
    heard(world, 1, needle(true, 250));
    heard(world, 2, band(true));
    expect(g.handOn).toBe(false);
    expect(g.openThumb).toBe(false);
  });

  it("are in the hash, both of them, on both sides of the wire", () => {
    const { world, g } = playing();
    g.jamBeat = world.beat;
    g.boundBeat = world.beat;
    const quiet = hashWorld(world);
    heard(world, 1, needle(true, 250));
    const swung = hashWorld(world);
    expect(swung).not.toBe(quiet);
    heard(world, 2, band(true));
    expect(hashWorld(world)).not.toBe(swung);
  });
});
