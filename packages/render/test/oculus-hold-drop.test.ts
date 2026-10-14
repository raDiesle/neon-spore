import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { oculusBoss, ticksPerBeat, type World } from "@neon-spore/sim";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, runFrames } from "./frame-harness.js";
import { posed, stood } from "./oculus-harness.js";
import { spyHolds } from "./soak-spy.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE OCULUS's holds are the HOLD LAB's drop on each half** (`oculus-verdicts.ts`):
 * both seats' on both screens for the whole of a shut or a reseal, each sunk
 * under its own seat's thumb, the partner's dimmed, the water how far the pair
 * has come — and the cue draws no second drop (`BossCue.ownDrop`).
 */

beforeAll(installCanvasGlobals);

function holding(held: [boolean, boolean], heldTicks = 0, ask: "shut" | "reseal" = "shut"): World {
  const world = stood();
  const s = posed(world, { ask, color: "either", beats: 4 }, false);
  s.held = held;
  s.heldTicks = heldTicks;
  return world;
}

const drops = (world: World, role: "p1" | "p2" | "test") =>
  spyHolds(() => runFrames(world, role, 1)).holds;

describe("THE OCULUS's hold", () => {
  it("is a drop on each half, on both screens, the partner's dimmed", () => {
    for (const ask of ["shut", "reseal"] as const) {
      const p1 = drops(holding([false, false], 0, ask), "p1");
      expect(p1.length).toBe(2);
      const [left, right] = [...p1].sort((a, b) => a.at.x - b.at.x);
      expect(left?.o.theirs).toBe(false);
      expect(right?.o.theirs).toBe(true);
      expect(drops(holding([false, false], 0, ask), "test").every((d) => !d.o.theirs)).toBe(true);
    }
  });

  it("stays under a thumb, sunk, where the cue's drop went", () => {
    const got = drops(holding([true, false]), "p1").sort((a, b) => a.at.x - b.at.x);
    expect(got.map((d) => d.o.held)).toEqual([true, false]);
  });

  it("fills as the pair holds together", () => {
    const tpb = ticksPerBeat(CFG);
    const fill = (ticks: number) => drops(holding([true, true], ticks), "p2")[0]?.o.fill ?? -1;
    expect(fill(2 * tpb)).toBeGreaterThan(fill(0));
  });

  it("is not there while the lit step is no hold", () => {
    const world = stood();
    posed(world, { ask: "tap", color: "either", beats: 4, need: 4 }, false);
    expect(drops(world, "p1").length).toBe(0);
    expect(oculusBoss(world)?.phase).toBe("lit");
  });
});
