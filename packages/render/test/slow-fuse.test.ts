import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { createWorld } from "@neon-spore/sim";
import { rgba } from "../src/hex.js";
import { computeLayout, type Layout } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { drawFuse } from "../src/slow-fuse.js";
import {
  type Box,
  FUSE_THICK,
  type FusePlace,
  fuseBox,
  fusePlace,
  underAim,
  underBox,
} from "../src/slow-fuse-place.js";
import { type SlowWindow, slowWindow } from "../src/slow-look.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  stubCanvas,
  VIEWPORT,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **How much of the fuse is left, and what colour it is** — `src/slow-fuse.ts`,
 * the measure the owner asked back for on 25 September 2026. Both are
 * arithmetic on a stroke and a `strokeStyle`, which is why this is read off
 * the log rather than looked at. `slow-look.test.ts` owns the pass; the fuse is
 * called directly so a window can be set by hand.
 */

beforeAll(installCanvasGlobals);

const LAYOUT: Layout = computeLayout(VIEWPORT, CFG, "p1");

/** Where the drawing tests stand the fuse: the middle of the screen, a third
 * of the way down, four tiles long. Where it goes is `fusePlace`'s, below. */
const PLACE: FusePlace = { x: LAYOUT.width / 2, y: LAYOUT.height / 3, half: LAYOUT.tile * 2 };

function window(beats: number, left: number, asks = true): SlowWindow {
  return { beats, left, through: (beats - left) / beats, asks };
}

/**
 * The log of one fuse drawn, and the line as `[x0, y, x1]` — read off the two
 * sparks, which are the only `fillRect`s and are centred on the burning ends.
 */
function drawn(win: SlowWindow): { log: string[]; line: number[] | null } {
  const { ctx } = stubCanvas();
  ctx.log = [];
  drawFuse(ctx as unknown as CanvasRenderingContext2D, LAYOUT, win, PLACE);
  const log = ctx.log;
  ctx.log = undefined;
  const ends = log
    .filter((e) => e.startsWith("fillRect("))
    .map((e) => e.slice("fillRect(".length, -1).split(", ").map(Number))
    .map(([x = 0, y = 0, w = 0, h = 0]) => [x + w / 2, y + h / 2]);
  const [a, b] = ends;
  return { log, line: a && b ? [a[0] ?? 0, a[1] ?? 0, b[0] ?? 0] : null };
}

describe("how much of the fuse is left", () => {
  it("runs its place's whole length on the tick the window opens, level", () => {
    const [x0 = 0, y = 0, x1 = 0] = drawn(window(8, 8)).line ?? [];
    expect(x0).toBeCloseTo(PLACE.x - PLACE.half, 2);
    expect(x1).toBeCloseTo(PLACE.x + PLACE.half, 2);
    expect(y).toBeCloseTo(PLACE.y, 2);
  });

  it("burns in from both ends and stays on its place's middle", () => {
    const [f0 = 0, , f1 = 0] = drawn(window(8, 8)).line ?? [];
    const [x0 = 0, , x1 = 0] = drawn(window(8, 2)).line ?? [];
    expect(x1 - x0).toBeCloseTo((f1 - f0) / 4, 2);
    expect((x0 + x1) / 2).toBeCloseTo(PLACE.x, 2);
  });

  /** The owner, 27 September 2026: *more visible (e.g. more height)*. It
   * was two tenths of a tile along the top of the screen. */
  it("is more than twice as thick as it was, with the glow wider still", () => {
    expect(FUSE_THICK).toBeGreaterThanOrEqual(0.45);
    const widths = drawn(window(8, 6))
      .log.filter((e) => e.startsWith("set lineWidth="))
      .map((e) => Number(e.slice("set lineWidth=".length)));
    expect(widths.some((w) => Math.abs(w - LAYOUT.tile * FUSE_THICK) < 0.01)).toBe(true);
    expect(Math.max(...widths)).toBeGreaterThanOrEqual(LAYOUT.tile * FUSE_THICK * 2.5);
  });

  it("draws nothing once the window is spent", () => {
    expect(drawn(window(8, 0)).log).toHaveLength(0);
  });

  /** A dramatic beat asks for nothing and fails nobody; a fuse on it would
   * count down to a hit that never comes. The world says which a window is,
   * so a long show gets no fuse and a short ask still does. */
  it("draws only on a window that asks for something", () => {
    expect(drawn(window(8, 8, false)).log).toHaveLength(0);
    expect(drawn(window(4, 4, true)).log.length).toBeGreaterThan(0);
  });
});

describe("what colour it is", () => {
  // A colour's own channels, whatever alpha it is laid at.
  const hue = (hex: string): string => rgba(hex, 0).replace(/,0\)$/, ",");

  function shows(win: SlowWindow, hex: string): boolean {
    return drawn(win).log.some((e) => e.startsWith("set strokeStyle=") && e.includes(hue(hex)));
  }

  it("is the ship's own violet while there is time", () => {
    expect(shows(window(8, 6), PALETTE.hull)).toBe(true);
    expect(shows(window(8, 6), PALETTE.ember)).toBe(false);
  });

  /** The owner's, the same day: *an orange-like warning colour before the
   * red, somewhere in the middle*. */
  it("warns in orange from half the window", () => {
    expect(shows(window(8, 4), PALETTE.ember)).toBe(true);
    expect(shows(window(8, 3), PALETTE.hull)).toBe(false);
    expect(shows(window(8, 3), PALETTE.red)).toBe(false);
  });

  it("goes red for the last two beats", () => {
    expect(shows(window(8, 1.5), PALETTE.red)).toBe(true);
    expect(shows(window(8, 1.5), PALETTE.ember)).toBe(false);
  });
});

/**
 * **The world says whether a window asks, and the fuse believes it.** THE
 * INSTAR's two windows, set rather than played into (`slow-look.test.ts` says
 * why; `sim/test/instar.test.ts` holds which one each opens): a step, which
 * strikes if it runs out, and the body's fall, which asks for nothing.
 */
describe("which windows get a fuse", () => {
  function instarWindow(beats: number, asks: boolean): SlowWindow {
    const world = createWorld(CFG, 5);
    world.beat = 10;
    world.slowFromBeat = 10;
    world.slowToBeat = 10 + beats;
    world.slowAsks = asks;
    const win = slowWindow(world, 0);
    if (win === null) throw new Error("no window");
    return win;
  }

  it("draws on THE INSTAR's step and not on its fall", () => {
    expect(drawn(instarWindow(8, true)).log.length).toBeGreaterThan(0);
    expect(drawn(instarWindow(CFG.instarSlowBeats, false)).log).toHaveLength(0);
  });
});

/**
 * **Where it stands** — `src/slow-fuse-place.ts`, the owner's *below the boss
 * and between the ship hull*, 27 September 2026. A body and marks set by
 * hand; `tools/director/test/fuse-place.test.ts` walks every boss's windows.
 */
describe("where the fuse stands", () => {
  const T = LAYOUT.tile;
  const mid = LAYOUT.width / 2;
  const body: Box = { left: mid - T, right: mid + T, top: T * 2, bottom: T * 4 };
  const crosses = (a: Box, b: Box): boolean =>
    a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

  it("stands level on the body's column, halfway to the hull, as long as the body is wide", () => {
    const p = fusePlace(LAYOUT, underBox(body), []);
    expect(p.x).toBeCloseTo(mid, 5);
    expect(p.half).toBeCloseTo(T, 5);
    expect(Math.abs(p.y - (body.bottom + LAYOUT.hullY) / 2)).toBeLessThan(T * 0.1);
    const box = fuseBox(LAYOUT, p);
    expect(box.top).toBeGreaterThanOrEqual(body.bottom);
    expect(box.bottom).toBeLessThanOrEqual(LAYOUT.hullY);
  });

  it("moves off a mark that sits in the middle of the gap", () => {
    const y = (body.bottom + LAYOUT.hullY) / 2;
    const mark: Box = { left: mid - T, right: mid + T, top: y - T, bottom: y + T };
    const box = fuseBox(LAYOUT, fusePlace(LAYOUT, underBox(body), [mark]));
    expect(crosses(box, mark)).toBe(false);
    expect(box.top).toBeGreaterThanOrEqual(body.bottom);
    expect(box.bottom).toBeLessThanOrEqual(LAYOUT.hullY);
  });

  it("drops to just above the hull where there is no gap", () => {
    const low: Box = { ...body, bottom: LAYOUT.hullY - 2 };
    const box = fuseBox(LAYOUT, fusePlace(LAYOUT, underBox(low), []));
    expect(box.bottom).toBeLessThanOrEqual(LAYOUT.hullY);
    expect(box.bottom).toBeGreaterThan(LAYOUT.hullY - T * 0.25);
  });

  /** THE INSTAR hangs head-down off a chain that climbs to its engines: the
   * middle of head and engines is a column nothing of it hangs in. */
  it("stands under a climbing body's lower end, as wide as that end", () => {
    const at = { x: mid - T, y: T * 4, r: T, ax: mid + T * 3, ay: 0 };
    const p = fusePlace(LAYOUT, underAim(at), []);
    expect(p.x).toBeCloseTo(at.x, 5);
    expect(p.half).toBeCloseTo(at.r, 5);
    const level = { ...at, ay: at.y };
    expect(fusePlace(LAYOUT, underAim(level), []).x).toBeCloseTo(mid + T, 5);
  });

  it("keeps both ends on the screen under a body wider than it", () => {
    const wide: Box = { ...body, left: -T, right: LAYOUT.width + T };
    const box = fuseBox(LAYOUT, fusePlace(LAYOUT, underBox(wide), []));
    expect(box.left).toBeGreaterThan(0);
    expect(box.right).toBeLessThan(LAYOUT.width);
  });
});
