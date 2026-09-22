import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { computeLayout, type Layout } from "../src/layout.js";
import type { Aim } from "../src/slow-intake-aim.js";
import { drawBar } from "../src/slow-intake-bar.js";
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
 * **Where the measure stands and how many divisions it carries** —
 * `src/slow-intake-bar.ts`, the two things the owner asked for on 22 September
 * 2026 that a frame test cannot tell apart from a bar drawn anywhere.
 *
 * *i asked to show this progress bar more near the boss*: the bar hangs under
 * the body now and only falls back to its old place above the hull when the
 * body is too low to hang anything under. And since the window it measures is
 * the whole of the asking (`sim/slow.ts` `closeSlow`) rather than a rest
 * between steps, it is around twenty-four beats wide — a notch a beat there is
 * a comb, so the beats are grouped. Both are arithmetic on a `fillRect`, which
 * is why this is read off the log rather than looked at.
 *
 * The bar is called directly: `slow-look.test.ts` owns the pass and the
 * streams, and an `Aim` set by hand is the only way to ask what happens to a
 * body standing where no wave puts one.
 */

beforeAll(installCanvasGlobals);

const LAYOUT: Layout = computeLayout(VIEWPORT, CFG, "p1");

/** Where the bar used to stand, and still stands when nothing hangs above it:
 * `LIFT` tiles over the hull line. Written out rather than imported because a
 * floor the file could move under this test is not a floor. */
const FLOOR = LAYOUT.hullY - LAYOUT.tile * 0.55;

function bodyAt(y: number, r: number): Aim {
  const x = LAYOUT.gridLeft + LAYOUT.gridWidth / 2;
  return { x, y, r, ax: x, ay: y - r };
}

function window(beats: number, left: number): SlowWindow {
  return { beats, left, through: (beats - left) / beats };
}

/** Every `fillRect` the bar made, as numbers — the log rounds to thousandths
 * of a pixel, which is why nothing below compares one to more places. */
function rects(win: SlowWindow, at: Aim): number[][] {
  const { ctx } = stubCanvas();
  ctx.log = [];
  drawBar(ctx as unknown as CanvasRenderingContext2D, LAYOUT, win, at);
  const out: number[][] = [];
  for (const line of ctx.log) {
    const m = /^fillRect\((.*)\)$/.exec(line);
    if (m?.[1] !== undefined) out.push(m[1].split(", ").map(Number));
  }
  ctx.log = undefined;
  return out;
}

/**
 * A notch is told from the bar by its **height**: the bar is two flat rects a
 * tenth of a tile thick and a notch stands a quarter of one. Width would be
 * the obvious reading and is the wrong one — a bar nearly spent is narrower
 * than the notches it has swallowed.
 */
function notches(all: number[][]): number[][] {
  return all.filter((r) => (r[3] ?? 0) >= LAYOUT.tile * 0.2);
}

/** The bar's own line, and the y every rect shares. */
function barY(all: number[][]): number {
  const thick = LAYOUT.tile * 0.1;
  const first = all[0] ?? [];
  return (first[1] ?? 0) + thick / 2;
}

describe("where the measure hangs", () => {
  it("hangs under the body rather than over the hull", () => {
    const at = bodyAt(LAYOUT.hullY * 0.4, LAYOUT.tile * 2);
    const y = barY(rects(window(8, 8), at));
    expect(y).toBeCloseTo(at.y + at.r + LAYOUT.tile * 0.7, 2);
    expect(y).toBeLessThan(FLOOR);
  });

  it("does not follow a body that has come down onto the hull", () => {
    const y = barY(rects(window(8, 8), bodyAt(LAYOUT.hullY, LAYOUT.tile * 2)));
    expect(y).toBeCloseTo(FLOOR, 2);
  });

  /**
   * THE INSTAR swings four beats a cycle (`instar-sway.ts`) and a measure that
   * swung with it would be a measure found again every beat. Only the height
   * comes off the body: two bodies at the same height, a field apart, give the
   * same bar.
   */
  it("keeps the field's middle whatever the body does sideways", () => {
    const y = LAYOUT.hullY * 0.4;
    const r = LAYOUT.tile * 2;
    const left = { ...bodyAt(y, r), x: LAYOUT.gridLeft, ax: LAYOUT.gridLeft };
    const right = {
      ...bodyAt(y, r),
      x: LAYOUT.gridLeft + LAYOUT.gridWidth,
      ax: LAYOUT.gridLeft + LAYOUT.gridWidth,
    };
    expect(rects(window(8, 8), left)).toEqual(rects(window(8, 8), right));
  });
});

describe("how many divisions it carries", () => {
  const at = bodyAt(LAYOUT.hullY * 0.4, LAYOUT.tile * 2);

  it("groups a choreographed window into five divisions a side at the most", () => {
    const drawn = notches(rects(window(24, 24), at));
    expect(drawn.length).toBeLessThanOrEqual(10);
    expect(drawn.length).toBeGreaterThan(2);
  });

  it("still puts a notch on every beat of a short one", () => {
    expect(notches(rects(window(4, 4), at))).toHaveLength(6);
  });

  it("swallows the notches the beats have taken", () => {
    const whole = notches(rects(window(24, 24), at)).length;
    const half = notches(rects(window(24, 12), at)).length;
    expect(half).toBeLessThan(whole);
    expect(notches(rects(window(24, 0.1), at))).toHaveLength(0);
  });

  it("draws nothing at all once the window is spent", () => {
    expect(rects(window(24, 0), at)).toHaveLength(0);
  });
});
