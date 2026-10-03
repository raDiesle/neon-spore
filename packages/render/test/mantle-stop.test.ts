import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { type Bullet, midCol, type World } from "@neon-spore/sim";
import { BoltStops } from "../src/bolt-stop.js";
import { computeLayout, type Layout, tileCX } from "../src/layout.js";
import { drawMantle } from "../src/mantle-draw.js";
import { MantleFx } from "../src/mantle-fx.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";
import { CFG, FRAME_TIMEOUT_MS, ROLES, VIEWPORT } from "./frame-harness.js";
import { body, hung, pulling, still } from "./mantle-frame-rig.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **A bolt stops on what it meets**, for THE MANTLE (`mantle-stop.ts`): the
 * leaking spark in either colour up its column, the shell anywhere else it
 * stands, and clear air past it.
 */

beforeAll(() => installCanvasGlobals());

const MID = midCol(CFG);
const paper = () => stubCanvas().ctx as unknown as CanvasRenderingContext2D;

/** Two pairs sheared and the spark half way down its fuse. */
function leaking(world: World): void {
  const s = pulling(world, 0, 0, 2);
  s.sparkCol = MID;
  s.sparkBeat = world.beat - Math.floor(CFG.mantleSparkBeats / 2);
}

function aimed(l: Layout, arrange: (world: World) => void): BoltStops {
  const world = hung();
  arrange(world);
  const stops = new BoltStops();
  drawMantle(paper(), l, world, body(world), world.beat, 0.5, 0, new MantleFx(), stops);
  return stops;
}

describe("THE MANTLE stops a bolt", () => {
  it.each(ROLES)("on the leaking spark in either colour, over the field, on %s", (role) => {
    const l = computeLayout(VIEWPORT, CFG, role);
    const stops = aimed(l, leaking);
    const cyan = stops.meets(MID, tileCX(l, MID), "cyan");
    const red = stops.meets(MID, tileCX(l, MID), "red");
    expect(cyan?.hit).toBe("target");
    expect(red).toEqual(cyan);
    expect(cyan?.y ?? 0).toBeGreaterThan(l.gridTop);
    expect(cyan?.y ?? 0).toBeLessThan(l.hullY);
  });

  it.each(ROLES)("on the shell up the middle and beside it while nothing leaks, on %s", (role) => {
    const l = computeLayout(VIEWPORT, CFG, role);
    const stops = aimed(l, still);
    for (const col of [MID, MID + 1, MID - 1]) {
      const at = stops.meets(col, tileCX(l, col), "cyan");
      expect(at?.hit).toBe("body");
      expect(at?.y ?? 0).toBeGreaterThan(l.gridTop);
    }
  });

  it("lets one past the shell go on into the sky", () => {
    const l = computeLayout(VIEWPORT, CFG, "test");
    expect(aimed(l, still).meets(0, tileCX(l, 0), "cyan")).toBeNull();
  });

  it("drawn no further than the spark", () => {
    const l = computeLayout(VIEWPORT, CFG, "test");
    const stops = aimed(l, leaking);
    const x = tileCX(l, MID);
    const y = stops.meets(MID, x, "cyan")?.y ?? 0;
    expect(stops.stopped(bolt(), x, y + l.tile, "#fff")).toBe(false);
    expect(stops.stopped(bolt(), x, y, "#fff")).toBe(true);
  });
});

function bolt(): Bullet {
  return {
    id: 1,
    col: MID,
    row: 0,
    subMilli: 0,
    color: "cyan",
    lance: false,
    driftMilli: 0,
    aimMilli: 0,
  };
}
