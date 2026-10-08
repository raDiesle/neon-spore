import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  capstanBoss,
  createWorld,
  gallBoss,
  sceneBoss,
  startWave,
  type World,
} from "@neon-spore/sim";
import { capstanCentre, capstanPivot, capstanSize } from "../src/capstan-shape.js";
import { gallPointCircle } from "../src/gall-grip.js";
import { gallArcAt } from "../src/gall-shape.js";
import { halterCentre, halterSize } from "../src/halter-shape.js";
import { instarAt, instarLen } from "../src/instar-place.js";
import { computeLayout } from "../src/layout.js";
import { nettleBody } from "../src/nettle-sway.js";
import { seamCentre, seamHalfHeight, seamHalfWidth } from "../src/seam-shape.js";
import { bodyBox } from "../src/slow-fuse-place.js";
import { aim } from "../src/slow-intake-aim.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE SLOW's light stands round the bosses on page four**
 * (`slow-boss-aim-d.ts`): five that opened windows that ask and were aimed at
 * the cannon on the hull until 27 September 2026, THE NETTLE once its body
 * was drawn. THE GALL's alien sits below the middle since 8 October 2026, so
 * it is held to its point and its arc rather than to the top. Each is held to the body its
 * own shape file names — its box holds the body, and stands well clear of the
 * hull — rather than to its own arithmetic again.
 */

const L = computeLayout(VIEWPORT, CFG, "p1");
const T = L.tile;

/** `kind`'s wave stood, and nothing stepped. */
function stood(kind: Parameters<typeof waveWith>[0]): World {
  const world = createWorld(CFG, 5);
  const index = waveWith(kind);
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  return world;
}

/** The aim's box once the boss has dropped in: its arrivals read 1 from here on. */
function settled(kind: Parameters<typeof waveWith>[0]) {
  const world = stood(kind);
  return bodyBox(aim(world, L, world.beat + 1_000, 0));
}

describe("THE SLOW's aim at the bosses on page four", () => {
  it.each(["seam", "halter", "capstan", "nettle"] as const)(
    "stands round THE %s, not the cannon, and leaves the hull a gap",
    (kind) => {
      const box = settled(kind);
      expect(box.bottom).toBeLessThan(L.hullY - 2 * T);
      expect(box.top).toBeLessThan(L.gridTop + 4 * T);
    },
  );

  it("runs THE SEAM's ridge the long way, as wide as its top lobe", () => {
    const box = settled("seam");
    const c = seamCentre(L, CFG);
    expect(box.left).toBeCloseTo(c.x - seamHalfWidth(L), 5);
    expect(box.right).toBeCloseTo(c.x + seamHalfWidth(L), 5);
    expect(box.bottom).toBeCloseTo(c.y + seamHalfHeight(L), 5);
  });

  it("runs THE HALTER's slab across, down past its hanging plates", () => {
    const box = settled("halter");
    const c = halterCentre(L, CFG);
    const { rx, ry, drop } = halterSize(L);
    expect(box.left).toBeCloseTo(c.x - rx, 5);
    expect(box.right).toBeCloseTo(c.x + rx, 5);
    expect(box.bottom).toBeGreaterThan(c.y + ry + drop);
  });

  it("holds THE CAPSTAN's drum and cradle, and follows the drum as it rolls", () => {
    const world = stood("capstan");
    const at = (): ReturnType<typeof bodyBox> => bodyBox(aim(world, L, world.beat + 1_000, 0));
    const c = capstanCentre(L, CFG);
    const { rx } = capstanSize(L);
    const still = at();
    expect(still.left).toBeCloseTo(c.x - rx, 5);
    expect(still.bottom).toBeCloseTo(c.y + capstanPivot(L), 5);
    const s = capstanBoss(world);
    if (s === null) throw new Error("the capstan wave stood no drum");
    s.phase = "lit";
    s.pullMilli = [CFG.capstanPullMilli, CFG.capstanPullMilli];
    expect(at().left).not.toBeCloseTo(still.left, 1);
  });

  it("stands round THE GALL's alien where it sits, below the middle, clear of the hull", () => {
    const world = stood("gall");
    const s = gallBoss(world);
    if (s === null) throw new Error("the gall wave stood no alien");
    const box = bodyBox(aim(world, L, world.beat + 1_000, 0));
    const at = gallPointCircle(L, CFG, s.point);
    expect(box.left).toBeLessThan(at.x);
    expect(box.right).toBeGreaterThan(at.x);
    expect(box.top).toBeLessThan(at.y);
    expect(box.bottom).toBeGreaterThan(at.y);
    expect(box.bottom).toBeLessThan(L.hullY - 2 * T);
  });

  it("goes with THE GALL's alien along its arc while it leaps", () => {
    const world = stood("gall");
    const s = gallBoss(world);
    if (s === null) throw new Error("the gall wave stood no alien");
    s.from = 0;
    s.point = 3;
    s.phase = "leap";
    s.phaseBeat = world.beat;
    const half = world.cfg.gallLeapBeats / 2;
    const box = bodyBox(aim(world, L, world.beat + Math.floor(half), half % 1));
    const top = gallArcAt(L, CFG, 0, 3, 0.5);
    expect(box.left).toBeLessThan(top.x);
    expect(box.right).toBeGreaterThan(top.x);
    expect(box.top).toBeLessThan(top.y);
    expect(box.bottom).toBeGreaterThan(top.y);
  });

  it("holds THE NETTLE's whole bell, where this frame's figure has it", () => {
    const world = stood("nettle");
    const s = sceneBoss(world);
    if (s === null || s.kind !== "nettle") throw new Error("the nettle wave stood no bell");
    const beat = world.beat + 1_000;
    const { f } = nettleBody(s, CFG, world, beat, 0);
    const c = instarAt(L, f.bellX, f.bellY);
    const r = instarLen(L, f.bellR);
    const still = bodyBox(aim(world, L, beat, 0));
    expect(still.left).toBeLessThan(c.x - r);
    expect(still.right).toBeGreaterThan(c.x + r);
    expect(still.top).toBeLessThan(c.y - 0.8 * r);
    expect(still.bottom).toBeGreaterThan(c.y + 0.8 * r);
  });
});
