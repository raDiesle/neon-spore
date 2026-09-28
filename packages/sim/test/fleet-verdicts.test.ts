import { expect, test } from "bun:test";
import type { FleetEntry } from "../src/boss-entries.js";
import { DEFAULT_CONFIG } from "../src/config.js";
import { fleetRound } from "../src/fleet.js";
import { fleetHandsHeard, fleetWoundAsks } from "../src/fleet-hand.js";
import type { FleetState } from "../src/fleet-state.js";
import type { Command } from "../src/types.js";
import { startWave } from "../src/wave-start.js";
import { createWorld, type SimEvent, type World } from "../src/world.js";

/**
 * THE FLEET's wound answering a touch the way every mark does: that both
 * thumbs are asked while it is open (`fleetWoundAsks`), and that each landing
 * is said once — hers on the plume as `fleetBreach`, his on the hull and her
 * pull taking as `fleetHold` — and a wrong seat's thumb says nothing
 * (`fleet-hand.ts`). `fleet-gestures.test.ts` holds what the thumbs do.
 */

const SHIPS: FleetEntry = { kind: "fleet", ships: [{ col: 1, row: 1, len: 3, dir: "h" }] };

function wounded(phase: FleetState["phase"]): { world: World; b: FleetState } {
  const world = createWorld(DEFAULT_CONFIG, 7);
  startWave(world, 0, [], [], { ...SHIPS, ships: SHIPS.ships.map((s) => ({ ...s })) });
  const b = fleetRound(world);
  if (b === null) throw new Error("the fleet's wave installed no fleet");
  Object.assign(b, { phase, phaseBeat: world.beat, holed: 0, holeCol: 1, holeRow: 1 });
  return { world, b };
}

const drag = (target: string, on: boolean, fromMilli = 0, fromYMilli = 0): Command =>
  ({ kind: "drag", target, on, fromMilli, fromYMilli }) as Command;

/** What one command says about a thumb landing, and nothing before it. */
function said(world: World, player: 1 | 2, command: Command): SimEvent[] {
  world.events.length = 0;
  fleetHandsHeard(world, player, command);
  return world.events.filter((e) => e.type === "fleetHold" || e.type === "fleetBreach");
}

test("both thumbs are asked in the flood and the wreck, never in the hunt", () => {
  expect(fleetWoundAsks(wounded("hunt").b)).toBe(false);
  expect(fleetWoundAsks(wounded("flood").b)).toBe(true);
  expect(fleetWoundAsks(wounded("wreck").b)).toBe(true);
});

test("his thumb landing on the hull is said once, and again after a lift", () => {
  const { world } = wounded("flood");
  expect(said(world, 1, drag("fleetRake", true))).toEqual([
    { type: "fleetHold", col: 1, row: 1, part: "rake" },
  ]);
  // Carried along the hull is the same thumb still down.
  expect(said(world, 1, drag("fleetRake", true, 1000))).toEqual([]);
  expect(said(world, 1, drag("fleetRake", false))).toEqual([]);
  expect(said(world, 1, drag("fleetRake", true))).toHaveLength(1);
});

test("her pull on the wreck is said the moment it takes, once", () => {
  const { world } = wounded("wreck");
  expect(said(world, 2, drag("fleetWreck", true, 0, 0))).toEqual([]);
  expect(said(world, 2, drag("fleetWreck", true, 0, 100))).toEqual([
    { type: "fleetHold", col: 1, row: 1, part: "wreck" },
  ]);
  expect(said(world, 2, drag("fleetWreck", true, 0, 200))).toEqual([]);
});

test("her thumb on the plume is still the breach, and a wrong seat says nothing", () => {
  const { world, b } = wounded("flood");
  expect(said(world, 1, drag("fleetBreach", true))).toEqual([]);
  expect(said(world, 2, drag("fleetRake", true))).toEqual([]);
  expect(b.rakeOn).toBe(false);
  expect(said(world, 2, drag("fleetBreach", true))).toEqual([
    { type: "fleetBreach", col: 1, row: 1, on: true },
  ]);
});
