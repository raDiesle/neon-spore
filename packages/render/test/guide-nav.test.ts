import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { navButtons, navHit, onNavBar } from "../src/guide-nav.js";
import { computeLayout } from "../src/layout.js";
import { readyCircles } from "../src/ready-page.js";

/**
 * A button is answered exactly where it is drawn.
 *
 * The rule `bandLobes` already plays by one layer down, applied to the bar a
 * stepped guide carries: `navButtons` is what the drawing places BACK, REPLAY
 * and NEXT from *and* what a thumb is hit-tested against
 * (`apps/game/src/briefing.ts`, `tools/director/src/stage-opening.ts`). The
 * failure this guards is silent in both places at once — a NEXT drawn an inch
 * from where it answers looks fine in a screenshot and does nothing under a
 * thumb.
 *
 * The gate no longer has a target of its own: the whole page above the bar
 * holds it, on the owner’s instruction, so what is left to check about the
 * circles is that they are drawn somewhere a page has room for them.
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
      expect(navHit(l, b.replay.x + b.replay.w / 2, b.replay.y + b.replay.h / 2)).toBe("replay");
      expect(navHit(l, b.next.x + b.next.w / 2, b.next.y + b.next.h / 2)).toBe("next");
    }
  });

  it("keeps all three inside the stage and clear of each other", () => {
    for (const size of SIZES) {
      const l = computeLayout(size, DEFAULT_CONFIG, "p1");
      const b = navButtons(l);
      expect(b.back.x).toBeGreaterThanOrEqual(0);
      expect(b.next.x + b.next.w).toBeLessThanOrEqual(l.width);
      expect(b.back.x + b.back.w).toBeLessThan(b.replay.x);
      expect(b.replay.x + b.replay.w).toBeLessThan(b.next.x);
      expect(b.bar.y + b.bar.h).toBe(l.height);
    }
  });

  it("says nothing is a button in the gap between them", () => {
    for (const size of SIZES) {
      const l = computeLayout(size, DEFAULT_CONFIG, "p1");
      const b = navButtons(l);
      const y = b.back.y + b.back.h / 2;
      expect(navHit(l, (b.back.x + b.back.w + b.replay.x) / 2, y)).toBe(null);
      expect(navHit(l, (b.replay.x + b.replay.w + b.next.x) / 2, y)).toBe(null);
      // But the bar itself still swallows the press: a thumb on the page
      // number must not fall through to whatever is drawn under it.
      expect(onNavBar(l, b.back.y)).toBe(true);
      expect(onNavBar(l, b.bar.y - 4)).toBe(false);
    }
  });

  it("draws both circles on the screen, clear of each other and of the bar", () => {
    for (const size of SIZES) {
      const l = computeLayout(size, DEFAULT_CONFIG, "p1");
      const { p1, p2 } = readyCircles(l);
      expect(p1.x - p1.r).toBeGreaterThanOrEqual(0);
      expect(p2.x + p2.r).toBeLessThanOrEqual(l.width);
      expect(p1.x + p1.r).toBeLessThan(p2.x - p2.r);
      // Room under them for the line that says who is still reading, and the
      // bar below that: the gate is the whole page, so a circle overlapping the
      // bar would be one press meaning two things.
      expect(p1.y + p1.r + 60).toBeLessThan(navButtons(l).bar.y);
    }
  });
});
