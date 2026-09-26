import { beforeAll, describe, expect, it } from "bun:test";
import { Canvas2DRenderer } from "../../../packages/render/src/canvas2d.js";
import { SLOW_LOOK } from "../../../packages/render/src/slow-look.js";
import { installCanvasGlobals, stubCanvas } from "../../../packages/render/test/canvas-stub.js";
import { beatPhase, step } from "../../../packages/sim/src/index.js";
import { seedRandom } from "../../versus/seed.js";
import { apply, restore, type Variant } from "../../versus/variant.js";
import { EFFECTS, type Effect, effectById, effectUrl } from "../src/effects/index.js";

/**
 * GRAPHICS → EFFECTS keeps effects the game no longer draws, and nothing in
 * the game's own tests reaches them any more — so what VERSUS's
 * `frames.test.ts` held them to as candidates is held here: each one is drawn
 * on the pose its page opens, through the canvas that refuses what a real one
 * refuses, and each one draws something the shipped look does not.
 */

beforeAll(installCanvasGlobals);

/** Canvas calls over a hundred and twenty ticks of the effect's own pose. */
function drawPose(effect: Effect, variant: Variant | null): number {
  const world = effect.pose.build();
  const { canvas, ctx } = stubCanvas();
  const renderer = new Canvas2DRenderer(canvas);
  renderer.resize({ width: 760, height: 1640, dpr: 2 });
  const applied = variant ? apply(variant) : null;
  const unseed = seedRandom(1);
  try {
    for (let tick = 0; tick < 120; tick++) {
      step(world, effect.pose.hand ? effect.pose.hand(world) : []);
      if (tick % 4 !== 0) continue;
      renderer.draw({
        world,
        beatPhase: beatPhase(world.cfg, world.tick),
        role: "test",
        time: tick / world.cfg.tickHz,
        dt: 4 / world.cfg.tickHz,
        events: world.events.slice(),
        running: true,
      });
    }
  } finally {
    unseed();
    if (applied) restore(applied);
  }
  return ctx.calls;
}

describe("the kept effects", () => {
  it("each has its own address, and the address finds it", () => {
    expect(new Set(EFFECTS.map((e) => e.id)).size).toBe(EFFECTS.length);
    for (const e of EFFECTS) {
      const id = new URLSearchParams(effectUrl(e).split("?")[1]).get("effect");
      expect(effectById(id)).toBe(e);
    }
    expect(effectById("slow-light/streems")).toBeUndefined();
  });

  it("exactly one of the slow:light group is the one in the game, and it is what ships", () => {
    const shipped = EFFECTS.filter((e) => e.inGame);
    expect(shipped.map((e) => e.id)).toEqual(["slow-light/crawl"]);
    expect(shipped[0]?.variant.patches[0]?.fields).toEqual({ paint: SLOW_LOOK.paint });
  });

  for (const e of EFFECTS) {
    it(`${e.id} patches the record the game draws`, () => {
      for (const p of e.variant.patches) expect(p.reached()).toBe(p.target);
    });
  }

  // Drawn once, on first use, after `beforeAll` has put a canvas in reach.
  let shippedCalls: number | null = null;
  const shipped = (): number => {
    shippedCalls ??= drawPose(EFFECTS[0] as Effect, null);
    return shippedCalls;
  };
  for (const e of EFFECTS) {
    it(`${e.id} draws on its own pose${e.inGame ? "" : ", and draws something else than CRAWL"}`, () => {
      const calls = drawPose(e, e.variant);
      expect(calls).toBeGreaterThan(0);
      if (e.inGame) expect(calls).toBe(shipped());
      else expect(calls).not.toBe(shipped());
    });
  }
});
