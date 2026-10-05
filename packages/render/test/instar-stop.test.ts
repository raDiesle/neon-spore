import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { type Bullet, instarMarkCol, midCol, type World } from "@neon-spore/sim";
import { BoltStops } from "../src/bolt-stop.js";
import { drawInstar } from "../src/instar-draw.js";
import { InstarFx } from "../src/instar-fx.js";
import { instarAt, instarHeadAt, type Point } from "../src/instar-place.js";
import type { Figure } from "../src/instar-shape.js";
import { instarBody } from "../src/instar-sway.js";
import { computeLayout, type Layout, tileCX } from "../src/layout.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";
import { CFG, FRAME_TIMEOUT_MS, ROLES, VIEWPORT } from "./frame-harness.js";
import { acting, body, hung, shootStep } from "./scene-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **A bolt stops on what it meets**, for THE INSTAR (`instar-stop.ts`,
 * `scene-stop.ts`): a SHOOT mark over its column, bursting in a colour it
 * takes and scuffing in one it refuses, and its body anywhere else it is drawn
 * — its head among it (`instar-head-stop.ts`), its wings and its tail
 * (`instar-limb-stop.ts`).
 */

beforeAll(() => installCanvasGlobals());

const MID = midCol(CFG);
const paper = () => stubCanvas().ctx as unknown as CanvasRenderingContext2D;

function aimed(l: Layout, world: World): BoltStops {
  const s = body(world);
  if (s.kind !== "instar") throw new Error("no instar");
  const stops = new BoltStops();
  drawInstar(paper(), l, world, s, world.beat, 0.5, 0, new InstarFx(), stops);
  return stops;
}

/** The first SHOOT step up, its first SHOOT mark wanting cyan; and that mark's column. */
function shooting(): { world: World; col: number } {
  const world = hung("instar");
  const s = acting(world, shootStep(body(world)));
  const mark = s.steps[s.cursor]?.marks.find((m) => m.gesture === "shoot");
  if (mark === undefined) throw new Error("no shoot mark");
  (mark as { color?: string }).color = "cyan";
  return { world, col: instarMarkCol(CFG, mark) };
}

describe("THE INSTAR stops a bolt", () => {
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

  it.each(ROLES)("on the body up the middle once its marks are down, on %s", (role) => {
    const l = computeLayout(VIEWPORT, CFG, role);
    const world = hung("instar");
    acting(world, shootStep(body(world))).phase = "land";
    const at = aimed(l, world).meets(MID, tileCX(l, MID), "cyan");
    expect(at?.hit).toBe("body");
    expect(at?.y ?? 0).toBeGreaterThan(l.gridTop);
  });

  it.each([
    ["face-on", 0],
    ["side-on", 1],
  ] as const)("on its head %s, below where the tube alone would stop it", (_, side) => {
    const l = computeLayout(VIEWPORT, CFG, "test");
    const { world, head, r } = landedSeen(l, side);
    const col = Math.floor((head.x - l.gridLeft) / l.tile);
    const at = aimed(l, world).meets(col, tileCX(l, col), "cyan");
    expect(at?.hit).toBe("body");
    // Face-on the chin hangs under the head's middle; side-on the skull and jaw span it.
    if (side === 0) expect(at?.y ?? 0).toBeGreaterThan(head.y);
    else expect(Math.abs((at?.y ?? 0) - head.y)).toBeLessThan(r);
  });

  it("on a wing face-on, out past the head and the tube", () => {
    const l = computeLayout(VIEWPORT, CFG, "test");
    const { world, head, r } = landedSeen(l, 0);
    const col = Math.floor((head.x - 1.2 * r - l.gridLeft) / l.tile);
    const at = aimed(l, world).meets(col, tileCX(l, col), "cyan");
    expect(at?.hit).toBe("body");
    expect(at?.y ?? 0).toBeGreaterThan(l.gridTop);
  });

  it("on the tail side-on, down where it strikes rather than on the hide above", () => {
    const l = computeLayout(VIEWPORT, CFG, "test");
    const { world, r, f } = landedSeen(l, 1, 1);
    const aim = instarAt(l, f.tailX, f.tailY);
    const col = Math.floor((aim.x - l.gridLeft) / l.tile);
    const at = aimed(l, world).meets(col, tileCX(l, col), "cyan");
    expect(at?.hit).toBe("body");
    expect(Math.abs((at?.y ?? 0) - aim.y)).toBeLessThan(1.5 * r);
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

/** A step landed with its body seen wholly face-on (`side` 0) or side-on (1),
 * its tail struck (`tail` 1) if asked, and where its head is. */
function landedSeen(
  l: Layout,
  side: 0 | 1,
  tail?: 0 | 1,
): { world: World; head: Point; r: number; f: Figure } {
  const world = hung("instar");
  for (let c = 0; c < body(world).steps.length; c++) {
    const s = acting(world, c);
    s.phase = "land";
    if (s.kind !== "instar") break;
    const { f } = instarBody(s, world.cfg, world, world.beat, 0.5, 0);
    if (f.side === side && (tail === undefined || f.tail === tail))
      return { world, f, ...instarHeadAt(l, f) };
  }
  throw new Error(`no step seen with side ${side} and tail ${tail}`);
}

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
