import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { trapezeBoss } from "@neon-spore/sim";
import { computeLayout } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { drawTrapeze } from "../src/trapeze-draw.js";
import { TrapezeFx } from "../src/trapeze-fx.js";
import { trapezeGongPx, trapezeOnArc } from "../src/trapeze-shape.js";
import { stubCanvas } from "./canvas-stub.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES, VIEWPORT } from "./frame-harness.js";
import { BACK_LEFT, count, frame, posed, stood } from "./trapeze-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE TRAPEZE, drawn (`render/src/trapeze-draw.ts`): the swing on its long
 * ropes with the alien on it, the zones badged with the seat that pushes
 * there, the gong at its angle with the gauge running up to it, and the word
 * a refused swipe stands — on all three screens, set rather than played to;
 * `sim/test/trapeze.test.ts` proves the rules.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) frame(role, () => {});
});

const L = computeLayout(VIEWPORT, CFG, "test");

/** One drawing of the posed swing on `role`'s screen, with the words it wrote. */
function drawn(
  role: (typeof ROLES)[number],
  arrange: Parameters<typeof posed>[3],
  ask = "push" as const,
  tick = BACK_LEFT,
  fx = new TrapezeFx(),
) {
  const world = stood();
  const s = posed(world, ask, tick, arrange);
  const { ctx } = stubCanvas();
  ctx.texts = [];
  const l = computeLayout(VIEWPORT, CFG, role);
  drawTrapeze(ctx as unknown as CanvasRenderingContext2D, l, world, s, world.beat, 0.5, 0, fx);
  return { ctx, words: ctx.texts.map((t) => t.text) };
}

describe("THE TRAPEZE's swing", () => {
  it.each(ROLES)("draws the ropes, the plank and the alien in the game's frame, on %s", (role) => {
    const log = frame(role, (w) => posed(w, "push", BACK_LEFT));
    expect(count(log, PALETTE.trapezeRopeDark)).toBeGreaterThan(0);
    expect(count(log, PALETTE.trapezeWood)).toBeGreaterThan(0);
    expect(count(log, PALETTE.trapezeAlien)).toBeGreaterThan(0);
  });

  it("hangs from above the field, its seat at rest two thirds of the way down", () => {
    const seat = trapezeOnArc(L, CFG, 0);
    expect(seat.y).toBeGreaterThan(L.gridTop + 0.5 * (L.hullY - L.gridTop));
    expect(seat.y).toBeLessThan(L.hullY - 3 * L.tile);
  });

  it("hangs the gong at the end of the swing on its side, inside the field", () => {
    const world = stood();
    const s = posed(world, "push");
    const step = s.steps[0];
    if (step === undefined) throw new Error("no level");
    const gong = trapezeGongPx(L, CFG, step);
    expect(gong.x).toBeGreaterThan(trapezeOnArc(L, CFG, 0).x);
    expect(gong.x).toBeLessThan(L.gridLeft + L.cols * L.tile);
    expect(trapezeBoss(world)).not.toBeNull();
  });
});

describe("the zones", () => {
  it("are badged with the seat that pushes on each side, in a swipe level", () => {
    expect(drawn("test", () => {}).words.sort()).toEqual(["P1", "P2"]);
    expect(drawn("test", (s) => (s.callers = [1, 0])).words.sort()).toEqual(["P1", "P2"]);
  });

  it("are not drawn in a shot level", () => {
    expect(drawn("test", () => {}, "shoot" as never).words).toEqual([]);
  });

  it("light the open zone, loud on its seat's screen and faint on the other", () => {
    const mine = drawn("p1", () => {});
    const theirs = drawn("p2", () => {});
    const shut = drawn("p1", (s) => (s.pushedHalf = s.half));
    expect(mine.ctx.calls).toBeGreaterThan(shut.ctx.calls);
    expect(theirs.ctx.calls).toBeGreaterThan(shut.ctx.calls);
  });
});

describe("a swipe that did nothing", () => {
  it("says why in its zone", () => {
    const fx = new TrapezeFx();
    fx.ingest(
      [{ type: "trapezeWhiff", seat: 1, zone: -1, why: "seat", col: 3 }],
      L,
      CFG,
      0.6,
      () => {},
    );
    expect(drawn("test", () => {}, "push", BACK_LEFT, fx).words).toContain("NOT YOUR SIDE");
    for (let i = 0; i < 60; i++) fx.update(1 / 30);
    expect(drawn("test", () => {}, "push", BACK_LEFT, fx).words).not.toContain("NOT YOUR SIDE");
  });
});
