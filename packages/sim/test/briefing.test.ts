import { describe, expect, it } from "bun:test";
import {
  ackBriefing,
  BRIEFING_SUBJECTS,
  briefingHolds,
  createWorld,
  currentBriefing,
  DEFAULT_CONFIG,
  forgetBriefings,
  hashWorld,
  MAX_BRIEFING_SUBJECTS,
  openBriefings,
  type PodEntry,
  type SimConfig,
  type SpawnEntry,
  startWave,
  step,
  subjectIndex,
  type TimedCommand,
  type World,
} from "../src/index.js";

/**
 * The card is the one thing in the game that can stop the world, so the two
 * questions here are the two that break a room: does it stop on both devices,
 * and does it start again only when both of them say so.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG, briefings: true };

const SLICK: SpawnEntry[] = [{ beat: 0, col: 3, kind: "slick", color: "red" }];
const ROCK: SpawnEntry[] = [{ beat: 0, col: 3, kind: "meteor", color: null }];

function open(queue: SpawnEntry[] = SLICK, pods: PodEntry[] = []): World {
  const world = createWorld(CFG, 1);
  startWave(world, 0, queue, pods);
  return world;
}

/** One tick's worth of a seat tapping the card. */
function tap(world: World, ...players: (1 | 2)[]): TimedCommand[] {
  return players.map((player) => ({ tick: world.tick, player, command: { kind: "brief" } }));
}

function dismiss(world: World): void {
  while (briefingHolds(world)) step(world, tap(world, 1, 2));
}

describe("the subject list", () => {
  it("fits in the bitmask the met set is", () => {
    expect(BRIEFING_SUBJECTS.length).toBeLessThanOrEqual(MAX_BRIEFING_SUBJECTS);
  });

  it("names each subject once", () => {
    expect(new Set(BRIEFING_SUBJECTS).size).toBe(BRIEFING_SUBJECTS.length);
  });
});

describe("a wave the pair has never seen", () => {
  it("opens on the split before anything the wave contains", () => {
    const world = open();
    expect(currentBriefing(world)).toBe("opening");
    expect(world.brief.due).toEqual([subjectIndex("opening"), subjectIndex("slick")]);
  });

  it("holds the field until the cards are gone", () => {
    const world = open();
    for (let i = 0; i < 400; i++) step(world, []);
    expect(world.beat).toBe(0);
    expect(world.creatures).toHaveLength(0);
    // The clock is not what stands still — a press is scheduled ticks ahead,
    // so a frozen tick counter could never receive its own dismissal.
    expect(world.tick).toBe(400);
  });

  it("takes both seats to put one card away", () => {
    const world = open();
    step(world, tap(world, 1));
    expect(currentBriefing(world)).toBe("opening");
    step(world, tap(world, 1));
    expect(currentBriefing(world)).toBe("opening");
    step(world, tap(world, 2));
    expect(currentBriefing(world)).toBe("slick");
  });

  it("plays the wave once the last card is gone", () => {
    const world = open();
    dismiss(world);
    for (let i = 0; i < 400; i++) step(world, []);
    expect(world.beat).toBeGreaterThan(0);
    expect(world.creatures.length + world.score).toBeGreaterThan(0);
  });
});

describe("the met set", () => {
  it("does not teach the same creature twice", () => {
    const world = open();
    dismiss(world);
    startWave(world, 2, SLICK);
    expect(briefingHolds(world)).toBe(false);
  });

  it("still teaches something new in a later wave", () => {
    const world = open();
    dismiss(world);
    startWave(world, 3, ROCK);
    expect(currentBriefing(world)).toBe("meteor");
  });

  it("counts a pod by what the pod gives", () => {
    const world = open(SLICK, [{ beat: 0, col: 3, row: 3, kind: "ward" }]);
    expect(world.brief.due).toContain(subjectIndex("ward"));
    expect(world.brief.due).not.toContain(subjectIndex("mend"));
  });

  it("counts the boss a wave installs", () => {
    const world = open();
    dismiss(world);
    startWave(world, 15, [], [], { kind: "warden" });
    expect(currentBriefing(world)).toBe("warden");
  });

  it("remembers a card across a wave abandoned half-read", () => {
    const world = open();
    step(world, tap(world, 1, 2)); // the opening, and only the opening
    expect(currentBriefing(world)).toBe("slick");
    startWave(world, 1, SLICK);
    expect(world.brief.due).toEqual([subjectIndex("slick")]);
  });

  it("is forgotten only when asked", () => {
    const world = open();
    dismiss(world);
    forgetBriefings(world);
    startWave(world, 0, SLICK);
    expect(currentBriefing(world)).toBe("opening");
  });
});

describe("an authored card overrides the derivation", () => {
  const BOTH: SpawnEntry[] = [
    { beat: 0, col: 3, kind: "slick", color: "red" },
    { beat: 4, col: 5, kind: "meteor", color: null },
  ];

  it("raises only the named subject, not everything the wave introduces", () => {
    const world = createWorld(CFG, 1);
    openBriefings(world, BOTH, [], null, "meteor");
    expect(world.brief.due).toEqual([subjectIndex("opening"), subjectIndex("meteor")]);
  });

  it("behaves exactly as derivation when nothing is named", () => {
    const world = createWorld(CFG, 1);
    openBriefings(world, BOTH, [], null);
    expect(world.brief.due).toEqual([
      subjectIndex("opening"),
      subjectIndex("slick"),
      subjectIndex("meteor"),
    ]);
  });

  it("drops a name for something the wave does not contain, rather than inventing it", () => {
    const world = createWorld(CFG, 1);
    openBriefings(world, [{ beat: 0, col: 3, kind: "slick", color: "red" }], [], null, "meteor");
    expect(world.brief.due).toEqual([subjectIndex("opening")]);
  });

  it("cannot resurrect a subject the pair has already met", () => {
    const world = createWorld(CFG, 1);
    openBriefings(world, BOTH, [], null);
    dismiss(world);
    openBriefings(world, BOTH, [], null, "slick");
    expect(world.brief.due).toEqual([]);
  });

  it("leaves the other new thing due for whenever it next appears", () => {
    const world = createWorld(CFG, 1);
    openBriefings(world, BOTH, [], null, "meteor");
    dismiss(world);
    openBriefings(world, BOTH, [], null);
    expect(world.brief.due).toEqual([subjectIndex("slick")]);
  });
});

describe("two devices", () => {
  it("disagreeing about the card disagree about the fingerprint", () => {
    const a = open();
    const b = open();
    expect(hashWorld(a)).toBe(hashWorld(b));
    step(a, tap(a, 1));
    step(b, []);
    expect(hashWorld(a)).not.toBe(hashWorld(b));
  });

  it("that both dismissed it agree again", () => {
    const a = open();
    const b = open();
    step(a, tap(a, 1));
    step(a, tap(a, 2));
    step(b, tap(b, 2));
    step(b, tap(b, 1));
    expect(hashWorld(a)).toBe(hashWorld(b));
  });
});

describe("the field behind the card", () => {
  it("takes no command but the dismissal", () => {
    const world = open();
    const col = world.cannonCol;
    step(world, [{ tick: 0, player: 1, command: { kind: "cannonCol", col: 0 } }]);
    expect(world.cannonCol).toBe(col);
    expect(world.bullets).toHaveLength(0);
  });

  it("is not opened at all when the config leaves it off", () => {
    const world = createWorld(DEFAULT_CONFIG, 1);
    startWave(world, 0, SLICK);
    expect(briefingHolds(world)).toBe(false);
    expect(world.brief.met).toBe(0);
  });
});

describe("ackBriefing", () => {
  it("does nothing when no card is up", () => {
    const world = createWorld(DEFAULT_CONFIG, 1);
    ackBriefing(world, 1);
    expect(world.brief).toEqual({ due: [], ack: 0, met: 0 });
  });
});

describe("startWave threads an authored card through to play", () => {
  const BOTH2: SpawnEntry[] = [
    { beat: 0, col: 3, kind: "slick", color: "red" },
    { beat: 4, col: 5, kind: "meteor", color: null },
  ];

  it("is bit-for-bit unchanged when no card is named", () => {
    const withoutArg = createWorld(CFG, 1);
    startWave(withoutArg, 0, BOTH2, [], null);
    const withUndefined = createWorld(CFG, 1);
    startWave(withUndefined, 0, BOTH2, [], null, undefined);
    expect(hashWorld(withoutArg)).toBe(hashWorld(withUndefined));
    expect(withoutArg.brief).toEqual(withUndefined.brief);
  });

  it("reaches play: an authored card changes what the wave opens on", () => {
    const derived = createWorld(CFG, 1);
    startWave(derived, 0, BOTH2, [], null);
    expect(derived.brief.due).toEqual([
      subjectIndex("opening"),
      subjectIndex("slick"),
      subjectIndex("meteor"),
    ]);

    const overridden = createWorld(CFG, 1);
    startWave(overridden, 0, BOTH2, [], null, "meteor");
    expect(overridden.brief.due).toEqual([subjectIndex("opening"), subjectIndex("meteor")]);
  });

  it("keeps catalogue order under an override — membership changes, order does not", () => {
    const world = createWorld(CFG, 1);
    // meteor (a later index) is authored ahead of slick in the wave's own
    // entries, and named as the card, yet the due list still comes out
    // lowest-index-first — the same `sort` runs whether or not `card` is set.
    startWave(
      world,
      0,
      [
        { beat: 0, col: 3, kind: "meteor", color: null },
        { beat: 4, col: 5, kind: "slick", color: "red" },
      ],
      [],
      null,
      "slick",
    );
    expect(world.brief.due).toEqual([subjectIndex("opening"), subjectIndex("slick")]);
  });
});
