import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { INSTAR_SCRIPT } from "@neon-spore/content";
import { instarMarkCol } from "@neon-spore/sim";
import { heartBeat, heartCurves } from "../src/instar-heart.js";
import { instarMarkPoint, instarMarkRadius, type Point } from "../src/instar-place.js";
import { BARE_GROWTH, BARE_HEART } from "../src/instar-poses-second.js";
import { RING_SWELL } from "../src/instar-ring.js";
import { computeLayout } from "../src/layout.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE INSTAR's bare heart is seen round its ring.** The owner, 27 September
 * 2026, on `instar:heart`: he could not see a difference, *probably because
 * the action circle is above the heart*. The ring is filled with the
 * background, so whatever of the heart is inside it is gone; the heart has to
 * reach past the ring on every side, by a third of a mark radius at the
 * ring's widest breath, on every point of the beat.
 */

const L = computeLayout(VIEWPORT, CFG, "test");
const MARK_R = instarMarkRadius(L, CFG);

/** The heart's outline, sampled along both of its curves. */
function outline(at: Point, r: number): Point[] {
  const [p0, c1, c2, p1, c3, c4] = heartCurves(at, r);
  const out: Point[] = [];
  const cubic = (a: Point, b: Point, c: Point, d: Point) => {
    for (let i = 0; i <= 64; i++) {
      const t = i / 64;
      const u = 1 - t;
      const k = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t] as const;
      out.push({
        x: k[0] * a.x + k[1] * b.x + k[2] * c.x + k[3] * d.x,
        y: k[0] * a.y + k[1] * b.y + k[2] * c.y + k[3] * d.y,
      });
    }
  };
  cubic(p0, c1, c2, p1);
  cubic(p1, c3, c4, p0);
  return out;
}

/** How far the shape reaches from `o` toward the least of every direction round it. */
function leastReach(shape: readonly Point[], o: Point): number {
  let least = Number.POSITIVE_INFINITY;
  for (let d = 0; d < 360; d += 2) {
    const a = (d * Math.PI) / 180;
    const reach = Math.max(
      ...shape.map((p) => (p.x - o.x) * Math.cos(a) + (p.y - o.y) * Math.sin(a)),
    );
    least = Math.min(least, reach);
  }
  return least;
}

const bare = INSTAR_SCRIPT.find((s) => s.pose === "bare");
const heartMark = bare?.marks.find((m) => m.part === "heart");

describe("the bare heart", () => {
  it("reaches a third of a mark radius past the ring's widest breath, on every side, all through the beat", () => {
    const mark = { x: 450, y: 700 };
    const widest = MARK_R * (1 + RING_SWELL.awaited);
    for (let i = 0; i < 20; i++) {
      const beat = heartBeat(L, CFG, mark, i / 20, 1);
      const reach = leastReach(outline(beat.at, beat.r), mark);
      expect(reach).toBeGreaterThanOrEqual(widest + MARK_R / 3);
      expect(reach / MARK_R).toBeGreaterThanOrEqual(1.33);
    }
  });

  it("is centred on its mark, not hung from it", () => {
    const mark = { x: 450, y: 700 };
    const beat = heartBeat(L, CFG, mark, 0.5, 1);
    const ys = outline(beat.at, beat.r).map((p) => p.y);
    const mid = (Math.min(...ys) + Math.max(...ys)) / 2;
    expect(Math.abs(mid - mark.y)).toBeLessThan(beat.r * 0.02);
  });

  it("the body grows about the script's own mark, so the heart and the mark stay together", () => {
    expect(BARE_GROWTH).toBeGreaterThan(1);
    expect(heartMark?.xMilli).toBe(BARE_HEART.xMilli);
    expect(heartMark?.yMilli).toBe(BARE_HEART.yMilli);
  });

  it("is hit where it is drawn: the column under the heart is the one the shot counts on", () => {
    if (heartMark === undefined) throw new Error("the bare step has no heart mark");
    const at = instarMarkPoint(L, heartMark, { xMilli: 0, yMilli: 0 }, 0);
    const beat = heartBeat(L, CFG, at, 0, 1);
    const xs = outline(beat.at, beat.r).map((p) => p.x);
    const centre = (Math.min(...xs) + Math.max(...xs)) / 2;
    expect(Math.floor((centre - L.gridLeft) / L.tile)).toBe(instarMarkCol(CFG, heartMark));
  });
});
