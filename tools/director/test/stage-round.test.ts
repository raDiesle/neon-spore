import { describe, expect, it } from "bun:test";
import { WAVES } from "@neon-spore/content";
import { DEFAULT_CONFIG, type MazeState } from "@neon-spore/sim";
import { buildStageWorld } from "../src/stage-world.js";
import type { Store } from "../src/state.js";

/**
 * THE STAGE TAB AND THE FIELD SAY THE SAME NUMBER, AFTER ANY OTHER EDIT.
 *
 * Picking STAGE 4 in THE MAZE's boss panel stands the field on the fourth
 * sheet. It used to work by *ordering*: the click ran `onEdit`, which rebuilt
 * the world at round 0, and then `setBossRound` on the world that rebuild had
 * just stood up. The order was the whole of why it worked and it was also the
 * hole — anything else that rebuilt the stage, a tuning slider or a pair
 * switch, put the fight back on round 0 while the tab still read STAGE 4, and
 * the panel then named a sheet the field was not playing.
 *
 * The round is a thing the stage *holds* now, handed to every world it builds.
 * So the test is a rebuild: build twice with the same wanted round and the
 * second world has to be standing where the first one was.
 */

const MAZE = WAVES.findIndex((w) => w.boss?.kind === "maze");

function store(index: number): Store {
  // The draft the director edits is the shipped list until somebody types in
  // it, which is exactly what a freshly opened director holds.
  return { waves: WAVES.map((w) => ({ ...w })), index, dirty: false };
}

/** The wave's fight, having refused to be anything but the one asked for. */
function mazeOn(round?: number): MazeState {
  const boss = buildStageWorld(store(MAZE), DEFAULT_CONFIG, round).boss;
  if (boss?.kind !== "maze") throw new Error("the maze wave stopped carrying a maze");
  return boss;
}

describe("the round the stage is held on", () => {
  it("finds a wave played in rounds to ask about", () => {
    expect(MAZE).toBeGreaterThanOrEqual(0);
  });

  it("survives a rebuild that had nothing to do with the round", () => {
    const wanted = 3;
    expect(mazeOn(wanted).round).toBe(wanted);
    // The second build is every other reason the stage is rebuilt: a slider,
    // a switch, a jump away and back. It is handed the same wanted round and
    // must land on the same sheet.
    expect(mazeOn(wanted).round).toBe(wanted);
  });

  it("opens on the fight's own first round when nothing is holding it", () => {
    expect(mazeOn().round).toBe(0);
    // And a round given back — the wave picker's `closeRound` — is the same
    // thing said out loud, since zero is what it writes down.
    expect(mazeOn(0).round).toBe(0);
  });

  it("carries the round's own state, not just its number", () => {
    // `setBossRound` is the fight's way in rather than a number written on the
    // field: the drum comes up standing at the fourth wheel's own start angle,
    // with nothing tried and nothing clicked. Writing the number and leaving
    // the rest is how a stage comes up at the last round's angle with the last
    // round's lock still on it (`sim/boss-round.ts`).
    const boss = mazeOn(4);
    const wheel = boss.rounds[4];
    if (wheel === undefined) throw new Error("THE MAZE no longer has a fifth sheet");
    expect(boss.round).toBe(4);
    expect(boss.angleMilli).toBe(wheel.startMilli);
    expect(boss.tried).toEqual([]);
    expect(boss.lockedWay).toBe(-1);
  });
});
