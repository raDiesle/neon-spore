import { describe, expect, it } from "bun:test";
import { gaugeRoundHeard } from "../src/gauge-round.js";
import {
  createWorld,
  DEFAULT_CONFIG,
  type GaugeState,
  gaugeBeatsLeft,
  gaugeBetweenLevels,
  gaugeGapeSpan,
  gaugeLevelMarksMade,
  gaugeRound,
  gaugeSpanNow,
  gaugeWoundOpen,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "../src/index.js";

/**
 * **Three levels, each harder** (`src/gauge-level.ts`). The owner, 29
 * September 2026: *add more levels (at least 3 and it should become harder,
 * maybe the mouth moves faster like in waves or becomes bigger every level)*.
 * Held to what a pair would notice: that a level is finished by its own marks
 * and not the round's, that the next one is quicker and slimmer, that its
 * clock does not run while the rim is bare between them, and that the round is
 * only passed on the last.
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

function ticks(world: World, n: number): void {
  for (let i = 0; i < n && gaugeRound(world)?.phase === "play"; i++) step(world, []);
}

/** One mark, landed: seat the needle, fire the wound's colour, wait out the bolt and the rim. */
function mark(world: World, g: GaugeState): void {
  while (!gaugeWoundOpen(g)) ticks(world, 1);
  g.needleMilli = g.markMilli;
  g.calledBeat = world.beat - CFG.gaugeCallRestBeats;
  const before = g.marks;
  gaugeRoundHeard(world, 2, { kind: "call", color: g.woundColor });
  ticks(world, CFG.gaugeShotTicks);
  expect(g.marks).toBe(before + 1);
  // The rests' own asks are not this file's: a tooth or the tongue left in
  // loses the round (`gauge-tooth.test.ts`, `gauge-tongue.test.ts`), so the
  // one a level-up just put out is taken back in, and the rest runs bare.
  g.looseTooth = -1;
  g.tongueOut = false;
}

describe("THE GAUGE's levels", () => {
  it("go up on a level's own marks, with the next quicker and slimmer", () => {
    const { world, g } = playing();
    const first = gaugeGapeSpan(CFG, g);
    for (let i = 0; i < CFG.gaugeLevelMarks; i++) mark(world, g);
    expect(g.level).toBe(1);
    expect(gaugeLevelMarksMade(CFG, g)).toBe(0);
    expect(gaugeGapeSpan(CFG, g)).toBe(first - CFG.gaugeGapeSpanMilli);
    // A level opens free: whatever the last mark wound is let go.
    expect(g.boundBeat).toBe(-1);
    expect(gaugeSpanNow(CFG, g)).toBe(gaugeGapeSpan(CFG, g));
  });

  it("walk the band further a beat on the level above", () => {
    const walked = (level: number): number => {
      const { world, g } = playing(11);
      g.level = level;
      g.markMilli = 500;
      g.driftDir = 1;
      ticks(world, TPB);
      return Math.abs(g.markMilli - 500);
    };
    expect(walked(1) - walked(0)).toBe(CFG.gaugeLevelDriftMilli);
    expect(walked(2) - walked(1)).toBe(CFG.gaugeLevelDriftMilli);
  });

  it("hold the next level's clock full while the rim is bare between them", () => {
    const { world, g } = playing();
    for (let i = 0; i < CFG.gaugeLevelMarks; i++) mark(world, g);
    expect(gaugeBetweenLevels(world, g)).toBe(true);
    expect(gaugeWoundOpen(g)).toBe(false);
    // The first rest is the loose tooth's, and it is longer (`gauge-tooth.ts`).
    ticks(world, TPB * (CFG.gaugeToothBeats - 1));
    expect(gaugeBeatsLeft(world, g)).toBe(CFG.gaugeLevelBeats);
    ticks(world, TPB * 2);
    expect(gaugeBetweenLevels(world, g)).toBe(false);
    expect(gaugeWoundOpen(g)).toBe(true);
    expect(gaugeBeatsLeft(world, g)).toBeLessThan(CFG.gaugeLevelBeats);
  });

  it("are all needed: the round is passed only on the last level's last mark", () => {
    const { world, g } = playing();
    const all = CFG.gaugeLevels * CFG.gaugeLevelMarks;
    for (let i = 0; i < all - 1; i++) mark(world, g);
    expect(g.phase).toBe("play");
    expect(g.level).toBe(CFG.gaugeLevels - 1);
    mark(world, g);
    ticks(world, 1);
    expect(g.phase).toBe("verdict");
    expect(g.passed).toBe(true);
  });

  it("each run out on their own clock, and that breaks the hull", () => {
    const { world, g } = playing();
    for (let i = 0; i < CFG.gaugeLevelMarks; i++) mark(world, g);
    ticks(world, TPB * (CFG.gaugeToothBeats + CFG.gaugeLevelBeats + 2));
    expect(g.phase).toBe("verdict");
    expect(g.passed).toBe(false);
    expect(world.scars.length).toBe(1);
  });
});
