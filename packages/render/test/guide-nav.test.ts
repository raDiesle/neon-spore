import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { navButtons, navHit, onNavBar } from "../src/guide-nav.js";
import { computeLayout } from "../src/layout.js";
import { onReadyButton, readyButtonBox } from "../src/ready-page.js";

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

  it("puts the gate's own button above the bar and answers it there", () => {
    for (const size of SIZES) {
      const l = computeLayout(size, DEFAULT_CONFIG, "p1");
      const box = readyButtonBox(l);
      expect(onReadyButton(l, box.x + box.w / 2, box.y + box.h / 2)).toBe(true);
      expect(box.y + box.h).toBeLessThan(navButtons(l).bar.y);
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.w).toBeLessThanOrEqual(l.width);
      // And nothing on the bar is on it, or one press would mean two things.
      expect(onReadyButton(l, l.width / 2, l.height - 10)).toBe(false);
    }
  });
});
