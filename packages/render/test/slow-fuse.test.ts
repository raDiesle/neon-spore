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
  roomUnder,
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

function window(beats: number, left: number, asks = true, span = beats): SlowWindow {
  return { beats, left, through: (beats - left) / beats, span, asks };
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

  /** The owner, 30 September 2026: *the size to start should always be the
   * same*. A step asked inside a window the last one left open counts from
   * its own ask, not from the window's first beat. */
  it("starts whole on an ask made inside a window already open", () => {
    const [f0 = 0, , f1 = 0] = drawn(window(8, 8)).line ?? [];
    const [x0 = 0, , x1 = 0] = drawn(window(12, 4, true, 4)).line ?? [];
    expect(x1 - x0).toBeCloseTo(f1 - f0, 2);
  });

  /** The owner, 27 September 2026: *more visible (e.g. more height)*, which
   * took it to 0.45 of a tile; and on the 30th, *make the glowing look better
   * and less height*. The glow is what makes a thin line read. */
  it("is a thin line in a glow wider than it", () => {
    expect(FUSE_THICK).toBeLessThanOrEqual(0.25);
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

  /** The owner, 30 September 2026: *starting green, then blue then to orange
   * and then to red colour depending on remaining seconds*. A quarter each. */
  const bands: readonly (readonly [number, string])[] = [
    [7, PALETTE.good],
    [5, PALETTE.blue],
    [3, PALETTE.ember],
    [1.5, PALETTE.red],
  ];

  it("goes green, blue, orange, then red as it burns", () => {
    for (const [left, colour] of bands) {
      for (const [, other] of bands) {
        expect(shows(window(8, left), other)).toBe(other === colour);
      }
    }
  });

  it("colours by the share left, so a short ask starts green too", () => {
    expect(shows(window(2, 2), PALETTE.good)).toBe(true);
    expect(shows(window(12, 4, true, 4), PALETTE.good)).toBe(true);
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
 * **Where it stands** — `src/slow-fuse-place.ts`: below the boss by default,
 * over it when the boss is down on the hull, the owner, 30 September 2026. A
 * body and marks set by hand; `tools/director/test/fuse-place.test.ts` walks
 * every boss's windows.
 */
describe("where the fuse stands", () => {
  const T = LAYOUT.tile;
  const mid = LAYOUT.width / 2;
  const body: Box = { left: mid - T, right: mid + T, top: T * 2, bottom: T * 4 };
  const crosses = (a: Box, b: Box): boolean =>
    a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

  it("stands level across almost the whole screen, halfway to the hull", () => {
    const p = fusePlace(LAYOUT, underBox(body), []);
    expect(p.x).toBeCloseTo(mid, 5);
    expect(p.half * 2).toBeGreaterThan(LAYOUT.width * 0.8);
    expect(Math.abs(p.y - (body.bottom + LAYOUT.hullY) / 2)).toBeLessThan(T * 0.1);
    const box = fuseBox(LAYOUT, p);
    expect(box.left).toBeGreaterThan(0);
    expect(box.right).toBeLessThan(LAYOUT.width);
    expect(box.top).toBeGreaterThanOrEqual(body.bottom);
    expect(box.bottom).toBeLessThanOrEqual(LAYOUT.hullY);
  });

  it("is the same length under a narrow body and a wide one", () => {
    const wide: Box = { ...body, left: -T, right: LAYOUT.width + T };
    const at = { x: mid - T, y: T * 4, r: T * 0.5, ax: mid + T * 3, ay: 0 };
    const halves = [underBox(body), underBox(wide), underAim(at)].map(
      (b) => fusePlace(LAYOUT, b, []).half,
    );
    for (const half of halves) expect(half).toBeCloseTo(halves[0] ?? 0, 5);
  });

  it("moves off a mark that sits in the middle of the gap", () => {
    const y = (body.bottom + LAYOUT.hullY) / 2;
    const mark: Box = { left: mid - T, right: mid + T, top: y - T, bottom: y + T };
    const box = fuseBox(LAYOUT, fusePlace(LAYOUT, underBox(body), [mark]));
    expect(crosses(box, mark)).toBe(false);
    expect(box.top).toBeGreaterThanOrEqual(body.bottom);
    expect(box.bottom).toBeLessThanOrEqual(LAYOUT.hullY);
  });

  it("stands over a boss that is down on the hull", () => {
    const low: Box = { ...body, top: LAYOUT.hullY - T * 3, bottom: LAYOUT.hullY - 2 };
    expect(roomUnder(LAYOUT, underBox(low))).toBe(false);
    const box = fuseBox(LAYOUT, fusePlace(LAYOUT, underBox(low), []));
    expect(box.bottom).toBeLessThanOrEqual(low.top);
    expect(box.bottom).toBeGreaterThan(low.top - T * 0.5);
  });

  it("drops to just above the hull when the boss fills the field over it too", () => {
    const tall: Box = { ...body, top: LAYOUT.gridTop, bottom: LAYOUT.hullY - 2 };
    const box = fuseBox(LAYOUT, fusePlace(LAYOUT, underBox(tall), []));
    expect(box.bottom).toBeLessThanOrEqual(LAYOUT.hullY);
    expect(box.bottom).toBeGreaterThan(LAYOUT.hullY - T * 0.25);
  });

  /** THE INSTAR hangs head-down off a chain that climbs to its engines: its
   * band of height runs from the engines down to the head. */
  it("stands under a climbing body's lower end", () => {
    const at = { x: mid - T, y: T * 4, r: T, ax: mid + T * 3, ay: 0 };
    const box = fuseBox(LAYOUT, fusePlace(LAYOUT, underAim(at), []));
    expect(box.top).toBeGreaterThanOrEqual(at.y + at.r);
  });
});
