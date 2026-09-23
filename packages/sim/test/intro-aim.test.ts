import { describe, expect, it } from "bun:test";
import {
  type Command,
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  introHolds,
  type SimConfig,
  type SpawnEntry,
  startWave,
  step,
  type World,
} from "../src/index.js";

/**
 * **Under the introduction, the pair may aim and not shoot.** The cannon and
 * the shield slide to the columns the two of them have just agreed on; the
 * trigger, the guard and the maw answer nothing, and nothing spawns or falls
 * until both seats are done (`step.ts`). The owner, 20 September 2026: players
 * reading the three lines wanted their controls.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG, briefings: true };
const SLICK: SpawnEntry[] = [{ beat: 0, col: 3, kind: "slick", color: "red" }];

function introduced(): World {
  const world = createWorld(CFG, 1);
  startWave(world, 0, SLICK, [], null, false);
  return world;
}

/** Everything a pair might press while the three lines stand, by tick. */
const PRESSES: [number, 1 | 2, Command][] = [
  [2, 1, { kind: "cannonCol", col: 1 }],
  [3, 2, { kind: "shieldCol", col: 5 }],
  [5, 2, { kind: "prime", on: true, color: "red" }],
  [9, 2, { kind: "prime", on: false, color: "red" }],
  [10, 1, { kind: "fire", color: "red" }],
  [11, 1, { kind: "guard" }],
  [12, 2, { kind: "intake" }],
];

/** The introduction played out with those presses, then both acks. */
function playOut(world: World): number[] {
  const hashes: number[] = [];
  for (let t = 0; t < 40; t++) {
    const commands = PRESSES.filter(([at]) => at === t).map(([, player, command]) => ({
      tick: world.tick,
      player,
      command,
    }));
    step(world, commands);
    hashes.push(hashWorld(world));
  }
  return hashes;
}

describe("the introduction, with the pair's thumbs on the hull", () => {
  it("slides the cannon and the shield", () => {
    const world = introduced();
    playOut(world);
    expect(introHolds(world)).toBe(true);
    expect(world.cannonCol).toBe(1);
    expect(world.shieldCol).toBe(5);
  });

  it("shoots nothing, fills nothing and spawns nothing", () => {
    const world = introduced();
    const guardBefore = world.guardTick;
    const intakeBefore = world.intakeTick;
    playOut(world);
    expect(world.bullets).toHaveLength(0);
    expect(world.creatures).toHaveLength(0);
    expect(world.beat).toBe(0);
    expect(world.guardTick).toBe(guardBefore);
    expect(world.intakeTick).toBe(intakeBefore);
  });

  it("starts the field from where the pair aimed", () => {
    const world = introduced();
    playOut(world);
    step(world, [
      { tick: world.tick, player: 1, command: { kind: "brief" } },
      { tick: world.tick, player: 2, command: { kind: "brief" } },
    ]);
    expect(introHolds(world)).toBe(false);
    expect(world.cannonCol).toBe(1);
    expect(world.shieldCol).toBe(5);
  });

  it("plays out the same on both devices, tick for tick", () => {
    const a = playOut(introduced());
    const b = playOut(introduced());
    expect(b).toEqual(a);
    // And the aim is in the fingerprint: a pair that aimed and a pair that did
    // not are two different worlds.
    const still = introduced();
    for (let t = 0; t < 40; t++) step(still, []);
    expect(hashWorld(still)).not.toBe(a[a.length - 1]);
  });
});
