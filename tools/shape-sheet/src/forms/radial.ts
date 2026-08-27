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

/**
 * A core with arms, each of which has its own length at any moment.
 *
 * Drawn for the one boss whose mechanic is a *combination*: the shape has to
 * be several readings at once, not one state with a needle on it, so each arm
 * runs its own slow cycle and the silhouette at any instant is the set of
 * them. That is the only reason the arms are not in step — a bloom that
 * pulsed together would be a heartbeat, which says "alive" and nothing about
 * what the pair is supposed to be reading off it.
 *
 * `arms` is how many, `reach` how far a fully extended one goes past the core
 * as a fraction of the radius, and `period` the shortest arm's full cycle.
 * Each arm takes a slightly longer period than the one before, so the set
 * never repeats on a beat a player could learn — the combination has to be
 * read, not remembered.
 */
export function bloom(
  name: string,
  note: string,
  r: number,
  arms: number,
  reach: number,
  period: number,
): Subject {
  const step = (Math.PI * 2) / arms;
  return {
    name,
    note,
    open: false,
    pointsAt(t) {
      // One extension per arm, resolved before the sweep so every sample of
      // the same arm agrees about how far out it is.
      const out: number[] = [];
      for (let k = 0; k < arms; k++) {
        const own = period * (1 + k * 0.17);
        out.push(0.5 + 0.5 * Math.sin((t / own) * Math.PI * 2 + k * 1.7));
      }
      const pts: Point[] = [];
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2;
        const k = Math.round(a / step) % arms;
        // Distance to that arm's axis, as a fraction of the half-gap between
        // two arms: 0 on the axis, 1 in the trough between them.
        const off = (a - k * step) / (step / 2);
        const spike = Math.max(0, Math.cos((off * Math.PI) / 2)) ** 3;
        const m = blobRadiusMul(a, 1, 0.05, 0.03, t, 13.2) * (1 + reach * (out[k] ?? 0) * spike);
        pts.push({ x: Math.cos(a) * r * m, y: Math.sin(a) * r * m });
      }
      return pts;
    },
    path: catmullRomToBezierPath,
  };
}

/**
 * A body that is mostly opening, with curling arms around it.
 *
 * Two things at once, and the order matters. The **mouth** is a second loop
 * cut out of the first — the same trick the Warden's ring uses, and for the
 * same reason: an opening drawn as an inner detail is a texture, and an
 * opening the field shows through is a shape. The **arms** are spikes with one
 * shoulder wider than the other, which is as close to a curl as a contour
 * sampled one radius per angle can get; a real hook needs the tip offset
 * sideways from its own axis, and that is a different kind of form. The skew
 * is worth having anyway, because a straight spike reads as a spine and a
 * leaning one reads as a limb.
 *
 * `gape` is how much of the body the mouth takes at its widest, as a fraction
 * of the radius. It closes and opens over `period`, so the card answers the
 * one question a picture of a mouth has to answer — whether the shape still
 * reads as a body when it is shut.
 */
export function mawed(
  name: string,
  note: string,
  r: number,
  arms: number,
  reach: number,
  gape: number,
  period: number,
): Subject {
  return {
    name,
    note,
    open: false,
    pointsAt(t) {
      const pts: Point[] = [];
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2;
        // Where this angle sits within its arm's slot, as −1..1.
        const slot = (Math.PI * 2) / arms;
        const off = (((a % slot) + slot) % slot) / slot - 0.5;
        // Wider behind than in front: the shoulder the arm leans off.
        const skew = off < 0 ? off / 0.62 : off / 0.38;
        const spike = Math.max(0, Math.cos(skew * Math.PI)) ** 2;
        const m = blobRadiusMul(a, 2, 0.09, 0.05, t, 14.8) * (1 + reach * spike);
        pts.push({ x: Math.cos(a) * r * m, y: Math.sin(a) * r * m });
      }
      return pts;
    },
    hole(t) {
      // Never fully shut and never wider than the body it is cut from: a mouth
      // that closes to nothing is a body with a blink, and one that opens past
      // its own edge is not a mouth any more.
      const open = 0.55 + 0.45 * Math.sin((t / period) * Math.PI * 2);
      const rr = r * gape * (0.45 + 0.55 * open);
      const pts: Point[] = [];
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2;
        const m = blobRadiusMul(a, 3, 0.12, 0.04, t, 6.6);
        pts.push({ x: Math.cos(a) * rr * m, y: Math.sin(a) * rr * m * 0.86 });
      }
      return pts;
    },
    path: catmullRomToBezierPath,
  };
}
