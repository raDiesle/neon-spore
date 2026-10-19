import { describe, expect, it } from "bun:test";
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
import {
  type MothState,
  type MothStep,
  mothBoss,
  mothLitSpots,
  mothLobes,
  mothLobesAll,
} from "../src/moth.js";
import { mothAlong, mothStruck } from "../src/moth-shot.js";

/**
 * THE MOTH's receipts, one rule a test (`sim/moth.ts`): it comes in and
 * lights its spots; it turns to a cannon only once the cannon stands still;
 * over the cannon it sinks and lands, a hull hit, unless the cannon moves; a
 * red bolt up a spot's column tears that wing; elsewhere a bolt does nothing;
 * another colour on a lit part loses the wave; a wings step may shed a slick;
 * on the belly step it hops away, opens its belly only as it sinks, and is
 * beaten by the last hit.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG };
const TPB = ticksPerBeat(CFG);
const MID = midCol(CFG);

/** The shipped wave's script, written out: sim tests do not read content. */
const SCRIPT: readonly MothStep[] = [
  { kind: "wings", spots: [-2, 2] },
  { kind: "wings", spots: [-2, 2, -1, 1], inTurn: true },
  { kind: "wings", spots: [-2, -1, 1, 2], dustEvery: 4 },
  { kind: "belly", hits: 4, hopEvery: 6 },
];

function install(steps: readonly MothStep[] = SCRIPT): World {
  const world = createWorld({ ...CFG }, 0);
  startWave(world, 0, [], [], { kind: "moth", steps });
  return world;
}

function moth(world: World): MothState {
  const s = mothBoss(world);
  if (s === null) throw new Error("the wave installed no moth");
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
    if (world.tick >= end) throw new Error("the moth never got there");
    for (const t of tick(world)) seen.add(t);
  }
  return seen;
}

/** Beats of the world run, whatever happens in them. */
function runBeats(world: World, beats: number): Set<string> {
  const to = world.beat + beats;
  return runUntil(world, (w) => w.beat >= to, beats + 2);
}

const lit = (w: World) => moth(w).phase === "flit";

function aim(world: World, col: number): void {
  tick(world, [{ player: 1, command: { kind: "cannonCol", col } }]);
}

function shot(col: number, color: Color): Bullet {
  return { id: 999, col, row: 20, subMilli: 0, color, lance: false, driftMilli: 0, aimMilli: 0 };
}

function strike(world: World, col: number, color: Color = "red"): string[] {
  const before = world.events.length;
  mothStruck(world, shot(col, color));
  return world.events.slice(before).map((e) => e.type);
}

describe("THE MOTH", () => {
  it("comes in over the middle with a part for every spot and hit, and lights its first spots", () => {
    const world = install();
    expect(moth(world).phase).toBe("enter");
    expect(mothLobesAll(moth(world))).toBe(14);
    const seen = runUntil(world, lit);
    expect(seen.has("mothStep")).toBe(true);
    expect(moth(world).centre).toBe(MID);
    expect(moth(world).spots).toEqual([-2, 2]);
  });

  it("turns to the cannon only once it has stood still, a column at a time", () => {
    const world = install();
    runUntil(world, lit);
    aim(world, MID + 2);
    runBeats(world, CFG.mothNoticeBeats - 1);
    expect(moth(world).centre).toBe(MID);
    const seen = runUntil(world, (w) => moth(w).centre === MID + 2, 4);
    expect(seen.has("mothFlit")).toBe(true);
  });

  it("sinks over a cannon left under it and lands on it, the hull hit", () => {
    const world = install();
    runUntil(world, lit);
    expect(world.cannonCol).toBe(MID);
    const seen = runUntil(world, (w) => moth(w).landed > 0, CFG.mothLandBeats + 2);
    expect(seen.has("mothSettle")).toBe(true);
    expect(seen.has("mothLand")).toBe(true);
    expect(seen.has("breach")).toBe(true);
  });

  it("breaks off and rises the moment the cannon moves out from under it", () => {
    const world = install();
    runUntil(world, lit);
    runUntil(world, (w) => moth(w).settle >= 2, 4);
    aim(world, MID + 3);
    runBeats(world, 1);
    expect(moth(world).settle).toBe(0);
    expect(moth(world).landed).toBe(0);
  });

  it("meets a bolt on its row under its wings, lower as it sinks, and not past their tips", () => {
    const world = install();
    runUntil(world, lit);
    const row = CFG.mothRow * 1000;
    expect(mothAlong(world, shot(MID + 2, "red"), row + 500, row - 500)).toBe(row);
    expect(mothAlong(world, shot(MID + 3, "red"), row + 500, row - 500)).toBe(-1);
    runUntil(world, (w) => moth(w).settle >= 2, 4);
    const low = row + 2 * CFG.mothSinkMilli;
    expect(mothAlong(world, shot(MID, "red"), low + 500, low - 500)).toBe(low);
  });

  it("tears a wing on a red bolt up its spot, and rests once both are torn", () => {
    const world = install();
    runUntil(world, lit);
    expect(strike(world, MID - 2)).toEqual(["mothTear"]);
    expect(mothLobes(moth(world))).toBe(13);
    expect(strike(world, MID + 2)).toEqual(["mothTear"]);
    expect(moth(world).phase).toBe("rest");
    runUntil(world, lit, CFG.mothRestBeats + 1);
    expect(moth(world).spots).toEqual([-2, 2, -1, 1]);
  });

  it("lights spots taken in turn one at a time, the next once the last is torn", () => {
    const world = install(SCRIPT.slice(1, 2));
    runUntil(world, lit);
    expect(mothLitSpots(moth(world))).toEqual([-2]);
    expect(strike(world, MID + 2)).toEqual(["mothHide"]);
    expect(strike(world, MID - 2)).toEqual(["mothTear"]);
    expect(mothLitSpots(moth(world))).toEqual([2]);
    expect(strike(world, MID + 2)).toEqual(["mothTear"]);
  });

  it("takes a bolt where nothing is lit and does nothing", () => {
    const world = install();
    runUntil(world, lit);
    const before = hashWorld(world);
    expect(strike(world, MID + 1)).toEqual(["mothHide"]);
    expect(strike(world, MID, "cyan")).toEqual(["mothHide"]);
    expect(mothLobes(moth(world))).toBe(14);
    expect(hashWorld(world)).toBe(before);
  });

  it("loses the wave on a lit part shot in another colour", () => {
    const world = install();
    runUntil(world, lit);
    expect(strike(world, MID + 2, "cyan")).toContain("mothSpoil");
    expect(world.failCause).toBe("wrongColour");
    expect(moth(world).spots).toEqual([-2, 2]);
  });

  it("sheds a slick off a wing on a dusty step, falling from under its row", () => {
    const world = install(SCRIPT.slice(2, 3));
    runUntil(world, lit);
    aim(world, MID + 1);
    const seen = runBeats(world, 7);
    expect(seen.has("mothDust")).toBe(true);
    const body = world.creatures[0];
    expect(body?.kind).toBe("slick");
    expect(body?.color).toBe("red");
    expect(moth(world).shed).toBe(1);
  });

  it("hops away on the belly step, its belly shut until it sinks over the cannon", () => {
    const world = install(SCRIPT.slice(3));
    runUntil(world, lit);
    aim(world, 0);
    const seen = runBeats(world, 7);
    expect(seen.has("mothFlit")).toBe(true);
    const at = moth(world).centre;
    expect(strike(world, at)).toEqual(["mothHide"]);
    aim(world, at);
    runUntil(world, (w) => moth(w).settle > 0, CFG.mothNoticeBeats + 2);
    expect(strike(world, at)).toEqual(["mothBelly", "mothFlit"]);
    expect(moth(world).centre).not.toBe(at);
    expect(moth(world).settle).toBe(0);
  });

  it("is beaten by the last belly hit, and goes once it has hung", () => {
    const world = install([{ kind: "belly", hits: 1, hopEvery: 6 }]);
    runUntil(world, lit);
    runUntil(world, (w) => moth(w).settle > 0, CFG.mothNoticeBeats + 3);
    expect(strike(world, MID)).toEqual(["mothBelly", "mothSpent"]);
    expect(mothLobes(moth(world))).toBe(0);
    const seen = runUntil(world, (w) => w.boss === null, CFG.mothSpentBeats + 2);
    expect(seen.has("mothOut")).toBe(true);
  });

  it("is torn by the cannon's own bolt, fired up the spot's column", () => {
    const world = install(SCRIPT.slice(0, 1));
    runUntil(world, lit);
    aim(world, MID + 2);
    const seen = new Set(tick(world, [{ player: 2, command: { kind: "fire", color: "red" } }]));
    for (const t of runBeats(world, 3)) seen.add(t);
    expect(seen.has("mothTear")).toBe(true);
  });

  it("fingerprints two worlds given the same presses the same", () => {
    const a = install();
    const b = install();
    for (const w of [a, b]) {
      runUntil(w, lit);
      aim(w, MID + 2);
      strike(w, MID + 2);
      for (let t = 0; t < TPB * 20; t++) tick(w);
    }
    expect(hashWorld(a)).toBe(hashWorld(b));
  });
});
