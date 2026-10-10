import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  type ScoutState,
  scoutHome,
  scoutLoad,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import { scoutPrimed } from "../src/scout-hand.js";

/**
 * **THE SCOUT's two hands on its own picture** (`docs/spec/interludes.md`, THE
 * SCOUT's *Three loads, three hands*).
 *
 * The loads are the price of hoarding: a pair that banks each mote as it takes
 * it never leaves `light`, and a pair that sweeps an arena before going home
 * meets both of the other two. Player 2's line brings a laden ship home —
 * straight, slowly, and with player 1's hands dead — and player 1's prime is
 * what makes a heavy ship's burn take at all.
 *
 * The loads here are **set** by putting motes aboard rather than flown to.
 * Four motes aboard is most of an arena and a minute of flying, and a test
 * that got there by flying would be a test about the flight.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const WAVE = 11;

const ARENAS = [
  {
    startColMilli: 4_000,
    startRowMilli: 6_000,
    startHeadingMilli: 0,
    motes: [
      { colMilli: 1_000, rowMilli: 1_000 },
      { colMilli: 2_000, rowMilli: 1_000 },
      { colMilli: 3_000, rowMilli: 1_000 },
      { colMilli: 4_000, rowMilli: 1_000 },
      { colMilli: 5_000, rowMilli: 1_000 },
      { colMilli: 6_000, rowMilli: 1_000 },
    ],
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

/** Put `n` motes aboard without flying to them: the load is the subject here. */
function carry(s: ScoutState, n: number): void {
  s.carrying = Array.from({ length: n }, (_, i) => i);
}

function press(world: World, player: 1 | 2, command: TimedCommand["command"]): void {
  step(world, [{ tick: world.tick, player, command }]);
}

const line = (on: boolean): TimedCommand["command"] => ({
  kind: "drag",
  target: "scoutLine",
  on,
  fromMilli: 0,
  fromYMilli: 0,
});

const prime = (on: boolean): TimedCommand["command"] => ({
  kind: "drag",
  target: "scoutPrime",
  on,
  fromMilli: 0,
  fromYMilli: 0,
});

describe("what the motes aboard make of the ship", () => {
  it("is light until scoutLadenMotes, laden after it and heavy after scoutHeavyMotes", () => {
    const world = open();
    const s = scout(world);
    expect(scoutLoad(CFG, s)).toBe("light");
    carry(s, CFG.scoutLadenMotes);
    expect(scoutLoad(CFG, s)).toBe("light");
    carry(s, CFG.scoutLadenMotes + 1);
    expect(scoutLoad(CFG, s)).toBe("laden");
    carry(s, CFG.scoutHeavyMotes);
    expect(scoutLoad(CFG, s)).toBe("laden");
    carry(s, CFG.scoutHeavyMotes + 1);
    expect(scoutLoad(CFG, s)).toBe("heavy");
  });
});

describe("the line, under laden", () => {
  it("pulls the ship toward home while her thumb is on it", () => {
    const world = open();
    carry(scout(world), CFG.scoutLadenMotes + 1);
    const home = scoutHome(CFG.cols, CFG.rows);
    const before = Math.abs(home.rowMilli - scout(world).rowMilli);
    press(world, 2, line(true));
    for (let i = 0; i < TPB; i++) step(world, []);
    expect(Math.abs(home.rowMilli - scout(world).rowMilli)).toBeLessThan(before);
  });

  /** She chooses *when*, never *where*: player 1's hands do nothing while it runs. */
  it("takes player 1's turn and burn out of the flight", () => {
    const world = open();
    carry(scout(world), CFG.scoutLadenMotes + 1);
    press(world, 2, line(true));
    press(world, 1, { kind: "scoutTurn", dir: -1, on: true });
    const heading = scout(world).headingMilli;
    for (let i = 0; i < TPB; i++) step(world, []);
    expect(scout(world).headingMilli).toBe(heading);
  });

  it("gives the ship back the moment her thumb comes off", () => {
    const world = open();
    carry(scout(world), CFG.scoutLadenMotes + 1);
    press(world, 2, line(true));
    press(world, 2, line(false));
    expect(scout(world).reeling).toBe(false);
    press(world, 1, { kind: "scoutTurn", dir: -1, on: true });
    const heading = scout(world).headingMilli;
    for (let i = 0; i < TPB; i++) step(world, []);
    expect(scout(world).headingMilli).not.toBe(heading);
  });

  it("is refused to the pilot, and on a ship that is not laden", () => {
    const world = open();
    carry(scout(world), CFG.scoutLadenMotes + 1);
    press(world, 1, line(true));
    expect(scout(world).reeling).toBe(false);
    carry(scout(world), CFG.scoutLadenMotes);
    press(world, 2, line(true));
    expect(scout(world).reeling).toBe(false);
  });
});

describe("the prime, under heavy", () => {
  it("is what a heavy ship's burn waits for", () => {
    const world = open();
    const s = scout(world);
    carry(s, CFG.scoutHeavyMotes + 1);
    expect(scoutPrimed(CFG, s)).toBe(false);
    press(world, 1, prime(true));
    expect(scoutPrimed(CFG, scout(world))).toBe(true);
  });

  it("holds a burn at nothing until it is given", () => {
    const world = open();
    carry(scout(world), CFG.scoutHeavyMotes + 1);
    press(world, 1, { kind: "scoutBurn", on: true });
    for (let i = 0; i < TPB; i++) step(world, []);
    expect(scout(world).vRowMilli).toBe(0);
    expect(scout(world).vColMilli).toBe(0);
    press(world, 1, prime(true));
    for (let i = 0; i < TPB; i++) step(world, []);
    expect(scout(world).vRowMilli).not.toBe(0);
  });

  /** A hold: no window outlives the thumb, however long it was down. */
  it("lasts exactly as long as the thumb, and the lift ends it", () => {
    const world = open();
    carry(scout(world), CFG.scoutHeavyMotes + 1);
    press(world, 1, prime(true));
    for (let i = 0; i < 10 * TPB; i++) step(world, []);
    expect(scoutPrimed(CFG, scout(world))).toBe(true);
    press(world, 1, prime(false));
    expect(scoutPrimed(CFG, scout(world))).toBe(false);
  });

  it("refuses a thumb from the navigator, and one off heavy", () => {
    const world = open();
    carry(scout(world), CFG.scoutHeavyMotes + 1);
    press(world, 2, prime(true));
    expect(scout(world).priming).toBe(false);
    carry(scout(world), CFG.scoutHeavyMotes);
    press(world, 1, prime(true));
    expect(scout(world).priming).toBe(false);
  });

  /** A thumb held while a mote is banked is let go by its lift, not left lit. */
  it("lets go on the lift whatever the load has become", () => {
    const world = open();
    carry(scout(world), CFG.scoutHeavyMotes + 1);
    press(world, 1, prime(true));
    carry(scout(world), CFG.scoutHeavyMotes);
    press(world, 1, prime(false));
    expect(scout(world).priming).toBe(false);
  });

  /** A light ship never waits for anything: the old flight is untouched. */
  it("is not asked for at all while the ship is light", () => {
    const world = open();
    expect(scoutPrimed(CFG, scout(world))).toBe(true);
  });
});

describe("the two hands in the fingerprint", () => {
  it("moves the hash, because each is whether the flight answers", () => {
    const world = open();
    carry(scout(world), CFG.scoutLadenMotes + 1);
    const before = hashWorld(world);
    press(world, 2, line(true));
    expect(hashWorld(world)).not.toBe(before);
  });
});
