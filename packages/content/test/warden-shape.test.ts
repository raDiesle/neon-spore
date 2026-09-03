import { describe, expect, test } from "bun:test";
import {
  hullRadiusMul,
  type Point,
  WARDEN_PUPIL_OPEN,
  WARDEN_RING,
  wardenOpening,
} from "../src/index.js";

/**
 * THE WARDEN's body is the only one in the game a shot has to get *inside*,
 * and the only thing on it worth hitting is in the middle. The opening below
 * the eye is what makes that picture true, and the thing worth testing is not
 * that a contour was built — it is that the lane is clear: straight up the
 * pupil's own column, from below the body to the eye, there is no material.
 */

const R = 100;

function loop(
  l: { lobes: number; depth: number; wobble: number },
  cx: number,
  r: number,
  t: number,
  seed: number,
): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    const m = hullRadiusMul(a, l.lobes, l.depth, l.wobble, t, seed);
    pts.push({ x: cx + Math.cos(a) * r * m, y: Math.sin(a) * r * m });
  }
  return pts;
}

/** The two loops the game builds, at one moment and one pupil. */
function pose(at: number, mul: number, t: number) {
  const dx = WARDEN_RING.pupilTravel * R * at;
  return {
    dx,
    outer: loop(WARDEN_RING.outer, 0, R, t, WARDEN_RING.outer.seed),
    pupil: loop(WARDEN_RING.pupil, dx, R * mul, t, WARDEN_RING.pupil.seed),
  };
}

/** Crossing count, so "is this point in the rock" is answered the way a fill is. */
function inside(poly: Point[], x: number, y: number): boolean {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i] as Point;
    const b = poly[j] as Point;
    if (a.y > y !== b.y > y && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) hit = !hit;
  }
  return hit;
}

const POSES: Array<[string, number, number]> = [
  ["at home", 0.2, WARDEN_RING.pupilMul],
  ["run out to the edge", 1, WARDEN_RING.pupilMul],
  ["run out the other way", -1, WARDEN_RING.pupilMul],
  ["open", 0.2, WARDEN_PUPIL_OPEN],
  ["open at the edge", 1, WARDEN_PUPIL_OPEN],
];

describe("the way in below THE WARDEN's eye", () => {
  for (const [name, at, mul] of POSES) {
    test(`${name}: the pupil's column is clear from below`, () => {
      for (let t = 0; t < 8; t += 0.5) {
        const p = pose(at, mul, t);
        const cut = wardenOpening(p.outer, p.pupil, 0, 0);
        expect({ name, t, cut: cut === null }).toEqual({ name, t, cut: false });
        // Up the middle of the hole, from clear of the body to the eye itself.
        const solid: number[] = [];
        for (let y = R * 1.4; y > 0; y -= R / 40) {
          if (inside((cut as { contour: Point[] }).contour, p.dx, y)) solid.push(y);
        }
        expect({ name, t, solid }).toEqual({ name, t, solid: [] });
      }
    });
  }

  test("the body above the eye is still material, or nothing was cut open", () => {
    const p = pose(0.2, WARDEN_RING.pupilMul, 0);
    const cut = wardenOpening(p.outer, p.pupil, 0, 0);
    const top = -R * (WARDEN_RING.pupilMul + 1) * 0.5;
    expect(inside((cut as { contour: Point[] }).contour, p.dx, top)).toBe(true);
  });

  test("the eye is not material either — the hole is still a hole", () => {
    const p = pose(0.2, WARDEN_RING.pupilMul, 0);
    const cut = wardenOpening(p.outer, p.pupil, 0, 0);
    expect(inside((cut as { contour: Point[] }).contour, p.dx, 0)).toBe(false);
  });
});
