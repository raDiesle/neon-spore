import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, type SimConfig } from "@neon-spore/sim";
import { type OutlinePose, outlineShift, posePoint } from "../src/outline-drift.js";
import { lobePose } from "../src/undertow-drift.js";
import { LOBE_TILES } from "../src/undertow-shape.js";

/**
 * THE UNDERTOW's lean (`undertow-drift.ts`): a grown lobe's top leans by more
 * than half a tile and never past its cap, its root at the skin hardly
 * moves, no two columns lean in step, and a lobe still rising leans only as
 * far as it has risen.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TILE = 100;
const ROOT = { x: 400, y: 900 };

/** How far the pose carries a point `up` tiles above the root, in tiles, at every quarter beat of 240. */
function carried(col: number, tiles: number, up: number): number[] {
  const out: number[] = [];
  for (let quarter = 0; quarter < 4 * 240; quarter++) {
    const p = lobePose(CFG, col, tiles, TILE, Math.floor(quarter / 4), (quarter % 4) / 4);
    out.push(moved(p, up));
  }
  return out;
}

function moved(p: OutlinePose | null, up: number): number {
  if (p === null) return 0;
  const rest = { x: ROOT.x, y: ROOT.y - up * TILE };
  const at = posePoint(p, ROOT, rest);
  return Math.hypot(at.x - rest.x, at.y - rest.y) / TILE;
}

describe("THE UNDERTOW leans where it comes up through the plating", () => {
  it("leans a grown lobe's top by more than half a tile, and never past its cap", () => {
    for (const col of [1, 3, 5]) {
      const top = carried(col, LOBE_TILES, LOBE_TILES);
      expect(Math.max(...top)).toBeGreaterThan(0.5);
      expect(Math.max(...top)).toBeLessThanOrEqual(outlineShift("undertow"));
    }
  });

  it("keeps a lobe's root at the skin within a fifth of a tile", () => {
    expect(Math.max(...carried(3, LOBE_TILES, 0))).toBeLessThan(0.2);
  });

  it("leans no two columns in step", () => {
    const a = carried(2, LOBE_TILES, LOBE_TILES);
    const b = carried(4, LOBE_TILES, LOBE_TILES);
    expect(Math.max(...a.map((v, i) => Math.abs(v - (b[i] ?? 0))))).toBeGreaterThan(0.3);
  });

  it("leans a rising lobe only as far as it has risen", () => {
    const low = LOBE_TILES / 10;
    expect(Math.max(...carried(3, low, low))).toBeLessThanOrEqual(
      (outlineShift("undertow") * low) / LOBE_TILES,
    );
  });
});
