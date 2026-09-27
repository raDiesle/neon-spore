import { DEG } from "../src/idle-drift.js";

/** What the drift tests measure a ten-minute sample by: a frame at a time. */

export const FPS = 60;
export const TEN_MINUTES = 600;

export function sample(f: (t: number) => number, seconds = TEN_MINUTES): number[] {
  const out: number[] = [];
  for (let i = 0; i <= seconds * FPS; i++) out.push(f(i / FPS));
  return out;
}

export function correlation(a: readonly number[], b: readonly number[]): number {
  const n = Math.min(a.length, b.length);
  let ma = 0;
  let mb = 0;
  for (let i = 0; i < n; i++) {
    ma += a[i] as number;
    mb += b[i] as number;
  }
  ma /= n;
  mb /= n;
  let ab = 0;
  let aa = 0;
  let bb = 0;
  for (let i = 0; i < n; i++) {
    const da = (a[i] as number) - ma;
    const db = (b[i] as number) - mb;
    ab += da * db;
    aa += da * da;
    bb += db * db;
  }
  return ab / Math.sqrt(aa * bb);
}

export function maxAbs(xs: readonly number[]): number {
  return xs.reduce((m, x) => Math.max(m, Math.abs(x)), 0);
}

/** The largest frame-to-frame step, as degrees a second. */
export function maxSpeed(xs: readonly number[]): number {
  let m = 0;
  for (let i = 1; i < xs.length; i++)
    m = Math.max(m, Math.abs((xs[i] as number) - (xs[i - 1] as number)));
  return (m / DEG) * FPS;
}
