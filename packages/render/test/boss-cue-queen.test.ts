import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  type Creature,
  createWorld,
  type QueenState,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { computeLayout, type Layout, tileCX, type ViewRole } from "../src/layout.js";
import { queenMarkCenter } from "../src/queen-figure.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **BULB QUEEN's four words**, and the one thing they may not do.
 *
 * She is the boss whose whole difficulty is a column the navigator can see and
 * the pilot cannot, so the case that matters most here is a *negative* one:
 * the pilot is never given a mark on either of her two marks, in any state,
 * because a frame is a place and the place is the answer (`boss-cue.ts`,
 * `docs/decisions.md` #34). The readings are asked directly, for
 * `boss-cue.test.ts`'s reason: what is at stake is which seat is told and what
 * the word contains, and a colour log cannot see either.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

function opened(beats = 1): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("queen");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < beats * TPB; i++) step(world, []);
  return world;
}

function queen(world: World): QueenState {
  const boss = world.boss;
  if (boss === null || boss.kind !== "queen") throw new Error("the wave installed no queen");
  return boss;
}

function cue(world: World, role: ViewRole): BossCue | null {
  const l = LAYOUT[role];
  return bossCue(l, world, 0, () => l.hullY);
}

const word = (world: World, role: ViewRole): string | null => cue(world, role)?.word ?? null;

/** Her body, which every mark below is measured against. */
function body(world: World): Creature {
  const found = world.creatures.find((c) => c.kind === "queen");
  if (found === undefined) throw new Error("she is not on the field");
  return found;
}

/** Nothing is falling, so only the bloom speaks. */
function clearTorches(world: World): void {
  world.creatures = world.creatures.filter((c) => c.kind !== "torch");
}

describe("BULB QUEEN", () => {
  it("tells the navigator to fire, on the mark that is really open", () => {
    const world = opened();
    clearTorches(world);
    const q = queen(world);
    const her = body(world);
    q.weakSide = 1;
    q.openBeat = world.beat;
    her.color = "cyan";
    expect(word(world, "p2")).toBe("FIRE");
    expect(cue(world, "p2")?.kind).toBe("PRESS");
    // On the mark she is shown and not on the pair: her half of this fight is
    // knowing which of the two is real (`showsQueenHint`).
    const right = cue(world, "p2")?.x ?? 0;
    q.weakSide = -1;
    expect(cue(world, "p2")?.x).toBeLessThan(right);
  });

  it("asks the pilot to open her, on her own column, in the two phases his thumb answers", () => {
    const world = opened();
    clearTorches(world);
    const q = queen(world);
    const her = body(world);
    q.openBeat = world.beat + 1;
    her.color = null;
    // BROOD: a press, while the pry is still waiting; gone once she is open.
    q.phase = 1;
    expect(word(world, "p1")).toBe("OPEN");
    expect(cue(world, "p1")?.kind).toBe("PRESS");
    for (const side of [-1, 1] as const) {
      q.weakSide = side;
      const his = cue(world, "p1");
      expect(his?.x).not.toBe(queenMarkCenter(LAYOUT.p1, her, side).x);
    }
    her.color = "cyan";
    expect(word(world, "p1")).toBe("MOVE");
    // SCREAM: a hold, from the tell through the bloom, so the thumb is there.
    q.phase = 2;
    her.color = null;
    expect(word(world, "p1")).toBe("OPEN");
    expect(cue(world, "p1")?.kind).toBe("HOLD");
    her.color = "cyan";
    expect(cue(world, "p1")?.kind).toBe("HOLD");
    // CROWN asks nothing of his thumb on her.
    q.phase = 0;
    expect(word(world, "p1")).toBe("MOVE");
  });

  it("never puts a mark on either of her marks on the pilot's screen", () => {
    const world = opened();
    clearTorches(world);
    const q = queen(world);
    const her = body(world);
    for (const side of [-1, 1] as const) {
      q.weakSide = side;
      for (const color of [null, "cyan"] as const) {
        her.color = color;
        q.openBeat = color === null ? -1 : world.beat;
        for (const phase of [0, 1, 2]) {
          q.phase = phase;
          const his = cue(world, "p1");
          if (his === null) continue;
          // His word stands on his own hull line, or on her own column — the
          // gap between the marks — and never over one of the two.
          if (his.y !== LAYOUT.p1.hullY) expect(his.x).toBe(tileCX(LAYOUT.p1, her.col));
        }
      }
    }
  });

  it("tells the pilot to move for the whole of the bloom, and not which way", () => {
    const world = opened();
    clearTorches(world);
    const q = queen(world);
    q.openBeat = world.beat + 1;
    expect(word(world, "p1")).toBe("MOVE");
    expect(cue(world, "p1")?.kind).toBe("CARRY");
    // Not suppressed when he happens to be under the real mark: a word that
    // went away there would answer, by disappearing, the one question she is.
    const her = body(world);
    q.weakSide = 1;
    world.cannonCol = her.col + 1;
    expect(word(world, "p1")).toBe("MOVE");
    // And nothing at all between blooms.
    q.openBeat = -1;
    expect(word(world, "p1")).toBeNull();
  });

  it("asks the navigator for the plate while a torch is falling past it", () => {
    const world = opened();
    const q = queen(world);
    q.openBeat = -1;
    const her = body(world);
    world.creatures.push({
      ...her,
      id: 9001,
      kind: "torch",
      col: her.col + 3,
      row: her.row + 2,
      color: null,
    });
    world.shieldCol = 0;
    expect(word(world, "p2")).toBe("MOVE");
    // Standing where it should be, she is told nothing: a word over a plate
    // that is already right teaches the pair to stop reading words.
    world.shieldCol = her.col + 3;
    expect(word(world, "p2")).toBeNull();
  });

  it("rides the torch down on the pilot's screen, who holds the trigger", () => {
    const world = opened();
    const q = queen(world);
    q.openBeat = -1;
    const her = body(world);
    world.creatures.push({
      ...her,
      id: 9002,
      kind: "torch",
      col: her.col + 3,
      row: her.row + 4,
      color: null,
    });
    expect(word(world, "p1")).toBe("SHIELD");
    expect(cue(world, "p1")?.kind).toBe("PRESS");
    // The bloom outranks it on his screen: two beats against a whole fall.
    q.openBeat = world.beat;
    expect(word(world, "p1")).toBe("MOVE");
  });

  it("says nothing about a colour, a column or a count", () => {
    const world = opened(3);
    for (const role of ["p1", "p2"] as const) {
      const said = cue(world, role)?.word;
      if (said === undefined) continue;
      expect(said).toMatch(/^[A-Z]+$/);
      expect(["MOVE", "FIRE", "SHIELD"]).toContain(said);
    }
  });
});
