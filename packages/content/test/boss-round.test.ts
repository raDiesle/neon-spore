import { describe, expect, it } from "bun:test";
import { createWorld, DEFAULT_CONFIG, setBossRound, startWave, type World } from "@neon-spore/sim";
import { buildBoss } from "../src/queue.js";
import { WAVES } from "../src/waves.js";

/**
 * Standing a boss on a numbered round.
 *
 * Four of the six fights are played in rounds and, until this existed, there
 * was no way to reach any of them but the first: `jumpToWave` opens a boss at
 * its first round and the only thing that moves it on is *winning*, which
 * nothing headless can do. So `bun run frames` could photograph the first
 * sheet of THE MAZE and no other — and the first sheet is the one with a
 * single way in, so the rim with five gaps and the drum coming apart on a
 * shot lost in a dead end were held by a unit test and by nothing an eye had
 * seen.
 *
 * The half that matters is not that `round` changes. It is that the round is
 * opened **the way the fight opens one**, so a picture taken here is a picture
 * of a round the pair could have reached.
 *
 * It lives in `content` rather than in `sim` because the bosses it stands up
 * are the *authored* ones — `packages/sim` may not read this package, and a
 * hand-made three-round fixture would prove the switch and nothing about the
 * five sheets THE MAZE actually ships.
 */

const CFG = DEFAULT_CONFIG;

/** A world with that wave's boss installed, at whatever round it opens on. */
function fight(name: string): World {
  const index = WAVES.findIndex((w) => w.name === name);
  if (index === -1) throw new Error(`no wave named ${name}`);
  const world = createWorld(CFG, 1, []);
  startWave(world, index, [], [], buildBoss(index, CFG.cols));
  return world;
}

/** The `round` of whichever boss is standing, or -1 for one without. */
function roundOf(world: World): number {
  const boss = world.boss;
  return boss && "round" in boss ? boss.round : -1;
}

describe("a boss played in rounds", () => {
  for (const name of ["THE MAZE", "THE MIRROR", "SNAKE", "PINBALL"]) {
    it(`stands ${name} on a later round`, () => {
      const world = fight(name);
      expect(roundOf(world)).toBe(0);
      expect(setBossRound(world, 2)).toBe(true);
      expect(roundOf(world)).toBe(2);
    });

    it(`clamps ${name} to the rounds it was authored with`, () => {
      const world = fight(name);
      const boss = world.boss;
      if (!boss || !("rounds" in boss)) throw new Error(`${name} has no rounds`);
      const last = boss.rounds.length - 1;
      // Clamped rather than refused: a caller asking for the round after the
      // last one wants the last one, and a boss that vanished mid-capture
      // would be a picture of an empty field with no error in it.
      expect(setBossRound(world, 99)).toBe(true);
      expect(roundOf(world)).toBe(last);
      expect(setBossRound(world, -3)).toBe(true);
      expect(roundOf(world)).toBe(0);
    });
  }

  /**
   * THE MAZE is the one the flag was asked for, and the wheel is what says the
   * round was *opened* rather than counted: a later sheet stands at its own
   * `startMilli` with nothing locked onto it. Writing `round` and leaving the
   * rest is how the drum comes up at the last round's angle.
   */
  it("stands the wheel up on the new sheet rather than leaving the old one", () => {
    const world = fight("THE MAZE");
    const maze = world.boss;
    if (maze?.kind !== "maze") throw new Error("no maze");
    maze.angleMilli = 123_456;
    maze.lockedCol = 4;
    maze.lockedWay = 1;
    maze.step = 3;
    setBossRound(world, 3);
    expect(maze.angleMilli).toBe(maze.rounds[3]?.startMilli ?? -1);
    expect(maze.lockedCol).toBe(-1);
    expect(maze.lockedWay).toBe(-1);
    expect(maze.step).toBe(0);
    expect(maze.phase).toBe("lead");
  });

  it("says no for a boss that is not played in rounds, and for no boss at all", () => {
    expect(setBossRound(fight("BULB QUEEN"), 1)).toBe(false);
    expect(setBossRound(createWorld(CFG, 1, []), 1)).toBe(false);
  });
});
