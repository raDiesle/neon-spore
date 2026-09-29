import { describe, expect, it } from "bun:test";
import { gaugeRoundHeard } from "../src/gauge-round.js";
import {
  createWorld,
  DEFAULT_CONFIG,
  GAUGE_FULL,
  type GaugeState,
  gaugeRound,
  gaugeSeated,
  gaugeWoundOpen,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "../src/index.js";

/**
 * **A call is judged where the bolt lands** (`src/gauge-call.ts`). The owner,
 * 29 September 2026: *first shot must reach the coloured area, and then
 * destroyed if correct colour, and then with at least 1 … break the new area
 * to aim for appears.* So the answer comes `gaugeShotTicks` after the press,
 * the band holds still while the bolt is on its way, and a wound shot out
 * leaves the rim bare for `gaugeRegrowBeats` before the next one opens.
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
  return { world, g };
}

function seatAndFire(world: World, g: GaugeState): void {
  g.needleMilli = g.markMilli;
  g.calledBeat = world.beat - CFG.gaugeCallRestBeats;
  gaugeRoundHeard(world, 2, { kind: "call", color: g.woundColor });
}

function ticks(world: World, n: number): void {
  for (let i = 0; i < n; i++) step(world, []);
}

describe("THE GAUGE's shot in the air", () => {
  it("is not judged until it reaches the rim", () => {
    const { world, g } = playing();
    seatAndFire(world, g);
    expect(g.shotTick).toBe(world.tick + CFG.gaugeShotTicks);
    ticks(world, CFG.gaugeShotTicks - 1);
    expect(g.marks).toBe(0);
    ticks(world, 1);
    expect(g.marks).toBe(1);
    expect(g.shotTick).toBe(-1);
  });

  it("holds the band still, so it lands in the wound it was fired at", () => {
    const { world, g } = playing();
    seatAndFire(world, g);
    const mark = g.markMilli;
    // The needle swings away the moment she fires; the shot is already gone.
    g.needleMilli = mark > GAUGE_FULL / 2 ? 0 : GAUGE_FULL;
    ticks(world, CFG.gaugeShotTicks);
    expect(g.marks).toBe(1);
    expect(g.markMilli).toBe(mark);
  });

  it("refuses a second call while the first is in the air", () => {
    const { world, g } = playing();
    seatAndFire(world, g);
    const landing = g.shotTick;
    g.calledBeat = world.beat - CFG.gaugeCallRestBeats;
    gaugeRoundHeard(world, 2, { kind: "call", color: g.woundColor });
    expect(g.shotTick).toBe(landing);
  });
});

describe("the bare rim after a hit", () => {
  it("stands for the break, takes no call, then opens a wound somewhere else", () => {
    const { world, g } = playing();
    seatAndFire(world, g);
    ticks(world, CFG.gaugeShotTicks);
    const landed = world.beat;
    expect(gaugeWoundOpen(g)).toBe(false);
    expect(gaugeSeated(world, g)).toBe(false);
    g.calledBeat = world.beat - CFG.gaugeCallRestBeats;
    gaugeRoundHeard(world, 2, { kind: "call", color: g.woundColor });
    expect(g.shotTick).toBe(-1);

    let guard = 0;
    while (!gaugeWoundOpen(g) && guard++ < TPB * 10) step(world, []);
    expect(world.beat - landed).toBeGreaterThanOrEqual(CFG.gaugeRegrowBeats);
    expect(g.woundBeat).toBe(world.beat);
    expect(Math.abs(g.markMilli - g.needleMilli)).toBeGreaterThanOrEqual(CFG.gaugeSpanMilli);
  });

  it("does not follow a miss: the wound stays where it was", () => {
    const { world, g } = playing();
    g.needleMilli = g.markMilli > GAUGE_FULL / 2 ? 0 : GAUGE_FULL;
    g.calledBeat = world.beat - CFG.gaugeCallRestBeats;
    gaugeRoundHeard(world, 2, { kind: "call", color: g.woundColor });
    ticks(world, CFG.gaugeShotTicks);
    expect(g.misses).toBe(1);
    expect(gaugeWoundOpen(g)).toBe(true);
  });
});
