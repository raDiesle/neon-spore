import { expect, test } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  type SimEvent,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type VaneState,
  vaneArmAsks,
  vaneHousingAsks,
  vaneSplitCol,
  vaneTipNow,
  type World,
} from "../src/index.js";

/**
 * THE VANE's arm and housing answering a touch the way every mark does: which
 * part is asked of which seat (`vaneArmAsks`, `vaneHousingAsks`), and a press
 * on the part asked of the other seat refused and said (`vaneRefuse`) —
 * `vane-hand.ts`. `vane-hand.test.ts` holds the pin and the haul themselves.
 */

const CFG = { ...DEFAULT_CONFIG };
const TPB = ticksPerBeat(CFG);

/** SWING at four pins, VEER at two, SEIZE at one (`VANE_PHASES`). */
function open(pins: number): World {
  const world = createWorld({ ...CFG }, 1);
  startWave(world, 0, [], [], { kind: "vane", pins });
  for (let i = 0; i < 2 * TPB; i++) step(world, []);
  return world;
}

const vane = (world: World): VaneState => {
  const b = world.boss;
  if (b === null || b.kind !== "vane") throw new Error("no vane");
  return b;
};

const arm = (player: 1 | 2, on: boolean): TimedCommand => ({
  tick: 0,
  player,
  command: { kind: "drag", target: "vaneArm", on, fromMilli: 0 },
});

const housing = (player: 1 | 2, on: boolean, fromYMilli = 0): TimedCommand => ({
  tick: 0,
  player,
  command: { kind: "drag", target: "vaneHousing", on, fromMilli: 0, fromYMilli },
});

function send(world: World, ...cmds: TimedCommand[]): SimEvent[] {
  step(
    world,
    cmds.map((c) => ({ ...c, tick: world.tick })),
  );
  return [...world.events];
}

const said = (seen: SimEvent[], type: SimEvent["type"]) => seen.filter((e) => e.type === type);
const asks = (world: World) => [
  vaneArmAsks(world.cfg, vane(world), world.beat),
  vaneHousingAsks(world.cfg, vane(world), world.beat),
];

test("the parts asked: nothing under SWING, the arm under VEER, the housing only while it is pinned", () => {
  expect(asks(open(4))).toEqual([false, false]);
  expect(asks(open(2))).toEqual([true, false]);
  const seize = open(1);
  expect(asks(seize)).toEqual([true, false]);
  send(seize, arm(1, true));
  expect(asks(seize)).toEqual([false, true]);
  send(seize, housing(2, false, CFG.vaneHaulMilli));
  expect(asks(seize)).toEqual([false, false]);
});

test("the navigator's thumb on the asked arm is refused, once, and pins nothing", () => {
  const world = open(2);
  const col = vaneTipNow(world, vane(world));
  const seen = send(world, arm(2, true));
  expect(said(seen, "vaneRefuse")).toEqual([{ type: "vaneRefuse", col, part: "arm", player: 2 }]);
  expect(said(seen, "vanePin")).toEqual([]);
  expect(vane(world).pinBeat).toBe(-1);
  expect(said(send(world, arm(2, false)), "vaneRefuse")).toEqual([]);
});

test("the pilot's thumb on the asked housing is refused and hauls nothing", () => {
  const world = open(1);
  send(world, arm(1, true));
  const col = vaneSplitCol(world, vane(world));
  const seen = send(world, housing(1, true));
  expect(said(seen, "vaneRefuse")).toEqual([
    { type: "vaneRefuse", col, part: "housing", player: 1 },
  ]);
  expect(said(send(world, housing(1, false, CFG.vaneHaulMilli)), "vaneHaul")).toEqual([]);
  expect(vane(world).hauled).toBe(false);
});

test("a press on a part nobody is asked for says nothing", () => {
  const swing = open(4);
  expect(said(send(swing, arm(2, true), housing(1, true)), "vaneRefuse")).toEqual([]);
  const veer = open(2);
  send(veer, arm(1, true));
  // Pinned: the arm is asked of nobody, and VEER never asks for the housing.
  expect(said(send(veer, arm(2, true), housing(1, true)), "vaneRefuse")).toEqual([]);
});
