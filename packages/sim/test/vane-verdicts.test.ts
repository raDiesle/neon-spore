import { expect, test } from "bun:test";
import {
  type SimEvent,
  step,
  type TimedCommand,
  vaneArmAsks,
  vaneHousingAsks,
  vaneSplitCol,
  vaneTipNow,
  type World,
} from "../src/index.js";
import { beats, CFG, open, vane } from "./vane-fixture.js";

/**
 * THE VANE's arm and housing answering a touch the way every mark does: which
 * part is asked of which seat (`vaneArmAsks`, `vaneHousingAsks`), and a press
 * on the part asked of the other seat refused and said (`vaneRefuse`) —
 * `vane-hand.ts`. `vane-pin.test.ts` and `vane-haul.test.ts` hold the pin and
 * the haul themselves.
 */

/** SWING at four pins, VEER at two, SEIZE at one (`VANE_PHASES`), two beats in. */
const settled = (pins: number): World => beats(open(pins), 2);

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
  expect(asks(settled(4))).toEqual([false, false]);
  expect(asks(settled(2))).toEqual([true, false]);
  const seize = settled(1);
  expect(asks(seize)).toEqual([true, false]);
  send(seize, arm(1, true));
  expect(asks(seize)).toEqual([false, true]);
  send(seize, housing(2, false, CFG.vaneHaulMilli));
  expect(asks(seize)).toEqual([false, false]);
});

test("the navigator's thumb on the asked arm is refused, once, and pins nothing", () => {
  const world = settled(2);
  const col = vaneTipNow(world, vane(world));
  const seen = send(world, arm(2, true));
  expect(said(seen, "vaneRefuse")).toEqual([{ type: "vaneRefuse", col, part: "arm", player: 2 }]);
  expect(said(seen, "vanePin")).toEqual([]);
  expect(vane(world).pinBeat).toBe(-1);
  expect(said(send(world, arm(2, false)), "vaneRefuse")).toEqual([]);
});

test("the pilot's thumb on the asked housing is refused and hauls nothing", () => {
  const world = settled(1);
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
  const swing = settled(4);
  expect(said(send(swing, arm(2, true), housing(1, true)), "vaneRefuse")).toEqual([]);
  const veer = settled(2);
  send(veer, arm(1, true));
  // Pinned: the arm is asked of nobody, and VEER never asks for the housing.
  expect(said(send(veer, arm(2, true), housing(1, true)), "vaneRefuse")).toEqual([]);
});
