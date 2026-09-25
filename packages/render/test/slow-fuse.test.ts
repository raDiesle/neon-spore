import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { rgba } from "../src/hex.js";
import { computeLayout, type Layout } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { drawFuse, FUSE_MIN_BEATS, FUSE_TOP_PX } from "../src/slow-fuse.js";
import type { SlowWindow } from "../src/slow-look.js";
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

function window(beats: number, left: number): SlowWindow {
  return { beats, left, through: (beats - left) / beats };
}

/**
 * The log of one fuse drawn, and the line as `[x0, y, x1]` — read off the two
 * sparks, which are the only `fillRect`s and are centred on the burning ends.
 */
function drawn(win: SlowWindow): { log: string[]; line: number[] | null } {
  const { ctx } = stubCanvas();
  ctx.log = [];
  drawFuse(ctx as unknown as CanvasRenderingContext2D, LAYOUT, win);
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
  /** Nearly the whole width, with the round ends pulled in far enough that
   * neither cap nor spark is cut by the side of the screen. */
  it("runs nearly the whole width of the screen on the tick the window opens", () => {
    const [x0 = 0, , x1 = 0] = drawn(window(8, 8)).line ?? [];
    expect(x0).toBeGreaterThan(LAYOUT.tile * 0.2);
    expect(x1).toBeLessThan(LAYOUT.width - LAYOUT.tile * 0.2);
    expect(x1 - x0).toBeGreaterThan(LAYOUT.width * 0.8);
  });

  it("burns in from both ends and stays on the screen's middle", () => {
    const [f0 = 0, , f1 = 0] = drawn(window(8, 8)).line ?? [];
    const [x0 = 0, , x1 = 0] = drawn(window(8, 2)).line ?? [];
    expect(x1 - x0).toBeCloseTo((f1 - f0) / 4, 2);
    expect((x0 + x1) / 2).toBeCloseTo(LAYOUT.width / 2, 2);
  });

  /** Flush on the edge it was a two-pixel line with half of each spark off
   * the screen — the owner's *cut off*, 25 September 2026. The ≡ button and
   * the link chip reach 40 px down. */
  it("hangs below the top chrome, not on the edge of the screen", () => {
    expect(drawn(window(8, 5)).line?.[1]).toBe(FUSE_TOP_PX);
    expect(FUSE_TOP_PX).toBeGreaterThan(40);
  });

  it("draws nothing once the window is spent", () => {
    expect(drawn(window(8, 0)).log).toHaveLength(0);
  });

  /** A dramatic beat asks for nothing and fails nobody; a fuse on it would
   * count down to a hit that never comes. THE INSTAR's fall is four. */
  it("draws nothing on a window too short to be asking for something", () => {
    expect(drawn(window(FUSE_MIN_BEATS - 1, FUSE_MIN_BEATS - 1)).log).toHaveLength(0);
    expect(drawn(window(4, 4)).log).toHaveLength(0);
    expect(drawn(window(6, 6)).log.length).toBeGreaterThan(0);
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
