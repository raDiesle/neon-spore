import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { computeLayout } from "../src/layout.js";
import { sinewCrownPoints, sinewCrownRoot } from "../src/sinew-crown.js";
import { sinewAnchor } from "../src/sinew-shape.js";
import { TOP_CHROME_PX } from "../src/top-chrome.js";

/**
 * **THE SINEW's crown is whole, and the strings ride it** — the owner, 2
 * October 2026: *i want not to cut. so strings are connected to something top
 * of the boss flying.* The crown is no longer clipped, so nothing but its
 * place keeps it off the chrome's line: on a tall phone, a short one and the
 * frame harness's wide stage, at a spread of wall-clock times across FLOAT's
 * drifts, its highest point stays under the line, and the point the strings
 * leave from stays inside its outline wherever it has flown.
 */

const SCREENS = [
  { width: 390, height: 844, dpr: 1 },
  { width: 430, height: 932, dpr: 1 },
  { width: 360, height: 640, dpr: 1 },
  { width: 900, height: 1600, dpr: 1 },
];
const TIMES = Array.from({ length: 240 }, (_, i) => i * 0.37);

/** Whether `p` is inside the closed polygon `poly`, by the crossing count. */
function inside(p: { x: number; y: number }, poly: { x: number; y: number }[]): boolean {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i] as { x: number; y: number };
    const b = poly[j] as { x: number; y: number };
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x)
      hit = !hit;
  }
  return hit;
}

describe("THE SINEW's crown", () => {
  for (const vp of SCREENS) {
    const l = computeLayout(vp, DEFAULT_CONFIG, "p1");
    const rest = sinewAnchor(l, DEFAULT_CONFIG);

    it(`flies clear of the chrome's line on ${vp.width}×${vp.height}`, () => {
      let top = Number.POSITIVE_INFINITY;
      for (const t of TIMES) {
        const root = sinewCrownRoot(l, rest, t);
        for (const p of sinewCrownPoints(l, root, t)) top = Math.min(top, p.y);
      }
      expect(top).toBeGreaterThan(TOP_CHROME_PX);
    });

    it(`keeps the strings' root inside it on ${vp.width}×${vp.height}`, () => {
      for (const t of TIMES) {
        const root = sinewCrownRoot(l, rest, t);
        expect(inside(root, sinewCrownPoints(l, root, t))).toBe(true);
      }
    });
  }

  it("moves: the root is not where it rests", () => {
    const l = computeLayout(SCREENS[0] as (typeof SCREENS)[0], DEFAULT_CONFIG, "p1");
    const rest = sinewAnchor(l, DEFAULT_CONFIG);
    const far = Math.max(
      ...TIMES.map((t) =>
        Math.hypot(sinewCrownRoot(l, rest, t).x - rest.x, sinewCrownRoot(l, rest, t).y - rest.y),
      ),
    );
    expect(far).toBeGreaterThan(l.tile * 0.2);
  });
});
