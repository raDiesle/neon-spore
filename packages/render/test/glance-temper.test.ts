import { describe, expect, it } from "bun:test";
import { cock, glanceOf, look, sway } from "../src/glance-styles.js";
import { GLANCE_ROUND, STEADY, temperedAt, temperOf } from "../src/glance-temper.js";

/**
 * **Every glancing thing its own temper** (`glance-temper.ts`): read off a
 * name the same on every run, different from its neighbours', a cycle of
 * rounds that are not alike, every round level at both ends, and none
 * reaching past the size it is given.
 */

const SIZE = { reach: 0.3, cock: 0.12, tilt: 0.4 };
const NAMES = ["baton", "cairn", "capstan", "queen", "keel", "plumb", "oculus", "well"];

/** Every round boundary of `name`'s cycle, twice round. */
function ends(name: string): number[] {
  const t = temperOf(name);
  const out = [0];
  for (let k = 0; k < 2; k++) {
    for (const r of t.rounds) out.push((out.at(-1) ?? 0) + r.length * t.round);
  }
  return out;
}

describe("a glance's temper", () => {
  it("is the same every time it is asked for", () => {
    expect(temperOf("baton")).toEqual(temperOf("baton"));
    expect(temperOf(17)).toEqual(temperOf("17"));
  });

  it("differs from one boss to the next, in round and in cocks", () => {
    const rounds = new Set(NAMES.map((n) => temperOf(n).round.toFixed(3)));
    expect(rounds.size).toBe(NAMES.length);
    expect(new Set(NAMES.map((n) => temperOf(n).cocks)).size).toBeGreaterThan(1);
  });

  it("plays rounds that are not alike, one of them at the whole reach", () => {
    for (const n of NAMES) {
      const { rounds } = temperOf(n);
      expect(new Set(rounds.map((r) => r.length.toFixed(3))).size).toBeGreaterThan(2);
      expect(Math.max(...rounds.map((r) => r.gain))).toBe(1);
      expect(Math.min(...rounds.map((r) => r.gain))).toBeLessThan(1);
    }
  });

  it("starts and ends every round level at the middle, in every style", () => {
    for (const n of NAMES) {
      for (const style of [sway, look, cock]) {
        const g = glanceOf(style, SIZE, temperOf(n));
        for (const at of ends(n)) {
          for (const t of [at, Math.max(0, at - 1e-7)]) {
            expect(Math.abs(g.swing(t))).toBeLessThan(1e-4);
            expect(Math.abs(g.roll(t))).toBeLessThan(1e-4);
          }
        }
      }
    }
  });

  it("never reaches past the size it is given, and reaches it once a cycle", () => {
    for (const n of NAMES) {
      const g = glanceOf(cock, SIZE, temperOf(n));
      const last = ends(n).at(-1) ?? 0;
      let widest = 0;
      for (let t = 0; t < last; t += 0.01) widest = Math.max(widest, Math.abs(g.swing(t)));
      expect(widest).toBeLessThanOrEqual(SIZE.reach + 1e-9);
      expect(widest).toBeGreaterThan(SIZE.reach * 0.99);
    }
  });

  it("leaves a steady record as every round alike, six seconds long", () => {
    expect(temperedAt(STEADY, 1.5)).toEqual({ t: 1.5, gain: 1 });
    expect(temperedAt(STEADY, GLANCE_ROUND + 1.5).t).toBeCloseTo(1.5, 9);
  });
});
