import { afterEach, describe, expect, test } from "bun:test";
import { HUSH } from "../src/idle-drift.js";
import {
  OUTLINE,
  OUTLINE_DRIFT,
  type OutlineBoss,
  outlinePose,
  posePoint,
} from "../src/outline-drift.js";

/**
 * THE OUTLINE TIER's pose (`outline-drift.ts`) is capped by what it does to a
 * body's farthest point, since the hit tests read the rest pose: no point
 * within reach ever moves more than `OUTLINE.shift` of a tile, and while THE
 * SLOW holds it at a tenth, no point moves faster than the tenth of a tile a
 * wall-clock second `boss-hush.test.ts` holds every mark to.
 */

const TILE = 80;
const BOSSES: readonly OutlineBoss[] = ["queen", "cairn", "reprise"];
const ROOT = { x: 400, y: 300 };
/** The ring of points at the reach, eight round it. */
const RIM = Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2);
const FPS = 60;

const saved = { ...OUTLINE_DRIFT };
afterEach(() => Object.assign(OUTLINE_DRIFT, saved));

/** The farthest and the fastest any rim point goes over `seconds`, in tiles and tiles a second. */
function sweep(boss: OutlineBoss, hush: number, reach: number, seconds: number) {
  let farthest = 0;
  let fastest = 0;
  let last: { x: number; y: number }[] | null = null;
  for (let f = 0; f <= seconds * FPS; f++) {
    const pose = outlinePose(boss, f / FPS, hush, reach, TILE);
    if (pose === null) throw new Error("no pose");
    const now = RIM.map((a) => {
      const rest = { x: ROOT.x + Math.cos(a) * reach, y: ROOT.y + Math.sin(a) * reach };
      const at = posePoint(pose, ROOT, rest);
      farthest = Math.max(farthest, Math.hypot(at.x - rest.x, at.y - rest.y) / TILE);
      return at;
    });
    if (last !== null) {
      for (let i = 0; i < now.length; i++) {
        const a = now[i] as { x: number; y: number };
        const b = last[i] as { x: number; y: number };
        fastest = Math.max(fastest, (Math.hypot(a.x - b.x, a.y - b.y) / TILE) * FPS);
      }
    }
    last = now;
  }
  return { farthest, fastest };
}

describe("the outline drift", () => {
  test("a boss whose drift is off draws no pose at all", () => {
    for (const boss of BOSSES) OUTLINE_DRIFT[boss] = 0;
    for (const boss of BOSSES) expect(outlinePose(boss, 3.2, 1, 3 * TILE, TILE)).toBeNull();
  });

  test("hushed to nothing, there is no pose either", () => {
    OUTLINE_DRIFT.queen = 1;
    expect(outlinePose("queen", 3.2, HUSH.beaten, 3 * TILE, TILE)).toBeNull();
  });

  test("no point within reach moves past the cap, for a narrow body or a wide one", () => {
    for (const boss of BOSSES) OUTLINE_DRIFT[boss] = 1;
    for (const boss of BOSSES) {
      for (const reach of [1.5, 3.7]) {
        const { farthest } = sweep(boss, HUSH.alive, reach * TILE, 120);
        expect(farthest).toBeLessThanOrEqual(OUTLINE.shift);
        expect(farthest).toBeGreaterThan(OUTLINE.shift * 0.3);
      }
    }
  });

  test("while a window holds it at a tenth, a mark moves under a tenth of a tile a second", () => {
    for (const boss of BOSSES) OUTLINE_DRIFT[boss] = 1;
    for (const boss of BOSSES) {
      const { fastest } = sweep(boss, HUSH.liveMark, 1.5 * TILE, 120);
      expect(fastest).toBeLessThan(0.1);
    }
  });

  test("no two bosses lean in step", () => {
    for (const boss of BOSSES) OUTLINE_DRIFT[boss] = 1;
    const rolls = (boss: OutlineBoss) =>
      Array.from(
        { length: 40 },
        (_, i) => outlinePose(boss, i * 0.7, 1, 3 * TILE, TILE)?.roll ?? 0,
      );
    const [q, c, r] = BOSSES.map(rolls) as [number[], number[], number[]];
    const same = (a: number[], b: number[]) => a.every((v, i) => Math.abs(v - (b[i] ?? 0)) < 1e-6);
    expect(same(q, c)).toBe(false);
    expect(same(q, r)).toBe(false);
    expect(same(c, r)).toBe(false);
  });

  test("a point at the root only slides", () => {
    OUTLINE_DRIFT.cairn = 1;
    const pose = outlinePose("cairn", 5.1, 1, 3 * TILE, TILE);
    if (pose === null) throw new Error("no pose");
    const at = posePoint(pose, ROOT, ROOT);
    expect(at.x - ROOT.x).toBeCloseTo(pose.dx, 9);
    expect(at.y).toBeCloseTo(ROOT.y, 9);
  });
});
