import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type SnakeRound,
  type SnakeState,
  startWave,
  step,
  type World,
} from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { arenaX, arenaY, snakeArena } from "../src/snake-draw.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **SNAKE, and the two words the field may say about it**
 * (`render/src/boss-cue-read-g.ts`).
 *
 * The round's whole content is that the seat with the wheel cannot see what it
 * is driving at, so the load-bearing case is the last one: the driver is told
 * nothing, on any tile, in any heading. A lane that made the round "clearer"
 * by writing `TURN` over her wheel would be a second driver, and there is only
 * one round in here (`decisions.md` #34, *never the answer*).
 */

beforeAll(installCanvasGlobals);

const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

function opened(): { world: World; s: SnakeState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("snake");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  step(world, []);
  const s = world.boss;
  if (s === null || s.kind !== "snake") throw new Error("the snake's wave installed no snake");
  // Straight into the round: the fold is a picture and says nothing.
  s.phase = "play";
  return { world, s };
}

function cue(world: World, role: ViewRole): BossCue | null {
  const l = LAYOUT[role];
  return bossCue(l, world, 0, () => l.hullY);
}

/** The round being played, read off the state the way the picture does. */
function current(s: SnakeState): SnakeRound {
  const round = s.rounds[s.round];
  if (round === undefined) throw new Error("a snake with no round to play");
  return round;
}

/** The head put one tile short of `at`, pointing at it. */
function approach(s: SnakeState, at: { col: number; row: number }): void {
  s.dirCol = 1;
  s.dirRow = 0;
  s.body = [{ col: at.col - 1, row: at.row }];
}

function mid(l: Layout, col: number, row: number): { x: number; y: number } {
  const a = snakeArena(l, CFG);
  return { x: arenaX(a, col) + a.tile / 2, y: arenaY(a, row) + a.tile / 2 };
}

describe("SNAKE", () => {
  it("says nothing before the body sets off, or after it has crashed", () => {
    const { world, s } = opened();
    const enemy = current(s).enemies[0];
    if (enemy === undefined) throw new Error("round one has no enemy to shoot");
    approach(s, enemy);
    s.phase = "morph";
    expect(cue(world, "p1")).toBeNull();
    s.phase = "verdict";
    expect(cue(world, "p1")).toBeNull();
    s.phase = "play";
    s.crashTick = world.tick;
    expect(cue(world, "p1")).toBeNull();
  });

  it("asks the pilot to FIRE on the enemy a shot would actually reach", () => {
    const { world, s } = opened();
    const enemy = current(s).enemies[0];
    if (enemy === undefined) throw new Error("round one has no enemy to shoot");
    approach(s, enemy);
    const c = cue(world, "p1");
    expect(c?.word).toBe("FIRE");
    expect(c?.kind).toBe("PRESS");
    expect(c?.seat).toBe(1);
    const at = mid(LAYOUT.p1, enemy.col, enemy.row);
    expect(c?.x).toBeCloseTo(at.x, 6);
    expect(c?.y).toBeCloseTo(at.y, 6);
  });

  it("says nothing about an enemy the shot cannot reach", () => {
    const { world, s } = opened();
    const enemy = current(s).enemies[0];
    if (enemy === undefined) throw new Error("round one has no enemy to shoot");
    // Out past the spit's whole reach, and then behind a meteor inside it.
    s.dirCol = 1;
    s.dirRow = 0;
    s.body = [{ col: enemy.col - CFG.snakeShotTiles - 1, row: enemy.row }];
    expect(cue(world, "p1")).toBeNull();
    approach(s, enemy);
    current(s).rocks.push({ col: enemy.col - 1, row: enemy.row });
    s.body = [{ col: enemy.col - 2, row: enemy.row }];
    expect(cue(world, "p1")).toBeNull();
  });

  it("asks him to OPEN on the point the head is one step from, before the shot", () => {
    const { world, s } = opened();
    const point = current(s).points[0];
    const enemy = current(s).enemies[0];
    if (point === undefined || enemy === undefined) throw new Error("round one is bare");
    approach(s, point);
    const c = cue(world, "p1");
    expect(c?.word).toBe("OPEN");
    expect(c?.kind).toBe("PRESS");
    const at = mid(LAYOUT.p1, point.col, point.row);
    expect(c?.x).toBeCloseTo(at.x, 6);
    // Two tiles out it is no longer the next step, and the word goes.
    s.body = [{ col: point.col - 2, row: point.row }];
    expect(cue(world, "p1")?.word).not.toBe("OPEN");
  });

  it("goes quiet while the trigger is resting", () => {
    const { world, s } = opened();
    const enemy = current(s).enemies[0];
    if (enemy === undefined) throw new Error("round one has no enemy to shoot");
    approach(s, enemy);
    s.shotBeat = world.beat;
    expect(cue(world, "p1")).toBeNull();
    world.beat += CFG.snakeFireRestBeats;
    expect(cue(world, "p1")?.word).toBe("FIRE");
  });

  it("says nothing at all to the driver, wherever the body is pointing", () => {
    const { world, s } = opened();
    const round = current(s);
    const seen = new Set<string>();
    for (const at of [...round.enemies, ...round.points]) {
      for (const [dc, dr] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ] as const) {
        s.dirCol = dc;
        s.dirRow = dr;
        s.body = [{ col: at.col - dc, row: at.row - dr }];
        const c = cue(world, "p2");
        if (c !== null) seen.add(`${c.kind}·${c.word}`);
      }
    }
    expect([...seen]).toEqual([]);
  });
});
