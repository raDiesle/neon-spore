import { beforeAll, describe, expect, it } from "bun:test";
import { type Creature, NO_SHELL } from "@neon-spore/sim";
import { computeLayout } from "../src/layout.js";
import { drawLiving } from "../src/living-draw.js";
import { CFG, installCanvasGlobals, stubCanvas, VIEWPORT } from "./frame-harness.js";

/**
 * The owner's report of 11 September 2026: *the inner animation of the red
 * rind is sometimes outside of the body.* A rind wears BURR and draws the
 * slick's bloom inside it, and the bloom was laid out for the slick's long
 * body, so between two knobs its veins stood past the rim. The fix is a clip
 * to the body drawn smaller about its centre (`body-inset.ts`), opened for
 * every living body — this test pins that it is opened at all, on a bare
 * body as much as on the one that showed it. The canvas stub cannot see
 * where a vein ends; the picture was judged by eye, and what can be counted
 * is that the interior is drawn under a second clip, inside the skin's own.
 */

const L = computeLayout(VIEWPORT, CFG, "test");

beforeAll(installCanvasGlobals);

function body(kind: Creature["kind"], extra: Partial<Creature> = {}): Creature {
  return {
    id: 1,
    kind,
    col: 3,
    row: 5,
    fromRow: 5,
    color: "red",
    holes: 0,
    petals: 0,
    dragMilli: 0,
    shell: NO_SHELL,
    ...extra,
  } as Creature;
}

function clipsFor(c: Creature): number {
  const { ctx } = stubCanvas();
  const ctx2d = ctx as unknown as CanvasRenderingContext2D;
  drawLiving(ctx2d, L, c, 200, 300, 4, 0.3, 1.5, 0, CFG, 0.4);
  return ctx.tally.get("clip") ?? 0;
}

describe("a living body's interior", () => {
  it("is clipped a second time, inside the skin's own clip, on a rind wearing BURR", () => {
    // Two layers on: the knobbed body the report was about.
    expect(clipsFor(body("rind", { rindLayers: 2 }))).toBe(2);
  });

  it("and on a plain slick and bulb, so the rule is the body's and not the rind's", () => {
    expect(clipsFor(body("slick"))).toBe(2);
    expect(clipsFor(body("bulb"))).toBe(2);
  });

  it("is not clipped when the body is only an outline — a blocked shot draws no interior", () => {
    const { ctx } = stubCanvas();
    drawLiving(
      ctx as unknown as CanvasRenderingContext2D,
      L,
      body("slick"),
      200,
      300,
      4,
      0.3,
      1.5,
      1,
      CFG,
      0.4,
    );
    expect(ctx.tally.get("clip") ?? 0).toBe(0);
  });
});
