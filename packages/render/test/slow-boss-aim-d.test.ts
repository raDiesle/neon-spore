import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import { burgeeBoss, capstanBoss, createWorld, startWave, type World } from "@neon-spore/sim";
import { burgeeTip } from "../src/burgee-shape.js";
import { capstanCentre, capstanPivot, capstanSize } from "../src/capstan-shape.js";
import { gallSeamY } from "../src/gall-shape.js";
import { halterCentre, halterSize } from "../src/halter-shape.js";
import { computeLayout } from "../src/layout.js";
import { seamCentre, seamHalfHeight, seamHalfWidth } from "../src/seam-shape.js";
import { bodyBox } from "../src/slow-fuse-place.js";
import { aim } from "../src/slow-intake-aim.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE SLOW's light stands round the bosses on page four**
 * (`slow-boss-aim-d.ts`): five that opened windows that ask and were aimed at
 * the cannon on the hull until 27 September 2026. Each is held to the body its
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
  it.each(["seam", "halter", "capstan", "gall", "burgee"] as const)(
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
    s.tiltMilli = [CFG.capstanLeanMilli, CFG.capstanLeanMilli];
    expect(at().left).not.toBeCloseTo(still.left, 1);
  });

  it("runs THE GALL's seam from one side of the field to the other", () => {
    const box = settled("gall");
    expect(box.left).toBeCloseTo(L.gridLeft, 5);
    expect(box.right).toBeCloseTo(L.gridLeft + L.cols * T, 5);
    expect((box.top + box.bottom) / 2).toBeCloseTo(gallSeamY(L), 5);
  });

  it("reaches from THE BURGEE's spindle down past the flag, and swings with it", () => {
    const world = stood("burgee");
    const s = burgeeBoss(world);
    if (s === null) throw new Error("the burgee wave stood no spindle");
    const box = bodyBox(aim(world, L, world.beat + 1_000, 0));
    expect(box.bottom).toBeGreaterThan(burgeeTip(L, CFG, s.swingMilli).y);
    s.swingMilli = CFG.burgeeSpanMilli;
    const swung = bodyBox(aim(world, L, world.beat + 1_000, 0));
    expect(swung.right).toBeGreaterThan(box.right);
  });
});
