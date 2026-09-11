import { beforeAll, describe, expect, it } from "bun:test";
import type { SimEvent } from "@neon-spore/sim";
import { computeLayout } from "../src/layout.js";
import { fuseFronts, StrandFuseFx, sampleThread } from "../src/strand-fuse.js";
import { CFG, installCanvasGlobals, stubCanvas, VIEWPORT } from "./frame-harness.js";

/**
 * The owner's ask, 11 September 2026: *when all bulb and slick are destroyed
 * there must be a nice animation how the string is destroyed — like a fuse in
 * the air, a bigger effect.*
 *
 * A fuse is a claim about order: it is lit at the ends, the middle goes last,
 * and the big moment is at the end rather than at the start. Pixels are not
 * assertable, but where the fronts stand and how many raisins are still on
 * the line are, and the meeting is the frame the line stops being drawn.
 */

beforeAll(installCanvasGlobals);

const L = computeLayout(VIEWPORT, CFG, "test");
const TILE = L.tile;

function broke(cols: number[]): SimEvent {
  const beads = cols.map((col, i) => ({ id: 10 + i, col, row: 4 }));
  const mid = beads[Math.floor(beads.length / 2)]!;
  return { type: "strandBroke", col: mid.col, row: mid.row, beads };
}

function lit(cols = [2, 3, 4, 5, 6]): StrandFuseFx {
  const fx = new StrandFuseFx();
  fx.ingest([broke(cols)], L, CFG, 12.5);
  return fx;
}

/** The raisins drawn this frame: each is one `Path2D` from `blobPath` filled
 * as a path, and nothing else in the picture fills a path — the fronts and
 * the blast fill the current arc. */
function raisins(fx: StrandFuseFx): number {
  const { ctx } = stubCanvas();
  let n = 0;
  const orig = ctx.fill.bind(ctx);
  ctx.fill = (...a: unknown[]) => {
    if (a.length > 0) n++;
    return (orig as (...a: unknown[]) => void)(...a);
  };
  fx.draw(ctx as unknown as CanvasRenderingContext2D, L);
  return n;
}

describe("THE STRAND's thread burning like a fuse", () => {
  it("hangs the line through the beads with the thread's own sag", () => {
    const pts = sampleThread(
      [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ],
      TILE,
    );
    expect(pts[0]!.s).toBe(0);
    // Longer than the straight line, because it sags, and it sags downward.
    expect(pts[pts.length - 1]!.s).toBeGreaterThan(100);
    expect(Math.max(...pts.map((p) => p.y))).toBeGreaterThan(TILE * 0.25);
  });

  it("lights both ends and meets in the middle", () => {
    const [a0, b0] = fuseFronts(400, 0);
    const [a1, b1] = fuseFronts(400, 0.5);
    const [a2, b2] = fuseFronts(400, 1);
    expect([a0, b0]).toEqual([0, 400]);
    expect(a1).toBeLessThan(b1);
    expect(a1).toBeGreaterThan(a0);
    expect(b1).toBeLessThan(b0);
    expect(a2).toBe(b2);
  });

  it("carries every raisin on the frame it is lit and drops the ends first", () => {
    const fx = lit();
    expect(raisins(fx)).toBe(5);
    // A third of the way along: the two outer raisins have gone, the three
    // inner ones are still hanging.
    for (let i = 0; i < 20; i++) fx.update(1 / 60);
    expect(raisins(fx)).toBe(3);
    for (let i = 0; i < 25; i++) fx.update(1 / 60);
    expect(raisins(fx)).toBe(1);
  });

  it("keeps burning past a beat, then blasts, then is gone", () => {
    const fx = lit();
    // A beat in (0.625 s at 96 bpm): still burning, the middle raisin on it.
    for (let i = 0; i < 38; i++) fx.update(1 / 60);
    expect(raisins(fx)).toBe(1);
    // A little over a second: the fronts have met, the blast is on.
    for (let i = 0; i < 32; i++) fx.update(1 / 60);
    const later = stubCanvas().ctx;
    fx.draw(later as unknown as CanvasRenderingContext2D, L);
    // The blast: no line and no raisin left, but a picture still.
    expect(later.calls).toBeGreaterThan(0);
    expect(raisins(fx)).toBe(0);
    for (let i = 0; i < 40; i++) fx.update(1 / 60);
    const gone = stubCanvas().ctx;
    fx.draw(gone as unknown as CanvasRenderingContext2D, L);
    expect(gone.calls).toBe(0);
  });

  it("ignores an event with no beads and clears to new", () => {
    const fx = new StrandFuseFx();
    fx.ingest([{ type: "strandBroke", col: 3, row: 5, beads: [] }], L, CFG, 0);
    const { ctx } = stubCanvas();
    fx.draw(ctx as unknown as CanvasRenderingContext2D, L);
    expect(ctx.calls).toBe(0);
    const two = lit();
    two.clear();
    expect(two).toEqual(new StrandFuseFx());
  });
});
