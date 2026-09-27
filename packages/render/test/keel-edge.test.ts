import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  type KeelState,
  keelBoss,
  NO_JOINT,
  NO_ROCK,
  startWave,
} from "@neon-spore/sim";
import { keelRingCircle } from "../src/keel-marks.js";
import { keelSegs } from "../src/keel-pose.js";
import { put } from "../src/keel-shape.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { STROKE } from "../src/palette.js";
import { FRAME_TIMEOUT_MS, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE KEEL's plates stay inside the field** at a phone's size, the two at
 * the ends too. Each plate sits over its segment's column, and the end ones
 * fall on column 0 and the last one, so a plate a little wider than half a
 * tile, turned by the arch's slope, by a loose sway or by the tail's whip,
 * had its outer corner cut by the screen's edge (27 September 2026). The
 * ring round an end joint was moved in on its own, off the plate it lit; now
 * the plates are kept in as far as their ring needs, and it stays on them.
 *
 * A plate is a superellipse inside the square `put` maps from `u, v` in
 * -1..1, so the square's four corners bound it; half the stroke is added.
 */

const CFG = DEFAULT_CONFIG;
const ROLES: ViewRole[] = ["p1", "p2", "test"];
const PHONE = { width: 390, height: 844, dpr: 3 };
const CORNERS = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, 1],
] as const;

function spine(): { beat: number; s: KeelState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("keel");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  const s = keelBoss(world);
  if (s === null) throw new Error("the keel wave hung no spine");
  s.movement = 1;
  s.joint = NO_JOINT;
  s.rockCol = NO_ROCK;
  s.locked = s.locked.map(() => false);
  return { beat: world.beat + 8, s };
}

/** The furthest any plate's outline reaches past the field's left and right edges over a stretch of beats, in pixels. */
function overhang(l: Layout, s: KeelState, beat: number): number {
  let worst = Number.NEGATIVE_INFINITY;
  for (let i = 0; i < 64; i++) {
    const t = beat + i / 16;
    for (const g of keelSegs(l, CFG, s, Math.floor(t), t % 1)) {
      for (const [u, v] of CORNERS) {
        const q = put(l, g.centre, g.slope, g.pose, u, v);
        const half = STROKE.outline / 2;
        worst = Math.max(worst, l.gridLeft - (q.x - half), q.x + half - (l.gridLeft + l.gridWidth));
      }
    }
  }
  return worst;
}

describe("THE KEEL's plates inside the field", () => {
  for (const role of ROLES) {
    const l = computeLayout(PHONE, CFG, role);

    it(`keeps every plate whole while the spine hangs loose, on ${role}`, () => {
      const { beat, s } = spine();
      s.phase = "rest";
      s.phaseBeat = beat - 3;
      expect(overhang(l, s, beat)).toBeLessThanOrEqual(0);
    });

    it(`keeps the tail's plate whole through its whip, on ${role}`, () => {
      const { beat, s } = spine();
      s.phase = "rock";
      s.phaseBeat = beat;
      expect(overhang(l, s, beat)).toBeLessThanOrEqual(0);
    });

    it(`keeps the ring round an end joint on its plate, on ${role}`, () => {
      const { beat, s } = spine();
      s.phase = "joint";
      s.phaseBeat = beat;
      const segs = keelSegs(l, CFG, s, beat, 0.4);
      for (const g of [segs[0], segs[segs.length - 1]]) {
        if (g === undefined) throw new Error("the spine has no ends");
        const ring = keelRingCircle(l, g.centre);
        expect(ring.x).toBe(g.centre.x);
        const breath = ring.r * 1.05 + STROKE.outline / 2;
        expect(ring.x - breath).toBeGreaterThanOrEqual(l.gridLeft);
        expect(ring.x + breath).toBeLessThanOrEqual(l.gridLeft + l.gridWidth);
      }
    });
  }
});
