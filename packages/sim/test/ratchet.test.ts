import { describe, expect, it } from "bun:test";
import { type Bullet, hashWorld, midCol, type SimConfig, type World } from "../src/index.js";
import {
  NO_BOLT,
  NO_CATCH,
  RATCHET_TEETH,
  ratchetHeld,
  ratchetWindowBeats,
} from "../src/ratchet.js";
import { ratchetStruck } from "../src/ratchet-shot.js";
import { slowing } from "../src/slow.js";
import { NOT_FAILED } from "../src/wave-fail.js";
import {
  beat,
  CFG,
  catchAt,
  cleanTooth,
  DOWN,
  install,
  lit,
  pass,
  pawlAt,
  press,
  rack,
  reset,
  runTo,
  send,
} from "./ratchet-rig.js";

/**
 * THE RATCHET: the one boss where a step, once taken, is never taken back.
 *
 * What these pin is the sentence the pair has to say. That every press of
 * the pawl climbs a tooth whether or not the catch is set, and is clean only
 * when it is. That a clean tooth spends the catch, so it has to be lifted and
 * set again. That a window nobody answers burns a tooth, and each later
 * window is shorter. That the seats are fixed by the target's name. That the
 * second clean tooth throws a bolt, and nobody shooting it is the wave. That
 * five clean opens the rack, and a third burn jams it into the hull. And that
 * THE SLOW spans each window exactly.
 *
 * The fingerprint is compared between two runs in one process rather than
 * pinned (`docs/decisions.md` #19).
 */

describe("THE RATCHET comes in", () => {
  it("over the middle, seven teeth, and neither hand on it", () => {
    const world = install();
    const s = rack(world);
    expect(s.phase).toBe("still");
    expect(s.teeth).toBe(RATCHET_TEETH);
    expect(s.catchMilli).toBe(NO_CATCH);
    expect(s.boltCol).toBe(NO_BOLT);
    expect(world.events.some((e) => e.type === "ratchetEnter")).toBe(true);
  });

  it("and lights the first pawl after its still", () => {
    const world = install();
    expect(lit(world).has("ratchetLit")).toBe(true);
    expect(rack(world).phase).toBe("work");
  });
});

describe("the catch and the pawl", () => {
  it("climb a tooth clean when the catch is set under the press", () => {
    const world = install();
    lit(world);
    expect(send(world, (t) => [catchAt(t, DOWN)]).has("ratchetSet")).toBe(true);
    expect(press(world).has("ratchetClick")).toBe(true);
    expect(rack(world).teeth).toBe(RATCHET_TEETH - 1);
    expect(rack(world).clean).toBe(1);
    // The first clean tooth is followed by the slip (`ratchet-story.test.ts`).
    expect(rack(world).phase).toBe("slip");
  });

  it("and climb it burnt when it is not, which is still a tooth", () => {
    const world = install();
    lit(world);
    expect(press(world).has("ratchetBurn")).toBe(true);
    expect(rack(world).teeth).toBe(RATCHET_TEETH - 1);
    expect(rack(world).clean).toBe(0);
  });

  it("so a thumb short of the grip sets nothing", () => {
    const world = install();
    lit(world);
    send(world, (t) => [catchAt(t, CFG.ratchetGripMilli - 1)]);
    expect(ratchetHeld(rack(world), world.cfg)).toBe(false);
    expect(press(world).has("ratchetBurn")).toBe(true);
  });

  it("and a thumb left on the pawl is one press, not a tooth a tick", () => {
    const world = install();
    lit(world);
    const t = world.tick;
    runTo(world, t + 4, [pawlAt(t, true), pawlAt(t + 1, true), pawlAt(t + 2, true)]);
    expect(rack(world).teeth).toBe(RATCHET_TEETH - 1);
  });

  it("spends the catch on a clean tooth, until it is lifted and set again", () => {
    const world = install();
    lit(world);
    send(world, (t) => [catchAt(t, DOWN)]);
    press(world);
    // Held down all along: the spent catch sets nothing.
    send(world, (t) => [catchAt(t, DOWN)]);
    expect(ratchetHeld(rack(world), world.cfg)).toBe(false);
    reset(world);
    expect(ratchetHeld(rack(world), world.cfg)).toBe(true);
  });

  it("hears each target from its own seat only", () => {
    const world = install();
    lit(world);
    send(world, (t) => [catchAt(t, DOWN, true, 1), pawlAt(t, true, 2)]);
    expect(rack(world).catchMilli).toBe(NO_CATCH);
    expect(rack(world).teeth).toBe(RATCHET_TEETH);
  });
});

describe("the window", () => {
  it("burns a tooth when nobody answers it", () => {
    const world = install();
    lit(world);
    const burn = beat(world, CFG.ratchetWindowBeats + 1);
    expect(burn.has("ratchetBurn")).toBe(true);
    expect(rack(world).teeth).toBe(RATCHET_TEETH - 1);
  });

  it("and is shorter for every tooth spent", () => {
    const world = install();
    const first = ratchetWindowBeats(rack(world), world.cfg);
    lit(world);
    press(world);
    expect(ratchetWindowBeats(rack(world), world.cfg)).toBe(first - CFG.ratchetWindowStepBeats);
  });

  it("is THE SLOW, opened on the light and closed on the answer", () => {
    const world = install();
    expect(slowing(world)).toBe(false);
    lit(world);
    expect(slowing(world)).toBe(true);
    press(world);
    expect(slowing(world)).toBe(false);
  });
});

describe("the bolt", () => {
  function twoClean(over: Partial<SimConfig> = {}): World {
    const world = install(over);
    lit(world);
    cleanTooth(world);
    pass(world);
    return world;
  }

  it("comes loose on the second clean tooth, over the middle", () => {
    const world = twoClean({ ratchetBoltBeats: 99 });
    expect(rack(world).boltCol).toBe(NO_BOLT);
    expect(cleanTooth(world).has("ratchetBolt")).toBe(true);
    expect(rack(world).boltCol).toBe(midCol(world.cfg));
  });

  it("goes out to a shot in either colour", () => {
    const world = twoClean({ ratchetBoltBeats: 99 });
    cleanTooth(world);
    const bolt: Bullet = {
      id: world.nextId++,
      col: rack(world).boltCol,
      row: 0,
      subMilli: 0,
      color: "red",
      lance: false,
      driftMilli: 0,
      aimMilli: 0,
    };
    ratchetStruck(world, bolt);
    expect(rack(world).boltCol).toBe(NO_BOLT);
    expect(world.events.some((e) => e.type === "ratchetBoltOut")).toBe(true);
  });

  it("and reaches the hull unanswered, which is the wave", () => {
    const world = twoClean();
    cleanTooth(world);
    expect(beat(world, CFG.ratchetBoltBeats + 1).has("ratchetBoltHit")).toBe(true);
    expect(world.failTick).not.toBe(NOT_FAILED);
  });
});

describe("the end of the rack", () => {
  it("opens on the fifth clean tooth, and is gone its beats later", () => {
    const world = install({ ratchetBoltBeats: 99 });
    lit(world);
    for (let i = 0; i < 4; i += 1) {
      cleanTooth(world);
      pass(world);
    }
    expect(cleanTooth(world).has("ratchetOpen")).toBe(true);
    expect(world.failTick).toBe(NOT_FAILED);
    expect(beat(world, CFG.ratchetOpenBeats + 1).has("ratchetOut")).toBe(true);
    expect(world.boss).toBeNull();
  });

  it("jams on the third burn, which breaches the hull", () => {
    const world = install();
    lit(world);
    press(world);
    beat(world, CFG.ratchetClimbBeats + 1);
    press(world);
    beat(world, CFG.ratchetClimbBeats + 1);
    expect(world.failTick).toBe(NOT_FAILED);
    expect(press(world).has("ratchetJam")).toBe(true);
    expect(rack(world).phase).toBe("jam");
    expect(world.failTick).not.toBe(NOT_FAILED);
  });

  it("holds the wave while there is margin left", () => {
    const world = install();
    lit(world);
    press(world);
    beat(world, CFG.ratchetClimbBeats + 1);
    press(world);
    expect(world.failTick).toBe(NOT_FAILED);
    expect(rack(world).phase).toBe("climb");
  });
});

describe("the fingerprint", () => {
  it("is the same for two runs given the same hands", () => {
    const run = (): number => {
      const world = install();
      lit(world);
      cleanTooth(world);
      beat(world, 2);
      return hashWorld(world);
    };
    expect(run()).toBe(run());
  });

  it("and differs when her thumb has the catch a thousandth further down", () => {
    const at = (to: number): number => {
      const world = install();
      lit(world);
      send(world, (t) => [catchAt(t, to)]);
      return hashWorld(world);
    };
    expect(at(700)).not.toBe(at(701));
  });
});
