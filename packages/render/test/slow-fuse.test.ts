import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { rgba } from "../src/hex.js";
import { computeLayout, type Layout } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { drawFuse, FUSE_MIN_BEATS } from "../src/slow-fuse.js";
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
 * arithmetic on a `fillRect` and a `fillStyle`, which is why this is read off
 * the log rather than looked at. `slow-look.test.ts` owns the pass; the fuse is
 * called directly so a window can be set by hand.
 */

beforeAll(installCanvasGlobals);

const LAYOUT: Layout = computeLayout(VIEWPORT, CFG, "p1");

function window(beats: number, left: number): SlowWindow {
  return { beats, left, through: (beats - left) / beats };
}

/** The log of one fuse drawn, and the widest `fillRect` in it — the line. */
function drawn(win: SlowWindow): { log: string[]; line: number[] | null } {
  const { ctx } = stubCanvas();
  ctx.log = [];
  drawFuse(ctx as unknown as CanvasRenderingContext2D, LAYOUT, win);
  const log = ctx.log;
  ctx.log = undefined;
  let line: number[] | null = null;
  for (const entry of log) {
    const m = /^fillRect\((.*)\)$/.exec(entry);
    if (m?.[1] === undefined) continue;
    const r = m[1].split(", ").map(Number);
    if (line === null || (r[2] ?? 0) > (line[2] ?? 0)) line = r;
  }
  return { log, line };
}

describe("how much of the fuse is left", () => {
  it("runs the whole width of the screen on the tick the window opens", () => {
    const { line } = drawn(window(8, 8));
    expect(line?.[0]).toBeCloseTo(0, 2);
    expect(line?.[2]).toBeCloseTo(LAYOUT.width, 2);
  });

  it("burns in from both ends and stays on the screen's middle", () => {
    const { line } = drawn(window(8, 2));
    const [x = 0, , w = 0] = line ?? [];
    expect(w).toBeCloseTo(LAYOUT.width / 4, 2);
    expect(x + w / 2).toBeCloseTo(LAYOUT.width / 2, 2);
  });

  it("stands on the top edge of the screen", () => {
    expect(drawn(window(8, 5)).line?.[1]).toBe(0);
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
  // The colour's own channels, whatever alpha it is laid at.
  const red = rgba(PALETTE.red, 0).replace(/,0\)$/, ",");

  function reds(win: SlowWindow): boolean {
    return drawn(win).log.some((e) => e.startsWith("set fillStyle=") && e.includes(red));
  }

  it("is the ship's own violet while there is time", () => {
    expect(reds(window(8, 6))).toBe(false);
  });

  it("goes red for the last two beats", () => {
    expect(reds(window(8, 1.5))).toBe(true);
  });
});
