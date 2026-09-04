import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  guideHolds,
  hashWorld,
  hullPercent,
  readyFill,
  readyFraction,
  readyHeld,
  readyHoldTicks,
  type SimConfig,
  type SpawnEntry,
  seatReady,
  startWave,
  step,
  type TimedCommand,
  type World,
} from "../src/index.js";

/**
 * The ready gate: the two circles a guide ends on. THE FORK's test file used
 * to stand here and its two surviving rules are checked at the bottom — no
 * timeout, and no free repair bay.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG, briefings: true };
const FULL = readyHoldTicks(CFG);
const SLICK: SpawnEntry[] = [{ beat: 0, col: 3, kind: "slick", color: "red" }];

/** A world standing on a guide, which is the first thing a wave opens on. */
function atGuide(): World {
  const world = createWorld(CFG, 1);
  startWave(world, 0, SLICK, [], null, true);
  if (!guideHolds(world)) throw new Error("expected the guide to be up");
  return world;
}

function hold(world: World, ...players: (1 | 2)[]): TimedCommand[] {
  return players.map((player) => ({
    tick: world.tick,
    player,
    command: { kind: "brief", on: true } as const,
  }));
}

function letGo(world: World, player: 1 | 2): TimedCommand[] {
  return [{ tick: world.tick, player, command: { kind: "brief", on: false } }];
}

/** `ticks` ticks with `players`' thumbs down and nothing else happening. */
function press(world: World, ticks: number, ...players: (1 | 2)[]): void {
  for (let i = 0; i < ticks; i++) step(world, i === 0 ? hold(world, ...players) : []);
}

describe("a circle filling", () => {
  it("is empty until a thumb is on it, and full after the hold", () => {
    const world = atGuide();
    expect(readyFill(world, 1)).toBe(0);
    expect(readyHeld(world, 1)).toBe(false);
    press(world, FULL - 1, 1);
    expect(readyHeld(world, 1)).toBe(true);
    expect(seatReady(world, 1)).toBe(false);
    expect(readyFraction(world, 1)).toBeGreaterThan(0.9);
    step(world, []);
    expect(seatReady(world, 1)).toBe(true);
    expect(readyFraction(world, 1)).toBe(1);
  });

  it("counts one seat's hold and not the other's", () => {
    const world = atGuide();
    press(world, 20, 1);
    expect(readyFill(world, 1)).toBe(20);
    expect(readyFill(world, 2)).toBe(0);
  });

  it("does not start the wave until both circles are full", () => {
    const world = atGuide();
    press(world, FULL + 30, 1);
    expect(seatReady(world, 1)).toBe(true);
    expect(guideHolds(world)).toBe(true);
    press(world, FULL, 2);
    expect(guideHolds(world)).toBe(false);
  });

  it("starts the wave on the tick the second circle comes full", () => {
    const world = atGuide();
    press(world, FULL, 1, 2);
    expect(guideHolds(world)).toBe(false);
  });
});

describe("letting go", () => {
  it("empties a circle that was not full yet", () => {
    const world = atGuide();
    press(world, FULL - 4, 1);
    expect(readyFill(world, 1)).toBeGreaterThan(0);
    step(world, letGo(world, 1));
    expect(readyFill(world, 1)).toBe(0);
    expect(readyHeld(world, 1)).toBe(false);
  });

  it("cannot be tapped through — ten presses are not one hold", () => {
    const world = atGuide();
    for (let i = 0; i < 10; i++) {
      step(world, hold(world, 1));
      step(world, letGo(world, 1));
    }
    expect(readyFill(world, 1)).toBe(0);
    expect(guideHolds(world)).toBe(true);
  });

  it("leaves READY alone once it has latched", () => {
    const world = atGuide();
    press(world, FULL, 1);
    expect(seatReady(world, 1)).toBe(true);
    step(world, letGo(world, 1));
    expect(seatReady(world, 1)).toBe(true);
    // And the other seat can take its own time: the two never have to overlap.
    press(world, FULL, 2);
    expect(guideHolds(world)).toBe(false);
  });
});

describe("the gate in the fingerprint", () => {
  it("hashes differently for every tick of one circle", () => {
    const seen = new Set<number>();
    for (const ticks of [0, 1, 5, FULL]) {
      const world = atGuide();
      press(world, ticks, 1);
      seen.add(hashWorld(world));
    }
    expect(seen.size).toBe(4);
  });

  it("hashes differently for a thumb down and a thumb that just lifted", () => {
    const down = atGuide();
    press(down, 1, 1);
    const up = atGuide();
    press(up, 1, 1);
    step(up, letGo(up, 1));
    expect(hashWorld(down)).not.toBe(hashWorld(up));
  });
});

describe("what the gate inherited from THE FORK", () => {
  it("waits forever — no clock ever starts the wave for them", () => {
    const world = atGuide();
    for (let i = 0; i < 20_000; i++) step(world, []);
    expect(guideHolds(world)).toBe(true);
  });

  it("is not a free repair bay: the hull does not mend behind it", () => {
    const world = atGuide();
    world.hullMilli = 40_000;
    for (let i = 0; i < 5_000; i++) step(world, []);
    expect(hullPercent(world)).toBe(40);
  });
});
