import { describe, expect, it } from "bun:test";
import { haspHeatMilli, haspHeld, NO_LATCH } from "../src/hasp.js";
import { step, type TimedCommand, type World } from "../src/index.js";
import { slowing } from "../src/slow.js";
import {
  beat,
  between,
  CFG,
  door,
  grip,
  install,
  letGo,
  lit,
  rest,
  rim,
  rock,
  runTo,
  settle,
  TPB,
  wind,
  windOff,
} from "./hasp-rig.js";

/**
 * THE HASP's story between the hasps (`hasp-story.ts`, §20): the rattle
 * after the first opening, the backspin and then the rust after the second,
 * the sway after the third — each under THE SLOW, each answered with the
 * latch and the wheel the door already has, none costing a clasp back, and
 * each run out a blow of the door's own at the hull that starts the state
 * again, save the sway, which clears the row anyway.
 */

/** `n` hasps opened, each story before the last one answered, the swing done. */
function after(n: number): World {
  const world = install({ haspBoltBeats: 99 });
  lit(world);
  windOff(world);
  for (let i = 1; i < n; i += 1) {
    between(world);
    windOff(world);
  }
  settle(world);
  return world;
}

/** The blows the door struck the hull with over `n` beats, by name. */
function blows(world: World, n: number): string[] {
  const out: string[] = [];
  const end = world.tick + TPB * n;
  while (world.tick < end) {
    step(world, []);
    for (const e of world.events)
      if (e.type === "breach" && e.by === "hasp") out.push(e.blow ?? "");
  }
  return out;
}

describe("each opening ends in its own state", () => {
  for (const [n, phase] of [
    [1, "rattle"],
    [2, "backspin"],
    [3, "sway"],
  ] as const) {
    it(`the ${phase}, after opening ${n}, under THE SLOW`, () => {
      const world = after(n);
      expect(door(world).phase).toBe(phase);
      expect(door(world).hasps).toBe(3 - n);
      expect(slowing(world)).toBe(true);
    });
  }

  it("and none with the story off, which is the rehearsal's door", () => {
    const world = install({ haspStory: false });
    lit(world);
    windOff(world);
    expect(settle(world).has("haspLit")).toBe(true);
    expect(door(world).phase).toBe("work");
  });
});

describe("the rattle", () => {
  it("is answered by the latch kept its beats, and the next latch lights under the hand", () => {
    const world = after(1);
    grip(world);
    const seen = beat(world, CFG.haspRattleBeats);
    expect(seen.has("haspHush")).toBe(true);
    expect(seen.has("haspLit")).toBe(true);
    const s = door(world);
    expect(s.phase).toBe("work");
    expect(s.hasps).toBe(2);
    expect(haspHeld(s, world.cfg)).toBe(true);
    // Carried over as a fresh grip, its fuse counted from the answer.
    expect(haspHeatMilli(s, world.cfg, s.gripBeat)).toBe(0);
    expect(slowing(world)).toBe(true);
  });

  it("burns no hand however long it is held, and reads no heat", () => {
    const world = after(1);
    grip(world);
    expect(haspHeatMilli(door(world), world.cfg, world.beat + CFG.haspHoldBeats)).toBe(0);
  });

  it("counts a hold in a row, so a hand let go starts it again", () => {
    const world = after(1);
    grip(world);
    beat(world, CFG.haspRattleBeats - 1);
    letGo(world);
    grip(world);
    beat(world, CFG.haspRattleBeats - 1);
    expect(door(world).phase).toBe("rattle");
  });

  it("run out, slams the door on the hull and rattles again", () => {
    const world = after(1);
    expect(blows(world, CFG.haspStoryBeats + 1)).toEqual(["rattle"]);
    expect(door(world).phase).toBe("rattle");
    expect(slowing(world)).toBe(true);
  });
});

describe("the backspin", () => {
  it("is hers alone: wound with no latch, it catches and the rust opens", () => {
    const world = after(2);
    const seen = wind(world, CFG.haspWindTravelMilli / 200);
    expect(seen.has("haspCatch")).toBe(true);
    expect(seen.has("haspRust")).toBe(true);
    expect(door(world).phase).toBe("rust");
    expect(slowing(world)).toBe(true);
  });

  it("counts the wind either way round", () => {
    const world = after(2);
    // Eight hundred on is two hundred back, the short way round.
    expect(wind(world, CFG.haspWindTravelMilli / 200, 800).has("haspCatch")).toBe(true);
  });

  it("and the latch takes no hand while it spins", () => {
    const world = after(2);
    grip(world);
    expect(door(world).latchMilli).toBe(NO_LATCH);
  });

  it("run out, throws a spoke at the hull and spins back again", () => {
    const world = after(2);
    expect(blows(world, CFG.haspBackspinBeats + 1)).toEqual(["backspin"]);
    expect(door(world).phase).toBe("backspin");
  });
});

describe("the rust", () => {
  function rusted(): World {
    const world = after(2);
    wind(world, CFG.haspWindTravelMilli / 200);
    return world;
  }

  it("cracks under her rocking while he holds, and the last latch is lit", () => {
    const world = rusted();
    grip(world);
    const seen = rock(world, CFG.haspRustRocks + 1);
    expect(seen.has("haspCrack")).toBe(true);
    expect(door(world).phase).toBe("work");
    expect(door(world).hasps).toBe(1);
  });

  it("counts nothing rocked with the latch let go — the gate again", () => {
    const world = rusted();
    rock(world, CFG.haspRustRocks + 1);
    expect(door(world).phase).toBe("rust");
    expect(door(world).rocks).toBe(0);
  });

  it("and counts a tremble short of a rock as nothing", () => {
    const world = rusted();
    grip(world);
    const t = world.tick;
    const small = CFG.haspRockMilli - 20;
    const cmds: TimedCommand[] = [rim(t, -1), rim(t + 1, 0)];
    for (let i = 1; i <= 8; i += 1) cmds.push(rim(t + 1 + i, i % 2 === 1 ? small : 0));
    runTo(world, t + 10, cmds);
    expect(door(world).rocks).toBe(0);
  });

  it("run out, bursts at the hull and is rusted again", () => {
    const world = rusted();
    expect(blows(world, CFG.haspRustBeats + 1)).toEqual(["rust"]);
    expect(door(world).phase).toBe("rust");
  });
});

describe("the sway", () => {
  it("is steadied by both holding still, and the row swings clear", () => {
    const world = after(3);
    grip(world);
    rest(world);
    const seen = beat(world, CFG.haspSwayBeats);
    expect(seen.has("haspSteady")).toBe(true);
    expect(seen.has("haspClear")).toBe(true);
    expect(door(world).phase).toBe("clear");
  });

  it("asks her hand on the wheel, not only his on the latch", () => {
    const world = after(3);
    grip(world);
    beat(world, CFG.haspSwayBeats + 1);
    expect(door(world).phase).toBe("sway");
  });

  it("and a wheel stirred past the stillness steadies nothing", () => {
    const world = after(3);
    grip(world);
    wind(world, TPB * (CFG.haspSwayBeats + 1), 100);
    expect(door(world).phase).toBe("sway");
  });

  it("run out, strikes the hull rough and clears the row anyway", () => {
    const world = after(3);
    expect(blows(world, CFG.haspStoryBeats + 1)).toEqual(["sway"]);
    expect(door(world).phase).toBe("clear");
    expect(slowing(world)).toBe(false);
  });
});
