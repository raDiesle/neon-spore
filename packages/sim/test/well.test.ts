import { describe, expect, it } from "bun:test";
// Not on the package's surface and not meant to be: nothing outside
// `packages/sim` asks this question, only `beat.ts` does (`boss-surface.ts`
// says a name goes there when something outside imports it, and no sooner).
import { bossHoldsWave } from "../src/boss-kinds.js";
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
 * author wrote **and it ends when that wave ends**, and the only difference the
 * fingerprint carries is the tag that says which picture the two devices are
 * drawing. The second half of that had never been tested and was not true: for
 * a day, wave 70 of the shipped campaign could be cleared and not passed. The test below is that claim
 * read literally — the same wave played twice from the same seed with the same
 * presses, once with the boss and once without, compared tick by tick on
 * everything but the tag.
 *
 * It is also the guard against the obvious future mistake. The next lane to
 * want the seam to *cost* something (`docs/queue.md`'s Asks) will reach for
 * `stepWell`, and the moment it writes one the last case below goes red with
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
    // **How far through the script the world is, and whether it is over.**
    // Both were missing until 16 September 2026, and while neither is what
    // finally caught that day's defect — the run below loses the hull before
    // either world could clear, so the case above it is the one that names it
    // — a comparison meant to read "the same world twice" that leaves out the
    // number saying the world is finished is a comparison about the middle of
    // a wave only, and it is the middle that was never in doubt.
    restBeat: world.restBeat,
    spawned: world.spawned,
  });
}

describe("THE WELL", () => {
  it("is a wave the author fills, not one the boss fills", () => {
    expect(bossFillsWave("well")).toBe(false);
  });

  // The other question, and it is a different one: the vane does not fill its
  // wave either and it *does* hold it open, because a vane is beaten by having
  // its pins taken out and a wave that ended without that would be a fight the
  // pair never had (`boss-kinds.ts`).
  it("is the one boss that does not hold its wave open", () => {
    expect(bossHoldsWave("well")).toBe(false);
    for (const kind of BOSS_KINDS) {
      if (kind === "well") continue;
      expect(bossHoldsWave(kind), kind).toBe(true);
    }
  });

  // The defect this test was written for, stated on its own rather than only
  // as a difference: a well wave with the field cleared and the script spent
  // has to end. It could not before 16 September 2026, and wave 70 of the
  // shipped campaign is a well wave, so the campaign stopped there.
  it("ends when the wave under it does", () => {
    const world = wellWorld(true);
    let rested = false;
    for (let t = 0; t < TPB * 40; t++) {
      step(world, []);
      // Every body taken the instant it arrives, so what is under test is only
      // the ending and never the fight.
      world.creatures.length = 0;
      // Watched rather than read at the end: the rest is a window, not a
      // state the world keeps — it is set when the wave clears and back to -1
      // once the next wave is asked for.
      if (world.restBeat >= 0) rested = true;
    }
    expect(world.spawned, "the script never ran out").toBe(QUEUE.length);
    expect(world.boss, "the projection went somewhere").toEqual({ kind: "well" });
    expect(world.balance.wavesCleared, "the wave never ended").toBe(1);
    expect(rested, "no rest was ever set").toBe(true);
  });

  // The tag `bossHashParts` pushes is this index, so the well's place in the
  // list is a wire value: a replay recorded on yesterday's build has to
  // fingerprint the same way today. It used to be read as "the last one",
  // which said the right thing only until a boss was appended after it — THE
  // SPLICE, 16 September 2026. What the rule always meant is the index.
  it("keeps its place in BOSS_KINDS — the tag is a wire value", () => {
    expect(BOSS_KINDS.indexOf("well")).toBe(11);
    expect(BOSS_KINDS.length, "a kind was inserted rather than appended").toBeGreaterThan(11);
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
