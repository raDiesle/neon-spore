import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { type Bullet, instarMarkCol, midCol, type World } from "@neon-spore/sim";
import { BoltStops } from "../src/bolt-stop.js";
import { computeLayout, type Layout, tileCX } from "../src/layout.js";
import { drawNettle } from "../src/nettle-draw.js";
import { NettleFx } from "../src/nettle-fx.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";
import { CFG, FRAME_TIMEOUT_MS, ROLES, VIEWPORT } from "./frame-harness.js";
import { acting, body, hung, morphing, shootStep } from "./scene-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **A bolt stops on what it meets**, for THE NETTLE (`nettle-stop.ts`,
 * `scene-stop.ts`): a SHOOT mark over its column, bursting in a colour it
 * takes and scuffing in one it refuses, and the bell anywhere else it hangs.
 */

beforeAll(() => installCanvasGlobals());

const MID = midCol(CFG);
const paper = () => stubCanvas().ctx as unknown as CanvasRenderingContext2D;

function aimed(l: Layout, world: World): BoltStops {
  const s = body(world);
  if (s.kind !== "nettle") throw new Error("no nettle");
  const stops = new BoltStops();
  drawNettle(paper(), l, world, s, world.beat, 0.5, 0, new NettleFx(), stops);
  return stops;
}

/** The first SHOOT step up, its first SHOOT mark wanting cyan; and that mark's column. */
function shooting(): { world: World; col: number } {
  const world = hung("nettle");
  const s = acting(world, shootStep(body(world)));
  const mark = s.steps[s.cursor]?.marks.find((m) => m.gesture === "shoot");
  if (mark === undefined) throw new Error("no shoot mark");
  (mark as { color?: string }).color = "cyan";
  return { world, col: instarMarkCol(CFG, mark) };
}

describe("THE NETTLE stops a bolt", () => {
  it.each(ROLES)("bursting on a SHOOT mark in its colour, scuffing in the other, on %s", (role) => {
    const l = computeLayout(VIEWPORT, CFG, role);
    const { world, col } = shooting();
    const stops = aimed(l, world);
    const right = stops.meets(col, tileCX(l, col), "cyan");
    const wrong = stops.meets(col, tileCX(l, col), "red");
    expect(right?.hit).toBe("target");
    expect(wrong?.hit).toBe("wrong");
    expect(wrong?.y).toBe(right?.y ?? Number.NaN);
    expect(right?.y ?? 0).toBeGreaterThan(l.gridTop);
    expect(right?.y ?? 0).toBeLessThan(l.hullY);
  });

  it.each(ROLES)("on the bell up the middle while its marks are down, on %s", (role) => {
    const l = computeLayout(VIEWPORT, CFG, role);
    const world = hung("nettle");
    morphing(world, shootStep(body(world)));
    const at = aimed(l, world).meets(MID, tileCX(l, MID), "cyan");
    expect(at?.hit).toBe("body");
    expect(at?.y ?? 0).toBeGreaterThan(l.gridTop);
  });

  it("drawn no further than the mark", () => {
    const l = computeLayout(VIEWPORT, CFG, "test");
    const { world, col } = shooting();
    const stops = aimed(l, world);
    const x = tileCX(l, col);
    const y = stops.meets(col, x, "cyan")?.y ?? 0;
    expect(stops.stopped(bolt(col), x, y + l.tile, "#fff")).toBe(false);
    expect(stops.stopped(bolt(col), x, y, "#fff")).toBe(true);
  });
});

function bolt(col: number): Bullet {
  return {
    id: 1,
    col,
    row: 0,
    subMilli: 0,
    color: "cyan",
    lance: false,
    driftMilli: 0,
    aimMilli: 0,
  };
}
