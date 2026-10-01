import { expect, test } from "bun:test";
import {
  type Command,
  createWorld,
  DEFAULT_CONFIG,
  type PinballState,
  pinPlungerAsks,
  pinTableAsks,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import { pinballDragHeard } from "../src/pinball-hand.js";

/**
 * PINBALL's plunger and table answering a touch the way every mark does:
 * which part is asked (`pinPlungerAsks`, `pinTableAsks`), and a press from the
 * other seat on the asked plunger said once as a refusal (`pinRefuse`) and
 * doing nothing else. The table has no other seat. `pinball-hand.test.ts` holds the wind and the shove themselves.
 */

type Drag = Extract<Command, { kind: "drag" }>;

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);

const ROUNDS = [
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

function playing(): { world: World; pin: PinballState } {
  const world = createWorld(CFG, 9);
  startWave(world, 9, [], [], { kind: "pinball", rounds: ROUNDS });
  for (let i = 0; i < 40 * TPB; i++) {
    if (world.boss?.kind === "pinball" && world.boss.phase === "play") break;
    step(world, []);
  }
  const pin = world.boss;
  if (pin === null || pin.kind !== "pinball" || pin.phase !== "play") throw new Error("no play");
  return { world, pin };
}

const slack = (pin: PinballState) => Object.assign(pin, { shot: "power", slack: true });
const flight = (pin: PinballState) =>
  Object.assign(pin, { shot: "flight", nudges: 0, tilted: false });

const plunger = (on: boolean): Drag => ({
  kind: "drag",
  target: "pinPlunger",
  on,
  fromMilli: 0,
  fromYMilli: on ? 0 : CFG.pinballWindMilli,
});
const table = (on: boolean): Drag => ({
  kind: "drag",
  target: "pinTable",
  on,
  fromMilli: on ? 0 : CFG.pinballNudgeMilli,
  fromYMilli: 0,
});

/** What one command says, and nothing said before it. */
function said(world: World, pin: PinballState, player: 1 | 2, command: Drag): SimEvent[] {
  world.events.length = 0;
  pinballDragHeard(world, pin, player, command);
  return world.events.filter((e) => e.type.startsWith("pin"));
}

test("the plunger is asked on a slack spring, the table in a flight, and only in the play", () => {
  const { pin } = playing();
  slack(pin);
  expect(pinPlungerAsks(pin)).toBe(true);
  expect(pinTableAsks(pin)).toBe(false);
  flight(pin);
  expect(pinPlungerAsks(pin)).toBe(false);
  expect(pinTableAsks(pin)).toBe(true);
  pin.tilted = true;
  expect(pinTableAsks(pin)).toBe(false);
  slack(pin);
  pin.phase = "verdict";
  expect(pinPlungerAsks(pin)).toBe(false);
});

test("the driver's thumb on the asked plunger is refused once and winds nothing", () => {
  const { world, pin } = playing();
  slack(pin);
  expect(said(world, pin, 2, plunger(true))).toEqual([
    { type: "pinRefuse", part: "plunger", player: 2 },
  ]);
  expect(said(world, pin, 2, plunger(false))).toEqual([]);
  expect(pin.slack).toBe(true);
  expect(said(world, pin, 1, plunger(false))).toEqual([{ type: "pinWind" }]);
});

test("the asked table refuses neither seat: the shove is both of theirs", () => {
  const { world, pin } = playing();
  flight(pin);
  expect(said(world, pin, 1, table(true))).toEqual([]);
  expect(said(world, pin, 1, table(false))).toEqual([{ type: "pinNudge", way: 1 }]);
  expect(said(world, pin, 2, table(true))).toEqual([]);
  expect(said(world, pin, 2, table(false))).toEqual([{ type: "pinNudge", way: 1 }]);
});

test("a part not asked refuses nobody", () => {
  const { world, pin } = playing();
  flight(pin);
  expect(said(world, pin, 2, plunger(true))).toEqual([]);
  slack(pin);
  expect(said(world, pin, 1, table(true))).toEqual([]);
});
