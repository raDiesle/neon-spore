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
import { P1_SKIN } from "../src/seat-skin.js";
import { drawSnakeLobe } from "../src/snake-button.js";
import { arenaX, arenaY, snakeArena } from "../src/snake-draw.js";
import { stubCanvas, type TextBox } from "./canvas-stub.js";
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
 * (`render/src/boss-cue-read-g.ts`): EAT and SHOOT, the words on player 1's
 * buttons, on the one item the head looks at or is nearest to, on both
 * screens. The owner, 25 September 2026: *have a hint if to eat or to shoot*,
 * and *all is seen by both*. `PRESS` goes over the word only on the step a
 * press would land.
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

  it("asks for SHOOT, with PRESS over it, on the enemy a shot would reach", () => {
    const { world, s } = opened();
    const enemy = current(s).enemies[0];
    if (enemy === undefined) throw new Error("round one has no enemy to shoot");
    approach(s, enemy);
    const c = cue(world, "p1");
    expect(c?.word).toBe("SHOOT");
    expect(c?.kind).toBe("PRESS");
    expect(c?.soon).toBe(false);
    expect(c?.seat).toBeNull();
    const at = mid(LAYOUT.p1, enemy.col, enemy.row);
    expect(c?.x).toBeCloseTo(at.x, 6);
    expect(c?.y).toBeCloseTo(at.y, 6);
  });

  it("names an enemy the head looks at but the shot cannot reach, without PRESS", () => {
    const { world, s } = opened();
    const enemy = current(s).enemies[0];
    if (enemy === undefined) throw new Error("round one has no enemy to shoot");
    s.dirCol = 1;
    s.dirRow = 0;
    s.body = [{ col: enemy.col - CFG.snakeShotTiles - 1, row: enemy.row }];
    const far = cue(world, "p1");
    expect(far?.word).toBe("SHOOT");
    expect(far?.soon).toBe(true);
    expect(far?.x).toBeCloseTo(mid(LAYOUT.p1, enemy.col, enemy.row).x, 6);
  });

  it("does not look through a meteor: the hint goes to the nearest item", () => {
    const { world, s } = opened();
    const enemy = current(s).enemies[0];
    if (enemy === undefined) throw new Error("round one has no enemy to shoot");
    approach(s, enemy);
    current(s).rocks.push({ col: enemy.col - 1, row: enemy.row });
    s.body = [{ col: enemy.col - 2, row: enemy.row }];
    // The enemy may still be the nearest, but no shot reaches it past the rock.
    const c = cue(world, "p1");
    expect(c?.kind === "PRESS" && c.soon !== true).toBe(false);
  });

  it("asks for EAT on the point the head is one step from, and PRESS only then", () => {
    const { world, s } = opened();
    const point = current(s).points[0];
    if (point === undefined) throw new Error("round one has no point");
    approach(s, point);
    const c = cue(world, "p1");
    expect(c?.word).toBe("EAT");
    expect(c?.kind).toBe("PRESS");
    expect(c?.soon).toBe(false);
    const at = mid(LAYOUT.p1, point.col, point.row);
    expect(c?.x).toBeCloseTo(at.x, 6);
    // Two tiles out the head still looks at it, and the word stays without PRESS.
    s.body = [{ col: point.col - 2, row: point.row }];
    const early = cue(world, "p1");
    expect(early?.word).toBe("EAT");
    expect(early?.soon).toBe(true);
  });

  it("goes to the nearest item when the head looks at none", () => {
    const { world, s } = opened();
    const round = current(s);
    const point = round.points[0];
    if (point === undefined) throw new Error("round one has no point");
    // Everything else spent, and the head pointing away from the one left.
    s.struck = round.enemies.map((_, i) => i);
    s.taken = round.points.map((_, i) => i).filter((i) => i !== 0);
    s.dirCol = 0;
    s.dirRow = point.row > 0 ? -1 : 1;
    s.body = [{ col: point.col === 0 ? 1 : point.col - 1, row: point.row }];
    const c = cue(world, "p1");
    expect(c?.word).toBe("EAT");
    expect(c?.soon).toBe(true);
    expect(c?.x).toBeCloseTo(mid(LAYOUT.p1, point.col, point.row).x, 6);
  });

  it("drops PRESS while the trigger is resting", () => {
    const { world, s } = opened();
    const enemy = current(s).enemies[0];
    if (enemy === undefined) throw new Error("round one has no enemy to shoot");
    approach(s, enemy);
    s.shotBeat = world.beat;
    expect(cue(world, "p1")?.soon).toBe(true);
    world.beat += CFG.snakeFireRestBeats;
    expect(cue(world, "p1")?.soon).toBe(false);
  });

  it("shows both screens the same mark: all is seen by both", () => {
    const { world, s } = opened();
    const round = current(s);
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
        const one = cue(world, "p1");
        const two = cue(world, "p2");
        expect(one).not.toBeNull();
        expect(two?.word).toBe(one?.word);
        expect(two?.kind).toBe(one?.kind);
        expect(two?.soon).toBe(one?.soon);
      }
    }
  });

  it("says nothing on the way home", () => {
    const { world, s } = opened();
    const round = current(s);
    s.struck = round.enemies.map((_, i) => i);
    s.taken = round.points.map((_, i) => i);
    s.clearBeat = world.beat;
    expect(cue(world, "p1")).toBeNull();
    expect(cue(world, "p2")).toBeNull();
  });
});

describe("SNAKE's buttons", () => {
  it("say SHOOT and EAT on player 1's two faces", () => {
    const { world } = opened();
    for (const [which, word] of [
      ["fire", "SHOOT"],
      ["maw", "EAT"],
    ] as const) {
      const { ctx } = stubCanvas();
      ctx.texts = [];
      drawSnakeLobe(
        ctx as unknown as CanvasRenderingContext2D,
        { x: 100, y: 100, r: 40 },
        which,
        world,
        P1_SKIN,
      );
      const texts = (ctx.texts ?? []) as TextBox[];
      expect(texts.map((t) => t.text)).toContain(word);
      // Inside the face, not hanging off it.
      for (const t of texts) {
        expect(t.x).toBeGreaterThan(60);
        expect(t.x + t.w).toBeLessThan(140);
        expect(t.y + t.h).toBeLessThan(140);
      }
    }
  });
});
