import { describe, expect, test } from "bun:test";
import { startWave } from "../src/beat.js";
import type { QueenState } from "../src/boss-state.js";
import { DEFAULT_CONFIG } from "../src/config.js";
import { step, ticksPerBeat } from "../src/index.js";
import type { Command, TimedCommand } from "../src/types.js";
import { createWorld, type QueenEntry, type SimEvent, type World } from "../src/world.js";

/**
 * **What BULB QUEEN's marks say of a thumb** (`queen-hand.ts`), which the
 * picture washes green or red (`render/queen-fx.ts`): a pry that landed, a
 * hold come down on either mark, a flinch, and player 2's press refused —
 * each said once per press and never once per move of a thumb already down.
 * What the gestures *do* is `queen-gestures.test.ts`.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);

function queenOf(world: World): QueenState {
  const boss = world.boss;
  if (boss === null || boss.kind !== "queen") throw new Error("no queen installed");
  return boss;
}

function withPetals(petals: number): World {
  const world = createWorld(CFG, 3);
  const boss: QueenEntry = { kind: "queen", col: 5, petals };
  startWave(world, 0, [], [], boss);
  return world;
}

function press(side: -1 | 1, on = true): Command {
  return { kind: "drag", target: "queenMark", on, fromMilli: 0, id: side === -1 ? 0 : 1 };
}

/** One tick with `player`'s command on it, and what it said of the queen. */
function said(world: World, player: 1 | 2, command: Command): SimEvent[] {
  const cmds: TimedCommand[] = [{ tick: world.tick, player, command }];
  step(world, cmds);
  return world.events.filter((e) => e.type.startsWith("queen"));
}

/** Run to the beat she announces on. */
function toAnnounce(world: World): void {
  for (let i = 0; i < 40 * TPB; i++) {
    step(world, []);
    if (queenOf(world).openBeat !== -1) return;
  }
  throw new Error("she never announced");
}

const other = (side: -1 | 1): -1 | 1 => (side === 1 ? -1 : 1);

describe("BROOD's pry", () => {
  test("landed is said, on the mark it landed on", () => {
    const world = withPetals(6);
    toAnnounce(world);
    const q = queenOf(world);
    expect(said(world, 1, press(q.weakSide))).toContainEqual(
      expect.objectContaining({ type: "queenPry", side: q.weakSide }),
    );
  });

  test("a flinch is said once, however many times the thumb moves before the beat closes", () => {
    const world = withPetals(6);
    toAnnounce(world);
    const wrong = other(queenOf(world).weakSide);
    expect(said(world, 1, press(wrong)).filter((e) => e.type === "queenFlinch")).toHaveLength(1);
    // A drag held on the mark repeats its press every move.
    for (let i = 0; i < 3; i++) expect(said(world, 1, press(wrong))).toEqual([]);
  });
});

describe("SCREAM's hold", () => {
  test("says whether the mark come down on is the real one, once", () => {
    const world = withPetals(3);
    toAnnounce(world);
    const q = queenOf(world);
    expect(said(world, 1, press(q.weakSide))).toEqual([
      expect.objectContaining({ type: "queenHold", side: q.weakSide, real: true }),
    ]);
    expect(said(world, 1, press(q.weakSide))).toEqual([]);
    expect(said(world, 1, press(other(q.weakSide)))).toEqual([
      expect.objectContaining({ type: "queenHold", side: other(q.weakSide), real: false }),
    ]);
  });

  test("says nothing of a thumb put down before she announced", () => {
    const world = withPetals(3);
    step(world, []);
    expect(said(world, 1, press(1))).toEqual([]);
  });
});

describe("player 2's press", () => {
  test("is refused, and said, while a mark asks", () => {
    for (const petals of [6, 3]) {
      const world = withPetals(petals);
      toAnnounce(world);
      const q = queenOf(world);
      expect(said(world, 2, press(q.weakSide))).toEqual([
        expect.objectContaining({ type: "queenRefuse", side: q.weakSide, player: 2 }),
      ]);
      expect(q.pryBeat).toBe(-1);
      expect(q.holdSide).toBe(0);
    }
  });

  test("is not refused where nothing asks — in CROWN, between windows, or once pried", () => {
    const crown = withPetals(9);
    toAnnounce(crown);
    expect(said(crown, 2, press(1))).toEqual([]);
    const early = withPetals(6);
    step(early, []);
    expect(said(early, 2, press(1))).toEqual([]);
    const pried = withPetals(6);
    toAnnounce(pried);
    said(pried, 1, press(queenOf(pried).weakSide));
    expect(said(pried, 2, press(1))).toEqual([]);
  });

  test("lifted is never refused", () => {
    const world = withPetals(6);
    toAnnounce(world);
    expect(said(world, 2, press(1, false))).toEqual([]);
  });
});
