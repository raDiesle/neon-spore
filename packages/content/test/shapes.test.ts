import { describe, expect, it } from "bun:test";
import { bumpAdd, bumpLift, hullAngleAtX, hullPointAtX, hullRadiusMul } from "../src/hull-shape.js";
import {
  blobPath,
  catmullRomSegments,
  catmullRomToBezierPath,
  openSmoothPath,
  type Point,
} from "../src/shapes.js";

describe("shapes", () => {
  describe("catmullRomToBezierPath", () => {
    it("produces closed paths (ends with Z)", () => {
      const pts: Point[] = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ];
      const path = catmullRomToBezierPath(pts);
      expect(path.endsWith("Z")).toBe(true);
    });

    it("starts with M", () => {
      const pts: Point[] = [{ x: 0, y: 0 }];
      const path = catmullRomToBezierPath(pts);
      expect(path.startsWith("M")).toBe(true);
    });

    it("handles single point", () => {
      const pts: Point[] = [{ x: 5, y: 5 }];
      const path = catmullRomToBezierPath(pts);
      expect(path).toContain("5");
    });
  });

  /**
   * The numbers and the text are one spline. `render/src/spline.ts` walks the
   * segments straight into a `Path2D` and never builds the string at all, and
   * a second copy of the control-point arithmetic is exactly the drift
   * `packages/sim/test/purity.test.ts` keeps a table against — so what is
   * checked here is that the two forms still describe the same curve, to the
   * two decimals the text was ever rounded to.
   */
  describe("catmullRomSegments", () => {
    const ring: Point[] = [
      { x: 3, y: 7 },
      { x: 41, y: 11 },
      { x: 37, y: 53 },
      { x: 5, y: 47 },
      { x: -9, y: 23 },
    ];

    /** Every number in an SVG `d`, in the order it was written. */
    const numbersIn = (d: string) => (d.match(/-?\d+\.\d+/g) ?? []).map(Number);

    it("carries the same curve the closed path spells out", () => {
      const text = numbersIn(catmullRomToBezierPath(ring));
      const seg = catmullRomSegments(ring, true);
      // The string leads with its `M`, which the segments do not carry.
      expect(text.slice(0, 2)).toEqual([3, 7]);
      expect(text.length).toBe(2 + seg.length);
      for (const [i, n] of seg.entries()) expect(text[2 + i]).toBeCloseTo(n, 2);
    });

    it("carries the same curve the open path spells out", () => {
      const text = numbersIn(openSmoothPath(ring));
      const seg = catmullRomSegments(ring, false);
      expect(text.length).toBe(2 + seg.length);
      for (const [i, n] of seg.entries()) expect(text[2 + i]).toBeCloseTo(n, 2);
    });

    it("closes the loop and clamps the open run", () => {
      expect(catmullRomSegments(ring, true).length / 6).toBe(ring.length);
      expect(catmullRomSegments(ring, false).length / 6).toBe(ring.length - 1);
    });
  });

  describe("blobPath", () => {
    it("is deterministic for the same parameters", () => {
      const params = {
        cx: 50,
        cy: 50,
        rx: 40,
        ry: 40,
        lobes: 2,
        depth: 0.3,
        wobble: 0.1,
        seed: 1.5,
      };
      const t = 1.23;
      const a = blobPath(
        params.cx,
        params.cy,
        params.rx,
        params.ry,
        params.lobes,
        params.depth,
        params.wobble,
        t,
        params.seed,
      );
      const b = blobPath(
        params.cx,
        params.cy,
        params.rx,
        params.ry,
        params.lobes,
        params.depth,
        params.wobble,
        t,
        params.seed,
      );
      expect(a).toBe(b);
    });

    it("produces a closed path", () => {
      const path = blobPath(50, 50, 40, 40, 2, 0.3, 0.1, 0.5, 1.5);
      expect(path.endsWith("Z")).toBe(true);
    });

    it("changes over time", () => {
      const a = blobPath(50, 50, 40, 40, 2, 0.3, 0.1, 0, 1.5);
      const b = blobPath(50, 50, 40, 40, 2, 0.3, 0.1, 1, 1.5);
      expect(a).not.toBe(b);
    });
  });

  describe("bumpAdd", () => {
    it("returns full strength at the centre (diff 0)", () => {
      const result = bumpAdd(0, 1.0, 0.5, 0.5);
      expect(result).toBe(1.0);
    });

    it("returns full strength within the plateau", () => {
      const plateau = 0.3;
      const result = bumpAdd(0.15, 1.0, plateau, 0.2);
      expect(result).toBe(1.0);
    });

    it("returns 0 beyond plateau + shoulder", () => {
      const result = bumpAdd(1.5, 1.0, 0.3, 0.2);
      expect(result).toBe(0);
    });

    it("tapers in the shoulder zone", () => {
      const at_edge = bumpAdd(0.3, 1.0, 0.3, 0.2); // plateau edge
      const at_mid = bumpAdd(0.4, 1.0, 0.3, 0.2); // middle of shoulder
      const at_end = bumpAdd(0.5, 1.0, 0.3, 0.2); // shoulder edge
      expect(at_mid).toBeGreaterThan(0);
      expect(at_mid).toBeLessThan(at_edge + 0.01); // floating point
      expect(at_end).toBeLessThan(0.01);
    });

    it("is symmetric around diff=0", () => {
      const pos = bumpAdd(0.4, 1.0, 0.3, 0.2);
      const neg = bumpAdd(-0.4, 1.0, 0.3, 0.2);
      expect(pos).toBe(neg);
    });
  });

  describe("hullRadiusMul", () => {
    it("is >= 1 at the lobes (for typical positive depth)", () => {
      // At angle 0, cos(0) = 1, so the lobe multiplier is 1 + depth
      const m = hullRadiusMul(0, 2, 0.3, 0.1, 0, 0);
      expect(m).toBeGreaterThanOrEqual(1);
    });

    it("changes over time due to wobble", () => {
      const m0 = hullRadiusMul(0, 2, 0.3, 0.1, 0, 0);
      const m1 = hullRadiusMul(0, 2, 0.3, 0.1, 1, 0);
      expect(m0).not.toBe(m1);
    });

    it("ignores bumps — they lift, they do not widen", () => {
      const bumps = [{ angle: 0, strength: 0.2, plateau: 0.1, shoulder: 0.1 }];
      expect(bumpLift(0, bumps)).toBeCloseTo(0.2);
      expect(bumpLift(5, bumps)).toBe(0);
      expect(bumpLift(0, undefined)).toBe(0);
    });
  });

  describe("hullPointAtX", () => {
    it("returns the x it was asked about", () => {
      const p = hullPointAtX(120, 100, 100, 300, 50, 2, 0.3, 0.1, 0, 0);
      expect(p.x).toBe(120);
      expect(typeof p.y).toBe("number");
    });

    it("is deterministic", () => {
      const a = hullPointAtX(150, 100, 100, 300, 50, 2, 0.3, 0.1, 1.2, 0.7);
      const b = hullPointAtX(150, 100, 100, 300, 50, 2, 0.3, 0.1, 1.2, 0.7);
      expect(a).toEqual(b);
    });

    it("changes over time", () => {
      const a = hullPointAtX(100, 100, 100, 300, 50, 2, 0.3, 0.1, 0, 0);
      const b = hullPointAtX(100, 100, 100, 300, 50, 2, 0.3, 0.1, 0.5, 0);
      expect(a.y).not.toBe(b.y);
    });

    /**
     * The lobe stands above the column it belongs to. A bump moves the surface
     * straight up by `strength * ry` at the x it is centred on, and leaves x
     * alone — at the apex and at either edge of the field alike. This is what
     * keeps the cannon from leaning towards the middle at the edges.
     */
    it("lifts a bump straight up, at the apex and away from it", () => {
      const cx = 100;
      const rx = 300;
      for (const x of [cx, cx - 140, cx + 140]) {
        const bumps = [
          { angle: hullAngleAtX(x, cx, rx), strength: 0.2, plateau: 0.1, shoulder: 0.1 },
        ];
        const flat = hullPointAtX(x, cx, 100, rx, 50, 2, 0.3, 0.1, 0, 0);
        const bumped = hullPointAtX(x, cx, 100, rx, 50, 2, 0.3, 0.1, 0, 0, bumps);
        expect(bumped.x).toBe(x);
        expect(flat.y - bumped.y).toBeCloseTo(0.2 * 50);
      }
    });
  });
});
