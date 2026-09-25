import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { GUIDE_LOOK, navHit, navStepHit, onNavBar } from "../src/guide-look.js";
import { computeLayout } from "../src/layout.js";
import { readyCircles } from "../src/ready-page.js";

/**
 * A button is answered exactly where it is drawn.
 *
 * The rule `bandLobes` already plays by one layer down, applied to the bar a
 * stepped guide carries: `GUIDE_LOOK.buttons` is what the drawing places BACK, REPLAY,
 * NEXT and SKIP from *and* what a thumb is hit-tested against
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
      const b = GUIDE_LOOK.buttons(l);
      expect(navHit(l, b.back.x + b.back.w / 2, b.back.y + b.back.h / 2)).toBe("back");
      expect(navHit(l, b.replay.x + b.replay.w / 2, b.replay.y + b.replay.h / 2)).toBe("replay");
      expect(navHit(l, b.next.x + b.next.w / 2, b.next.y + b.next.h / 2)).toBe("next");
      expect(navHit(l, b.skip.x + b.skip.w / 2, b.skip.y + b.skip.h / 2)).toBe("skip");
    }
  });

  it("keeps all four inside the stage and clear of each other", () => {
    for (const size of SIZES) {
      const l = computeLayout(size, DEFAULT_CONFIG, "p1");
      const b = GUIDE_LOOK.buttons(l);
      // On the stage, all four, and none of them on top of another. *Where*
      // each one is belongs to the chrome and is not checked here: TIDE keeps
      // BACK and REPLAY up in the top bezel and gives NEXT the whole width at
      // the foot (`guide-tide.ts`), and a test that insisted on one row would
      // be a test of the answer rather than of the promise.
      for (const box of [b.back, b.replay, b.next, b.skip]) {
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.w).toBeLessThanOrEqual(l.width);
        expect(box.y).toBeGreaterThanOrEqual(0);
        expect(box.y + box.h).toBeLessThanOrEqual(l.height);
      }
      for (const [one, two] of [
        [b.back, b.replay],
        [b.back, b.next],
        [b.replay, b.next],
        [b.next, b.skip],
        [b.back, b.skip],
        [b.replay, b.skip],
      ] as const) {
        const apart =
          one.x + one.w <= two.x ||
          two.x + two.w <= one.x ||
          one.y + one.h <= two.y ||
          two.y + two.h <= one.y;
        expect(apart, `${size.width}: two of the four overlap`).toBe(true);
      }
      expect(b.bar.y + b.bar.h).toBe(l.height);
    }
  });

  it("says nothing is a button in the gaps around them", () => {
    for (const size of SIZES) {
      const l = computeLayout(size, DEFAULT_CONFIG, "p1");
      const b = GUIDE_LOOK.buttons(l);
      // Between BACK and REPLAY, wherever the chrome put the two of them.
      const gapX = (b.back.x + b.back.w + b.replay.x) / 2;
      const gapY = (b.back.y + b.back.h / 2 + b.replay.y + b.replay.h / 2) / 2;
      expect(navHit(l, gapX, gapY)).toBe(null);
      // And just off NEXT's own edge, on its own row.
      expect(navHit(l, b.next.x - 4, b.next.y + b.next.h / 2)).toBe(null);
      // And in the gap between NEXT and the narrow SKIP beside it.
      const seam = (b.next.x + b.next.w + b.skip.x) / 2;
      expect(navHit(l, seam, b.next.y + b.next.h / 2)).toBe(null);
      // But the bar itself still swallows the press: a thumb on the page
      // number must not fall through to whatever is drawn under it.
      expect(onNavBar(l, b.bar.y + 2)).toBe(true);
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
      expect(p1.y + p1.r + 60).toBeLessThan(GUIDE_LOOK.buttons(l).bar.y);
    }
  });
});

/**
 * **The row of marks is a control now**, and it is the same promise one layer
 * along: the row is drawn from `GUIDE_LOOK.steps` and a thumb is tested
 * against it, so a chrome that moves the row moves what answers with it.
 *
 * The counts are the shipped guides' — two pages up to twelve — because the
 * marks shrink to fit and a row of twelve is nine pixels wide a piece. That is
 * the case worth holding: a hit test that only agreed at four pages would
 * agree by accident.
 */
const PAGES = [2, 3, 5, 12];

describe("the marks that say which step a guide is on", () => {
  it("answers a thumb on each mark it draws", () => {
    for (const size of SIZES) {
      for (const pages of PAGES) {
        const l = computeLayout(size, DEFAULT_CONFIG, "p1");
        const boxes = GUIDE_LOOK.steps(l, pages);
        expect(boxes.length, `${pages} pages`).toBe(pages);
        for (const [i, box] of boxes.entries()) {
          const at = navStepHit(l, pages, box.x + box.w / 2, box.y + box.h / 2);
          expect(at, `${size.width}/${pages}: mark ${i}`).toBe(i);
        }
      }
    }
  });

  it("gives a press between two marks to the nearer of them", () => {
    const l = computeLayout(SIZES[0] as (typeof SIZES)[number], DEFAULT_CONFIG, "p1");
    const boxes = GUIDE_LOOK.steps(l, 5);
    const one = boxes[1];
    const two = boxes[2];
    if (!one || !two) throw new Error("five pages, five marks");
    const cy = one.y + one.h / 2;
    // A mark is five pixels tall and as little as nine wide; the gaps between
    // them are a third of that again. Refusing the gap would make the row feel
    // broken exactly where it is hardest to hit.
    expect(navStepHit(l, 5, one.x + one.w + 1, cy)).toBe(1);
    expect(navStepHit(l, 5, two.x - 1, cy)).toBe(2);
  });

  it("stops at the ends of the row and above the button under it", () => {
    for (const size of SIZES) {
      const l = computeLayout(size, DEFAULT_CONFIG, "p1");
      const boxes = GUIDE_LOOK.steps(l, 4);
      const first = boxes[0];
      const last = boxes[3];
      if (!first || !last) throw new Error("four pages, four marks");
      const cy = first.y + first.h / 2;
      expect(navStepHit(l, 4, first.x - 40, cy)).toBe(null);
      expect(navStepHit(l, 4, last.x + last.w + 40, cy)).toBe(null);
      // Off the strip downward is NEXT's, which is asked first and is the one
      // control on this bar a thumb finds without looking.
      const b = GUIDE_LOOK.buttons(l);
      expect(navStepHit(l, 4, l.width / 2, b.next.y + b.next.h / 2)).toBe(null);
      expect(navHit(l, l.width / 2, b.next.y + b.next.h / 2)).toBe("next");
    }
  });
});
