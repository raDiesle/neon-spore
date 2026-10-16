import { describe, expect, it } from "bun:test";
import { type GeodeState, type GeodeStep, geodeBoss, geodeLeft } from "../src/geode.js";
import { geodeStruck, geodeVerdict } from "../src/geode-shot.js";
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
import { NOT_FAILED } from "../src/wave-fail.js";

/**
 * THE GEODE's receipts (`sim/geode.ts`, `geode-step.ts`, `geode-shot.ts`):
 * the stone sinks in and lights its cracks under THE SLOW; a bolt only chips
 * it; a beam down a crack in its colour breaks that piece, two stacked at
 * once; the other colour alone loses the wave; a level run out lands on the
 * hull; and the real lance — a held colour over a still cannon — does it all
 * through `lance-burn.ts`.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG };
const TPB = ticksPerBeat(CFG);
const MID = midCol(CFG);

/** The shipped wave's script, written out: sim tests do not read content. */
const SCRIPT: readonly GeodeStep[] = [
  { beats: 20, cracks: [{ at: 2, color: "red" }] },
  {
    beats: 24,
    cracks: [
      { at: -3, color: "cyan" },
      { at: 3, color: "red" },
    ],
  },
  {
    beats: 28,
    cracks: [
      { at: -4, color: "red" },
      { at: 0, color: "cyan" },
      { at: 0, color: "cyan" },
      { at: 4, color: "red" },
    ],
  },
  {
    beats: 22,
    cracks: [
      { at: -1, color: "red" },
      { at: -1, color: "cyan" },
    ],
  },
];

function install(steps: readonly GeodeStep[] = SCRIPT): World {
  const world = createWorld({ ...CFG }, 0);
  startWave(world, 0, [], [], { kind: "geode", steps });
  return world;
}

function geode(world: World): GeodeState {
  const s = geodeBoss(world);
  if (s === null) throw new Error("the wave installed no geode");
  return s;
}

function tick(world: World, cmds: Omit<TimedCommand, "tick">[] = []): string[] {
  step(
    world,
    cmds.map((c) => ({ ...c, tick: world.tick })),
  );
  return world.events.map((e) => e.type);
}

/** Ticks until `done`, at most `beats` beats; every event type seen on the way. */
function runUntil(world: World, done: (w: World) => boolean, beats: number): Set<string> {
  const seen = new Set<string>();
  for (let t = 0; t < beats * TPB && !done(world); t++) for (const e of tick(world)) seen.add(e);
  return seen;
}

/** To the next level's cracks. */
function toCracks(world: World): void {
  runUntil(world, (w) => geode(w).phase === "crack", 12);
}

/** A shot in `col`, a beam when `lance`, met by the geode directly. */
function shot(col: number, color: Color, lance: boolean): Bullet {
  return { id: 999, col, row: 0, subMilli: 0, color, lance, driftMilli: 0, aimMilli: 0 };
}

function beam(world: World, col: number, color: Color): string[] {
  world.events = [];
  geodeStruck(world, shot(col, color, true));
  return world.events.map((e) => e.type);
}

describe("THE GEODE", () => {
  it("sinks in whole, then lights the boulder's crack under THE SLOW", () => {
    const world = install();
    expect(geode(world).phase).toBe("enter");
    expect(geodeVerdict(world, MID + 2, "red", true)).toBeNull();
    const seen = runUntil(world, (w) => geode(w).phase === "crack", CFG.geodeEnterBeats + 2);
    expect(seen.has("geodeCracks")).toBe(true);
    expect(world.slowToBeat).toBeGreaterThan(world.beat);
    expect(geodeLeft(geode(world))).toBe(1);
  });

  it("only chips the stone with a bolt, even down a crack in its colour", () => {
    const world = install();
    toCracks(world);
    expect(geodeVerdict(world, MID + 2, "red", false)).toBe("armour");
    world.events = [];
    expect(geodeStruck(world, shot(MID + 2, "red", false))).toBe(true);
    expect(world.events.map((e) => e.type)).toEqual(["geodeChip"]);
    expect(geodeLeft(geode(world))).toBe(1);
  });

  it("chips the stone with a beam where no crack runs", () => {
    const world = install();
    toCracks(world);
    expect(beam(world, MID - 1, "red")).toEqual(["geodeChip"]);
    expect(world.failTick).toBe(NOT_FAILED);
  });

  it("breaks the boulder with a beam down its crack, and the pieces fly apart", () => {
    const world = install();
    toCracks(world);
    const seen = beam(world, MID + 2, "red");
    expect(seen).toContain("geodeCleave");
    expect(seen).toContain("geodeSplit");
    expect(geode(world).phase).toBe("split");
    expect(geode(world).pieces).toBe(1);
    expect(world.slowToBeat).toBeLessThanOrEqual(world.beat);
  });

  it("takes both stacked pieces with one beam", () => {
    const world = install([SCRIPT[2] as GeodeStep]);
    toCracks(world);
    const seen = beam(world, MID, "cyan");
    expect(seen.filter((t) => t === "geodeCleave")).toHaveLength(2);
    expect(geodeLeft(geode(world))).toBe(2);
  });

  it("is never wrong in a column with both colours, and burns only its own", () => {
    const world = install([SCRIPT[3] as GeodeStep]);
    toCracks(world);
    expect(geodeVerdict(world, MID - 1, "cyan", true)).toBe("target");
    beam(world, MID - 1, "cyan");
    expect(geodeLeft(geode(world))).toBe(1);
    expect(world.failTick).toBe(NOT_FAILED);
    expect(geodeVerdict(world, MID - 1, "cyan", true)).toBe("wrong");
    beam(world, MID - 1, "red");
    expect(geode(world).phase).toBe("spent");
  });

  it("loses the wave on a beam down a crack of the other colour", () => {
    const world = install();
    toCracks(world);
    expect(beam(world, MID + 2, "cyan")).toContain("geodeWrong");
    expect(geodeLeft(geode(world))).toBe(1);
    expect(world.failCause).toBe("wrongColour");
  });

  it("lands on the hull when a level runs out", () => {
    const world = install();
    toCracks(world);
    const scars = world.scars.length;
    const seen = runUntil(world, (w) => geode(w).phase === "struck", 40);
    expect(seen.has("geodeStrike")).toBe(true);
    expect(world.scars.length).toBe(scars + 1);
  });

  it("is cut by the real lance: a colour held over a still cannon", () => {
    const world = install();
    toCracks(world);
    tick(world, [{ player: 1, command: { kind: "cannonCol", col: MID + 2 } }]);
    const hold = {
      player: 2 as const,
      command: { kind: "prime" as const, on: true, color: "red" as const },
    };
    tick(world, [hold]);
    const seen = runUntil(world, (w) => geode(w).phase !== "crack", CFG.lancePrimeBeats + 2);
    expect(seen.has("lanceFull")).toBe(true);
    expect(seen.has("geodeCleave")).toBe(true);
    expect(geode(world).phase).toBe("split");
  });

  it("shatters after the heart, and goes", () => {
    const world = install([SCRIPT[0] as GeodeStep]);
    toCracks(world);
    expect(beam(world, MID + 2, "red")).toContain("geodeShatter");
    const seen = runUntil(world, (w) => w.boss === null, CFG.geodeSpentBeats + 2);
    expect(seen.has("geodeOut")).toBe(true);
  });

  it("plays the same geode to the same hash", () => {
    const run = () => {
      const world = install();
      toCracks(world);
      beam(world, MID + 2, "red");
      for (let t = 0; t < TPB * 3; t++) tick(world);
      return hashWorld(world);
    };
    expect(run()).toBe(run());
  });
});
