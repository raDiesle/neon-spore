import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  setDefaultTimeout,
  test,
} from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import { createWorld, startWave, ticksPerBeat } from "@neon-spore/sim";
import { HUSH } from "../src/idle-drift.js";
import { type PartAngles, partDrift, partSeed, STILL } from "../src/idle-drift-parts.js";
import { tileCX, tileCY } from "../src/layout.js";
import { OUTLINE_DRIFT, OUTLINE_SEED } from "../src/outline-drift.js";
import { OUTLINE_PARTS, PART, partMatrix, partPoint } from "../src/outline-parts.js";
import { QUEEN_FIGURE, queenMarkCenter } from "../src/queen-figure.js";
import { type QueenParts, queenPartLengths, queenParts, swingWings } from "../src/queen-parts.js";
import { queenShellParts } from "../src/queen-shell.js";
import { correlation, maxSpeed, sample } from "./drift-stats.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  runFrames,
  waveWith,
} from "./frame-harness.js";
import { queenOnField } from "./queen-on-field.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);
beforeAll(installCanvasGlobals);

/**
 * THE OUTLINE TIER's parts (`outline-parts.ts`) and the first boss that has
 * them, THE BULB QUEEN (`queen-parts.ts`): a part's matrix keeps its joint,
 * every tip moves far enough to be seen and no further, no mark rides a moving
 * part, her pairs are exact mirrors, and her parts are out of step with one
 * another. Her arms, the large ones, are `queen-arm-parts.test.ts`.
 */

const saved = { drift: { ...OUTLINE_DRIFT }, parts: { ...OUTLINE_PARTS } };
beforeEach(() => {
  OUTLINE_PARTS.queen = saved.parts.queen;
});
afterEach(() => {
  Object.assign(OUTLINE_DRIFT, saved.drift);
  Object.assign(OUTLINE_PARTS, saved.parts);
});

describe("a part's matrix", () => {
  const joint = { x: 120, y: 80 };
  test("keeps its joint where it is, and is the identity at rest", () => {
    const m = partMatrix({ turn: 0.1, tilt: 0.08, rotate: -0.05 }, { joint, axis: 0.7 });
    const at = partPoint(m, joint);
    expect(at.x).toBeCloseTo(joint.x, 9);
    expect(at.y).toBeCloseTo(joint.y, 9);
    const still = partMatrix(STILL, { joint, axis: 1.1 });
    for (const [i, v] of [1, 0, 0, 1, 0, 0].entries()) expect(still[i]).toBeCloseTo(v, 12);
  });

  test("a rotate turns the tip about the joint by that angle", () => {
    const m = partMatrix({ turn: 0, tilt: 0, rotate: 0.1 }, { joint, axis: 0 });
    const tip = partPoint(m, { x: joint.x + 50, y: joint.y });
    expect(Math.atan2(tip.y - joint.y, tip.x - joint.x)).toBeCloseTo(0.1, 12);
  });

  test("the left of a pair, pointing the other way with its angles mirrored, is the right's reflection", () => {
    const a = { turn: 0.09, tilt: 0.05, rotate: 0.07 };
    const m = { turn: -a.turn, tilt: a.tilt, rotate: -a.rotate };
    const right = partMatrix(a, { joint: { x: 30, y: 10 }, axis: 0 });
    const left = partMatrix(m, { joint: { x: -30, y: 10 }, axis: Math.PI });
    for (const q of [
      { x: 60, y: 4 },
      { x: 45, y: 30 },
    ]) {
      const r = partPoint(right, q);
      const lq = partPoint(left, { x: -q.x, y: q.y });
      expect(lq.x).toBeCloseTo(-r.x, 9);
      expect(lq.y).toBeCloseTo(r.y, 9);
    }
  });
});

describe("THE BULB QUEEN's parts", () => {
  test("ship moving", () => {
    expect(saved.parts.queen).toBe(1);
  });

  test("at 0 none of them moves, and hushed to nothing none moves either", () => {
    const { l, queen, root } = queenOnField();
    expect(queenParts(l, queen, 3.3, HUSH.beaten, root.reach)).toBeNull();
    OUTLINE_PARTS.queen = 0;
    expect(queenParts(l, queen, 3.3, 1, root.reach)).toBeNull();
  });

  test("she moves at most eight parts, a pair counting as two, and none under the size floor", () => {
    const { l, queen } = queenOnField();
    const lengths = queenPartLengths(l, queen);
    expect(Object.keys(lengths).length * 2).toBeLessThanOrEqual(PART.most);
    for (const len of Object.values(lengths)) expect(len).toBeGreaterThan(PART.minTiles);
  });

  test("each pair is an exact mirror, so neither torch says which side", () => {
    const { l, queen, root } = queenOnField();
    for (const t of [0.4, 17.2, 311.9]) {
      const p = queenParts(l, queen, t, 1, root.reach) as QueenParts;
      for (const k of ["wing", "arm"] as const) {
        const r = p[k].right as PartAngles;
        const lf = p[k].left as PartAngles;
        expect(lf.rotate).toBeCloseTo(-r.rotate, 12);
        expect(lf.turn).toBeCloseTo(-r.turn, 12);
        expect(lf.tilt).toBeCloseTo(r.tilt, 12);
      }
    }
  });

  // The owner could not see a fifth of a tile (`docs/looks.md`, *Big enough to be seen*).
  test("every wing's tip moves far enough to be seen, and never past `PART.tip`", () => {
    const { l, queen, root } = queenOnField();
    const tile = l.tile;
    const len = queenPartLengths(l, queen).wing;
    let worst = 0;
    for (let f = 0; f <= 600 * 20; f++) {
      const a = (queenParts(l, queen, f / 20, 1, root.reach) as QueenParts).wing
        .right as PartAngles;
      const tip = partPoint(partMatrix(a, { joint: { x: 0, y: 0 }, axis: 0 }), {
        x: len * tile,
        y: 0,
      });
      worst = Math.max(worst, Math.hypot(tip.x - len * tile, tip.y) / tile);
    }
    expect(worst).toBeLessThanOrEqual(PART.tip);
    expect(worst).toBeGreaterThan(PART.tip * 0.6);
  });

  test("no wing comes within a mark's reach at its widest, so no hit test has a part to follow", () => {
    const { l, queen, root } = queenOnField();
    const tile = l.tile;
    const bodyX = tileCX(l, queen.col);
    const bodyY = tileCY(l, queen.row) + QUEEN_FIGURE.bodyCy * tile;
    const marks = ([-1, 1] as const).map((side) => queenMarkCenter(l, queen, side));
    let nearest = Infinity;
    for (let f = 0; f <= 600 * 4; f++) {
      const t = f / 4;
      const p = queenParts(l, queen, t, 1, root.reach) as QueenParts;
      const shell = queenShellParts(QUEEN_FIGURE.bodyRx * tile, QUEEN_FIGURE.bodyRy * tile, t);
      const swung = swingWings(shell, p.wing);
      for (const w of [swung.right, swung.left])
        for (const q of w.points)
          for (const m of marks)
            nearest = Math.min(nearest, Math.hypot(q.x + bodyX - m.x, q.y + bodyY - m.y) - m.r);
    }
    expect(nearest).toBeGreaterThan(0);
  });

  test("no part is faster than 30° a second as drawn", () => {
    const { l, queen, root } = queenOnField();
    for (const k of ["wing", "arm"] as const) {
      const at = (t: number) => (queenParts(l, queen, t, 1, root.reach) as QueenParts)[k].right;
      expect(maxSpeed(sample((t) => at(t)?.rotate ?? 0, 120))).toBeLessThanOrEqual(30);
    }
  });

  test("her parts are out of step with one another", () => {
    const own = (index: number, row: "wing" | "arm") =>
      sample((t) => partDrift(t, partSeed(OUTLINE_SEED.queen, index), row, () => STILL).rotate);
    expect(Math.abs(correlation(own(0, "wing"), own(1, "arm")))).toBeLessThan(0.3);
  });
});

describe("THE BULB QUEEN drawn with her parts moving", () => {
  /** Eight beats of her wave: the context, with every op it was asked for logged. */
  const frames = () => {
    const world = createWorld(CFG, 7, buildQueue(0, CFG.cols));
    const index = waveWith("queen");
    startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
    return runFrames(world, "test", ticksPerBeat(CFG) * 8, {
      onCanvas: (ctx) => {
        ctx.log = [];
      },
    }).ctx;
  };

  // A wing is its points moved and an elbow is one point moved: no op is added.
  // The first run fills the module caches (a torch's shell, the organs), so it is thrown away.
  test("draws without the canvas refusing a value, with no more draws or ops than still", () => {
    const total = (t: ReadonlyMap<string, number>) => [...t.values()].reduce((a, b) => a + b, 0);
    frames();
    const moving = frames();
    OUTLINE_PARTS.queen = 0;
    const still = frames();
    expect(moving.calls).toBe(still.calls);
    expect(total(moving.tally)).toBe(total(still.tally));
    expect(moving.log?.join(" ")).not.toBe(still.log?.join(" "));
  });
});
