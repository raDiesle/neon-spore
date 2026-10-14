import { describe, expect, it } from "bun:test";
import { BATON_GLANCE, BATON_GLANCE_SIZE } from "../src/baton-glance.js";
import { CAIRN_GLANCE, CAIRN_GLANCE_SIZE } from "../src/cairn-glance.js";
import { FLEET_GLANCE, FLEET_GLANCE_SIZE } from "../src/fleet-glance.js";
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
import { GORGE_GLANCE, GORGE_GLANCE_SIZE } from "../src/gorge-glance.js";
import { HIVE_GLANCE, HIVE_GLANCE_SIZE } from "../src/hive-glance.js";
import { MAZE_GLANCE, MAZE_GLANCE_SIZE } from "../src/maze-glance.js";
import { MIRROR_GLANCE, MIRROR_GLANCE_SIZE } from "../src/mirror-glance.js";
import { PINBALL_GLANCE, PINBALL_GLANCE_SIZE } from "../src/pinball-glance.js";
import { PULSE_GLANCE, PULSE_GLANCE_SIZE } from "../src/pulse-glance.js";
import { QUEEN_GLANCE, QUEEN_GLANCE_HOLD, QUEEN_GLANCE_SIZE } from "../src/queen-glance.js";
import { REPRISE_GLANCE, REPRISE_GLANCE_SIZE } from "../src/reprise-glance.js";
import { SPLICE_GLANCE, SPLICE_GLANCE_SIZE } from "../src/splice-glance.js";
import { STARE_GLANCE, STARE_GLANCE_SIZE } from "../src/stare-glance.js";
import { THROAT_GLANCE, THROAT_GLANCE_SIZE } from "../src/throat-glance.js";
import { UNDERTOW_GLANCE, UNDERTOW_GLANCE_SIZE } from "../src/undertow-glance.js";
import { VANE_GLANCE, VANE_GLANCE_SIZE } from "../src/vane-glance.js";
import { WARDEN_GLANCE, WARDEN_GLANCE_SIZE } from "../src/warden-glance.js";
import { WELL_GLANCE, WELL_GLANCE_SIZE } from "../src/well-glance.js";

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
  /** The held points, in part radii either side of the centre; 0 the centre itself. */
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
  // Held at the hole's widest, at rest: the pupil is 0.44 of the body.
  { name: "THE WARDEN", record: WARDEN_GLANCE, size: WARDEN_GLANCE_SIZE, hold: 0.44 },
  { name: "THE VANE", record: VANE_GLANCE, size: VANE_GLANCE_SIZE, hold: 0 },
  { name: "THE FLEET", record: FLEET_GLANCE, size: FLEET_GLANCE_SIZE, hold: 1 },
  { name: "PINBALL", record: PINBALL_GLANCE, size: PINBALL_GLANCE_SIZE, hold: 0 },
  { name: "THE PULSE", record: PULSE_GLANCE, size: PULSE_GLANCE_SIZE, hold: 0 },
  { name: "THE MAZE", record: MAZE_GLANCE, size: MAZE_GLANCE_SIZE, hold: 0 },
  { name: "THE CAIRN", record: CAIRN_GLANCE, size: CAIRN_GLANCE_SIZE, hold: 1 },
  { name: "THE WELL", record: WELL_GLANCE, size: WELL_GLANCE_SIZE, hold: 0 },
  { name: "THE SPLICE", record: SPLICE_GLANCE, size: SPLICE_GLANCE_SIZE, hold: 0 },
  { name: "THE HIVE", record: HIVE_GLANCE, size: HIVE_GLANCE_SIZE, hold: 0 },
  { name: "THE REPRISE", record: REPRISE_GLANCE, size: REPRISE_GLANCE_SIZE, hold: 0 },
  { name: "THE STARE", record: STARE_GLANCE, size: STARE_GLANCE_SIZE, hold: 0 },
  { name: "THE BATON", record: BATON_GLANCE, size: BATON_GLANCE_SIZE, hold: 0 },
  { name: "THE THROAT", record: THROAT_GLANCE, size: THROAT_GLANCE_SIZE, hold: 0 },
  { name: "THE UNDERTOW", record: UNDERTOW_GLANCE, size: UNDERTOW_GLANCE_SIZE, hold: 0 },
  { name: "THE GORGE", record: GORGE_GLANCE, size: GORGE_GLANCE_SIZE, hold: 0 },
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

  it("holds its held points, and turns between them", () => {
    const f = { ...at, swing: row.size.reach * R, roll: 0 };
    if (row.hold === 0) {
      // Held at its centre: the middle stays, the near half opens, the far one closes.
      expect(glancedPoint(f, { x: 0, y: 0 }).x).toBeCloseTo(0, 6);
      expect(glancedPoint(f, { x: -R, y: 0 }).x).toBeLessThan(-R);
      expect(glancedPoint(f, { x: R, y: 0 }).x).toBeLessThan(R);
      return;
    }
    for (const side of [-1, 1]) {
      const p = { x: side * row.hold * R, y: 5 };
      const q = glancedPoint(f, p);
      expect(q.x).toBeCloseTo(p.x, 6);
      expect(q.y).toBeCloseTo(p.y, 6);
    }
    expect(glancedPoint(f, { x: 0, y: 0 }).x).toBeCloseTo(row.size.reach * R, 6);
  });
});
