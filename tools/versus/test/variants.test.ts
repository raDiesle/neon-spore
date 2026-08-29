import { beforeAll, describe, expect, it } from "bun:test";
import { existsSync } from "node:fs";
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
import { VARIANTS } from "../candidates/index.js";
import { seedRandom } from "../seed.js";
import { apply, patchedFields, restore, slots, type Variant } from "../variant.js";

/**
 * A candidate that can win a vote and then fail `bun run check` at adoption
 * has failed at the worst possible moment: the expensive half — somebody
 * looking at two phones at 26 px and at tempo — is already spent, and the only
 * thing left to do with the answer is throw it away. So everything a candidate
 * could get wrong that a machine can see is caught here, before a pair sees it.
 */

const ROOT = Bun.fileURLToPath(new URL("../../../", import.meta.url));
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

/** Every key a record carries right now, and what each one is. */
function snapshot(target: object): Map<string, unknown> {
  const t = target as Record<string, unknown>;
  return new Map(Object.keys(t).map((k) => [k, t[k]]));
}

function expectSame(before: Map<string, unknown>, after: Map<string, unknown>): void {
  expect([...after.keys()].sort()).toEqual([...before.keys()].sort());
  for (const [k, v] of before) {
    // Object.is, not toEqual: an equal *copy* breaks the aliasing anyway.
    expect(Object.is(after.get(k), v)).toBe(true);
  }
}

describe("a patch puts back everything it touched", () => {
  for (const v of VARIANTS) {
    it(`${v.slot}/${v.name} restores every field on every record`, () => {
      const before = v.patches.map((p) => snapshot(p.target));
      const applied = apply(v);
      // Not vacuous: a patch that changed nothing restores perfectly.
      const changed = v.patches.some((p, i) =>
        patchedFields(p).some(
          (f) => !Object.is((p.target as Record<string, unknown>)[f], before[i]?.get(f)),
        ),
      );
      restore(applied);
      expect(changed).toBe(true);
      v.patches.forEach((p, i) => {
        const b = before[i];
        expect(b).toBeDefined();
        if (b) expectSame(b, snapshot(p.target));
      });
    });
  }
});

describe("a patch reaches the object the game draws", () => {
  for (const v of VARIANTS) {
    for (const p of v.patches) {
      it(`${v.slot}/${v.name}: ${p.where.symbol} is what the game's own route hands back`, () => {
        // The monkeypatch is only honest while the drawing code reads *this*
        // object every call. The day a lookup starts handing out a copy, the
        // pair draws the unpatched thing on both sides and looks like agreement.
        expect(p.reached()).toBe(p.target);
      });

      it(`${v.slot}/${v.name}: ${p.where.symbol} is not frozen`, () => {
        expect(Object.isFrozen(p.target)).toBe(false);
      });

      it(`${v.slot}/${v.name}: ${p.where.symbol} really lives in ${p.where.file}`, () => {
        expect(existsSync(`${ROOT}${p.where.file}`)).toBe(true);
        const source = Bun.file(`${ROOT}${p.where.file}`);
        expect(source.size).toBeGreaterThan(0);
      });

      it(`${v.slot}/${v.name}: ${p.where.symbol} patches fields the record has`, () => {
        const fields = patchedFields(p);
        expect(fields.length).toBeGreaterThan(0);
        for (const f of fields) expect(f in p.target).toBe(true);
      });
    }

    it(`${v.slot}/${v.name} names a directory that exists`, () => {
      // `dir` is what a vote's prompt tells a session to `git rm -r`, so a
      // drifted path turns the one destructive step of an adoption into a
      // no-op nobody notices.
      expect(existsSync(`${ROOT}${v.dir}`)).toBe(true);
    });
  }
});

describe("a slot is one question", () => {
  /** Which records and fields a candidate touches, as a comparable string. */
  function shape(v: Variant): string {
    return v.patches
      .map((p) => `${p.where.file}#${p.where.symbol}:${patchedFields(p).join(",")}`)
      .sort()
      .join(" | ");
  }

  for (const { slot, candidates } of slots(VARIANTS)) {
    it(`${slot}: every candidate patches the same records and the same fields`, () => {
      // Otherwise the pair is not an A/B: a field one candidate changes and
      // its rival leaves alone makes the vote a vote on two questions at once.
      const shapes = new Set(candidates.map(shape));
      expect([...shapes]).toHaveLength(1);
    });

    it(`${slot}: every candidate has its own name`, () => {
      const names = candidates.map((c) => c.name);
      expect(new Set(names).size).toBe(names.length);
    });
  }

  it("no field is claimed by two open slots at once", () => {
    // Two slots patching one field cannot both be decided: whichever is
    // adopted first moves the value the other one's `old -> new` was written
    // against, and the second prompt is stale before it is pasted.
    const claimed = new Map<object, Map<string, string>>();
    for (const v of VARIANTS) {
      for (const p of v.patches) {
        let byField = claimed.get(p.target);
        if (!byField) {
          byField = new Map();
          claimed.set(p.target, byField);
        }
        for (const f of patchedFields(p)) {
          const owner = byField.get(f);
          if (owner !== undefined && owner !== v.slot) {
            throw new Error(`${p.where.symbol}.${f} is claimed by both ${owner} and ${v.slot}`);
          }
          byField.set(f, v.slot);
        }
      }
    }
  });
});

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

/** A registry with nothing in it is a correct state — the seam outlives its slots. */
it("the registry is a list of variants, empty or not", () => {
  expect(Array.isArray(VARIANTS)).toBe(true);
  for (const v of VARIANTS) {
    expect(v.slot).toContain(":");
    expect(v.name.length).toBeGreaterThan(0);
    expect(v.sentence.length).toBeGreaterThan(10);
    expect(v.patches.length).toBeGreaterThan(0);
  }
});
