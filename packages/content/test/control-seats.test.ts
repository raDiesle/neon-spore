import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  scoutOpenRound,
  scoutRound,
  startWave,
} from "@neon-spore/sim";
import {
  buildBoss,
  buildQueue,
  controlSeat,
  controlSetForWave,
  seatedSet,
  setControls,
  setSeating,
  swapSeats,
  WAVES,
} from "../src/index.js";

/**
 * THE SCOUT's seats exchange on every level (`control-seats.ts`): the panel
 * each phone draws and answers is the wave's own on the first arena and the
 * other way round on the second.
 */
describe("the seated panel", () => {
  const index = WAVES.findIndex((w) => w.boss?.kind === "scout");

  function scoutWorld() {
    const world = createWorld(DEFAULT_CONFIG, 1);
    startWave(
      world,
      index,
      buildQueue(index, DEFAULT_CONFIG.cols),
      [],
      buildBoss(index, DEFAULT_CONFIG.cols),
    );
    return world;
  }

  it("seats the first level as authored and the second the other way round", () => {
    const world = scoutWorld();
    const own = controlSetForWave(index);
    const first = seatedSet(own, world);
    expect(first).toBe(own);
    const round = scoutRound(world);
    if (round === null) throw new Error("no scout round");
    scoutOpenRound(world, round, 1);
    const second = seatedSet(own, world);
    expect(setControls(second, 1).map((c) => c.id)).toEqual(setControls(own, 2).map((c) => c.id));
    expect(setControls(second, 2).map((c) => c.id)).toEqual(setControls(own, 1).map((c) => c.id));
  });

  it("swaps to one cached set and back again", () => {
    const own = controlSetForWave(index);
    const swapped = swapSeats(own);
    expect(swapSeats(own)).toBe(swapped);
    expect(swapSeats(swapped)).toBe(swapped);
    for (const def of setControls(own, 1)) {
      expect(controlSeat(swapped, def)).toBe(2);
      expect(setSeating(own, def, 2)).toBe(swapped);
      expect(setSeating(swapped, def, 1)).toBe(own);
    }
  });

  it("never swaps a wave without THE SCOUT", () => {
    const world = createWorld(DEFAULT_CONFIG, 1);
    const set = controlSetForWave(0);
    expect(seatedSet(set, world)).toBe(set);
  });
});
