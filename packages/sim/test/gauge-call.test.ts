import { describe, expect, it } from "bun:test";
import { gaugeRoundHeard } from "../src/gauge-round.js";
import {
  createWorld,
  DEFAULT_CONFIG,
  type GaugeState,
  gaugeJammed,
  gaugeRound,
  gaugeSeated,
  hashWorld,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import { landNow } from "./gauge-land.js";

/**
 * **THE GAUGE's call names a colour** (`src/gauge-call.ts`). The owner, 27
 * September 2026, asked whether the wound's colour should stay a picture:
 * *a rule*. So her panel is a red and a cyan button, the wound is one or the
 * other, drawn with the band, and a seated needle called in the wrong colour
 * is a miss that jams the valve like any other.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);

function playing(seed = 5): { world: World; g: GaugeState } {
  const world = createWorld(CFG, seed);
  startWave(world, 4, [], [], { kind: "gauge" });
  const g = gaugeRound(world);
  if (g === null) throw new Error("the gauge's wave installed no gauge");
  let guard = 0;
  while (g.phase !== "play" && guard++ < 40 * TPB) step(world, []);
  if (g.phase !== "play") throw new Error("the round never reached its play");
  return { world, g };
}

/** The needle on the band, the rest between calls spent. */
function seat(world: World, g: GaugeState): void {
  g.needleMilli = g.markMilli;
  g.calledBeat = world.beat - CFG.gaugeCallRestBeats;
  if (!gaugeSeated(world, g)) throw new Error("the needle on the mark is not seated");
}

const other = (g: GaugeState) => (g.woundColor === "red" ? "cyan" : "red");

describe("THE GAUGE's call", () => {
  it("lands in the wound's colour", () => {
    const { world, g } = playing();
    seat(world, g);
    gaugeRoundHeard(world, 2, { kind: "call", color: g.woundColor });
    landNow(world, g);
    expect(g.marks).toBe(1);
    expect(g.misses).toBe(0);
  });

  it("misses in the other colour on a seated needle, and the miss jams the valve", () => {
    const { world, g } = playing();
    seat(world, g);
    const wrong = other(g);
    world.events.length = 0;
    gaugeRoundHeard(world, 2, { kind: "call", color: wrong });
    landNow(world, g);
    expect(g.marks).toBe(0);
    expect(g.misses).toBe(1);
    expect(gaugeJammed(g)).toBe(true);
    expect(g.calledColor).toBe(wrong);
    expect(world.events.map((e) => e.type)).toEqual(["gaugeMiss", "gaugeJam"]);
  });

  it("draws the colour with each band, so both come up", () => {
    const { world, g } = playing();
    const seen = new Set<string>([g.woundColor]);
    for (let i = 0; i < 12; i++) {
      seat(world, g);
      g.boundBeat = -1;
      gaugeRoundHeard(world, 2, { kind: "call", color: g.woundColor });
      landNow(world, g);
      seen.add(g.woundColor);
    }
    expect(g.marks).toBe(12);
    expect([...seen].sort()).toEqual(["cyan", "red"]);
  });

  it("is hashed: the wound's colour and the colour last called", () => {
    const { world, g } = playing();
    const before = hashWorld(world);
    g.woundColor = other(g);
    expect(hashWorld(world)).not.toBe(before);
    g.woundColor = other(g);
    expect(hashWorld(world)).toBe(before);
    g.calledColor = g.calledColor === "red" ? "cyan" : "red";
    expect(hashWorld(world)).not.toBe(before);
  });
});
