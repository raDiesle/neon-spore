import { beforeAll, describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  type SimEvent,
  type SpawnEntry,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "@neon-spore/sim";
import { Canvas2DRenderer } from "../src/canvas2d.js";
import { commsCall } from "../src/comms.js";
import { CoordGrid, colLabel, rowLabel } from "../src/coord-grid.js";
import type { ViewRole } from "../src/layout.js";
import { JUMP_TILES, showsWisp, wispApexTiles, wispJump } from "../src/wisp.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

/**
 * THE WISP's two halves that a type check cannot see: the body is drawn on one
 * screen and not the other, and the lettered grid is up only while one is out.
 *
 * Its own file rather than another block in `frame.test.ts` for the reason
 * `dart-query.test.ts` is one: that file asks whether a frame draws at all,
 * and these are questions about *which* frame draws what. The split is where
 * the seats differ.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const ROLES: ViewRole[] = ["p1", "p2", "test"];

beforeAll(installCanvasGlobals);

function frames(role: ViewRole, ticks: number, queue: SpawnEntry[], inputs: TimedCommand[] = []) {
  const world = createWorld(CFG, 3, queue);
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  const { canvas, ctx } = stubCanvas();
  const renderer = new Canvas2DRenderer(canvas);
  renderer.resize({ width: 900, height: 1600, dpr: 2 });

  let events: SimEvent[] = [];
  for (let tick = 0; tick < ticks; tick++) {
    step(world, byTick.get(tick) ?? []);
    if (world.events.length) events.push(...world.events);
    if (tick % 4 !== 0) continue;
    renderer.draw({
      world,
      beatPhase: (world.tick % TPB) / TPB,
      role,
      time: tick / CFG.tickHz,
      dt: 4 / CFG.tickHz,
      events,
      running: true,
    });
    events = [];
  }
  return { ctx, world };
}

const wisp = (col: number): SpawnEntry => ({ beat: 0, col, kind: "wisp", color: null });

describe("showsWisp", () => {
  it("is the mirror of the veil's gate: never the pilot, always the navigator", () => {
    expect(showsWisp({ role: "p1" } as never)).toBe(false);
    expect(showsWisp({ role: "p2" } as never)).toBe(true);
    expect(showsWisp({ role: "test" } as never)).toBe(true);
  });
});

describe("wispJump", () => {
  /**
   * The flight is the whole of a hop beat and nothing else, which is what makes
   * the arc a picture of the simulation rather than a flourish over it: the
   * body leaves on the frame `stepWisp` moves it and touches down on the last
   * frame before the next beat.
   */
  it("is in the air for the whole of a hop beat and on the ground for every other", () => {
    for (const phase of [0, 0.25, 0.5, 0.75, 0.99]) {
      expect(wispJump(CFG, 6, phase).flying).toBe(true);
    }
    for (const beat of [7, 8, 9, 10, 11]) {
      expect(wispJump(CFG, beat, 0.5).flying).toBe(false);
    }
  });

  it("leaves the ground and comes back to it, highest in the middle", () => {
    expect(wispJump(CFG, 6, 0).arc).toBeCloseTo(0, 5);
    expect(wispJump(CFG, 6, 0.5).arc).toBeCloseTo(1, 5);
    expect(wispJump(CFG, 6, 1).arc).toBeCloseTo(0, 5);
  });

  /**
   * A wisp may stand on row 0, and a body that rose the full apex out of it
   * would arc through the lettered axis and off the top of the grid — over
   * the one thing the pair reads this creature by.
   */
  it("takes only the headroom it has, and the full apex once there is room", () => {
    const at = (fromRow: number, row: number): number => wispApexTiles({ fromRow, row } as never);
    expect(at(0, 0)).toBeCloseTo(0.9, 6);
    expect(at(8, 0)).toBeCloseTo(0.9, 6);
    expect(at(0, 8)).toBeCloseTo(0.9, 6);
    expect(at(2, 5)).toBeCloseTo(JUMP_TILES, 6);
    expect(at(9, 9)).toBeCloseTo(JUMP_TILES, 6);
  });

  it("gathers at the tail of the beat before and absorbs at the head of the beat after", () => {
    expect(wispJump(CFG, 5, 0.5).crouch).toBe(0);
    expect(wispJump(CFG, 5, 0.99).crouch).toBeGreaterThan(0.9);
    expect(wispJump(CFG, 7, 0).land).toBe(1);
    expect(wispJump(CFG, 7, 0.5).land).toBe(0);
  });

  /**
   * The dwell is what player 2 reads a letter and a number off, and it is why
   * `wispDwellBeats` had to grow: one beat of the six is the jump and the
   * gather and the landing take a third each off two more, which leaves three
   * whole beats of a body standing plainly still. At the old two it left none.
   */
  it("leaves most of a dwell completely still", () => {
    const still = [];
    for (let beat = 6; beat < 12; beat++) {
      for (const phase of [0.1, 0.5, 0.9]) {
        const j = wispJump(CFG, beat, phase);
        if (!j.flying && j.crouch === 0 && j.land === 0) still.push([beat, phase]);
      }
    }
    expect(still.length).toBeGreaterThan(CFG.wispDwellBeats);
  });

  it("never gathers or lands while it is in the air, whatever the dwell", () => {
    for (const wispDwellBeats of [1, 2, 6]) {
      const cfg = { ...CFG, wispDwellBeats };
      for (let beat = 0; beat < 8; beat++) {
        for (const phase of [0, 0.3, 0.7, 0.99]) {
          const j = wispJump(cfg, beat, phase);
          if (!j.flying) continue;
          expect(j.crouch).toBe(0);
          expect(j.land).toBe(0);
        }
      }
    }
  });
});

describe("the coordinate axes", () => {
  it("names columns A onward and rows 1 onward, counting toward the ship", () => {
    expect(colLabel(0)).toBe("A");
    expect(colLabel(4)).toBe("E");
    expect(colLabel(10)).toBe("K");
    expect(rowLabel(0)).toBe("1");
    expect(rowLabel(8)).toBe("9");
  });

  it("keeps going past the alphabet rather than running out", () => {
    expect(colLabel(25)).toBe("Z");
    expect(colLabel(26)).toBe("AA");
  });

  it("gives every column of the field a label of its own", () => {
    const seen = new Set<string>();
    for (let c = 0; c < CFG.cols; c++) seen.add(colLabel(c));
    expect(seen.size).toBe(CFG.cols);
  });
});

describe("CoordGrid", () => {
  it("comes up while something has to be named by tile and goes again when it does not", () => {
    const grid = new CoordGrid();
    expect(grid.shown).toBe(0);
    grid.update(1 / 60, true);
    expect(grid.shown).toBe(1);
    for (let i = 0; i < 60; i++) grid.update(1 / 60, false);
    expect(grid.shown).toBe(0);
  });

  it("is up on the first frame a wisp is out, so one paint is enough to see it", () => {
    // The asymmetry `coord-grid.ts` argues for, as a check: `tools/frames`
    // paints once, so anything eased into place on `dt` is invisible in every
    // picture ever taken of it.
    const grid = new CoordGrid();
    grid.update(1 / 60, true);
    expect(grid.shown).toBe(1);
  });

  it("eases on the way out — a lattice that vanished with the body reads as the kill", () => {
    const grid = new CoordGrid();
    grid.update(1 / 60, true);
    grid.update(1 / 60, false);
    expect(grid.shown).toBeGreaterThan(0);
    expect(grid.shown).toBeLessThan(1);
  });

  it("is back at nothing after a reset, so a restart does not inherit it", () => {
    const grid = new CoordGrid();
    for (let i = 0; i < 60; i++) grid.update(1 / 60, true);
    grid.clear();
    expect(grid.shown).toBe(0);
  });
});

describe("a wisp on the field", () => {
  const TICKS = TPB * 10;

  for (const role of ROLES) {
    it(`draws for ${role} without the canvas refusing a value`, () => {
      const { ctx } = frames(role, TICKS, [wisp(3)]);
      expect(ctx.calls).toBeGreaterThan(1000);
    });
  }

  /**
   * The creature itself, as a number. Player 2 draws a body, its spectrum
   * fill, its glow passes, a ring and a beam; player 1 draws an empty field
   * under the same lattice. If those two ever came out equal, something is
   * being drawn on the pilot's screen that names the tile.
   */
  it("costs the navigator's frame more than the pilot's, because only one has a body in it", () => {
    const p1 = frames("p1", TICKS, [wisp(3)]);
    const p2 = frames("p2", TICKS, [wisp(3)]);
    expect(p2.ctx.calls).toBeGreaterThan(p1.ctx.calls);
  });

  it("still moves — a run that never hopped would prove nothing about either", () => {
    const { world } = frames("test", TICKS, [wisp(3)]);
    const c = world.creatures[0];
    expect(c).toBeDefined();
    expect(c!.row !== 0 || c!.col !== 3).toBe(true);
  });

  it("puts the navigator on the mouth and the pilot on the ear", () => {
    const world = createWorld(CFG, 1, [wisp(3)]);
    for (let tick = 0; tick < TPB * 2; tick++) step(world, []);
    expect(commsCall(world)).toEqual({ p1: false, p2: true });
  });

  it("draws the lettered grid on both screens, so a tile said is a tile heard", () => {
    // The grid is the one part of this creature that is *not* split, and it
    // has to be: the seat reading the letter and the seat putting a cannon on
    // it are different people. A field with no wisp in it draws fewer calls
    // than the same field with one, on the pilot's screen — where the only
    // thing the wisp adds is the grid.
    const bare = frames("p1", TICKS, [{ beat: 0, col: 3, kind: "bulb", color: "cyan" }]);
    const gridded = frames("p1", TICKS, [wisp(3)]);
    expect(gridded.ctx.calls).toBeGreaterThan(bare.ctx.calls);
  });
});
