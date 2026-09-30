import { describe, expect, it } from "bun:test";
import { gaugeRoundHeard } from "../src/gauge-round.js";
import {
  createWorld,
  DEFAULT_CONFIG,
  GAUGE_TEETH,
  type GaugeState,
  gaugeBetweenLevels,
  gaugeJammed,
  gaugeRound,
  gaugeToothAsks,
  gaugeToothLoose,
  gaugeToothPulled,
  gaugeWoundOpen,
  hashWorld,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "../src/index.js";

/**
 * **The loose tooth** (`src/gauge-tooth.ts`). The owner, 30 September 2026:
 * *pull teeth out ( p1 needs to tell p2 which one to pull out.)*. Held to what
 * the pair would notice: that the tooth comes loose after the first level and
 * no other, that only the navigator's hand can pull, that the right pull ends
 * the rest early and a wrong one — or none — jams the valve, and that two
 * devices agree about all of it.
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

function ticks(world: World, n: number): SimEvent[] {
  const seen: SimEvent[] = [];
  for (let i = 0; i < n && gaugeRound(world)?.phase === "play"; i++) {
    step(world, []);
    seen.push(...world.events);
  }
  return seen;
}

/** The first level finished, mark by mark, leaving the pair in the tooth's rest. */
function toTheTooth(seed = 5): { world: World; g: GaugeState } {
  const { world, g } = playing(seed);
  while (g.level === 0) {
    while (!gaugeWoundOpen(g)) ticks(world, 1);
    g.needleMilli = g.markMilli;
    g.calledBeat = world.beat - CFG.gaugeCallRestBeats;
    g.jamBeat = -1;
    g.liftBeat = -1;
    gaugeRoundHeard(world, 2, { kind: "call", color: g.woundColor });
    ticks(world, CFG.gaugeShotTicks);
  }
  return { world, g };
}

function pull(world: World, player: 1 | 2, id: number, fromYMilli: number): void {
  gaugeRoundHeard(world, player, {
    kind: "drag",
    target: "gaugeTooth",
    on: true,
    id,
    fromMilli: 0,
    fromYMilli,
  });
}

/** A tooth that is not the loose one, and not at either end. */
function wrong(g: GaugeState): number {
  return g.looseTooth === 1 ? 2 : 1;
}

describe("THE GAUGE's loose tooth", () => {
  it("comes loose after the first level, never at either end", () => {
    const { world, g } = toTheTooth();
    expect(g.level).toBe(1);
    expect(gaugeToothAsks(g)).toBe(true);
    expect(g.looseTooth).toBeGreaterThan(0);
    expect(g.looseTooth).toBeLessThan(GAUGE_TEETH - 1);
    expect(g.levelBeat - world.beat).toBe(CFG.gaugeToothBeats);
    expect(gaugeWoundOpen(g)).toBe(false);
  });

  it("is pulled by the navigator only, and only once the drag is far enough", () => {
    const { world, g } = toTheTooth();
    const k = g.looseTooth;
    pull(world, 1, k, 2000);
    expect(gaugeToothLoose(g)).toBe(true);
    expect(g.toothHold).toBe(-1);
    pull(world, 2, k, CFG.gaugeToothPullMilli - 100);
    expect(g.toothHold).toBe(k);
    expect(gaugeToothLoose(g)).toBe(true);
    pull(world, 2, k, CFG.gaugeToothPullMilli);
    expect(gaugeToothLoose(g)).toBe(false);
    expect(gaugeToothPulled(g, k)).toBe(true);
    expect(g.toothHold).toBe(-1);
  });

  it("ends the rest early when it is the right one", () => {
    const { world, g } = toTheTooth();
    pull(world, 2, g.looseTooth, 2000);
    expect(g.levelBeat - world.beat).toBe(CFG.gaugeRegrowBeats);
    expect(gaugeJammed(g)).toBe(false);
    ticks(world, TPB * (CFG.gaugeRegrowBeats + 1));
    expect(gaugeBetweenLevels(world, g)).toBe(false);
    expect(gaugeWoundOpen(g)).toBe(true);
  });

  it("jams the valve when it is the wrong one, and the loose one stays loose", () => {
    const { world, g } = toTheTooth();
    const k = wrong(g);
    const before = g.levelBeat;
    pull(world, 2, k, 2000);
    expect(gaugeToothPulled(g, k)).toBe(true);
    expect(gaugeToothLoose(g)).toBe(true);
    expect(gaugeJammed(g)).toBe(true);
    expect(g.levelBeat).toBe(before);
    // A tooth already out cannot be pressed again.
    pull(world, 2, k, 0);
    expect(g.toothHold).toBe(-1);
  });

  it("jams the valve when the rest runs out with it still in", () => {
    const { world, g } = toTheTooth();
    const events = ticks(world, TPB * (CFG.gaugeToothBeats + 1));
    expect(gaugeToothLoose(g)).toBe(false);
    expect(g.pulledTeeth).toBe(0);
    expect(events.some((e) => e.type === "gaugeJam")).toBe(true);
    expect(gaugeJammed(g)).toBe(true);
  });

  it("comes loose once in the round, not after the second level", () => {
    const { world, g } = toTheTooth();
    pull(world, 2, g.looseTooth, 2000);
    const pulled = g.pulledTeeth;
    while (g.level === 1 && g.phase === "play") {
      while (!gaugeWoundOpen(g)) ticks(world, 1);
      g.needleMilli = g.markMilli;
      g.calledBeat = world.beat - CFG.gaugeCallRestBeats;
      g.jamBeat = -1;
      g.liftBeat = -1;
      gaugeRoundHeard(world, 2, { kind: "call", color: g.woundColor });
      ticks(world, CFG.gaugeShotTicks);
    }
    expect(g.level).toBe(2);
    expect(gaugeToothLoose(g)).toBe(false);
    expect(g.pulledTeeth).toBe(pulled);
  });

  it("is in the fingerprint: a pull on one device only is a desync", () => {
    const a = toTheTooth(8);
    const b = toTheTooth(8);
    expect(hashWorld(a.world)).toBe(hashWorld(b.world));
    expect(a.g.looseTooth).toBe(b.g.looseTooth);
    pull(a.world, 2, a.g.looseTooth, 300);
    expect(hashWorld(a.world)).not.toBe(hashWorld(b.world));
  });
});
