import { beforeAll, describe, expect, it } from "bun:test";
import { beats, type Pose } from "../../../packages/content/src/own-motion.js";
import { buildQueue } from "../../../packages/content/src/queue.js";
import { Canvas2DRenderer } from "../../../packages/render/src/canvas2d.js";
import { installCanvasGlobals, stubCanvas } from "../../../packages/render/test/canvas-stub.js";
import {
  createWorld,
  DEFAULT_CONFIG,
  step,
  ticksPerBeat,
} from "../../../packages/sim/src/index.js";
import { poseForSlot } from "../../director/src/versus-pose.js";
import { VARIANTS } from "../candidates/index.js";
import { seedRandom } from "../seed.js";
import { apply, restore } from "../variant.js";

/**
 * What a candidate actually draws, through a canvas that refuses what a real
 * one refuses.
 *
 * Split from `variants.test.ts` when that file reached CLAUDE.md's line
 * ceiling, along a seam it already had: next door is about the *shape* of a
 * patch — which record, which fields, whether it puts them back — and asks no
 * renderer anything. This is about the pixels, and every line of it needs a
 * canvas, a world and the whole render package. An unparseable colour, a NaN
 * coordinate or a negative radius is a crash or an invisible object in the
 * game and nothing at all in a typecheck, and this file is where that is
 * caught — before the expensive half, two people looking at two phones, has
 * been spent.
 */

const CFG = DEFAULT_CONFIG;

/**
 * Spec 5.8: own-motion may not touch the lane. A creature that swayed half a
 * tile would sit over the column line, and the whole readability of the field
 * rests on a player being able to say "column four" and mean it. The number
 * `packages/content/test/own-motion.test.ts` holds the shipped motions to,
 * held here against the ones that have not shipped.
 */
const LANE_LIMIT = 0.25;

beforeAll(installCanvasGlobals);

/** One world, a few dozen frames, through the canvas that refuses what a real one refuses. */
function drawFrames(ticks: number): number {
  const world = createWorld(CFG, 7, buildQueue(0, CFG.cols));
  const { canvas, ctx } = stubCanvas();
  const renderer = new Canvas2DRenderer(canvas);
  renderer.resize({ width: 760, height: 1640, dpr: 2 });

  const tpb = ticksPerBeat(CFG);
  for (let tick = 0; tick < ticks; tick++) {
    step(world, []);
    if (tick % 4 !== 0) continue;
    renderer.draw({
      world,
      beatPhase: (world.tick % tpb) / tpb,
      role: "test",
      time: tick / CFG.tickHz,
      dt: 4 / CFG.tickHz,
      events: world.events.slice(),
      running: true,
    });
  }
  return ctx.calls;
}

describe("a candidate survives a whole frame", () => {
  for (const v of VARIANTS) {
    it(`${v.slot}/${v.name} draws without the canvas objecting`, () => {
      const applied = apply(v);
      const unseed = seedRandom(1);
      try {
        // An unparseable colour, a NaN coordinate, a negative radius: each is a
        // crash or an invisible object in the game and nothing in a typecheck.
        expect(drawFrames(240)).toBeGreaterThan(0);
      } finally {
        unseed();
        restore(applied);
      }
    });
  }

  for (const v of VARIANTS) {
    for (const p of v.patches) {
      const replacement = (p.fields as Record<string, unknown>).poseAt;
      if (typeof replacement !== "function") continue;
      it(`${v.slot}/${v.name}: ${p.where.symbol}'s poseAt stays inside its column`, () => {
        const poseAt = replacement as (t: number) => Pose;
        for (let t = 0; t < 64; t += 0.01) {
          const pose = poseAt(beats(t));
          expect(Math.abs(pose.dx)).toBeLessThan(LANE_LIMIT);
          expect(Math.abs(pose.dy)).toBeLessThan(LANE_LIMIT);
          expect(pose.sx).toBeGreaterThan(0.5);
          expect(pose.sy).toBeGreaterThan(0.5);
          expect(pose.sx).toBeLessThan(2);
          expect(pose.sy).toBeLessThan(2);
        }
      });
    }
  }
});

/**
 * The same again, on the world the slot is actually judged on.
 *
 * `drawFrames` above runs wave 0, which is slicks and bulbs and nothing else —
 * so a candidate that patches a worm, a throb, a membrane or a rock was never
 * *drawn* by it at all. It passed by not being reached, which is the shape of a
 * test that reports a colour it never parsed. The pair opens every slot on
 * `poseForSlot`, so that is the world to draw: one build, a hundred and twenty
 * ticks of it, and the stub still refusing what a real canvas refuses.
 */
function drawPose(slot: string, ticks: number): number {
  const world = poseForSlot(slot).build();
  const { canvas, ctx } = stubCanvas();
  const renderer = new Canvas2DRenderer(canvas);
  renderer.resize({ width: 760, height: 1640, dpr: 2 });

  const tpb = ticksPerBeat(world.cfg);
  for (let tick = 0; tick < ticks; tick++) {
    step(world, []);
    if (tick % 4 !== 0) continue;
    renderer.draw({
      world,
      beatPhase: (world.tick % tpb) / tpb,
      role: "test",
      time: tick / world.cfg.tickHz,
      dt: 4 / world.cfg.tickHz,
      events: world.events.slice(),
      running: true,
    });
  }
  return ctx.calls;
}

describe("a candidate survives the state it is judged on", () => {
  for (const v of VARIANTS) {
    it(`${v.slot}/${v.name} draws on its own pose without the canvas objecting`, () => {
      const applied = apply(v);
      const unseed = seedRandom(1);
      try {
        expect(drawPose(v.slot, 120)).toBeGreaterThan(0);
      } finally {
        unseed();
        restore(applied);
      }
    });
  }
});

describe("the seeded stream", () => {
  it("hands both sides of a frame the same numbers, all of them inside 0..1", () => {
    const take = (seed: number) => {
      const unseed = seedRandom(seed);
      const out = Array.from({ length: 5000 }, () => Math.random());
      unseed();
      return out;
    };
    const a = take(4);
    expect(a).toEqual(take(4));
    expect(a).not.toEqual(take(5));
    for (const n of a) {
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1);
    }
  });

  it("puts the real one back — a fake left installed makes every later frame lie", () => {
    const real = Math.random;
    const unseed = seedRandom(1);
    expect(Math.random).not.toBe(real);
    unseed();
    expect(Math.random).toBe(real);
  });
});
