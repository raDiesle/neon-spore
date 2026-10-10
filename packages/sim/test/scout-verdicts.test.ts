import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  type ScoutState,
  type SimEvent,
  scoutLineAsks,
  scoutLineOffered,
  scoutPrimeAsks,
  scoutPrimeOffered,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";

/**
 * **What THE SCOUT's two rings ask, and the press from the wrong seat**
 * (`scout-hand.ts`, `render/scout-marks.ts`): each ring is on offer from its
 * load, asks until it is answered, and a press on it from the other seat is
 * said once as `scoutRefuse` and changes nothing else.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const WAVE = 11;

const ARENAS = [
  {
    startColMilli: 4_000,
    startRowMilli: 6_000,
    startHeadingMilli: 0,
    motes: [1_000, 2_000, 3_000, 4_000, 5_000, 6_000].map((colMilli) => ({
      colMilli,
      rowMilli: 1_000,
    })),
    hazards: [],
    beats: 400,
  },
];

function open(): World {
  const world = createWorld(CFG, WAVE);
  startWave(world, WAVE, [], [], { kind: "scout", arenas: ARENAS });
  for (let i = 0; i < 40 * TPB; i++) {
    if (scout(world).phase === "play") break;
    step(world, []);
  }
  return world;
}

function scout(world: World): ScoutState {
  const b = world.boss;
  if (b === null || b.kind !== "scout") throw new Error("no round running");
  return b;
}

const carry = (s: ScoutState, n: number): void => {
  s.carrying = Array.from({ length: n }, (_, i) => i);
};

function press(world: World, player: 1 | 2, command: TimedCommand["command"]): SimEvent[] {
  step(world, [{ tick: world.tick, player, command }]);
  return world.events;
}

const drag = (target: "scoutLine" | "scoutPrime", on: boolean, fromYMilli = 0) =>
  ({ kind: "drag", target, on, fromMilli: 0, fromYMilli }) as TimedCommand["command"];

const refusals = (events: SimEvent[]) => events.filter((e) => e.type === "scoutRefuse");

describe("what each ring asks", () => {
  it("offers nothing on a light ship, the line laden, both heavy", () => {
    const world = open();
    const s = scout(world);
    expect(scoutLineOffered(CFG, s) || scoutPrimeOffered(CFG, s)).toBe(false);
    carry(s, CFG.scoutLadenMotes + 1);
    expect(scoutLineOffered(CFG, s)).toBe(true);
    expect(scoutPrimeOffered(CFG, s)).toBe(false);
    carry(s, CFG.scoutHeavyMotes + 1);
    expect(scoutPrimeOffered(CFG, s)).toBe(true);
  });

  it("asks for the line until her thumb is down", () => {
    const world = open();
    carry(scout(world), CFG.scoutLadenMotes + 1);
    expect(scoutLineAsks(CFG, scout(world))).toBe(true);
    press(world, 2, drag("scoutLine", true));
    expect(scoutLineAsks(CFG, scout(world))).toBe(false);
    press(world, 2, drag("scoutLine", false));
    expect(scoutLineAsks(CFG, scout(world))).toBe(true);
  });

  it("asks for the prime while no thumb is on it, and again once it lifts", () => {
    const world = open();
    carry(scout(world), CFG.scoutHeavyMotes + 1);
    expect(scoutPrimeAsks(CFG, scout(world))).toBe(true);
    press(world, 1, drag("scoutPrime", true));
    expect(scoutPrimeAsks(CFG, scout(world))).toBe(false);
    press(world, 1, drag("scoutPrime", false));
    expect(scoutPrimeAsks(CFG, scout(world))).toBe(true);
  });

  it("asks nothing outside the play", () => {
    const world = open();
    const s = scout(world);
    carry(s, CFG.scoutHeavyMotes + 1);
    s.phase = "verdict";
    expect(scoutLineAsks(CFG, s) || scoutPrimeAsks(CFG, s)).toBe(false);
  });
});

describe("the press from the wrong seat", () => {
  it("is refused once on the line from the pilot, and the line stays off", () => {
    const world = open();
    carry(scout(world), CFG.scoutLadenMotes + 1);
    const said = refusals(press(world, 1, drag("scoutLine", true)));
    expect(said).toEqual([{ type: "scoutRefuse", part: "line", player: 1 }]);
    expect(scout(world).reeling).toBe(false);
  });

  it("is refused once on the prime from the navigator, and nothing is primed", () => {
    const world = open();
    carry(scout(world), CFG.scoutHeavyMotes + 1);
    const said = refusals(press(world, 2, drag("scoutPrime", true)));
    expect(said).toEqual([{ type: "scoutRefuse", part: "prime", player: 2 }]);
    expect(scout(world).priming).toBe(false);
  });

  it("is not refused on a ring that is not on offer, nor on the lift", () => {
    const world = open();
    expect(refusals(press(world, 1, drag("scoutLine", true)))).toEqual([]);
    carry(scout(world), CFG.scoutHeavyMotes + 1);
    expect(refusals(press(world, 2, drag("scoutPrime", false)))).toEqual([]);
  });

  it("is not refused from the right seat", () => {
    const world = open();
    carry(scout(world), CFG.scoutHeavyMotes + 1);
    expect(refusals(press(world, 2, drag("scoutLine", true)))).toEqual([]);
    expect(refusals(press(world, 1, drag("scoutPrime", true)))).toEqual([]);
  });
});
