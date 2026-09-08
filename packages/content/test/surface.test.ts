import { describe, expect, it } from "bun:test";
import { KEY } from "../src/light.js";
import { facet, limbX, pin, surfaceDim, surfaceLit } from "../src/surface.js";

/**
 * The claims `docs/dimensional.md` makes about depth, as a test.
 *
 * That document measured the difference between a body *placed* on a surface
 * and a body *posed* by an affine, and the numbers it arrived at are the whole
 * argument for `surface.ts` existing. A number in prose drifts from the code
 * under it silently, so each one is checked here against the projection the
 * game and the director both call.
 */

/** The step the document measured at: 5°, the same on both sides of its table. */
const STEP = (5 * Math.PI) / 180;

describe("the surface a mark is placed on", () => {
  it("carries a mark across the facing meridian 22.9 times faster than one at the limb", () => {
    const facing = pin(0, 0, 1);
    const limb = pin(Math.PI / 2, 0, 1);
    const near = Math.abs(facet(facing, STEP).x - facet(facing, 0).x);
    const far = Math.abs(facet(limb, STEP).x - facet(limb, 0).x);
    expect(near).toBeCloseTo(0.0872, 4);
    expect(far).toBeCloseTo(0.0038, 4);
    // An affine manages 1.10 : 1 on the same body, which is the absence of an
    // asymmetry rather than a weak one. Nothing about tuning a pose reaches
    // this number, and that is why the projection is worth its trigonometry.
    expect(near / far).toBeCloseTo(22.9, 1);
  });

  it("narrows a feature to nothing at the silhouette rather than clipping it", () => {
    const p = pin(0, 0, 1);
    expect(facet(p, 0).sx).toBeCloseTo(1, 6);
    expect(facet(p, Math.PI / 2).sx).toBeCloseTo(0, 6);
    // Past the limb it is not drawn at all: a feature that faded out instead
    // would say translucent where the claim is round.
    expect(facet(p, Math.PI).near).toBe(false);
  });

  it("keeps a feature's height out of the rotation entirely", () => {
    const p = pin(0.3, 0.6, 40);
    const y = facet(p, 0).y;
    for (const theta of [0.4, 1.1, 2.7, 5.9]) expect(facet(p, theta).y).toBeCloseTo(y, 9);
    expect(y).toBeCloseTo(40 * Math.sin(0.6), 9);
  });

  it("folds a far vertex onto the silhouette at its own height", () => {
    const reach = 30;
    const lat = 0.4;
    const k = reach * Math.cos(lat);
    const cy = reach * Math.sin(lat);
    // A vertex round the back, so `cos α < 0` and the fold is what answers.
    const a = Math.PI * 0.8;
    const x = limbX(k, Math.sin(a), Math.cos(a));
    expect(Math.hypot(x, cy)).toBeCloseTo(reach, 9);
    expect(x).toBeGreaterThan(0);
  });

  it("does not turn the light with the body", () => {
    // The lit shoulder is where the light is, not where the body has got to.
    // `KEY` is upper left, so the brightest place on the surface is up and to
    // the left of centre whatever the rotation has done underneath it.
    for (const theta of [0, 0.7, 2.2, 4.4]) {
      let best = { x: 0, y: 0, lit: -1 };
      for (let lon = 0; lon < Math.PI * 2; lon += 0.02) {
        for (let lat = -1.2; lat <= 1.2; lat += 0.02) {
          const f = facet(pin(lon, lat, 1), theta);
          if (f.near && f.lit > best.lit) best = { x: f.x, y: f.y, lit: f.lit };
        }
      }
      expect(Math.sign(best.x)).toBe(Math.sign(KEY.x));
      expect(Math.sign(best.y)).toBe(Math.sign(KEY.y));
    }
  });

  it("gives a feature in full shadow whatever floor it was authored with", () => {
    const dark = surfaceLit(1, 0, 0, -1);
    expect(dark).toBe(0);
    expect(surfaceDim(0.25, dark)).toBeCloseTo(0.25, 9);
    expect(surfaceDim(0.25, 1)).toBeCloseTo(1, 9);
    expect(surfaceDim(1, 0)).toBe(1);
  });
});
