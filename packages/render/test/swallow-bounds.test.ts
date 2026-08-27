import { beforeAll, describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { drawHull, type HullMood } from "../src/hull.js";
import { computeLayout } from "../src/layout.js";
import { installCanvasGlobals, StubContext } from "./canvas-stub.js";

/**
 * The bug this guards: the maw is the one shape on the hull with *negative*
 * lift — at full intake it inverts the cannon lobe into a dent instead of a
 * bump — and nothing before this test ever asked whether that dent, or the
 * muzzle drawn into the bottom of it, could reach past the field's own
 * bottom edge (`Layout.bandTop`) into the control band underneath. It could:
 * at full intake, past a particular column and breath phase, the bare
 * contour landed more than half a tile below `bandTop` with nothing to stop
 * it — `drawHull`'s own clip rect reached to `l.height`, the whole canvas,
 * not to the field it was meant to bound.
 *
 * Two guards, matching the two halves of the fix:
 *
 * 1. Whatever `drawHull` draws is clipped no lower than `bandTop` — a frame
 *    that regresses the clip rect back to the full canvas height fails this
 *    immediately, regardless of any lobe math upstream of it.
 * 2. The muzzle's own reach below the tip (`ry` in `drawMuzzle`) never grows
 *    with intake — the growth the old circle spent on getting deeper now
 *    only ever goes sideways (`rx`), so the shape cannot re-introduce the
 *    same overflow through its own radius even if the clip above it were
 *    ever loosened again.
 */

const CFG = DEFAULT_CONFIG;
const L = computeLayout({ width: 400, height: 850, dpr: 2 }, CFG, "test");
const EPS = 0.01;

/** Records the clip rect `drawHull` sets up, and every ellipse it fills. */
class RecordingContext extends StubContext {
  clipRects: { y: number; h: number }[] = [];
  ellipses: { cy: number; rx: number; ry: number }[] = [];
  private lastRect: { y: number; h: number } | null = null;

  override rect(x: number, y: number, w: number, h: number): void {
    super.rect(x, y, w, h);
    this.lastRect = { y, h };
  }

  override clip(): void {
    super.clip();
    if (this.lastRect) this.clipRects.push(this.lastRect);
  }

  override ellipse(
    x: number,
    y: number,
    rx: number,
    ry: number,
    rotation: number,
    from: number,
    to: number,
  ): void {
    super.ellipse(x, y, rx, ry, rotation, from, to);
    this.ellipses.push({ cy: y, rx, ry });
  }
}

beforeAll(installCanvasGlobals);

function moodAt(intake: number): HullMood {
  return { armed: 0, intake, chew: 0, charge: 0 };
}

describe("the maw stays inside the field", () => {
  it("clips no lower than bandTop, at every intake, column and breath phase", () => {
    const ctx = new RecordingContext();
    for (let col = 0; col <= CFG.cols - 1; col += 1) {
      for (let ti = 0; ti < 20; ti++) {
        const time = ti * 0.1;
        for (const intake of [0, 0.25, 0.5, 0.75, 1]) {
          drawHull(ctx as unknown as CanvasRenderingContext2D, L, [], time, moodAt(intake), 100, {
            cannon: col,
            shield: [],
          });
        }
      }
    }
    expect(ctx.clipRects.length).toBeGreaterThan(0);
    for (const r of ctx.clipRects) {
      expect(r.y + r.h).toBeLessThanOrEqual(L.bandTop + EPS);
    }
  });

  it("never grows the muzzle's reach below the tip, however wide it opens", () => {
    const ctx = new RecordingContext();
    for (let col = 0; col <= CFG.cols - 1; col += 0.5) {
      for (const intake of [0, 0.25, 0.5, 0.75, 1]) {
        drawHull(ctx as unknown as CanvasRenderingContext2D, L, [], 0.3, moodAt(intake), 100, {
          cannon: col,
          shield: [],
        });
      }
    }
    expect(ctx.ellipses.length).toBeGreaterThan(0);
    const maxRy = Math.max(...ctx.ellipses.map((e) => e.ry));
    // The resting muzzle's own radius, in pixels — the ceiling this shape is
    // meant never to exceed on its way down, no matter how far it opens.
    expect(maxRy).toBeLessThanOrEqual(L.tile * 0.13 + EPS);
  });
});
