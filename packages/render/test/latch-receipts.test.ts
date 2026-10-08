import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { strikeFrom } from "../src/boss-strike-from.js";
import { lash, type StrikeFrame, strikeLook } from "../src/boss-strike-look.js";
import { LatchFx } from "../src/latch-fx.js";
import { LATCH_AT_REST, latchPose } from "../src/latch-pose.js";
import { drawLatchTorn } from "../src/latch-receipts.js";
import { latchBodies, latchRoot } from "../src/latch-shape.js";
import { computeLayout } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { stubCanvas } from "./canvas-stub.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, VIEWPORT } from "./frame-harness.js";
import { posed, stood } from "./latch-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **What THE LATCH leaves behind a frame** (`render/src/latch-fx.ts`,
 * `latch-receipts.ts`, `latch-blow.ts`): the body a knot tears off, flung
 * clear from where it was drawn and falling away; the hull's shudder as the
 * tendril hooks in and as the rope snaps; and its own blow at the hull, a
 * whip cracked down the rope from the core. The blow a knot deals is
 * `boss-hurt.test.ts`'s row.
 */

beforeAll(installCanvasGlobals);

const l = computeLayout(VIEWPORT, CFG, "test");
const BEAT = 0.5;

function torn() {
  const world = stood();
  const s = posed(world);
  const fx = new LatchFx();
  const bodies = latchBodies(l, CFG, s, latchPose(s, CFG, world.beat, 0), 0);
  fx.note(bodies);
  fx.ingest([{ type: "latchKnot", knots: 1, col: 5 }], l, CFG, BEAT, () => {});
  return { fx, body: bodies.find((b) => b.knot === 1) };
}

describe("THE LATCH's receipts", () => {
  it("tears off the body the knot pulled in, from where it was drawn", () => {
    const { fx, body } = torn();
    expect(body).toBeDefined();
    expect(fx.torn).toMatchObject({ now: 1, x: body?.x, y: body?.y, r: body?.r });
  });

  it("draws the torn body falling away, and nothing once it has gone", () => {
    const { fx } = torn();
    const drawn = (): string => {
      const { ctx } = stubCanvas();
      ctx.log = [];
      drawLatchTorn(ctx as unknown as CanvasRenderingContext2D, l, fx.torn);
      return ctx.log.join("|");
    };
    expect(drawn()).toContain(PALETTE.latchSkin);
    for (let i = 0; i < 120; i++) fx.update(1 / 30);
    expect(fx.torn.now).toBe(0);
    expect(drawn()).not.toContain(PALETTE.latchSkin);
  });

  it("shudders the hull as the tendril hooks in, and harder as the rope snaps", () => {
    const fx = new LatchFx();
    fx.ingest([{ type: "latchEnter", col: 5 }], l, CFG, BEAT, () => {});
    const hook = fx.shock.now;
    fx.clear();
    fx.ingest([{ type: "latchSpent", col: 5 }], l, CFG, BEAT, () => {});
    expect(hook).toBeGreaterThan(0);
    expect(fx.shock.now).toBeGreaterThan(hook);
  });

  it("throws no torn body for a knot it never drew", () => {
    const fx = new LatchFx();
    fx.ingest([{ type: "latchKnot", knots: 1, col: 5 }], l, CFG, BEAT, () => {});
    expect(fx.torn.now).toBe(0);
    expect(fx.hurt.value).toBe(1);
  });
});

describe("THE LATCH's own blow", () => {
  it("leaves from under the core and cracks the rope down to the hull, splitting it once landed", () => {
    const from = strikeFrom(l, CFG, "latch");
    expect(from).toEqual(latchRoot(l, CFG, LATCH_AT_REST));
    const look = strikeLook("latch");
    expect(look).not.toBe(lash);
    const frame = {
      l,
      blow: undefined,
      from,
      to: { x: from.x, y: l.hullY },
      tile: l.tile,
      time: 0,
    };
    const calls = (f: StrikeFrame): number => {
      const { ctx } = stubCanvas();
      look(ctx as unknown as CanvasRenderingContext2D, f);
      return ctx.calls;
    };
    expect(calls({ ...frame, reach: 0.5, after: 0 })).toBeGreaterThan(0);
    expect(calls({ ...frame, reach: 1, after: 0.3 })).toBeGreaterThan(
      calls({ ...frame, reach: 0.5, after: 0 }),
    );
    expect(calls({ ...frame, reach: 1, after: 1 })).toBe(0);
  });
});
