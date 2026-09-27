import { describe, expect, test } from "bun:test";
import { DEG, easeHush, HEAD_LEAD, HUSH, idleDrift, letGo, settle } from "../src/idle-drift.js";
import { correlation, FPS, maxAbs, maxSpeed, sample, TEN_MINUTES } from "./drift-stats.js";

/**
 * The body's idle drift (`docs/spec/living-bosses.md` §1): in range, never
 * snapping, out of step between bosses, the head ahead of the body. Ten
 * minutes at every frame, on several seeds, because a ceiling is only
 * proven where the noise was asked.
 */

const SEEDS = [1, 7, 42, 311, 9001];

/** Ten minutes of one seed's body drift, a sample a frame. */
function body(seed: number) {
  const out = [];
  for (let i = 0; i <= TEN_MINUTES * FPS; i++) out.push(idleDrift(i / FPS, seed));
  return out;
}

describe("idleDrift", () => {
  test("every angle stays in its range over ten minutes", () => {
    for (const seed of SEEDS) {
      const d = body(seed);
      expect(maxAbs(d.map((x) => x.yaw)) / DEG).toBeLessThanOrEqual(14);
      expect(maxAbs(d.map((x) => x.pitch)) / DEG).toBeLessThanOrEqual(5);
      expect(maxAbs(d.map((x) => x.roll)) / DEG).toBeLessThanOrEqual(6);
      expect(maxAbs(d.map((x) => x.headYaw)) / DEG).toBeLessThanOrEqual(28);
    }
  });

  test("the body never turns faster than 12° a second, the head than 20° on it and 30° in all", () => {
    for (const seed of SEEDS) {
      const d = body(seed);
      expect(maxSpeed(d.map((x) => x.yaw))).toBeLessThanOrEqual(12);
      expect(maxSpeed(d.map((x) => x.pitch))).toBeLessThanOrEqual(12);
      expect(maxSpeed(d.map((x) => x.roll))).toBeLessThanOrEqual(12);
      expect(maxSpeed(d.map((x) => x.headYaw))).toBeLessThanOrEqual(20);
      expect(maxSpeed(d.map((x) => x.yaw + x.headYaw))).toBeLessThanOrEqual(30);
    }
  });

  test("two seeds are not in step", () => {
    for (let s = 0; s + 1 < SEEDS.length; s++) {
      const a = body(SEEDS[s] as number);
      const b = body(SEEDS[s + 1] as number);
      for (const k of ["yaw", "pitch", "roll", "headYaw"] as const) {
        expect(
          Math.abs(
            correlation(
              a.map((x) => x[k]),
              b.map((x) => x[k]),
            ),
          ),
        ).toBeLessThan(0.2);
      }
    }
  });

  test("the head leads the body", () => {
    for (const seed of SEEDS) {
      const yaw = sample((t) => idleDrift(t, seed).yaw);
      const behind = sample((t) => idleDrift(t - HEAD_LEAD, seed).headYaw);
      const ahead = sample((t) => idleDrift(t + HEAD_LEAD, seed).headYaw);
      expect(correlation(yaw, behind)).toBeGreaterThan(correlation(yaw, ahead) + 0.3);
    }
  });

  test("the same time and seed give the same angles", () => {
    for (const t of [0, 1.234, 77.7, 599.9]) expect(idleDrift(t, 42)).toEqual(idleDrift(t, 42));
  });

  test("hush scales it, and eases over one beat from where it was", () => {
    const full = idleDrift(12.5, 7);
    const hushed = idleDrift(12.5, 7, HUSH.marks);
    expect(hushed.yaw).toBeCloseTo(full.yaw * HUSH.marks, 12);
    for (const a of Object.values(idleDrift(12.5, 7, HUSH.beaten))) expect(Math.abs(a)).toBe(0);
    expect(easeHush(1, HUSH.marks, 0)).toBe(1);
    expect(easeHush(1, HUSH.marks, 0.5)).toBeCloseTo((1 + HUSH.marks) / 2, 12);
    expect(easeHush(0.6, 1, 1)).toBe(1);
    expect(easeHush(0.6, 1, 3)).toBe(1);
  });
});

describe("settle and let-go", () => {
  test("the settle overshoots by a fifth and is within a degree of rest by half a second", () => {
    const move = 30;
    const xs = sample((t) => settle(t, move), 2);
    expect(settle(0, move)).toBe(-move);
    expect(Math.max(...xs) / move).toBeGreaterThan(0.19);
    expect(Math.max(...xs) / move).toBeLessThan(0.21);
    for (let i = FPS / 2; i < xs.length; i++)
      expect(Math.abs(xs[i] as number)).toBeLessThanOrEqual(1);
  });

  test("a gesture lets go over a quarter beat, and gives back from where it was", () => {
    expect(letGo(0)).toBe(1);
    expect(letGo(0.25)).toBe(0);
    expect(letGo(3)).toBe(0);
    expect(letGo(3.25, 3)).toBe(1);
    // A gesture of a tenth of a beat never jumps at its end.
    expect(letGo(0.1 + 1e-9, 0.1)).toBeCloseTo(letGo(0.1, 0.1), 6);
    expect(letGo(0.1, 0.1)).toBeGreaterThan(0);
  });
});
