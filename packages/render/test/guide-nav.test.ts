import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { navButtons, navHit, onNavBar } from "../src/guide-nav.js";
import { computeLayout } from "../src/layout.js";
import { onReadyCircle, readyCircles } from "../src/ready-page.js";

/**
 * A button is answered exactly where it is drawn.
 *
 * The rule `bandLobes` already plays by one layer down, applied to the three
 * targets a stepped guide carries: `navButtons` and `readyButtonBox` are what
 * the drawing places them from *and* what a thumb is hit-tested against
 * (`apps/game/src/briefing.ts`, `tools/director/src/stage-opening.ts`). The
 * failure this guards is silent in both places at once — a NEXT drawn an inch
 * from where it answers looks fine in a screenshot and does nothing under a
 * thumb.
 *
 * The sizes are phone-shaped and then absurd, because the buttons shrink to fit
 * and a hit test that only agreed at one width is a hit test that agrees by
 * accident.
 */

const SIZES = [
  { width: 390, height: 844, dpr: 2 },
  { width: 320, height: 568, dpr: 1 },
  { width: 240, height: 480, dpr: 1 },
  { width: 900, height: 1600, dpr: 2 },
];

describe("the bar a stepped guide is turned by", () => {
  it("answers a thumb in the middle of each button it draws", () => {
    for (const size of SIZES) {
      const l = computeLayout(size, DEFAULT_CONFIG, "p1");
      const b = navButtons(l);
      expect(navHit(l, b.back.x + b.back.w / 2, b.back.y + b.back.h / 2)).toBe("back");
      expect(navHit(l, b.next.x + b.next.w / 2, b.next.y + b.next.h / 2)).toBe("next");
    }
  });

  it("keeps both buttons inside the stage and clear of each other", () => {
    for (const size of SIZES) {
      const l = computeLayout(size, DEFAULT_CONFIG, "p1");
      const b = navButtons(l);
      expect(b.back.x).toBeGreaterThanOrEqual(0);
      expect(b.next.x + b.next.w).toBeLessThanOrEqual(l.width);
      expect(b.back.x + b.back.w).toBeLessThan(b.next.x);
      expect(b.bar.y + b.bar.h).toBe(l.height);
    }
  });

  it("says nothing is a button in the gap between them", () => {
    for (const size of SIZES) {
      const l = computeLayout(size, DEFAULT_CONFIG, "p1");
      const b = navButtons(l);
      const gap = (b.back.x + b.back.w + b.next.x) / 2;
      expect(navHit(l, gap, b.back.y + b.back.h / 2)).toBe(null);
      // But the bar itself still swallows the press: a thumb on the page
      // number must not fall through to whatever is drawn under it.
      expect(onNavBar(l, b.back.y)).toBe(true);
      expect(onNavBar(l, b.bar.y - 4)).toBe(false);
    }
  });

  it("answers a thumb on the circle a seat may fill, and only that one", () => {
    for (const size of SIZES) {
      const l = computeLayout(size, DEFAULT_CONFIG, "p1");
      const { p1, p2 } = readyCircles(l);
      // Player one's own, on player one's screen. Player two's is drawn there
      // too — it is how you see your partner is still reading — but it is not a
      // thing this seat may press.
      expect(onReadyCircle(l, p1.x, p1.y, "p1")).toBe(true);
      expect(onReadyCircle(l, p2.x, p2.y, "p1")).toBe(false);
      expect(onReadyCircle(l, p2.x, p2.y, "p2")).toBe(true);
      // `test` is one person holding both, so either answers.
      expect(onReadyCircle(l, p1.x, p1.y, "test")).toBe(true);
      expect(onReadyCircle(l, p2.x, p2.y, "test")).toBe(true);
      // Nothing on the bar is, or one press would mean two things.
      expect(onReadyCircle(l, l.width / 2, l.height - 10, "test")).toBe(false);
      // And both stay on the screen and clear of each other.
      expect(p1.x - p1.r).toBeGreaterThanOrEqual(0);
      expect(p2.x + p2.r).toBeLessThanOrEqual(l.width);
      expect(p1.x + p1.r).toBeLessThan(p2.x - p2.r);
      expect(p1.y + p1.r).toBeLessThan(navButtons(l).bar.y);
    }
  });
});
