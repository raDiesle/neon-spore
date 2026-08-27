import { blobRadiusMul, catmullRomToBezierPath, type Point } from "@neon-spore/content";
import type { Subject } from "../contour.js";

/** Points in one sampled outline. */
const N = 64;

/**
 * A slab: a superellipse, flat-sided and square-shouldered. The one form here
 * that does not read as grown — a made thing, for the ideas that are about a
 * rule rather than an animal.
 */
export function slab(name: string, note: string, rx: number, ry: number, power: number): Subject {
  return {
    name,
    note,
    open: false,
    pointsAt(t) {
      const pts: Point[] = [];
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2;
        const c = Math.cos(a);
        const s = Math.sin(a);
        // Superellipse in polar form: the exponent squares off the corners.
        const r = (Math.abs(c) ** power + Math.abs(s) ** power) ** (-1 / power);
        const breath = 1 + 0.02 * Math.sin(t * 0.7);
        pts.push({ x: c * r * rx * breath, y: s * r * ry * breath });
      }
      return pts;
    },
    path: catmullRomToBezierPath,
  };
}

/**
 * A body whose edge carries a band of notches that travel around it.
 *
 * The pattern is cut into the silhouette rather than drawn inside it, because
 * the outline is all a player has at 26 px — an inner texture is a detail on a
 * phone, and a notched rim is a shape. `march` is how fast the band scrolls;
 * it is the tell for anything whose state is a code rather than a health bar.
 */
export function glyphed(
  name: string,
  note: string,
  rx: number,
  ry: number,
  teeth: number,
  march: number,
): Subject {
  return {
    name,
    note,
    open: false,
    pointsAt(t) {
      const pts: Point[] = [];
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2;
        // Sharpened so the notches read as cut rather than as a gentle lobing.
        const wave = Math.tanh(Math.sin(teeth * a - t * march) * 2.2);
        const m = blobRadiusMul(a, 1, 0.04, 0.02, t, 4.3) * (1 + 0.11 * wave);
        pts.push({ x: Math.cos(a) * rx * m, y: Math.sin(a) * ry * m });
      }
      return pts;
    },
    path: catmullRomToBezierPath,
  };
}
