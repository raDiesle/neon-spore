import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import {
  createWorld,
  type GorgeLevel,
  type GorgeState,
  gorgeBoss,
  gorgeBottom,
  gorgeColOf,
  gorgeDue,
  midCol,
  startWave,
  type World,
} from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE GORGE's readings** (`render/src/boss-cue-read-n.ts`): which bubble is
 * the pilot's to pick and say, so on a row in any order he is told nothing;
 * where the column is not his choice — the one due on an ordered row, the
 * middle on a ring — `MOVE` stands on the cannon; `TAP` stands on a ring's
 * shut bottom bubble and outranks it; and the navigator is told `FIRE` only
 * over the bubble the cannon's own column can feed.
 *
 * The states are set rather than played into: the swallow, the spit, the
 * turn and the tap are proved in `sim/test/gorge*.test.ts`.
 */

beforeAll(installCanvasGlobals);

const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

const ROW: GorgeLevel = {
  intakes: 4,
  ordered: false,
  ring: false,
  mixed: 0,
  needMin: 1,
  needMax: 3,
};
const ORDERED: GorgeLevel = { ...ROW, ordered: true };
const RING: GorgeLevel = {
  intakes: 5,
  ordered: false,
  ring: true,
  mixed: 0,
  needMin: 2,
  needMax: 3,
};

function opened(level: GorgeLevel): World {
  const world = createWorld(CFG, 5);
  startWave(world, waveWith("gorge"), [], [], { kind: "gorge", levels: [level] });
  return world;
}

function cue(world: World, role: ViewRole): BossCue | null {
  const l = LAYOUT[role];
  return bossCue(l, world, 0, () => l.hullY);
}

function word(world: World, role: ViewRole): string | null {
  return cue(world, role)?.word ?? null;
}

function installed(world: World): GorgeState {
  const g = gorgeBoss(world);
  if (g === null) throw new Error("the gorge wave installed no gorge");
  return g;
}

/** The column bubble `i` is fed up. */
const colOf = (g: GorgeState, i: number): number => gorgeColOf(CFG, g, i);

/** A column that is not this one, wherever in the field it sits. */
const other = (col: number): number => (col === 0 ? 1 : col - 1);

describe("THE GORGE on a row in any order", () => {
  it("tells the pilot nothing: which bubble is his to pick", () => {
    const world = opened(ROW);
    const g = installed(world);
    world.cannonCol = other(colOf(g, 0));
    expect(word(world, "p1")).toBeNull();
    world.cannonCol = colOf(g, 2);
    expect(word(world, "p1")).toBeNull();
  });

  it("tells the navigator to fire up the cannon's column while the bubble there wants", () => {
    const world = opened(ROW);
    const g = installed(world);
    world.cannonCol = colOf(g, 2);
    expect(word(world, "p2")).toBe("FIRE");
    expect(cue(world, "p2")?.kind).toBe("PRESS");
    const k = g.intakes[2];
    if (k === undefined) throw new Error("no bubble 2");
    k.gotRed = k.needRed;
    k.gotCyan = k.needCyan;
    expect(word(world, "p2")).toBeNull();
  });
});

describe("THE GORGE on an ordered row", () => {
  it("tells neither seat anything till the cannon is under the bubble due", () => {
    const world = opened(ORDERED);
    const g = installed(world);
    const due = g.intakes.findIndex((_, i) => gorgeDue(g, i));
    const off = g.intakes.findIndex((_, i) => !gorgeDue(g, i));
    world.cannonCol = colOf(g, off);
    // No MOVE on the cannon since 5 October 2026 — the owner, the shoot
    // indicator is enough.
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
    world.cannonCol = colOf(g, due);
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBe("FIRE");
  });
});

describe("THE GORGE on a ring", () => {
  it("asks the pilot to tap the shut bottom bubble, before the column", () => {
    const world = opened(RING);
    installed(world);
    world.cannonCol = other(midCol(CFG));
    expect(word(world, "p1")).toBe("TAP");
    expect(cue(world, "p1")?.why).toBe("TO OPEN IT");
    // Shut, it takes no shot: she is told nothing even with the cannon under it.
    world.cannonCol = midCol(CFG);
    expect(word(world, "p2")).toBeNull();
  });

  it("gives her the shot in the middle once it is open, and him no word to get there", () => {
    const world = opened(RING);
    const g = installed(world);
    const k = g.intakes[gorgeBottom(g)];
    if (k === undefined) throw new Error("the ring has no bottom");
    k.taps = CFG.gorgeOpenTaps;
    world.cannonCol = other(midCol(CFG));
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
    world.cannonCol = midCol(CFG);
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBe("FIRE");
    expect(cue(world, "p2")?.why).toBe("TO FEED IT");
  });
});

describe("THE GORGE between levels and after", () => {
  it("says nothing at all", () => {
    for (const set of [(g: GorgeState) => (g.clearBeat = 0), (g: GorgeState) => (g.outBeat = 0)]) {
      const world = opened(RING);
      set(installed(world));
      world.cannonCol = other(midCol(CFG));
      expect(word(world, "p1")).toBeNull();
      expect(word(world, "p2")).toBeNull();
    }
  });
});
