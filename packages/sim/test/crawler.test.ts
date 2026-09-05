import { describe, expect, it } from "bun:test";
import {
  CRAWLER_MAX,
  CRAWLER_MIN,
  crawlerHeading,
  crawlerLinks,
  crawlerOf,
  crawlerSegmentCount,
  crawlerSide,
  crawlRow,
  linkIsArmoured,
  segmentColor,
} from "../src/crawler.js";
import { linkStruck } from "../src/crawler-round.js";
import { guardWindowTicks } from "../src/hull-guard.js";
import {
  type Color,
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  hullPercent,
  linkIsEnd,
  linkOrder,
  record,
  runReplay,
  type SimConfig,
  type SimEvent,
  type SpawnEntry,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "../src/index.js";
import type { Bullet, Creature } from "../src/types.js";

/**
 * THE CRAWLER: a worm that walks the ship's surface, and the first body both
 * controls have to take apart together.
 *
 * What is worth pinning here is the half a reader of `crawler.ts` cannot check
 * by eye — that one queue entry really becomes a run of bodies, that the
 * answers along it cycle red, cyan, plate, that **every** ring comes off and
 * the two ends are the dome's like any other plate, that a link taken off
 * closes the body up behind it rather than leaving a hole, that the shield
 * answers a plate where no shield has ever answered anything before, that the
 * ring which empties a worm is what pays for it, and that a second device
 * walking the same beats arrives at the same fingerprint.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const ROW = crawlRow(CFG);

const crawler = (segments: number, col = 0, side?: "left" | "right"): SpawnEntry => ({
  beat: 0,
  col,
  kind: "crawler",
  color: null,
  segments,
  ...(side ? { side } : {}),
});

/** A world with one worm on it, stepped far enough for it to be standing. */
function onField(segments: number, col = 0, side?: "left" | "right") {
  const world = createWorld({ ...CFG }, 0, [crawler(segments, col, side)]);
  for (let t = 0; t < TPB + 1; t++) step(world, []);
  return world;
}

const wormOf = (world: ReturnType<typeof createWorld>): Creature[] =>
  world.creatures.filter((c) => c.kind === "crawler").sort((a, b) => linkOrder(a) - linkOrder(b));

const bolt = (col: number, color: Color): Bullet => ({
  id: 1,
  col,
  row: 0,
  subMilli: 0,
  color,
  lance: false,
  pierced: 0,
  driftMilli: 0,
  aimMilli: 0,
});

describe("the worm a wave authors", () => {
  it("is one entry and a run of bodies, a lane apart along the ship's own row", () => {
    for (const segments of [CRAWLER_MIN, 3, CRAWLER_MAX]) {
      const on = wormOf(onField(segments));
      // Head, the segments, tail.
      expect(on).toHaveLength(segments + 2);
      expect(on.every((c) => c.row === ROW)).toBe(true);
      // One behind the next, walking away from the wall it came over — and
      // most of the body is still off the field, which is the entrance.
      expect(on.map((c) => c.col)).toEqual(on.map((_, i) => on[0]!.col - i));
      expect(on[0]!.col).toBe(0);
      expect(new Set(on.map(crawlerOf)).size).toBe(1);
    }
  });

  it("holds the authored length inside the two bounds", () => {
    expect(crawlerSegmentCount(CFG, undefined)).toBe(CFG.crawlerSegments);
    expect(crawlerSegmentCount(CFG, 1)).toBe(CRAWLER_MIN);
    expect(crawlerSegmentCount(CFG, 99)).toBe(CRAWLER_MAX);
  });

  it("comes over the wall it was told, or the one its column is nearest", () => {
    expect(crawlerSide(CFG.cols, 1, undefined)).toBe("left");
    expect(crawlerSide(CFG.cols, CFG.cols - 1, undefined)).toBe("right");
    // An explicit side wins over the column, which is what lets a wave call a
    // worm on one strip and bring it over the other wall.
    expect(crawlerSide(CFG.cols, 0, "right")).toBe("right");
    const from = wormOf(onField(3, CFG.cols - 1));
    expect(from[0]!.col).toBe(CFG.cols - 1);
    expect(crawlerHeading(from[0]!)).toBe(-1);
  });

  it("runs red, cyan, plate along its segments, and neither end is any of them", () => {
    const on = wormOf(onField(CRAWLER_MAX));
    expect(
      on.map((_, i) => (i === 0 || i === on.length - 1 ? "end" : segmentColor(i - 1))),
    ).toEqual(["end", "red", "cyan", null, "red", "cyan", null, "red", "end"]);
    expect(on.slice(1, -1).map((c) => c.color)).toEqual([
      "red",
      "cyan",
      null,
      "red",
      "cyan",
      null,
      "red",
    ]);
  });

  it("names its two ends off the run itself, and neither carries a colour", () => {
    const world = onField(4);
    const on = wormOf(world);
    expect(on.filter((c) => linkIsEnd(world, c)).map(linkOrder)).toEqual([0, on.length - 1]);
    expect(on[0]!.color).toBeNull();
    expect(on[on.length - 1]!.color).toBeNull();
  });

  it("owes the shield every colourless link, the two ends included", () => {
    const world = onField(4);
    const on = wormOf(world);
    // Head, third segment, tail: every ring with no colour on it, and the ends
    // are no longer the exception they were.
    expect(on.filter(linkIsArmoured).map(linkOrder)).toEqual([0, 3, on.length - 1]);
    expect(on.every((c) => (c.color === null) === linkIsArmoured(c))).toBe(true);
  });
});

describe("what a shot does to a link", () => {
  it("kills a colour segment with its own colour, and closes the body up", () => {
    const world = onField(3);
    const on = wormOf(world);
    const red = on[1]!;
    const behind = on.slice(2).map((c) => c.col);
    expect(linkStruck(world, bolt(red.col, "red"), red)).toBe(false);
    const left = wormOf(world);
    expect(left).toHaveLength(4);
    expect(left.some((c) => c.id === red.id)).toBe(false);
    // Everything behind the gap has snapped one column forward — the magnet.
    expect(left.slice(1).map((c) => c.col)).toEqual(behind.map((col) => col + 1));
  });

  it("refuses the other colour, and the segment stays on the worm", () => {
    const world = onField(3);
    const red = wormOf(world)[1]!;
    linkStruck(world, bolt(red.col, "cyan"), red);
    expect(wormOf(world)).toHaveLength(5);
    expect(world.events.some((e: SimEvent) => e.type === "reject")).toBe(true);
  });

  it("leaves a crater on an end and on a plate, and takes nothing off either", () => {
    const world = onField(3);
    const on = wormOf(world);
    for (const link of [on[0]!, on[3]!, on[4]!]) {
      for (const color of ["red", "cyan"] as const) {
        linkStruck(world, bolt(link.col, color), link);
      }
    }
    expect(wormOf(world)).toHaveLength(5);
    expect(world.events.filter((e: SimEvent) => e.type === "hole")).toHaveLength(6);
  });

  it("bursts the ring in its own colour rather than pushing a plain destroy", () => {
    const world = onField(3);
    const red = wormOf(world)[1]!;
    linkStruck(world, bolt(red.col, "red"), red);
    const burst = world.events.find((e: SimEvent) => e.type === "crawlerBreak");
    expect(burst).toBeDefined();
    expect(burst).toMatchObject({ col: red.col, row: ROW, color: "red" });
    expect(world.events.some((e: SimEvent) => e.type === "destroy")).toBe(false);
  });
});

describe("what the shield does to a plate", () => {
  /** Walk a worm until its third segment — the plate — is under the shield,
   * with the guard armed on every beat it might be answered on. */
  function wardThePlate(segments: number): ReturnType<typeof createWorld> {
    const world = createWorld({ ...CFG }, 0, [crawler(segments)]);
    let seen = false;
    for (let t = 0; t < TPB * (CFG.cols + 2); t++) {
      const plate = wormOf(world).find((c) => linkIsArmoured(c));
      if (plate) {
        seen = true;
        world.shieldCol = Math.max(0, plate.col);
        world.guardTick = world.tick;
      }
      step(world, []);
      // Only once there has been a plate to lose: on the first tick the queue
      // has not been read yet, so the field is empty and every worm on it is
      // trivially stripped.
      if (seen && !wormOf(world).some((c) => linkIsArmoured(c))) break;
    }
    return world;
  }

  it("takes it off when the dome is under it and the trigger is in time", () => {
    const world = wardThePlate(3);
    expect(wormOf(world).filter(linkIsArmoured)).toHaveLength(0);
    expect(world.guard.deflected).toBeGreaterThan(0);
  });

  it("does nothing at all while the trigger is cold", () => {
    const world = createWorld({ ...CFG }, 0, [crawler(3)]);
    for (let t = 0; t < TPB * 4; t++) {
      const plate = wormOf(world).find((c) => linkIsArmoured(c));
      if (plate) world.shieldCol = Math.max(0, plate.col);
      // The window is never opened, so `guardArmed` is false throughout.
      expect(world.tick - world.guardTick).toBeGreaterThan(guardWindowTicks(CFG));
      step(world, []);
    }
    expect(wormOf(world).some((c) => linkIsArmoured(c))).toBe(true);
  });
});

describe("the two ways a worm stops existing", () => {
  it("is finished by the ring that empties it, and the dome is what takes the ends", () => {
    const world = onField(2);
    const before = world.score;
    // The two colour rings by the cannon...
    for (const link of wormOf(world)) {
      if (link.color !== null) linkStruck(world, bolt(link.col, link.color), link);
    }
    // ...and the head and the tail by the dome, which is the only thing that
    // can take either now. One a beat, the shield under whatever is left.
    const beams: SimEvent[] = [];
    for (let t = 0; t < TPB * CFG.cols && wormOf(world).length > 0; t++) {
      const link = wormOf(world)[0];
      if (link) {
        world.shieldCol = Math.max(0, link.col);
        world.guardTick = world.tick;
      }
      step(world, []);
      beams.push(...world.events.filter((e: SimEvent) => e.type === "crawlerBeam"));
    }
    expect(wormOf(world)).toHaveLength(0);
    // Paid once, at the moment the run emptied — not a beat later off what was
    // left standing, because nothing is ever left standing any more.
    expect(beams).toHaveLength(1);
    expect(world.score - before).toBeGreaterThanOrEqual(CFG.scoreCrawlerBeam);
    expect(hullPercent(world)).toBe(100);
  });

  it("eats into the hull when its head reaches the far wall, and leaves", () => {
    const world = createWorld({ ...CFG }, 0, [crawler(3)]);
    let burrowed = false;
    for (let t = 0; t < TPB * (CFG.cols + 4) * CFG.crawlerStepBeats; t++) {
      step(world, []);
      if (world.events.some((e: SimEvent) => e.type === "crawlerBurrow")) burrowed = true;
    }
    expect(burrowed).toBe(true);
    expect(wormOf(world)).toHaveLength(0);
    expect(hullPercent(world)).toBeLessThan(100);
    // Broken in more than one column: a thing that digs throws material up on
    // both sides of itself.
    expect(new Set(world.scars.map((s) => s.col)).size).toBeGreaterThan(1);
  });

  it("costs the hull nothing at all while it is only walking", () => {
    const world = createWorld({ ...CFG }, 0, [crawler(3)]);
    for (let t = 0; t < TPB * 6; t++) step(world, []);
    expect(wormOf(world).length).toBeGreaterThan(0);
    expect(hullPercent(world)).toBe(100);
  });
});

describe("two devices", () => {
  it("replays deterministically: two runs of one script agree tick for tick", () => {
    const inputs: TimedCommand[] = [
      { tick: TPB * 3, player: 1, command: { kind: "cannonCol", col: 2 } },
      { tick: TPB * 3 + 4, player: 2, command: { kind: "fire", color: "red" } },
      { tick: TPB * 5, player: 2, command: { kind: "shieldCol", col: 4 } },
      { tick: TPB * 5 + 6, player: 1, command: { kind: "guard" } },
      { tick: TPB * 8, player: 1, command: { kind: "cannonCol", col: 5 } },
      { tick: TPB * 8 + 4, player: 2, command: { kind: "fire", color: "cyan" } },
    ];
    const replay = record({
      name: "the crawler",
      seed: 11,
      ticks: TPB * 30,
      queue: [crawler(4)],
      inputs,
    });
    expect(hashWorld(runReplay(replay))).toBe(replay.expectHash!);
  });

  it("hashes a link's three fields, so a worm cannot desync silently", () => {
    const world = onField(3);
    const before = hashWorld(world);
    const link = wormOf(world)[2]!;
    link.crawlerOrder = (link.crawlerOrder ?? 0) + 1;
    expect(hashWorld(world)).not.toBe(before);
  });

  it("carries no crawler field on a body that is not a link", () => {
    const world = createWorld({ ...CFG }, 0, [{ beat: 0, col: 3, kind: "slick", color: "red" }]);
    for (let t = 0; t < TPB + 1; t++) step(world, []);
    const slick = world.creatures[0]!;
    expect(slick.crawlerId).toBeUndefined();
    expect(crawlerLinks(world, crawlerOf(slick))).toHaveLength(0);
  });
});
