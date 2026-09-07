import { beforeAll, describe, expect, it } from "bun:test";
import { createWorld, type SpawnEntry } from "@neon-spore/sim";
import { drawRadar } from "../src/field.js";
import { computeLayout, tileCY, type ViewRole } from "../src/layout.js";
import { radarBlips } from "../src/radar-blip.js";
import { CFG, installCanvasGlobals, stubCanvas } from "./frame-harness.js";

/**
 * Radar ownership crosses the controls: p1 reads rocks, p2 reads the living.
 * A single queued body must draw on one strip and nowhere on the other.
 */

beforeAll(installCanvasGlobals);

describe("the radar", () => {
  const layout = (role: ViewRole) => computeLayout({ width: 900, height: 1600, dpr: 1 }, CFG, role);

  /** A rock the wave sent across, authored in the middle of the field so the
   * wall it enters at can never be the column it was painted in. */
  const rock = (col: number, cross: -1 | 1, row: number): SpawnEntry => ({
    beat: 2,
    col,
    kind: "meteor",
    color: null,
    cross,
    row,
  });

  function strips(queue: SpawnEntry[]) {
    const world = createWorld(CFG, 1, queue);
    const p1 = stubCanvas();
    drawRadar(p1.ctx as unknown as CanvasRenderingContext2D, layout("p1"), world);
    const p2 = stubCanvas();
    drawRadar(p2.ctx as unknown as CanvasRenderingContext2D, layout("p2"), world);
    return { p1: p1.ctx, p2: p2.ctx };
  }

  it("shows a rock's arrival to p1 only, never to p2", () => {
    const { p1, p2 } = strips([{ beat: 2, col: 3, kind: "meteor", color: null }]);
    expect(p1.calls).toBeGreaterThan(0);
    expect(p2.calls).toBe(0);
  });

  it("shows a living arrival to p2 only, never to p1", () => {
    const { p1, p2 } = strips([{ beat: 2, col: 3, kind: "slick", color: "red" }]);
    expect(p1.calls).toBe(0);
    expect(p2.calls).toBeGreaterThan(0);
  });

  /**
   * **A rock that comes over a side wall is marked at that wall, on the row it
   * will hold, pointing the way it will fly.** Not on the strip along the top:
   * that strip answers *which column* with horizontal place and *how soon*
   * with height, and a body entering at an edge has no column at all — what
   * the pair needs before it appears is the row and the side.
   *
   * Three facts, all rules rather than looks: the mark is at the wall the rock
   * will actually enter at (`rockEntryCol`, never the authored column), it is
   * down in the field at that row rather than above it, and it carries the
   * heading so the arrow can point.
   */
  it("marks a crossing rock at the wall and the row it will come in on", () => {
    const l = layout("p1");
    const right = radarBlips(l, createWorld(CFG, 1, [rock(3, 1, 5)]))[0];
    const left = radarBlips(l, createWorld(CFG, 1, [rock(3, -1, 5)]))[0];
    expect(right?.cross).toBe(1);
    expect(left?.cross).toBe(-1);
    // One at each wall, and neither where the author painted it.
    expect(right?.x).toBeLessThan(left?.x ?? 0);
    expect(right?.y).toBeCloseTo(tileCY(l, 5));
    expect(left?.y).toBeCloseTo(tileCY(l, 5));
    // A different row is a different place, which is the whole of the warning.
    const higher = radarBlips(l, createWorld(CFG, 1, [rock(3, 1, 2)]))[0];
    expect(higher?.y).toBeLessThan(right?.y ?? 0);
  });

  it("leaves a falling rock on the strip above the field", () => {
    const l = layout("p1");
    const fall: SpawnEntry = { beat: 2, col: 3, kind: "meteor", color: null };
    const plain = radarBlips(l, createWorld(CFG, 1, [fall]))[0];
    expect(plain?.cross).toBeUndefined();
    expect(plain?.y).toBeLessThan(l.gridTop);
  });

  it("draws that blip rather than skipping it", () => {
    const { p1 } = strips([rock(3, 1, 5)]);
    expect(p1.calls).toBeGreaterThan(0);
  });

  /**
   * A lure arrives on player 2's strip carrying the exclamation and its name;
   * on player 1's it carries nothing, because player 1's strip carries `guard`
   * kinds only. That is the same rule the test above checks for a slick — the
   * point here is that the alarm rides on it rather than around it.
   */
  it("marks a lure on p2's strip and leaves p1's as blank as a slick's", () => {
    const lure = strips([{ beat: 2, col: 3, kind: "lure", color: "cyan", wears: "bulb" }]);
    expect(lure.p1.calls).toBe(0);

    // More than the plain blip a real bulb draws: the glyph and the word.
    const bulb = strips([{ beat: 2, col: 3, kind: "bulb", color: "cyan" }]);
    expect(lure.p2.calls).toBeGreaterThan(bulb.p2.calls);
  });
});
