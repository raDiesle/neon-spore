import { describe, expect, it } from "bun:test";
import { livingPoints, livingSilhouette, type Point } from "@neon-spore/content";
import { type Fracture, shatter } from "../src/shatter.js";
import { shardAt } from "../src/shatter-fall.js";

/**
 * What a fracture has to be true about, as opposed to what it has to look like.
 *
 * The looking is the pair's job and `tools/breaks` is where a session does it.
 * These are the four things no eye can check quickly and every one of which
 * silently ruins a break: that the pieces are the *whole* body and not most of
 * it, that both phones cut it the same way, that nothing degenerate reaches a
 * canvas, and that a piece that lands stays landed.
 */

const SLICK = livingSilhouette("slick");
const THROB = livingSilhouette("throb");

function area(pts: readonly Point[]): number {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i] as Point;
    const q = pts[(i + 1) % pts.length] as Point;
    a += p.x * q.y - q.x * p.y;
  }
  return Math.abs(a) / 2;
}

const CUT: Fracture = { ox: 0, oy: 0, wedges: 12, innerAt: 0.55, speed: 40, spin: 5, seed: 91 };

describe("shatter", () => {
  it("cuts the whole body up and loses none of it", () => {
    // The one property that separates a fracture from a particle system: the
    // pieces put back together are the body again. A wedge scheme that drops
    // a sliver at every cut, or one that double-counts the overlap between two
    // rings, fails here long before anybody notices it on a screen.
    const outline = livingPoints(SLICK, 0);
    const pieces = shatter(outline, CUT);
    const sum = pieces.reduce((n, s) => n + area(s.points), 0);
    // Within a couple of percent: the wedge arcs are sampled rather than exact,
    // so a lobe between two cut rays is chorded and the pieces sit fractionally
    // inside the true contour.
    expect(sum).toBeGreaterThan(area(outline) * 0.97);
    expect(sum).toBeLessThanOrEqual(area(outline) * 1.001);
  });

  it("cuts a clubbed rim without tearing", () => {
    // THE THROB is walked rather than sampled by angle (`clubbedPoints`), which
    // is the contour most likely to defeat a ray cast. Nothing degenerate, and
    // still nearly all of the body.
    const outline = livingPoints(THROB, 0);
    const pieces = shatter(outline, CUT);
    expect(pieces.length).toBeGreaterThan(12);
    for (const s of pieces) {
      expect(area(s.points)).toBeGreaterThan(0);
      for (const p of s.points) {
        expect(Number.isFinite(p.x)).toBe(true);
        expect(Number.isFinite(p.y)).toBe(true);
      }
    }
  });

  it("cuts the same body the same way from the same seed", () => {
    // Two phones watching one body die watch the same pieces leave it, which is
    // `sparks.ts`'s rule and the reason nothing here touches `Math.random`.
    const outline = livingPoints(SLICK, 0);
    expect(shatter(outline, CUT)).toEqual(shatter(outline, CUT));
    expect(shatter(outline, { ...CUT, seed: 92 })).not.toEqual(shatter(outline, CUT));
  });

  it("gives one piece per wedge with a single ring, and two with two", () => {
    const outline = livingPoints(SLICK, 0);
    expect(shatter(outline, { ...CUT, innerAt: 1 })).toHaveLength(CUT.wedges);
    expect(shatter(outline, { ...CUT, innerAt: 0.5 })).toHaveLength(CUT.wedges * 2);
  });

  it("draws nothing when the look asks for no fracture", () => {
    expect(shatter(livingPoints(SLICK, 0), { ...CUT, wedges: 0 })).toEqual([]);
  });
});

describe("a piece falling", () => {
  const piece = { points: [], x: 0, y: 0, vx: 30, vy: -20, spin: 4, depth: 1 };
  const fall = { gravity: 400, life: 1, fade: 0.4, floor: 60, skid: 0.3 };

  it("comes down onto the floor and stays on it", () => {
    const mid = shardAt(piece, 0.2, fall);
    expect(mid.landed).toBe(false);
    // It meets the floor at 0.6 s exactly; the frame of contact still counts as
    // the flight, which is what keeps the settle from starting twice.
    for (const t of [0.65, 0.8, 1]) {
      const late = shardAt(piece, t, fall);
      expect(late.landed).toBe(true);
      expect(late.y).toBeCloseTo(fall.floor, 6);
    }
  });

  it("stops sliding, rather than sliding forever", () => {
    const a = shardAt(piece, 0.7, fall);
    const b = shardAt(piece, 1, fall);
    // Still moving a little between the two, and by far less than it moved in
    // the same span while it was in the air.
    expect(Math.abs(b.x - a.x)).toBeLessThan(1);
  });

  it("is solid until the fade and gone at the end of its life", () => {
    expect(shardAt(piece, 0.5, fall).alpha).toBe(1);
    expect(shardAt(piece, 1, fall).alpha).toBeCloseTo(0, 6);
    expect(shardAt(piece, 5, fall).alpha).toBeCloseTo(0, 6);
  });

  it("falls out of the picture when there is nothing under it", () => {
    const free = shardAt(piece, 0.9, { ...fall, floor: undefined });
    expect(free.landed).toBe(false);
    expect(free.y).toBeGreaterThan(fall.floor);
  });
});
