import { beforeAll, describe, expect, it } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import { createWorld, fleetRows, startWave, step, ticksPerBeat, type World } from "@neon-spore/sim";
import { chartOf, crossingSize } from "../src/fleet-chart.js";
import type { ViewRole } from "../src/layout.js";
import { computeLayout } from "../src/layout.js";
import {
  CFG,
  installCanvasGlobals,
  ROLES,
  runFrames,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

/**
 * THE FLEET, played rather than posed: the chart with its water under it, the
 * hulls on the one screen that has them, salvoes arcing out of the cannon and
 * landing, marks and scars appearing behind them, a ship going under, and the
 * clock counting down through all of it.
 *
 * It had no frame test at all until the shell was given a flight — which is
 * the one part of this boss that outlives its frame, and therefore the one
 * part a canvas could refuse a value in on a frame nobody had ever drawn.
 *
 * The run drives the fight from the outside, exactly as the pair would: the
 * navigator's arrows walk the sights onto a square the wave's author put a
 * hull in, and the pilot's trigger goes every other beat. That is the only way
 * to reach a burst — nothing about this boss happens on its own except the
 * clock running out.
 */

beforeAll(installCanvasGlobals);

/** The wave's first ship, which is the one this test walks the sights onto. */
function firstShip(world: World): { col: number; row: number } {
  const boss = world.boss;
  if (boss?.kind !== "fleet") throw new Error("the fleet wave installed no fleet");
  const ship = boss.ships[0];
  if (!ship) throw new Error("the fleet wave carries no ships");
  return { col: ship.col, row: ship.row };
}

function fleetFrames(role: ViewRole, ticks: number) {
  const world = createWorld(CFG, 3);
  const index = waveWith("fleet");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  const target = firstShip(world);
  const tpb = ticksPerBeat(CFG);
  // The sights open dead centre (`installFleet`), so the walk is the distance
  // from there — one press a tick, which the round answers on the tick.
  let col = Math.floor(CFG.cols / 2);
  let row = Math.floor(fleetRows(CFG) / 2);
  return runFrames(world, role, ticks, {
    // Every tick: a shell leaving and a shell landing are both moments between
    // beats, and a frame every fourth tick would step over one of them.
    every: 1,
    onTick: (tick, w) => {
      if (col !== target.col) {
        const dcol: -1 | 1 = target.col > col ? 1 : -1;
        col += dcol;
        step(w, [{ tick, player: 2, command: { kind: "aim", dcol, drow: 0 } }]);
        return;
      }
      if (row !== target.row) {
        const drow: -1 | 1 = target.row > row ? 1 : -1;
        row += drow;
        step(w, [{ tick, player: 2, command: { kind: "aim", dcol: 0, drow } }]);
        return;
      }
      // Standing on the ship: fire, then walk one square along it and fire
      // again, so the run holes the same hull more than once.
      if (tick % (tpb * 2) === 0) {
        step(w, [{ tick, player: 1, command: { kind: "salvo" } }]);
        return;
      }
      if (tick % (tpb * 2) === tpb) {
        col += 1;
        step(w, [{ tick, player: 2, command: { kind: "aim", dcol: 1, drow: 0 } }]);
        return;
      }
      step(w, []);
    },
  });
}

describe("the fleet", () => {
  for (const role of ROLES) {
    it(`draws the chart, the water, a salvo in the air and where it lands for ${role}`, () => {
      const { ctx } = fleetFrames(role, ticksPerBeat(CFG) * 16);
      expect(ctx.calls).toBeGreaterThan(1000);
    });
  }

  it("really fired, or no shell was ever drawn", () => {
    const { events } = fleetFrames("test", ticksPerBeat(CFG) * 16);
    expect(events.some((e) => e.type === "fleetSalvo")).toBe(true);
    // And found the hull the sights were walked onto — the splash is the other
    // burst and this test would pass on it without proving the red one.
    expect(events.some((e) => e.type === "fleetHit")).toBe(true);
  });

  /**
   * **The crossings are one fill, and it is the same picture as 132.**
   *
   * They used to be a `fillRect` each — twelve by eleven every frame, seventy
   * per cent of every rectangle this fight drew. One `fill` of one path is
   * identical to that only while no two of the marks touch: overlapping rects
   * blend twice under separate fills and once under one, and the mark carries
   * alpha. So that is the condition, and it is what is held here — the count
   * is `fleet-budget.test.ts`'s.
   */
  it("keeps a crossing's mark smaller than the gap to the next one", () => {
    const world = createWorld(CFG, 3);
    const chart = chartOf(computeLayout(VIEWPORT, CFG, "test"), world);
    // `flash` is 1 at the beat and falls to 0, so this is the widest it goes.
    expect(crossingSize(1)).toBeLessThan(chart.tile);
    expect(crossingSize(0)).toBeGreaterThan(0);
  });

  /** And the marks themselves, read out of the frame: one per crossing, all
   * the same size, and no two of them closer together than they are wide. */
  it("puts one mark on every crossing of the lattice it drew", () => {
    const log: string[] = [];
    const world = createWorld(CFG, 3);
    const index = waveWith("fleet");
    startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
    runFrames(world, "test", 2, {
      onCanvas: (c) => {
        c.log = log;
      },
    });
    const marks = log
      .filter((line) => line.startsWith("Path2D.rect("))
      .map((line) => line.slice("Path2D.rect(".length, -1).split(", ").map(Number))
      .filter((r) => r[2] === r[3] && (r[2] ?? 0) <= crossingSize(1));
    const chart = chartOf(computeLayout(VIEWPORT, CFG, "test"), world);
    expect(marks.length).toBe((chart.cols + 1) * (chart.rows + 1));
    const size = marks[0]?.[2] ?? 0;
    expect(marks.every((r) => r[2] === size)).toBe(true);
    const xs = [...new Set(marks.map((r) => r[0] ?? 0))].sort((a, b) => a - b);
    expect(xs.length).toBe(chart.cols + 1);
    expect((xs[1] ?? 0) - (xs[0] ?? 0)).toBeGreaterThan(size);
  });

  it("draws a chart with nothing on it, which is the first frame of every run", () => {
    const world = createWorld(CFG, 3);
    const index = waveWith("fleet");
    startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
    for (const role of ROLES) {
      expect(() => runFrames(world, role, 4)).not.toThrow();
    }
  });
});
