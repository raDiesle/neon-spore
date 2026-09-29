import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  type ScoutArena,
  type ScoutState,
  scoutNavigator,
  scoutOpenRound,
  scoutPilot,
  scoutRound,
  startWave,
  step,
  type World,
} from "../src/index.js";

/**
 * **THE SCOUT's seats swap on every level** — the owner's *every level next,
 * the controls swap with other player*, 29 September 2026. Player 1 flies the
 * first arena and player 2 holds the mouth; on the second it is the other way
 * round, and on the third back again (`scout-ask.ts` `scoutPilot`). What is
 * held here is that the round hears each press from the seat that has it on
 * this arena and from no other.
 */

const CFG = DEFAULT_CONFIG;

const ARENA: ScoutArena = {
  beats: 40,
  motes: [{ colMilli: 500, rowMilli: 500 }],
  hazards: [],
};

/** The round stood on a numbered arena, in play, with the ship at rest. */
function on(index: number): { world: World; s: ScoutState } {
  const world = createWorld(CFG, 3);
  startWave(world, 6, [], [], { kind: "scout", arenas: [ARENA, ARENA, ARENA, ARENA] });
  step(world, []);
  const s = scoutRound(world);
  if (s === null) throw new Error("no round running");
  scoutOpenRound(world, s, index);
  return { world, s };
}

describe("THE SCOUT's seats", () => {
  it("gives the flying to player 1, then player 2, then player 1 again", () => {
    expect([0, 1, 2, 3].map((i) => scoutPilot(on(i).s))).toEqual([1, 2, 1, 2]);
    expect([0, 1, 2, 3].map((i) => scoutNavigator(on(i).s))).toEqual([2, 1, 2, 1]);
  });

  for (const index of [0, 1]) {
    it(`hears the turns and the burn only from the pilot on arena ${index + 1}`, () => {
      const { world, s } = on(index);
      const pilot = scoutPilot(s);
      const other = scoutNavigator(s);
      const heading = s.headingMilli;
      step(world, [
        { tick: world.tick, player: other, command: { kind: "scoutTurn", dir: 1, on: true } },
      ]);
      step(world, [{ tick: world.tick, player: other, command: { kind: "scoutBurn", on: true } }]);
      expect(s.headingMilli).toBe(heading);
      expect(s.burning).toBe(false);
      step(world, [
        { tick: world.tick, player: pilot, command: { kind: "scoutTurn", dir: 1, on: true } },
      ]);
      expect(s.headingMilli).not.toBe(heading);
      step(world, [{ tick: world.tick, player: pilot, command: { kind: "scoutBurn", on: true } }]);
      expect(s.burning).toBe(true);
    });

    it(`opens the mouth only for the navigator on arena ${index + 1}`, () => {
      const { world, s } = on(index);
      step(world, [{ tick: world.tick, player: scoutPilot(s), command: { kind: "scoutMaw" } }]);
      expect(s.mawTick).toBe(-1);
      const at = world.tick;
      step(world, [{ tick: at, player: scoutNavigator(s), command: { kind: "scoutMaw" } }]);
      expect(s.mawTick).toBe(at);
    });
  }
});
