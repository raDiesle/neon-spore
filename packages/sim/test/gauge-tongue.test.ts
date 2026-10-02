import { describe, expect, it } from "bun:test";
import { gaugeRoundHeard } from "../src/gauge-round.js";
import {
  createWorld,
  DEFAULT_CONFIG,
  GAUGE_TONGUE_LEVEL,
  type GaugeState,
  gaugeBetweenLevels,
  gaugeRound,
  gaugeTongueAsks,
  gaugeTongueOut,
  gaugeWoundOpen,
  hashWorld,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "../src/index.js";

/**
 * **The twisted tongue** (`src/gauge-tongue.ts`). The owner, 30 September
 * 2026: *or to rotate the tongue that it gets twisted by both players*. Held
 * to what the pair would notice: that the tongue comes out after the second
 * level and no other, that one hand alone or two the same way round wrings
 * nothing, that two opposite ways end the rest early and a rest run out loses
 * the round, and that two devices agree about all of it.
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

/** One level finished, mark by mark. */
function passLevel(world: World, g: GaugeState): void {
  const level = g.level;
  while (g.level === level && g.phase === "play") {
    while (!gaugeWoundOpen(g)) ticks(world, 1);
    g.needleMilli = g.markMilli;
    g.calledBeat = world.beat - CFG.gaugeCallRestBeats;
    gaugeRoundHeard(world, 2, { kind: "call", color: g.woundColor });
    ticks(world, CFG.gaugeShotTicks);
  }
}

/** Two levels finished and the teeth pulled between them, leaving the pair in the tongue's rest. */
function toTheTongue(seed = 5): { world: World; g: GaugeState } {
  const { world, g } = playing(seed);
  passLevel(world, g);
  for (let k = 0; k < CFG.gaugeTeethToPull; k++) {
    gaugeRoundHeard(world, 2, {
      kind: "drag",
      target: "gaugeTooth",
      on: true,
      id: g.looseTooth,
      fromMilli: 0,
      fromYMilli: 2000,
    });
  }
  passLevel(world, g);
  return { world, g };
}

function wring(world: World, player: 1 | 2, fromMilli: number, on = true): void {
  gaugeRoundHeard(world, player, {
    kind: "drag",
    target: "gaugeTongue",
    on,
    id: 0,
    fromMilli,
    fromYMilli: 0,
  });
}

describe("THE GAUGE's tongue", () => {
  it("comes out after the second level, and not after the first", () => {
    const { world, g } = playing();
    passLevel(world, g);
    expect(g.level).toBe(1);
    expect(gaugeTongueOut(g)).toBe(false);
    const rest = toTheTongue();
    expect(rest.g.level).toBe(GAUGE_TONGUE_LEVEL);
    expect(gaugeTongueAsks(rest.g)).toBe(true);
    expect(rest.g.levelBeat - rest.world.beat).toBe(CFG.gaugeTongueBeats);
    expect(gaugeWoundOpen(rest.g)).toBe(false);
  });

  it("is not wrung by one hand alone, however far", () => {
    const { world, g } = toTheTongue();
    wring(world, 1, 5000);
    expect(gaugeTongueOut(g)).toBe(true);
    expect(g.tongueHolds).toBe(1);
    wring(world, 2, -CFG.gaugeTongueTwistMilli + 100);
    expect(gaugeTongueOut(g)).toBe(true);
    expect(g.tongueHolds).toBe(3);
  });

  it("is not wrung by two hands the same way round", () => {
    const { world, g } = toTheTongue();
    wring(world, 1, 2000);
    wring(world, 2, 2000);
    expect(gaugeTongueOut(g)).toBe(true);
  });

  it("is wrung by two hands opposite ways, and the rest ends early", () => {
    const { world, g } = toTheTongue();
    wring(world, 1, -CFG.gaugeTongueTwistMilli);
    const before = world.events.length;
    wring(world, 2, CFG.gaugeTongueTwistMilli);
    expect(world.events.slice(before).some((e) => e.type === "gaugeTwist")).toBe(true);
    expect(gaugeTongueOut(g)).toBe(false);
    expect(g.tongueHolds).toBe(0);
    expect(g.levelBeat - world.beat).toBe(CFG.gaugeRegrowBeats);
    expect(g.misses).toBe(0);
    ticks(world, TPB * (CFG.gaugeRegrowBeats + 1));
    expect(gaugeBetweenLevels(world, g)).toBe(false);
    expect(gaugeWoundOpen(g)).toBe(true);
  });

  it("unwinds the half that lets go, so neither can wind it and wait", () => {
    const { world, g } = toTheTongue();
    wring(world, 1, 2000);
    wring(world, 1, 2000, false);
    expect(g.tongueHolds).toBe(0);
    expect(g.tongueP1Milli).toBe(0);
    wring(world, 2, -2000);
    expect(gaugeTongueOut(g)).toBe(true);
  });

  it("loses the round when the rest runs out with it still out", () => {
    // The owner's rule, 2 October 2026: *a miss makes the boss
    // wave fail and requires retry*. It used to jam the valve.
    const { world, g } = toTheTongue();
    const events = ticks(world, TPB * (CFG.gaugeTongueBeats + 1));
    expect(gaugeTongueOut(g)).toBe(false);
    expect(g.misses).toBe(1);
    expect(g.phase).toBe("verdict");
    expect(g.passed).toBe(false);
    expect(events.some((e) => e.type === "waveFailed")).toBe(true);
  });

  it("is in the fingerprint: a hand on one device only is a desync", () => {
    const a = toTheTongue(8);
    const b = toTheTongue(8);
    expect(hashWorld(a.world)).toBe(hashWorld(b.world));
    wring(a.world, 1, 300);
    expect(hashWorld(a.world)).not.toBe(hashWorld(b.world));
  });
});
