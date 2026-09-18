import { describe, expect, test } from "bun:test";
import { startWave } from "../src/beat.js";
import type { QueenState } from "../src/boss-state.js";
import { DEFAULT_CONFIG } from "../src/config.js";
import { hashWorld, step, ticksPerBeat } from "../src/index.js";
import { PHASES, queenGesture } from "../src/queen-mark.js";
import type { Command, Creature, TimedCommand } from "../src/types.js";
import { createWorld, type QueenEntry, type World } from "../src/world.js";

/**
 * **BULB QUEEN's three gestures**, one per phase (`queen-mark.ts`,
 * `queen-hand.ts`): CROWN is shot on the panel as before, BROOD's mark is
 * pried open by player 1's thumb, SCREAM's is held open by it. Each phase is
 * entered by installing her with the petals it starts at, since the phase
 * is read off the petals and nothing else.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);

function queenOf_(world: World): QueenState {
  const boss = world.boss;
  if (boss === null || boss.kind !== "queen") throw new Error("no queen installed");
  return boss;
}

function queenAt(world: World): Creature {
  const q = world.creatures.find((c) => c.kind === "queen");
  if (!q) throw new Error("no queen");
  return q;
}

function withPetals(petals: number, seed = 3): World {
  const world = createWorld(CFG, seed);
  const boss: QueenEntry = { kind: "queen", col: 5, petals };
  startWave(world, 0, [], [], boss);
  return world;
}

function press(side: -1 | 1, on: boolean): Command {
  return { kind: "drag", target: "queenMark", on, fromMilli: 0, id: side === -1 ? 0 : 1 };
}

function stepBeats(world: World, beats: number, commands: TimedCommand[] = []): void {
  for (let i = 0; i < beats * TPB; i++) step(world, commands);
}

/** Run to the first tick of the beat she announces on, and return that beat. */
function toAnnounce(world: World): number {
  for (let i = 0; i < 40 * TPB; i++) {
    step(world, []);
    if (queenOf_(world).openBeat !== -1) return world.beat;
  }
  throw new Error("she never announced");
}

function events(world: World, type: string): number {
  return world.events.filter((e) => e.type === type).length;
}

describe("the three phases", () => {
  test("CROWN shoots, BROOD pries, SCREAM holds", () => {
    expect(PHASES.map((p) => p.gesture)).toEqual(["shoot", "pry", "hold"]);
    expect(queenGesture(queenOf_(withPetals(9)))).toBe("shoot");
    // The phase is entered on her first beat; before it, at -1, she is CROWN's.
    const brood = withPetals(6);
    stepBeats(brood, 1);
    expect(queenGesture(queenOf_(brood))).toBe("pry");
    const scream = withPetals(3);
    stepBeats(scream, 1);
    expect(queenGesture(queenOf_(scream))).toBe("hold");
  });
});

describe("BROOD: a pry", () => {
  test("she never opens by herself, and a window nobody pried is a miss", () => {
    const world = withPetals(6);
    toAnnounce(world);
    const q = queenOf_(world);
    const tell = q.openBeat;
    const close = q.closeBeat;
    stepBeats(world, close - world.beat + 1);
    expect(queenAt(world).color).toBeNull();
    expect(world.beat).toBeGreaterThan(tell);
    // Closed, forgotten, the next bloom picked with the other side spent.
    expect(queenOf_(world).openBeat).toBe(-1);
    expect(queenOf_(world).pryBeat).toBe(-1);
  });

  test("player 1's press on the real mark opens her for the phase's beats", () => {
    const world = withPetals(6);
    toAnnounce(world);
    const q = queenOf_(world);
    const opened = world.beat;
    step(world, [{ tick: world.tick, player: 1, command: press(q.weakSide, true) }]);
    expect(queenAt(world).color).toBe(q.tellColor);
    expect(q.pryBeat).toBe(opened);
    expect(q.closeBeat).toBe(opened + PHASES[1]!.openBeats);
    stepBeats(world, PHASES[1]!.openBeats);
    expect(queenAt(world).color).toBeNull();
    expect(events(world, "queenFlinch")).toBe(0);
  });

  test("the other mark pressed is a flinch: shut on the next beat, and said", () => {
    const world = withPetals(6);
    toAnnounce(world);
    const q = queenOf_(world);
    const wrong = q.weakSide === 1 ? -1 : 1;
    const col = queenAt(world).col + wrong;
    step(world, [{ tick: world.tick, player: 1, command: press(wrong, true) }]);
    expect(queenAt(world).color).toBeNull();
    expect(q.closeBeat).toBe(world.beat);
    expect(world.events).toContainEqual({ type: "queenFlinch", col, side: wrong });
    stepBeats(world, 1);
    expect(queenOf_(world).openBeat).toBe(-1);
    expect(queenAt(world).color).toBeNull();
  });

  test("a press before the announcement, or from player 2, or in CROWN, does nothing", () => {
    const early = withPetals(6);
    stepBeats(early, 1);
    step(early, [{ tick: early.tick, player: 1, command: press(1, true) }]);
    expect(queenAt(early).color).toBeNull();
    expect(queenOf_(early).pryBeat).toBe(-1);

    const hers = withPetals(6);
    toAnnounce(hers);
    step(hers, [{ tick: hers.tick, player: 2, command: press(queenOf_(hers).weakSide, true) }]);
    expect(queenAt(hers).color).toBeNull();
    expect(events(hers, "queenFlinch")).toBe(0);

    const crown = withPetals(9);
    toAnnounce(crown);
    const q = queenOf_(crown);
    const wrong = q.weakSide === 1 ? -1 : 1;
    step(crown, [{ tick: crown.tick, player: 1, command: press(wrong, true) }]);
    expect(events(crown, "queenFlinch")).toBe(0);
    expect(q.closeBeat).toBeGreaterThan(crown.beat);
  });
});

describe("SCREAM: a hold", () => {
  test("unheld, she stands open one beat", () => {
    const world = withPetals(3);
    toAnnounce(world);
    const q = queenOf_(world);
    stepBeats(world, q.openBeat - world.beat);
    expect(queenAt(world).color).not.toBeNull();
    stepBeats(world, 1);
    expect(queenAt(world).color).toBeNull();
  });

  test("player 1's thumb on the real mark keeps her open to queenHoldBeats, then she shuts", () => {
    const world = withPetals(3);
    toAnnounce(world);
    const q = queenOf_(world);
    step(world, [{ tick: world.tick, player: 1, command: press(q.weakSide, true) }]);
    expect(q.holdSide).toBe(q.weakSide);
    const opened = q.openBeat;
    stepBeats(world, opened - world.beat);
    for (let b = 0; b < CFG.queenHoldBeats; b++) {
      expect(queenAt(world).color, `beat ${b} of the hold`).not.toBeNull();
      stepBeats(world, 1);
    }
    expect(queenAt(world).color).toBeNull();
    expect(world.beat).toBe(opened + CFG.queenHoldBeats);
  });

  test("the thumb lifted, or on the other mark, and she shuts on the next beat", () => {
    const world = withPetals(3);
    toAnnounce(world);
    const q = queenOf_(world);
    step(world, [{ tick: world.tick, player: 1, command: press(q.weakSide, true) }]);
    stepBeats(world, q.openBeat - world.beat + 1);
    expect(queenAt(world).color).not.toBeNull();
    step(world, [{ tick: world.tick, player: 1, command: press(q.weakSide, false) }]);
    expect(q.holdSide).toBe(0);
    stepBeats(world, 1);
    expect(queenAt(world).color).toBeNull();

    const other = withPetals(3);
    toAnnounce(other);
    const o = queenOf_(other);
    const wrong = o.weakSide === 1 ? -1 : 1;
    step(other, [{ tick: other.tick, player: 1, command: press(wrong, true) }]);
    stepBeats(other, o.openBeat - other.beat + 1);
    expect(queenAt(other).color).toBeNull();
  });
});

test("a pry and a hold are in the hash and the same on two worlds", () => {
  const a = withPetals(6);
  const b = withPetals(6);
  toAnnounce(a);
  toAnnounce(b);
  const cmd = { tick: a.tick, player: 1 as const, command: press(queenOf_(a).weakSide, true) };
  step(a, [cmd]);
  step(b, [cmd]);
  expect(hashWorld(a)).toBe(hashWorld(b));
  const c = withPetals(6);
  toAnnounce(c);
  step(c, []);
  expect(hashWorld(c)).not.toBe(hashWorld(a));
});
