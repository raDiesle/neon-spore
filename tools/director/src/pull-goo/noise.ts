import { sinHash, smoothstep } from "@neon-spore/render";

/**
 * The irregular in GOO: noise that is the same every frame for the same
 * input, so a slime's lumps stay where they are and only creep. Nothing here
 * is random; the director's own clock and a seed are all it reads.
 */

/** A fixed number in [0, 1) for any `n`: the renderer's own repeatable hash. */
export const hash = (n: number): number => sinHash(n);

/** Smooth noise along a line, in [-1, 1]. */
export function noise(x: number): number {
  const i = Math.floor(x);
  const u = smoothstep(x - i);
  return (hash(i) * (1 - u) + hash(i + 1) * u) * 2 - 1;
}

/** Three octaves of `noise`, in about [-1, 1]. */
export function fbm(x: number, seed = 0): number {
  return (
    0.6 * noise(x + seed * 17.3) + 0.3 * noise(x * 2.13 + seed * 5.1) + 0.1 * noise(x * 4.7 + seed)
  );
}

/**
 * How far a rim swells at angle `a`: five lobes of different sizes turning
 * at different speeds, their phases fixed by `seed` — round enough to be a
 * drop, never even enough to be a circle.
 */
export function lumps(a: number, time: number, seed: number): number {
  let out = 0;
  for (let k = 2; k <= 6; k++) {
    const amp = (0.5 + hash(seed * 13 + k)) / k;
    const phase = hash(seed * 7 + k * 3) * Math.PI * 2;
    const speed = (hash(seed * 3 + k * 11) - 0.5) * 3;
    out += amp * Math.sin(k * a + phase + time * speed);
  }
  return out * 0.5;
}

/** `a` to `b` by `t`, for hex colours `#RRGGBB`. */
export function mix(a: string, b: string, t: number): string {
  const u = Math.max(0, Math.min(1, t));
  const ch = (h: string, i: number) => Number.parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  let out = "#";
  for (let i = 0; i < 3; i++) {
    const v = Math.round(ch(a, i) * (1 - u) + ch(b, i) * u);
    out += v.toString(16).padStart(2, "0");
  }
  return out;
}

export const clamp01 = (x: number): number => Math.max(0, Math.min(1, x));

/** A damped spring's swing, 1 at `t` 0 and settling to 0. */
export const settle = (t: number, rate = 9, freq = 22): number =>
  Math.exp(-t * rate) * Math.cos(t * freq);
