import { describe, expect, it } from "bun:test";
import { type BroodState, type BroodStep, broodBoss, broodNextLurch } from "../src/brood.js";
import { broodAlong, broodStruck } from "../src/brood-step.js";
import {
  type Bullet,
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  midCol,
  type SimConfig,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "../src/index.js";

/**
 * THE BROOD's laying and swaying, one rule a test (`sim/brood-lay.ts`): a body
 * is seen inside the sac before it is laid, over a column no bud hangs in, and
 * falls from the bud row; the sac shudders, then lurches a column — left,
 * middle, right, middle — its buds and the bodies inside it with it, and a
 * bolt is met under where it stands now; beaten, it lays nothing more.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG };
const TPB = ticksPerBeat(CFG);
const MID = midCol(CFG);

function install(steps: readonly BroodStep[], seed = 0): World {
  const world = createWorld({ ...CFG }, seed);
  startWave(world, 0, [], [], { kind: "brood", steps });
  return world;
}

function brood(world: World): BroodState {
  const s = broodBoss(world);
  if (s === null) throw new Error("the wave installed no brood");
  return s;
}

/** Beats stepped until `until`, every event type seen on the way. */
function runUntil(world: World, until: (w: World) => boolean, beats = 80): string[] {
  const seen: string[] = [];
  const end = world.tick + TPB * beats;
  while (!until(world)) {
    if (world.tick >= end) throw new Error("the brood never got there");
    step(world, []);
    for (const e of world.events) seen.push(e.type);
  }
  return seen;
}

const growing = (w: World) => brood(w).phase === "grow";

function shot(col: number): Bullet {
  return {
    id: 999,
    col,
    row: 20,
    subMilli: 0,
    color: "red",
    lance: false,
    driftMilli: 0,
    aimMilli: 0,
  };
}

const LAYS: BroodStep[] = [{ buds: [{ offset: 0, color: "red" }], ripenBeats: 40, layEvery: 2 }];
const SWAYS: BroodStep[] = [{ buds: [{ offset: 2, color: "red" }], ripenBeats: 40, swayEvery: 4 }];

describe("THE BROOD lays", () => {
  it("grows a body inside first, then lays it from the bud row over a column no bud hangs in", () => {
    const world = install(LAYS);
    runUntil(world, growing);
    runUntil(world, (w) => brood(w).eggs.length > 0, 4);
    const egg = brood(world).eggs[0];
    if (egg === undefined) throw new Error("no egg");
    expect(egg.col).not.toBe(MID);
    expect(Math.abs(egg.col - MID)).toBeLessThanOrEqual(CFG.broodSpan);
    expect(egg.layBeat - world.beat).toBe(CFG.broodLayLeadBeats);
    expect(world.creatures).toEqual([]);
    const seen = runUntil(world, (w) => brood(w).laid > 0, CFG.broodLayLeadBeats + 1);
    expect(seen).toContain("broodLay");
    const body = world.creatures.find((c) => c.col === egg.col);
    expect(body?.color).toBe(egg.color);
    expect(body?.kind).toBe(egg.color === "red" ? "slick" : "bulb");
    expect(body?.row).toBeLessThanOrEqual(CFG.broodBudRow + 1);
  });

  it("lays the same bodies in the same columns for the same seed, and fingerprints them", () => {
    const a = install(LAYS, 7);
    const b = install(LAYS, 7);
    for (const w of [a, b]) runUntil(w, (x) => brood(x).laid >= 3);
    expect(a.creatures.map((c) => [c.col, c.color])).toEqual(
      b.creatures.map((c) => [c.col, c.color]),
    );
    expect(hashWorld(a)).toBe(hashWorld(b));
  });

  it("lays nothing more once it is beaten", () => {
    const world = install(LAYS);
    runUntil(world, (w) => brood(w).eggs.length > 0);
    broodStruck(world, shot(MID));
    expect(brood(world).phase).toBe("spent");
    expect(brood(world).eggs).toEqual([]);
  });
});

describe("THE BROOD sways", () => {
  it("shudders, then lurches a column with its bud, and is met where it stands now", () => {
    const world = install(SWAYS);
    runUntil(world, growing);
    const lurch = broodNextLurch(world, brood(world));
    expect(lurch).toBe(world.beat + 4);
    const seen = runUntil(world, (w) => brood(w).lurches > 0, 6);
    expect(seen.indexOf("broodShudder")).toBeLessThan(seen.indexOf("broodLurch"));
    expect(brood(world).sway).toBe(-1);
    expect(brood(world).buds[0]?.col).toBe(MID + 1);
    const row = CFG.broodBudRow * 1000;
    const edge = MID - 1 - CFG.broodSpan;
    expect(broodAlong(world, shot(edge), row + 500, row - 500)).toBe(row);
    expect(broodAlong(world, shot(MID + CFG.broodSpan), row + 500, row - 500)).toBe(-1);
  });

  it("goes left, back to the middle, right and back", () => {
    const world = install(SWAYS);
    runUntil(world, growing);
    const at: number[] = [];
    for (let i = 1; i <= 4; i++) {
      runUntil(world, (w) => brood(w).lurches >= i, 6);
      at.push(brood(world).sway);
    }
    expect(at).toEqual([-1, 0, 1, 0]);
    expect(brood(world).buds[0]?.col).toBe(MID + 2);
  });
});
