import { describe, expect, it } from "bun:test";
import {
  BOSS_KINDS,
  bossFillsWave,
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  type SpawnEntry,
  setBossRound,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";

/**
 * THE WELL, which is the one boss in this game whose whole content is a
 * **picture** — so what there is to test here is that the simulation does not
 * know it is installed.
 *
 * The claim `docs/spec/bosses.md` 11.12 and `src/well.ts` both make is strong
 * and easy to break by accident: a well wave is byte-for-byte the wave its
 * author wrote, and the only difference the fingerprint carries is the tag that
 * says which picture the two devices are drawing. The test below is that claim
 * read literally — the same wave played twice from the same seed with the same
 * presses, once with the boss and once without, compared tick by tick on
 * everything but the tag.
 *
 * It is also the guard against the obvious future mistake. The next lane to
 * want the seam to *cost* something (`docs/queue.md`'s Asks) will reach for
 * `stepWell`, and the moment it writes one the fourth case below goes red with
 * the reason in its name.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);

/**
 * The shipped wave's own shape, written out here rather than read off `WAVES`:
 * `packages/sim` may not import `packages/content` (rule 1 is one way, and this
 * is the other direction of the same wall), so a sim test authors its own queue.
 * One at each wall and one in the middle, which is the figure the wave is built
 * on — the two lanes the clock draws either side of its seam.
 */
const QUEUE: SpawnEntry[] = [
  { beat: 0, col: 5, kind: "slick", color: "red" },
  { beat: 8, col: 0, kind: "bulb", color: "cyan" },
  { beat: 16, col: 10, kind: "slick", color: "red" },
];

/** The same wave, with or without the boss over it. */
function wellWorld(withBoss: boolean): World {
  const world = createWorld(CFG, 5);
  startWave(world, 3, [...QUEUE], [], withBoss ? { kind: "well" } : null);
  return world;
}

/** Every number in the world that is not the boss tag, as one string. */
function shape(world: World): string {
  return JSON.stringify({
    creatures: world.creatures,
    bullets: world.bullets,
    scars: world.scars,
    pods: world.pods,
    cannonCol: world.cannonCol,
    shieldCol: world.shieldCol,
    balance: world.balance,
    guard: world.guard,
    beat: world.beat,
    tick: world.tick,
    nextId: world.nextId,
  });
}

describe("THE WELL", () => {
  it("is a wave the author fills, not one the boss fills", () => {
    expect(bossFillsWave("well")).toBe(false);
  });

  it("is appended to BOSS_KINDS, never inserted — the tag is a wire value", () => {
    expect(BOSS_KINDS[BOSS_KINDS.length - 1]).toBe("well");
  });

  it("puts nothing on the field and keeps nothing between beats", () => {
    const world = wellWorld(true);
    expect(world.boss).toEqual({ kind: "well" });
    expect(world.creatures.length, "a projection with a body").toBe(0);
    // No rounds either: there is nothing to stand it on (`setBossRound`).
    expect(setBossRound(world, 1)).toBe(false);
    for (let t = 0; t < TPB * 24; t++) step(world, []);
    expect(world.boss, "the well grew state").toEqual({ kind: "well" });
  });

  it("changes nothing about the simulation — the wave is the wave either way", () => {
    const withBoss = wellWorld(true);
    const without = wellWorld(false);
    // Presses on both, identical and deliberately clumsy: a colour loaded, a
    // cannon sent to one wall and then the other, a trigger. If the boss
    // touched a single rule, one of these would land differently on one of the
    // two runs and the shapes would part.
    const at = (tick: number): TimedCommand[] => {
      if (tick === TPB * 4) return [{ tick, player: 1, command: { kind: "cannonCol", col: 0 } }];
      if (tick === TPB * 12) return [{ tick, player: 1, command: { kind: "cannonCol", col: 10 } }];
      if (tick === TPB * 14) return [{ tick, player: 2, command: { kind: "fire", color: "red" } }];
      return [];
    };
    for (let t = 0; t < TPB * 40; t++) {
      const cmds = at(t);
      step(withBoss, cmds);
      step(without, cmds);
      expect(shape(withBoss), `tick ${t}`).toBe(shape(without));
    }
    // And the fingerprints differ by the tag alone, which is the one thing two
    // devices must agree about: they are drawing two different pictures of one
    // world, and a device that thought the well was off would draw the field.
    expect(hashWorld(withBoss)).not.toBe(hashWorld(without));
  });
});
