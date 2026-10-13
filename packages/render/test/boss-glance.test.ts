import { describe, expect, it } from "bun:test";
import { type Glance, glancedPoint, glanceFrame, glanceStill } from "../src/glance.js";
import {
  cock,
  GLANCE_ROUND,
  type GlanceSize,
  glanceOf,
  glanceRound,
  look,
  sway,
} from "../src/glance-styles.js";
import { MIRROR_GLANCE, MIRROR_GLANCE_SIZE } from "../src/mirror-glance.js";
import { QUEEN_GLANCE, QUEEN_GLANCE_HOLD, QUEEN_GLANCE_SIZE } from "../src/queen-glance.js";

/**
 * **Every boss's part that glances** (`glance.ts`, `.claude/skills/depth`, "A
 * part that glances"): each record ships still until the owner takes an
 * answer on VERSUS, each answer — SWAY, LOOK and COCK at the boss's own size —
 * swings both ways far enough to be seen in a still, every round hands over
 * level, and the points a turn holds stay where they are. A boss's glance is
 * a row here.
 */

interface Row {
  name: string;
  record: Glance;
  size: GlanceSize;
  /** The held points, in part radii either side of the centre. */
  hold: number;
}

const ROWS: readonly Row[] = [
  {
    name: "THE BULB QUEEN",
    record: QUEEN_GLANCE,
    size: QUEEN_GLANCE_SIZE,
    hold: QUEEN_GLANCE_HOLD,
  },
  { name: "THE MIRROR", record: MIRROR_GLANCE, size: MIRROR_GLANCE_SIZE, hold: 1 },
];

const R = 100;
const sweep = (g: Glance) =>
  Array.from({ length: 121 }, (_, i) => (i * GLANCE_ROUND) / 120).map((t) => g.swing(t));

describe.each(ROWS.map((r) => [r.name, r] as const))("%s's glance", (_, row) => {
  const at = { x: 0, y: 0, r: R, hold: row.hold };

  it("ships still, and a still frame draws it as before", () => {
    for (const t of [0, 0.7, 1.5, 4.5, 13]) {
      expect(glanceStill(glanceFrame(row.record, t, at))).toBe(true);
    }
  });

  it("swings both ways in every answer, a good share of the part", () => {
    for (const style of [sway, look, cock]) {
      const s = sweep(glanceOf(style, row.size));
      expect(Math.max(...s)).toBeGreaterThan(0.12);
      expect(Math.min(...s)).toBeLessThan(-0.12);
    }
  });

  it("starts and ends every round level at the middle", () => {
    for (const style of [sway, look, cock]) {
      for (const t of [0, GLANCE_ROUND - 1e-9]) {
        const p = glanceRound(style, t, row.size);
        expect(Math.abs(p.swing)).toBeLessThan(1e-6);
        expect(Math.abs(p.roll)).toBeLessThan(1e-6);
      }
    }
  });

  it("holds its held points, and moves its middle", () => {
    const f = { ...at, swing: row.size.reach * R, roll: 0 };
    for (const side of [-1, 1]) {
      const p = { x: side * row.hold * R, y: 5 };
      const q = glancedPoint(f, p);
      expect(q.x).toBeCloseTo(p.x, 6);
      expect(q.y).toBeCloseTo(p.y, 6);
    }
    expect(glancedPoint(f, { x: 0, y: 0 }).x).toBeCloseTo(row.size.reach * R, 6);
  });
});
