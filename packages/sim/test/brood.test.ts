import { describe, expect, it } from "bun:test";
import {
  type BroodState,
  type BroodStep,
  broodBoss,
  broodLobes,
  broodLobesAll,
} from "../src/brood.js";
import { broodAlong, broodStruck } from "../src/brood-step.js";
import {
  type Bullet,
  type Color,
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  midCol,
  type SimConfig,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";

/**
 * THE BROOD's receipts, one rule a test (`sim/brood.ts`): a bud grows over
 * its column once the sac is down; a bolt of its colour pops it and the sac
 * loses a lobe; the other colour loses the wave; the hide takes a bolt and
 * does nothing; a ripe bud drops as the slick or bulb it was, from its own
 * row, and grows again; and the last bud popped beats it.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG };
const TPB = ticksPerBeat(CFG);
const MID = midCol(CFG);

/** The shipped wave's script, written out: sim tests do not read content. */
const SCRIPT: readonly BroodStep[] = [
  { buds: [{ offset: 0, color: "red" }], ripenBeats: 10 },
  { buds: [{ offset: -2, color: "cyan" }], ripenBeats: 10 },
  { buds: [{ offset: 3, color: "red" }], ripenBeats: 9 },
  {
    buds: [
      { offset: -3, color: "red" },
      { offset: 2, color: "cyan" },
    ],
    ripenBeats: 12,
  },
  {
    buds: [
      { offset: 1, color: "cyan" },
      { offset: -1, color: "red" },
    ],
    ripenBeats: 12,
  },
  {
    buds: [
      { offset: -4, color: "cyan" },
      { offset: 0, color: "red" },
      { offset: 4, color: "cyan" },
    ],
    ripenBeats: 14,
  },
];

function install(steps: readonly BroodStep[] = SCRIPT): World {
  const world = createWorld({ ...CFG }, 0);
  startWave(world, 0, [], [], { kind: "brood", steps });
  return world;
}

function brood(world: World): BroodState {
  const s = broodBoss(world);
  if (s === null) throw new Error("the wave installed no brood");
  return s;
}

function tick(world: World, cmds: Omit<TimedCommand, "tick">[] = []): string[] {
  step(
    world,
    cmds.map((c) => ({ ...c, tick: world.tick })),
  );
  return world.events.map((e) => e.type);
}

function runUntil(world: World, until: (w: World) => boolean, beats = 80): Set<string> {
  const seen = new Set<string>();
  const end = world.tick + TPB * beats;
  while (!until(world)) {
    if (world.tick >= end) throw new Error("the brood never got there");
    for (const t of tick(world)) seen.add(t);
  }
  return seen;
}

const growing = (w: World) => brood(w).phase === "grow";

function shot(col: number, color: Color): Bullet {
  return { id: 999, col, row: 20, subMilli: 0, color, lance: false, driftMilli: 0, aimMilli: 0 };
}

function strike(world: World, col: number, color: Color): string[] {
  const before = world.events.length;
  broodStruck(world, shot(col, color));
  return world.events.slice(before).map((e) => e.type);
}

describe("THE BROOD", () => {
  it("installs a lobe for every bud to come, and grows the first once it is down", () => {
    const world = install();
    expect(brood(world).phase).toBe("enter");
    expect(broodLobesAll(brood(world))).toBe(10);
    const seen = runUntil(world, growing);
    expect(seen.has("broodBud")).toBe(true);
    expect(brood(world).buds).toEqual([
      { col: MID, color: "red", bornBeat: world.beat, popped: false },
    ]);
  });

  it("meets a bolt on the bud's row under the sac, and not past its edge", () => {
    const world = install();
    runUntil(world, growing);
    const row = CFG.broodBudRow * 1000;
    expect(broodAlong(world, shot(MID, "red"), row + 500, row - 500)).toBe(row);
    expect(broodAlong(world, shot(MID + CFG.broodSpan + 1, "red"), row + 500, row - 500)).toBe(-1);
  });

  it("pops a bud shot in its colour, a lobe gone and the next step after the rest", () => {
    const world = install();
    runUntil(world, growing);
    expect(strike(world, MID, "red")).toEqual(["broodPop"]);
    expect(broodLobes(brood(world))).toBe(9);
    expect(brood(world).phase).toBe("rest");
    runUntil(world, growing, CFG.broodRestBeats + 1);
    expect(brood(world).buds[0]?.col).toBe(MID - 2);
  });

  it("loses the wave on a bud shot in the other colour", () => {
    const world = install();
    runUntil(world, growing);
    expect(strike(world, MID, "cyan")).toContain("broodSpoil");
    expect(world.failCause).toBe("wrongColour");
    expect(brood(world).buds[0]?.popped).toBe(false);
  });

  it("takes a bolt into the hide and does nothing", () => {
    const world = install();
    runUntil(world, growing);
    const before = hashWorld(world);
    expect(strike(world, MID + 2, "red")).toEqual(["broodHide"]);
    expect(broodLobes(brood(world))).toBe(10);
    expect(world.failCause).not.toBe("wrongColour");
    expect(hashWorld(world)).toBe(before);
  });

  it("drops a ripe bud from its own row as the body it was, and grows it again", () => {
    const world = install();
    runUntil(world, growing);
    const born = world.beat;
    const seen = runUntil(world, (w) => w.beat >= born + 10);
    expect(seen.has("broodDrop")).toBe(true);
    const body = world.creatures.find((c) => c.col === MID);
    expect(body?.kind).toBe("slick");
    expect(body?.color).toBe("red");
    expect(body?.row).toBeLessThanOrEqual(CFG.broodBudRow + 1);
    expect(brood(world).dropped).toBe(1);
    expect(broodLobes(brood(world))).toBe(10);
    const again = runUntil(world, (w) => w.beat >= born + 10 + CFG.broodRegrowBeats);
    expect(again.has("broodBud")).toBe(true);
    expect(strike(world, MID, "red")).toEqual(["broodPop"]);
  });

  it("is beaten by the last bud popped, and goes once it has stood", () => {
    const world = install(SCRIPT.slice(5));
    runUntil(world, growing);
    expect(strike(world, MID - 4, "cyan")).toEqual(["broodPop"]);
    expect(strike(world, MID, "red")).toEqual(["broodPop"]);
    expect(strike(world, MID + 4, "cyan")).toEqual(["broodPop", "broodSpent"]);
    expect(broodLobes(brood(world))).toBe(0);
    const seen = runUntil(world, (w) => w.boss === null, CFG.broodSpentBeats + 2);
    expect(seen.has("broodOut")).toBe(true);
  });

  it("is popped by the cannon's own bolt, fired up the bud's column", () => {
    const world = install(SCRIPT.slice(0, 1));
    runUntil(world, growing);
    tick(world, [{ player: 1, command: { kind: "cannonCol", col: MID } }]);
    const seen = new Set(tick(world, [{ player: 2, command: { kind: "fire", color: "red" } }]));
    for (const t of runUntil(world, (w) => brood(w).phase !== "grow", 6)) seen.add(t);
    expect(seen.has("broodPop")).toBe(true);
  });

  it("fingerprints two worlds given the same presses the same", () => {
    const a = install();
    const b = install();
    for (const w of [a, b]) {
      runUntil(w, growing);
      strike(w, MID, "red");
      for (let t = 0; t < TPB * 20; t++) tick(w);
    }
    expect(hashWorld(a)).toBe(hashWorld(b));
  });
});
