import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  type CystState,
  createWorld,
  cystBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { cystLobes, cystTip, RESTING } from "../src/cyst-shape.js";
import { CYST_SWING, cystSwing } from "../src/cyst-sway.js";
import { computeLayout } from "../src/layout.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE CYST's lobes (`cyst-sway.ts`): each tip moves by more than half a tile
 * each way, the four out of step; a lobe's joint at its waist never moves, so
 * the ring never parts; and the flanks and the spit lobe are still inside
 * THE SLOW, the whole sac through the split.
 */

const L = computeLayout(VIEWPORT, CFG, "p1");
const QUARTERS = Array.from({ length: 4 * 240 }, (_, q) => q);

function sac(): { world: World; s: CystState } {
  const world = createWorld(CFG, 7);
  const index = waveWith("cyst");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < ticksPerBeat(CFG); i++) step(world, []);
  const s = cystBoss(world);
  if (s === null) throw new Error("the cyst wave hung no sac");
  return { world, s };
}

const swings = (world: World, s: CystState) =>
  QUARTERS.map((q) => cystSwing(world, s, Math.floor(q / 4), (q % 4) / 4));

describe("THE CYST's lobes swing about their waists", () => {
  it("moves each tip by more than half a tile each way, never past its cap", () => {
    const { world, s } = sac();
    const all = swings(world, s);
    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 2;
      const rest = cystTip(L, a, RESTING);
      const moved = all.map((swing) => {
        const tip = cystTip(L, a, { ...RESTING, swing });
        // Signed: across the lobe's own axis, in tiles.
        return ((tip.x - rest.x) * -Math.sin(a) + (tip.y - rest.y) * Math.cos(a)) / L.tile;
      });
      expect(Math.max(...moved)).toBeGreaterThan(0.5);
      expect(Math.min(...moved)).toBeLessThan(-0.5);
      expect(Math.max(...all.map((w) => Math.abs(w[k] ?? 0)))).toBeLessThanOrEqual(CYST_SWING);
    }
  });

  it("never moves a lobe's joint, so the ring stays whole", () => {
    const swing = [0.4, -0.4, 0.3, -0.2] as const;
    const rest = cystLobes(L, RESTING);
    const bent = cystLobes(L, { ...RESTING, swing });
    bent.forEach((lobe, k) => {
      expect(lobe.joint.x).toBeCloseTo(rest[k]?.joint.x ?? NaN, 6);
      expect(lobe.joint.y).toBeCloseTo(rest[k]?.joint.y ?? NaN, 6);
      // A lobe's first point, at its waist, is where the one before it ended.
      expect(lobe.points[0]?.x).toBeCloseTo(rest[k]?.points[0]?.x ?? NaN, 6);
    });
  });

  it("stills the flanks and the spit lobe under THE SLOW, and the whole sac in its split", () => {
    const { world, s } = sac();
    const slow = { ...world, slowFromBeat: 0, slowToBeat: 1000 };
    for (const w of swings(slow, s).slice(4)) {
      expect(Math.max(Math.abs(w[0]), Math.abs(w[1]), Math.abs(w[2]))).toBe(0);
      expect(Math.abs(w[3])).toBeLessThanOrEqual(CYST_SWING / 3 + 1e-9);
    }
    for (const w of swings(world, { ...s, phase: "split" })) {
      expect(Math.max(...w.map(Math.abs))).toBe(0);
    }
  });
});
