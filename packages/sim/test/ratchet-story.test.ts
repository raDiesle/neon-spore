import { describe, expect, it } from "bun:test";
import { step, type World } from "../src/index.js";
import { ratchetHeld } from "../src/ratchet.js";
import { slowing } from "../src/slow.js";
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
  send,
  TPB,
} from "./ratchet-rig.js";

/**
 * THE RATCHET's story between the teeth (`ratchet-story.ts`, §22): the slip
 * after the first clean tooth, the kick after the second, the bind after the
 * third and the wind after the fourth — each under THE SLOW, each won by a
 * hand the boss already has, and each run out a blow of the rack's own
 * against the hull that starts the state again.
 */

/** `n` clean teeth, each story before the last one answered. */
function after(n: number): World {
  const world = install({ ratchetBoltBeats: 99 });
  lit(world);
  for (let i = 1; i < n; i += 1) {
    cleanTooth(world);
    pass(world);
  }
  cleanTooth(world);
  return world;
}

/** The blows the rack struck the hull with over `n` beats, by name. */
function blows(world: World, n: number): string[] {
  const out: string[] = [];
  const end = world.tick + TPB * n;
  while (world.tick < end) {
    step(world, []);
    for (const e of world.events)
      if (e.type === "breach" && e.by === "ratchet") out.push(e.blow ?? "");
  }
  return out;
}

describe("each clean tooth opens its own state", () => {
  for (const [n, phase] of [
    [1, "slip"],
    [2, "kick"],
    [3, "bind"],
    [4, "wind"],
  ] as const) {
    it(`the ${phase}, after clean tooth ${n}, under THE SLOW`, () => {
      const world = after(n);
      expect(rack(world).phase).toBe(phase);
      expect(slowing(world)).toBe(true);
    });
  }

  it("and a burnt tooth opens none", () => {
    const world = install();
    lit(world);
    press(world);
    expect(rack(world).phase).toBe("climb");
  });
});

describe("the slip", () => {
  it("is won by the catch set and held, which spends it", () => {
    const world = after(1);
    reset(world);
    const seen = beat(world, CFG.ratchetSlipBeats + 1);
    expect(seen.has("ratchetBite")).toBe(true);
    expect(rack(world).phase).toBe("climb");
    expect(slowing(world)).toBe(false);
    expect(ratchetHeld(rack(world), world.cfg)).toBe(false);
  });

  it("is not won by a catch still spent from the tooth", () => {
    const world = after(1);
    send(world, (t) => [catchAt(t, DOWN)]);
    beat(world, CFG.ratchetSlipBeats + 1);
    expect(rack(world).phase).toBe("slip");
  });

  it("run out drops the rack against the hull, and slips again", () => {
    const world = after(1);
    expect(blows(world, CFG.ratchetStoryBeats + 1)).toEqual(["slip"]);
    expect(rack(world).phase).toBe("slip");
    expect(slowing(world)).toBe(true);
  });
});

describe("the kick", () => {
  it("is won by the pawl held down, and takes no tooth", () => {
    const world = after(2);
    const teeth = rack(world).teeth;
    send(world, (t) => [pawlAt(t, true)]);
    const seen = beat(world, CFG.ratchetKickBeats + 1);
    expect(seen.has("ratchetSeat")).toBe(true);
    expect(rack(world).phase).toBe("climb");
    expect(rack(world).teeth).toBe(teeth);
  });

  it("run out flies the pawl against the hull", () => {
    const world = after(2);
    expect(blows(world, CFG.ratchetStoryBeats + 1)).toEqual(["kick"]);
    expect(rack(world).phase).toBe("kick");
  });
});

describe("the bind", () => {
  it("is not won by one hand", () => {
    const world = after(3);
    send(world, (t) => [pawlAt(t, true)]);
    beat(world, CFG.ratchetBindBeats + 1);
    expect(rack(world).phase).toBe("bind");
  });

  it("is won by both, catch set and pawl down", () => {
    const world = after(3);
    reset(world);
    send(world, (t) => [pawlAt(t, true)]);
    expect(beat(world, CFG.ratchetBindBeats + 1).has("ratchetMesh")).toBe(true);
    expect(rack(world).phase).toBe("climb");
  });

  it("run out shakes a plate against the hull", () => {
    const world = after(3);
    expect(blows(world, CFG.ratchetStoryBeats + 1)).toEqual(["bind"]);
  });
});

describe("the wind", () => {
  it("is wound by the catch set enough times, and the fifth pawl lights after", () => {
    const world = after(4);
    const seen = new Set<string>();
    for (let i = 0; i < CFG.ratchetWindSets; i += 1) for (const e of reset(world)) seen.add(e);
    expect(seen.has("ratchetWound")).toBe(true);
    expect(rack(world).phase).toBe("climb");
    beat(world, CFG.ratchetClimbBeats + 1);
    reset(world);
    expect(press(world).has("ratchetOpen")).toBe(true);
  });

  it("is not wound by one set short", () => {
    const world = after(4);
    for (let i = 1; i < CFG.ratchetWindSets; i += 1) reset(world);
    expect(rack(world).phase).toBe("wind");
    expect(rack(world).windSets).toBe(CFG.ratchetWindSets - 1);
  });

  it("run out unwinds against the hull, its sets counted again from none", () => {
    const world = after(4);
    reset(world);
    expect(blows(world, CFG.ratchetWindBeats + 1)).toEqual(["wind"]);
    expect(rack(world).windSets).toBe(0);
  });
});
