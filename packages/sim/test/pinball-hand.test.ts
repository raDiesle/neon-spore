import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  type PinballState,
  type SimConfig,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import { PINBALL_MORPH_BEATS } from "../src/pinball-round.js";
import { resetShot } from "../src/pinball-shot.js";

/**
 * **PINBALL's two hands on the table** (`docs/spec/interludes.md`, PINBALL's
 * *Three shots, three hands*).
 *
 * Both are entered by the pair's own last answer, which is THE GAUGE's shape
 * for the same brief: a launch above `pinballHardMilli` leaves the spring
 * slack and the bar will not run until player 1 has wound the plunger; through
 * a flight either seat may shove the table, out of one count the two of them
 * share, and the shove past it tilts it.
 *
 * Nothing here can reach the hull. Every refusal below is a hand that did
 * nothing, which is the only kind of cost this round charges outside the ball
 * itself (`pinball-round.ts` is where a dropped ball is charged).
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const WAVE = 9;

/**
 * One peg high on the board and a long clock: nothing here is about the ball
 * finding anything, and a round that ended under a test would take the state
 * it was about with it. `packages/sim` never imports `content`, so the board
 * is authored here the way `round-end.test.ts` authors one.
 */
const PIN_ROUNDS = [
  {
    pieces: [
      {
        kind: "peg" as const,
        xMilli: 2_500,
        yMilli: 4_000,
        wMilli: 300,
        hMilli: 300,
        target: true,
      },
    ],
    beats: 200,
  },
];

function open(): World {
  const world = createWorld(CFG, WAVE);
  startWave(world, WAVE, [], [], { kind: "pinball", rounds: PIN_ROUNDS });
  for (let i = 0; i < (PINBALL_MORPH_BEATS + 2) * TPB; i++) {
    if (pin(world).phase === "play") break;
    step(world, []);
  }
  return world;
}

function pin(world: World): PinballState {
  const b = world.boss;
  if (b === null || b.kind !== "pinball") throw new Error("no round running");
  return b;
}

function press(world: World, player: 1 | 2, command: TimedCommand["command"]): void {
  step(world, [{ tick: world.tick, player, command }]);
}

const plunger = (milli: number): TimedCommand["command"] => ({
  kind: "drag",
  target: "pinPlunger",
  on: false,
  fromMilli: 0,
  fromYMilli: milli,
});

/** A press of ◀ (-1) or ▶ (1), from either seat's panel. */
const table = (dir: -1 | 1): TimedCommand["command"] => ({ kind: "pinNudge", dir });

/** Latch the needle and fire at exactly this power, which is the whole of what
 * the spring is charged against. */
function launchAt(world: World, powerMilli: number): void {
  press(world, 1, { kind: "latch" });
  pin(world).powerMilli = powerMilli;
  press(world, 2, { kind: "launch" });
}

describe("the spring, after a hard launch", () => {
  it("comes back slack above pinballHardMilli and taut below it", () => {
    const soft = open();
    launchAt(soft, CFG.pinballHardMilli - 1);
    expect(pin(soft).slack).toBe(false);
    const hard = open();
    launchAt(hard, CFG.pinballHardMilli);
    expect(pin(hard).slack).toBe(true);
  });

  it("stops the bar running on the shot after it", () => {
    const world = open();
    launchAt(world, 1000);
    // Back to `aim`, latched again, and the bar is where the reset left it.
    pin(world).shot = "aim";
    press(world, 1, { kind: "latch" });
    pin(world).powerMilli = 0;
    for (let i = 0; i < 40; i++) step(world, []);
    expect(pin(world).powerMilli).toBe(0);
  });

  it("is wound by a carry that travelled far enough, and by nothing else", () => {
    const world = open();
    launchAt(world, 1000);
    pin(world).shot = "power";
    press(world, 1, plunger(CFG.pinballWindMilli - 1));
    expect(pin(world).slack).toBe(true);
    press(world, 2, plunger(CFG.pinballWindMilli));
    expect(pin(world).slack).toBe(true);
    press(world, 1, plunger(CFG.pinballWindMilli));
    expect(pin(world).slack).toBe(false);
  });

  it("runs the bar again once it is wound", () => {
    const world = open();
    launchAt(world, 1000);
    pin(world).shot = "power";
    pin(world).powerMilli = 0;
    press(world, 1, plunger(CFG.pinballWindMilli));
    for (let i = 0; i < 40; i++) step(world, []);
    expect(pin(world).powerMilli).toBeGreaterThan(0);
  });
});

describe("the nudge, through a flight", () => {
  it("shoves the ball the way the button points", () => {
    const world = open();
    launchAt(world, 500);
    expect(pin(world).shot).toBe("flight");
    const before = pin(world).ball.vxMilli;
    press(world, 2, table(1));
    expect(pin(world).ball.vxMilli).toBe(before + CFG.pinballNudgeShoveMilli);
    expect(pin(world).nudges).toBe(1);
  });

  it("goes the other way for the other button", () => {
    const world = open();
    launchAt(world, 500);
    const before = pin(world).ball.vxMilli;
    press(world, 2, table(-1));
    expect(pin(world).ball.vxMilli).toBe(before - CFG.pinballNudgeShoveMilli);
  });

  /** The owner, 1 October 2026: *any player can bump the ball*. */
  it("takes a shove from either seat, out of the one count they share", () => {
    const mixed = open();
    const driver = open();
    launchAt(mixed, 500);
    launchAt(driver, 500);
    press(mixed, 1, table(1));
    press(driver, 2, table(1));
    expect(pin(mixed).nudges).toBe(1);
    press(mixed, 2, table(1));
    press(driver, 2, table(1));
    // Whose thumb it was is nowhere in the table afterwards: the same shove.
    expect(pin(mixed).nudges).toBe(2);
    expect(hashWorld(mixed)).toBe(hashWorld(driver));
  });

  /** The buttons are there all the time and dark outside a flight. */
  it("does nothing off a flight", () => {
    const aiming = open();
    press(aiming, 2, table(1));
    press(aiming, 1, table(-1));
    expect(pin(aiming).nudges).toBe(0);
    expect(pin(aiming).tilted).toBe(false);
  });

  /** The arcade's own rule: the shove after the last one is the tilt. */
  it("tilts on the next shove, and both hands are dead for the rest of the flight", () => {
    const world = open();
    launchAt(world, 500);
    for (let i = 0; i <= CFG.pinballNudges; i++) {
      press(world, i % 2 === 0 ? 1 : 2, table(1));
    }
    expect(pin(world).tilted).toBe(true);
    const after = pin(world).ball.vxMilli;
    press(world, 1, table(1));
    press(world, 2, table(1));
    expect(pin(world).ball.vxMilli).toBe(after);
  });

  /** A tilt is a cost and not an ending: the shot reset hands both back. */
  it("gives the shoves back with the next shot", () => {
    const world = open();
    launchAt(world, 500);
    for (let i = 0; i <= CFG.pinballNudges; i++) press(world, 2, table(1));
    expect(pin(world).tilted).toBe(true);
    resetShot(pin(world));
    expect(pin(world).tilted).toBe(false);
    expect(pin(world).nudges).toBe(0);
  });
});

describe("the two hands in the fingerprint", () => {
  it("moves the hash, because each is whether the next press does anything", () => {
    const world = open();
    launchAt(world, 1000);
    const before = hashWorld(world);
    press(world, 2, table(1));
    expect(hashWorld(world)).not.toBe(before);
  });
});
