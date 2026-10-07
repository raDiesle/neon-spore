import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { INSTAR_SCRIPT } from "@neon-spore/content";
import { grown } from "../src/instar-head-look.js";
import { instarAt, instarHeadAt, instarMarkRadius, type Point } from "../src/instar-place.js";
import type { Look } from "../src/instar-plate.js";
import { POSES } from "../src/instar-poses.js";
import { quarterHeadPoints } from "../src/instar-quarter-head.js";
import { EYES, NOSTRILS, SKULL_OUTLINE } from "../src/instar-quarter-model.js";
import { deformed } from "../src/instar-shape.js";
import { computeLayout } from "../src/layout.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT } from "./frame-harness.js";

/**
 * **THE INSTAR's head side-on, turned three quarters to the ship**
 * (`instar-quarter-head.ts`). It faces the player: both eyes and both
 * nostrils are seen, the near ones larger. And it is drawn last over the
 * body, so it must never lie over a mark — a nest, a blade of the tail, the
 * hide — while the one mark that is on the head, THE TWIST's, stays on it.
 */

setDefaultTimeout(FRAME_TIMEOUT_MS);

const L = computeLayout(VIEWPORT, CFG, "test");

function inside(p: Point, poly: readonly Point[]): boolean {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i] as Point;
    const b = poly[j] as Point;
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x)
      hit = !hit;
  }
  return hit;
}

function gap(p: Point, poly: readonly Point[]): number {
  let best = Infinity;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i] as Point;
    const b = poly[j] as Point;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy)));
    best = Math.min(best, Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy));
  }
  return inside(p, poly) ? -best : best;
}

const SIDE_ON = INSTAR_SCRIPT.filter((step) => POSES[step.pose].side === 1);

function headOf(step: (typeof SIDE_ON)[number]): { jaw: Point[]; skull: Point[] } {
  const f = deformed(POSES[step.pose], step.marks, () => 1);
  const { head, r } = instarHeadAt(L, f);
  return quarterHeadPoints(grown({ f, head, r, time: 0 } as Look));
}

describe("THE INSTAR's head turned to the ship", () => {
  it("shows both eyes and both nostrils, the near ones turned further to the ship", () => {
    const [farEye, nearEye] = EYES;
    expect(farEye.face).toBeGreaterThan(0);
    expect(nearEye.face).toBeGreaterThan(farEye.face);
    expect(NOSTRILS[1].face).toBeGreaterThan(NOSTRILS[0].face);
    // Both eyes on the skull, the far one nearer the snout.
    for (const e of EYES) expect(inside(e.at, SKULL_OUTLINE)).toBe(true);
    expect(farEye.at.x).toBeLessThan(nearEye.at.x);
  });

  it("stays a mark's ring clear of every mark but its own, jaw wide open, in every side-on step", () => {
    const radius = instarMarkRadius(L, CFG);
    for (const step of SIDE_ON) {
      const { jaw, skull } = headOf(step);
      for (const m of step.marks.filter((k) => k.part !== "head")) {
        const at = instarAt(L, m.xMilli, m.yMilli);
        const clear = Math.min(gap(at, jaw), gap(at, skull));
        // The whole ring clear of it, and not only its middle: a nest's eggs spread past the point.
        expect(clear, `${step.pose}'s ${m.part} mark is under the head`).toBeGreaterThan(radius);
      }
    }
  });

  it("keeps THE TWIST's mark on the head", () => {
    const twist = SIDE_ON.filter((step) => step.marks.some((m) => m.part === "head"));
    expect(twist.length).toBeGreaterThan(0);
    for (const step of twist) {
      const { jaw, skull } = headOf(step);
      for (const m of step.marks.filter((k) => k.part === "head")) {
        const at = instarAt(L, m.xMilli, m.yMilli);
        expect(inside(at, skull) || inside(at, jaw)).toBe(true);
      }
    }
  });
});
