import { describe, expect, it } from "bun:test";
import {
  BELLOWS_SEAMS,
  type BellowsState,
  bellowsBoss,
  bellowsShared,
  createWorld,
  DEFAULT_CONFIG,
  type SimConfig,
  slowing,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";

/**
 * THE BELLOWS doubled (`docs/spec/choreographed-windows.md`, 24 September
 * 2026): **the one window asks for both halves `bellowsExchanges` times**, the
 * marks lighting again after every push short of the last, and **THE SLOW
 * spans that window exactly** — up with its marks, shut when its seam parts or
 * the handles jam (`bellows-step.ts`, `bellowsSlow`). `bellows.test.ts` is the
 * fight itself.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG, bellowsSparkBeats: 99 };
const TPB = ticksPerBeat(CFG);
const REACH = CFG.bellowsReachMilli;

function install(): World {
  const world = createWorld(CFG, 0);
  startWave(world, 0, [], [], { kind: "bellows" });
  return world;
}

function lung(world: World): BellowsState {
  const s = bellowsBoss(world);
  if (s === null) throw new Error("the wave installed no bellows");
  return s;
}

const hold = (tick: number, player: 1 | 2, to: number, on = true): TimedCommand => ({
  tick,
  player,
  command: {
    kind: "drag",
    target: player === 1 ? "bellowsPull" : "bellowsPush",
    on,
    fromMilli: 0,
    fromYMilli: to,
  },
});

function run(world: World, ticks: number, cmds: TimedCommand[] = []): Set<string> {
  const seen = new Set<string>();
  const end = world.tick + ticks;
  while (world.tick < end) {
    step(
      world,
      cmds.filter((c) => c.tick === world.tick),
    );
    for (const e of world.events) seen.add(e.type);
  }
  return seen;
}

function stroke(world: World, player: 1 | 2, to = REACH): Set<string> {
  return run(world, 1, [hold(world.tick, player, to)]);
}

function lift(world: World): void {
  run(world, 1, [hold(world.tick, 1, 0, false), hold(world.tick, 2, 0, false)]);
}

/** Past the still and the first two seams: the shared window's marks are up. */
function shared(world: World): void {
  run(world, TPB * (CFG.bellowsStillBeats + 1));
  for (let n = 0; n < 2; n++) {
    stroke(world, 1);
    stroke(world, 2);
    lift(world);
    run(world, TPB * (CFG.bellowsSeamBeats + 1));
  }
  expect(bellowsShared(lung(world))).toBe(true);
  expect(lung(world).phase).toBe("pull");
}

describe("THE BELLOWS, doubled", () => {
  it("asks nothing slowly in an exchange with no clock", () => {
    const world = install();
    run(world, TPB * (CFG.bellowsStillBeats + 1));
    expect(lung(world).phase).toBe("pull");
    expect(slowing(world)).toBe(false);
  });

  it("slows the shared window for its whole length from the marks", () => {
    const world = install();
    shared(world);
    const s = lung(world);
    expect(slowing(world)).toBe(true);
    expect(world.slowToBeat).toBe(s.exchangeBeat + CFG.bellowsWindowBeats);
  });

  it("lights the marks again after a push short of the last, inside the same window", () => {
    const world = install();
    shared(world);
    const s = lung(world);
    const from = s.exchangeBeat;
    const to = world.slowToBeat;
    stroke(world, 1);
    expect(stroke(world, 2).has("bellowsMarks")).toBe(true);
    expect(s.phase).toBe("pull");
    expect(s.seams).toBe(BELLOWS_SEAMS - 2);
    expect(s.exchanged).toBe(1);
    expect(s.exchangeBeat).toBe(from);
    expect(world.slowToBeat).toBe(to);
  });

  it("takes no stroke from a thumb still resting from the round before", () => {
    const world = install();
    shared(world);
    stroke(world, 1);
    stroke(world, 2);
    stroke(world, 1);
    expect(lung(world).phase).toBe("pull");
  });

  it("parts the seam on the last round, and shuts THE SLOW with it", () => {
    const world = install();
    shared(world);
    for (let i = 0; i < CFG.bellowsExchanges; i++) {
      lift(world);
      stroke(world, 1);
      stroke(world, 2);
    }
    expect(lung(world).seams).toBe(BELLOWS_SEAMS - 3);
    expect(slowing(world)).toBe(false);
  });

  it("shuts THE SLOW when the window runs out half done", () => {
    const world = install();
    shared(world);
    stroke(world, 1);
    let late = false;
    for (let n = 0; n <= CFG.bellowsWindowBeats && !late; n++)
      late = run(world, TPB).has("bellowsLate");
    expect(late).toBe(true);
    expect(slowing(world)).toBe(false);
    // The exchange starts again after the jam, and its window with it.
    run(world, TPB * (CFG.bellowsJamBeats + 1));
    expect(slowing(world)).toBe(true);
  });

  it("shuts THE SLOW when a seat strokes out of turn", () => {
    const world = install();
    shared(world);
    expect(stroke(world, 2).has("bellowsJam")).toBe(true);
    expect(slowing(world)).toBe(false);
  });
});
