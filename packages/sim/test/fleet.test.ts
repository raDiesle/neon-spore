import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, type SimConfig } from "../src/config.js";
import type { FleetEntry } from "../src/entries.js";
import { fleetAfloat, fleetBeatsLeft, fleetRound } from "../src/fleet.js";
import {
  FLEET_SHIPS_MAX,
  fleetFault,
  fleetIndex,
  fleetRows,
  fleetShipAt,
  shipSunk,
} from "../src/fleet-board.js";
import { hullPercent } from "../src/hull.js";
import { step } from "../src/step.js";
import type { Command, TimedCommand } from "../src/types.js";
import { startWave } from "../src/wave-start.js";
import { createWorld, type World } from "../src/world.js";

/**
 * THE FLEET, and the two things worth holding it to.
 *
 * **The split is a rule of the simulation and not a coat of paint.** The pilot
 * cannot move the sights and the navigator cannot fire, and a test that only
 * checked the picture would pass while both seats quietly played both halves —
 * so every press below is signed with the seat that sent it.
 *
 * **Nothing here is random.** The placement is authored and the clock is the
 * wave's own beat, so the same presses give the same fight on both phones;
 * `replay.test.ts` next door holds the fingerprint to that.
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

/** One press, on the next tick, from the seat that is allowed to send it. */
function press(world: World, player: 1 | 2, command: Command): void {
  const timed: TimedCommand[] = [{ tick: world.tick, player, command }];
  step(world, timed);
}

function tick(world: World, times = 1): void {
  for (let i = 0; i < times; i++) step(world, []);
}

/** Walk the sights onto a square, one press at a time, as the navigator. */
function aimAt(world: World, col: number, row: number): void {
  const b = fleetRound(world);
  if (b === null) throw new Error("no fleet");
  while (b.aimCol !== col) {
    press(world, 2, { kind: "aim", dcol: b.aimCol < col ? 1 : -1, drow: 0 });
  }
  while (b.aimRow !== row) {
    press(world, 2, { kind: "aim", dcol: 0, drow: b.aimRow < row ? 1 : -1 });
  }
}

/** A salvo, with the rest between two of them already spent. */
function salvo(world: World): void {
  const beats = Math.max(1, world.cfg.fleetSalvoRestBeats);
  tick(world, (beats * (world.cfg.tickHz * 60)) / world.cfg.bpm);
  press(world, 1, { kind: "salvo" });
}

describe("the chart", () => {
  it("takes the wave's ships exactly where they were authored", () => {
    const world = fleetWorld();
    const b = fleetRound(world);
    expect(b?.ships).toEqual(SHIPS.ships);
    expect(fleetShipAt(b?.ships ?? [], 2, 1)).toBe(0);
    expect(fleetShipAt(b?.ships ?? [], 6, 5)).toBe(1);
    expect(fleetShipAt(b?.ships ?? [], 4, 1)).toBe(-1);
  });

  it("opens with the sights dead centre and nothing fired at", () => {
    const b = fleetRound(fleetWorld());
    expect(b?.aimCol).toBe(Math.floor(DEFAULT_CONFIG.cols / 2));
    expect(b?.aimRow).toBe(Math.floor(fleetRows(DEFAULT_CONFIG) / 2));
    expect(b?.struck).toEqual([]);
    expect(fleetAfloat(b!)).toBe(2);
  });

  it("refuses a fleet that is not one", () => {
    const cfg = DEFAULT_CONFIG;
    expect(fleetFault(cfg, SHIPS.ships)).toBeNull();
    expect(fleetFault(cfg, [])).not.toBeNull();
    // Two hulls in one square: one salvo would sink both and the pair could
    // never work out why.
    expect(
      fleetFault(cfg, [
        { col: 1, row: 1, len: 3, dir: "h" },
        { col: 2, row: 1, len: 2, dir: "v" },
      ]),
    ).not.toBeNull();
    expect(fleetFault(cfg, [{ col: 9, row: 1, len: 5, dir: "h" }])).not.toBeNull();
    expect(fleetFault(cfg, [{ col: 0, row: 0, len: 9, dir: "v" }])).not.toBeNull();
    const many = Array.from({ length: FLEET_SHIPS_MAX + 1 }, (_, i) => ({
      col: 0,
      row: i,
      len: 2,
      dir: "h" as const,
    }));
    expect(fleetFault(cfg, many)).not.toBeNull();
  });
});

describe("the sights", () => {
  it("move one square a press and never leave the chart", () => {
    const world = fleetWorld();
    const b = fleetRound(world)!;
    const col = b.aimCol;
    press(world, 2, { kind: "aim", dcol: -1, drow: 0 });
    expect(b.aimCol).toBe(col - 1);
    for (let i = 0; i < 40; i++) press(world, 2, { kind: "aim", dcol: -1, drow: 0 });
    expect(b.aimCol).toBe(0);
    for (let i = 0; i < 40; i++) press(world, 2, { kind: "aim", dcol: 0, drow: -1 });
    expect(b.aimRow).toBe(0);
    for (let i = 0; i < 60; i++) press(world, 2, { kind: "aim", dcol: 1, drow: 1 });
    expect(b.aimCol).toBe(DEFAULT_CONFIG.cols - 1);
    expect(b.aimRow).toBe(fleetRows(DEFAULT_CONFIG) - 1);
  });

  it("do not answer the pilot at all", () => {
    const world = fleetWorld();
    const b = fleetRound(world)!;
    const before = { col: b.aimCol, row: b.aimRow };
    press(world, 1, { kind: "aim", dcol: -1, drow: -1 });
    expect({ col: b.aimCol, row: b.aimRow }).toEqual(before);
  });
});

describe("a salvo", () => {
  it("only counts from the pilot", () => {
    const world = fleetWorld();
    const b = fleetRound(world)!;
    aimAt(world, 4, 4);
    press(world, 2, { kind: "salvo" });
    expect(b.struck).toEqual([]);
  });

  it("marks open water and says so", () => {
    const world = fleetWorld();
    const b = fleetRound(world)!;
    aimAt(world, 4, 4);
    salvo(world);
    expect(b.struck).toEqual([fleetIndex(world.cfg, 4, 4)]);
    expect(b.lastHit).toBe(false);
    expect(world.events.some((e) => e.type === "fleetSplash")).toBe(true);
  });

  it("marks a hull, and spends the square rather than the ship", () => {
    const world = fleetWorld();
    const b = fleetRound(world)!;
    const score = world.score;
    aimAt(world, 2, 1);
    salvo(world);
    expect(b.lastHit).toBe(true);
    expect(world.score).toBe(score + world.cfg.scoreFleetHit);
    expect(fleetAfloat(b)).toBe(2);
    // The same square again is a press that meant nothing: it costs no rest
    // and it is not a second hit.
    salvo(world);
    expect(b.struck).toHaveLength(1);
    expect(world.events.some((e) => e.type === "reject")).toBe(true);
  });

  it("sinks a ship on its last square and never before", () => {
    const world = fleetWorld();
    const b = fleetRound(world)!;
    aimAt(world, 6, 4);
    salvo(world);
    expect(b.sunkBeat[1]).toBe(-1);
    aimAt(world, 6, 5);
    salvo(world);
    expect(shipSunk(world.cfg, b.ships[1]!, b.struck)).toBe(true);
    expect(b.sunkBeat[1]).toBe(world.beat);
    expect(fleetAfloat(b)).toBe(1);
    expect(world.events.some((e) => e.type === "fleetSunk")).toBe(true);
  });

  it("ends the wave when the last hull goes down, and costs the hull nothing", () => {
    const world = fleetWorld();
    const hull = world.hullMilli;
    for (const [col, row] of [
      [1, 1],
      [2, 1],
      [3, 1],
      [6, 4],
      [6, 5],
    ] as const) {
      aimAt(world, col, row);
      salvo(world);
    }
    expect(world.boss).toBeNull();
    expect(world.hullMilli).toBe(hull);
    expect(world.score).toBeGreaterThan(world.cfg.scoreFleetDown);
  });
});

describe("the clock", () => {
  it("breaks the hull when it runs out, and takes the chart with it", () => {
    // A round short enough to run out inside a test, and nothing else moved:
    // what is being checked is the cost, not the length.
    const world = fleetWorld({ ...DEFAULT_CONFIG, fleetRoundBeats: 4 });
    const before = hullPercent(world);
    const perBeat = (world.cfg.tickHz * 60) / world.cfg.bpm;
    expect(fleetBeatsLeft(world, fleetRound(world)!)).toBe(4);
    tick(world, perBeat * 5);
    expect(world.boss).toBeNull();
    expect(hullPercent(world)).toBeLessThan(before);
  });
});
