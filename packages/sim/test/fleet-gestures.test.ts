import { describe, expect, it } from "bun:test";
import type { FleetEntry } from "../src/boss-entries.js";
import { DEFAULT_CONFIG, type SimConfig } from "../src/config.js";
import { fleetAfloat, fleetRound, fleetStruck } from "../src/fleet.js";
import { fleetIndex, shipSunk } from "../src/fleet-board.js";
import { fleetWindowLeft } from "../src/fleet-flood.js";
import type { FleetState } from "../src/fleet-state.js";
import { hashWorld } from "../src/hash.js";
import { step } from "../src/step.js";
import type { Command, TimedCommand } from "../src/types.js";
import { startWave } from "../src/wave-start.js";
import { createWorld, type SimEvent, type World } from "../src/world.js";

/**
 * THE FLEET's second and third states, and the three thumbs on the picture
 * that get a hull from holed to sunk (`fleet-state.ts`, `fleet-flood.ts`,
 * `fleet-hand.ts`).
 *
 * What is held here, in order: that the seats are rules and not paint — her
 * plume, his rake, her wreck; that the rake bites only under both thumbs;
 * that a window closing gives the hull back whole; that the pull sinks; and
 * that every one of those is in the fingerprint.
 */

const SHIPS: FleetEntry = {
  kind: "fleet",
  ships: [
    { col: 1, row: 1, len: 3, dir: "h" },
    { col: 6, row: 4, len: 2, dir: "v" },
  ],
};

function fleetWorld(cfg: SimConfig = DEFAULT_CONFIG): World {
  const world = createWorld(cfg, 7);
  startWave(world, 0, [], [], { ...SHIPS, ships: SHIPS.ships.map((s) => ({ ...s })) });
  return world;
}

function press(world: World, player: 1 | 2, command: Command): void {
  const timed: TimedCommand[] = [{ tick: world.tick, player, command }];
  step(world, timed);
}

/** `n` beats of nothing pressed, and every event said on the way. */
function beats(world: World, n: number): SimEvent["type"][] {
  const per = (world.cfg.tickHz * 60) / world.cfg.bpm;
  const said: SimEvent["type"][] = [];
  for (let i = 0; i < n * per; i++) {
    step(world, []);
    for (const e of world.events) said.push(e.type);
  }
  return said;
}

function aimAt(world: World, col: number, row: number): void {
  const b = fleetRound(world)!;
  while (b.aimCol !== col) press(world, 2, { kind: "aim", dcol: b.aimCol < col ? 1 : -1, drow: 0 });
  while (b.aimRow !== row) press(world, 2, { kind: "aim", dcol: 0, drow: b.aimRow < row ? 1 : -1 });
}

/** A hull holed at its first square: the flood, freshly opened. */
function flooded(world: World, ship = 0): FleetState {
  const b = fleetRound(world)!;
  const s = b.ships[ship]!;
  aimAt(world, s.col, s.row);
  beats(world, world.cfg.fleetSalvoRestBeats);
  press(world, 1, { kind: "salvo" });
  expect(b.phase).toBe("flood");
  return b;
}

const breach = (on: boolean): Command => ({
  kind: "drag",
  target: "fleetBreach",
  on,
  fromMilli: 0,
});
const rake = (across: number, down = 0): Command => ({
  kind: "drag",
  target: "fleetRake",
  on: true,
  fromMilli: across,
  fromYMilli: down,
});
const pull = (down: number): Command => ({
  kind: "drag",
  target: "fleetWreck",
  on: true,
  fromMilli: 0,
  fromYMilli: down,
});

describe("the plume", () => {
  it("is the navigator's thumb, and only hers", () => {
    const world = fleetWorld();
    const b = flooded(world);
    press(world, 1, breach(true));
    expect(b.breachHeld).toBe(false);
    press(world, 2, breach(true));
    expect(b.breachHeld).toBe(true);
    expect(world.events.some((e) => e.type === "fleetBreach" && e.on)).toBe(true);
    press(world, 2, breach(false));
    expect(b.breachHeld).toBe(false);
  });

  it("is nothing to hold in the hunt", () => {
    const world = fleetWorld();
    press(world, 2, breach(true));
    expect(fleetRound(world)!.breachHeld).toBe(false);
  });
});

describe("the rake", () => {
  it("is the pilot's thumb, and puts the square under it where the hull runs", () => {
    const world = fleetWorld();
    const b = flooded(world);
    press(world, 2, rake(1000));
    expect(b.rakeOn).toBe(false);
    press(world, 1, rake(1000, 3000));
    expect(b.rakeOn).toBe(true);
    // A horizontal hull: the drop is ignored, the reach counts in whole tiles.
    expect([b.rakeCol, b.rakeRow]).toEqual([2, 1]);
  });

  it("strikes only under both thumbs, a square a dwell", () => {
    const world = fleetWorld();
    const b = flooded(world);
    press(world, 1, rake(1000));
    beats(world, world.cfg.fleetRakeBeats + 1);
    expect(fleetStruck(world, b, 2, 1)).toBe(false);
    press(world, 2, breach(true));
    expect(beats(world, world.cfg.fleetRakeBeats)).toContain("fleetRake");
    expect(fleetStruck(world, b, 2, 1)).toBe(true);
    // Off the hull, nothing bites.
    press(world, 1, rake(4000));
    beats(world, world.cfg.fleetRakeBeats);
    expect(b.struck).toHaveLength(2);
  });

  it("raked end to end, the hull is a wreck", () => {
    const world = fleetWorld();
    const b = flooded(world, 1);
    press(world, 2, breach(true));
    press(world, 1, rake(0, 1000));
    expect(beats(world, world.cfg.fleetRakeBeats)).toContain("fleetWreck");
    expect(shipSunk(world.cfg, b.ships[1]!, b.struck)).toBe(true);
    expect(b.phase).toBe("wreck");
    expect(b.sunkBeat[1]).toBe(-1);
  });
});

describe("the plug", () => {
  it("gives the hull back whole when the window closes, and leaves the water spent", () => {
    const world = fleetWorld();
    const b = fleetRound(world)!;
    aimAt(world, 4, 4);
    beats(world, world.cfg.fleetSalvoRestBeats);
    press(world, 1, { kind: "salvo" });
    flooded(world);
    press(world, 2, breach(true));
    press(world, 1, rake(1000));
    beats(world, world.cfg.fleetRakeBeats);
    expect(b.struck).toHaveLength(3);
    expect(beats(world, world.cfg.fleetFloodBeats)).toContain("fleetPlug");
    expect(b.phase).toBe("hunt");
    expect(b.holed).toBe(-1);
    expect(b.struck).toEqual([fleetIndex(world.cfg, 4, 4)]);
    expect(fleetWindowLeft(world, b)).toBe(0);
  });

  it("refloats a wreck nobody pulled under", () => {
    const world = fleetWorld();
    const b = flooded(world, 1);
    press(world, 2, breach(true));
    press(world, 1, rake(0, 1000));
    beats(world, world.cfg.fleetRakeBeats);
    expect(b.phase).toBe("wreck");
    beats(world, world.cfg.fleetWreckBeats);
    expect(b.phase).toBe("hunt");
    expect(fleetAfloat(b)).toBe(2);
  });
});

describe("the wreck", () => {
  function wrecked(world: World): FleetState {
    const b = flooded(world, 1);
    press(world, 2, breach(true));
    press(world, 1, rake(0, 1000));
    beats(world, world.cfg.fleetRakeBeats);
    expect(b.phase).toBe("wreck");
    return b;
  }

  it("goes under on the navigator's pull, with the pilot's thumb still on it", () => {
    const world = fleetWorld();
    const b = wrecked(world);
    const reach = world.cfg.fleetWreckPullMilli;
    press(world, 1, pull(reach));
    expect(b.wreckPullMilli).toBe(0);
    press(world, 2, pull(reach / 2));
    expect(b.wreckPullMilli).toBe(reach / 2);
    expect(b.phase).toBe("wreck");
    // His thumb off the hull: her pull holds a wreck that is going nowhere.
    press(world, 1, { kind: "drag", target: "fleetRake", on: false, fromMilli: 0 });
    press(world, 2, pull(reach));
    expect(b.phase).toBe("wreck");
    press(world, 1, rake(0, 1000));
    press(world, 2, pull(reach));
    expect(b.phase).toBe("hunt");
    expect(fleetAfloat(b)).toBe(1);
    expect(world.events.some((e) => e.type === "fleetSunk" && e.left === 1)).toBe(true);
  });

  it("ends the wave when the last hull goes under, and costs the pair nothing", () => {
    const world = fleetWorld();
    for (const ship of [1, 0]) {
      const b = flooded(world, ship);
      const s = b.ships[ship]!;
      press(world, 2, breach(true));
      for (let i = 1; i < s.len; i++) {
        press(world, 1, s.dir === "h" ? rake(i * 1000) : rake(0, i * 1000));
        beats(world, world.cfg.fleetRakeBeats);
      }
      expect(b.phase).toBe("wreck");
      press(world, 2, pull(world.cfg.fleetWreckPullMilli));
    }
    expect(world.boss).toBeNull();
    expect(world.retries).toBe(0);
  });
});

describe("the fingerprint", () => {
  it("tells two phones apart by which thumb is where", () => {
    const a = fleetWorld();
    const b = fleetWorld();
    flooded(a);
    flooded(b);
    expect(hashWorld(a)).toBe(hashWorld(b));
    press(a, 2, breach(true));
    expect(hashWorld(a)).not.toBe(hashWorld(b));
    press(b, 2, breach(true));
    expect(hashWorld(a)).toBe(hashWorld(b));
    press(a, 1, rake(1000));
    expect(hashWorld(a)).not.toBe(hashWorld(b));
  });
});
