import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import { createWorld, NO_WELL_GRIP, startWave, type WellState, type World } from "@neon-spore/sim";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { wellAngle, wellCenter } from "../src/well.js";
import { drawWellSeamHold } from "../src/well-seam-hold.js";
import { stubCanvas } from "./canvas-stub.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, waveWith } from "./frame-harness.js";
import { spyHolds } from "./soak-spy.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE WELL's seam is the HOLD LAB's drop while the face slips**
 * (`well-seam-hold.ts`): in the middle of the empty sector, on the pilot's
 * screen alone, sunk while his thumb is on it and filling as the hold he may
 * spend is spent — and gone when the same press would be the wind, or nothing.
 */

beforeAll(installCanvasGlobals);

const layout = (role: ViewRole) => computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, role);

function slipping(over: Partial<WellState> = {}): World {
  const world = createWorld(CFG, 4);
  const index = waveWith("well");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  const b = world.boss;
  if (b === null || b.kind !== "well") throw new Error("no well");
  Object.assign(b, { phase: "rolling", gripMilli: NO_WELL_GRIP, heldBeats: 0 }, over);
  return world;
}

const drops = (world: World, role: ViewRole = "p1") => {
  const ctx = stubCanvas().ctx as unknown as CanvasRenderingContext2D;
  return spyHolds(() => drawWellSeamHold(ctx, layout(role), world, 1.2)).holds;
};

describe("THE WELL's seam", () => {
  it("is one drop in the middle of the empty sector while the face slips", () => {
    const got = drops(slipping());
    expect(got.length).toBe(1);
    const l = layout("p1");
    const c = wellCenter(l);
    const at = got[0]?.at ?? { x: Number.NaN, y: Number.NaN };
    const angle = (Math.atan2(at.x - c.x, c.y - at.y) + 2 * Math.PI) % (2 * Math.PI);
    const seam = (wellAngle(l, -1) + 2 * Math.PI) % (2 * Math.PI);
    expect(angle).toBeCloseTo(seam, 6);
    expect(got[0]?.o).toMatchObject({ held: false, fill: 0 });
  });

  it("sinks under his thumb and fills as the hold is spent", () => {
    const half = Math.floor(CFG.wellHoldBeats / 2);
    const o = drops(slipping({ gripMilli: 0, heldBeats: half }))[0]?.o;
    expect(o?.held).toBe(true);
    expect(o?.fill).toBeCloseTo(half / CFG.wellHoldBeats, 6);
  });

  it("is not there at rest, once wound, or on the flat field", () => {
    expect(drops(slipping({ phase: "still" })).length).toBe(0);
    expect(drops(slipping({ phase: "wound" })).length).toBe(0);
    expect(drops(slipping(), "p2").length).toBe(0);
  });
});
