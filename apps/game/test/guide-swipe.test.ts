import { describe, expect, it } from "bun:test";
import { SWIPE_MIN, SWIPE_SLOPE, swipeTurn } from "../src/guide-swipe.js";

/**
 * **The two ways through a guide that are not its buttons**, asked for
 * together on 20 September 2026: a press on the row of marks that says which
 * step this is, and a swipe — *left (= back) or right (= next)*.
 *
 * The rule itself is a pure function and is tested as one. What surrounds it
 * is listeners on a canvas, and this runner has no DOM (`input-pc.test.ts`
 * says why), so the wiring is held against the source the way every other
 * press path in this app is.
 */

const source = await Bun.file(
  Bun.fileURLToPath(new URL("../src/briefing.ts", import.meta.url)),
).text();

describe("what counts as a swipe across a guide", () => {
  it("turns back on the left and on to the next on the right", () => {
    // The owner's mapping, which is the arrow keys' and not the carousel's
    // (`keys-guide.ts`): a drag moves the cursor, not the page under it.
    expect(swipeTurn(-SWIPE_MIN, 0)).toBe("back");
    expect(swipeTurn(SWIPE_MIN, 0)).toBe("next");
  });

  it("is nothing at all until the thumb has really travelled", () => {
    expect(swipeTurn(0, 0)).toBe(null);
    expect(swipeTurn(SWIPE_MIN - 1, 0)).toBe(null);
    expect(swipeTurn(-(SWIPE_MIN - 1), 0)).toBe(null);
  });

  it("refuses a drag that is mostly down the glass", () => {
    // A thumb holding the gate and sliding down it is not a page turn.
    expect(swipeTurn(SWIPE_MIN, SWIPE_MIN * SWIPE_SLOPE)).toBe(null);
    expect(swipeTurn(-SWIPE_MIN, SWIPE_MIN * SWIPE_SLOPE)).toBe(null);
    // Sideways enough, and it is one again.
    expect(swipeTurn(SWIPE_MIN * 2, SWIPE_MIN)).toBe("next");
  });
});

describe("the guide's presses, as they are wired", () => {
  it("asks the row of marks after the three buttons and before the bar", () => {
    const marks = source.indexOf("navStepHit(");
    const buttons = source.indexOf("navHit(");
    const bar = source.indexOf("onNavBar(");
    expect(buttons).toBeGreaterThanOrEqual(0);
    expect(marks).toBeGreaterThan(buttons);
    expect(bar).toBeGreaterThan(marks);
  });

  it("reaches a mark three pages back as three turns, because the wire carries one", () => {
    expect(source).toMatch(
      /const turnTo = \(page: number\): void => \{\s*const at = guidePage\(world, seat\(\)\);\s*for \(let i = 0; i < Math\.abs\(page - at\); i\+\+\) turn\(page < at\);/,
    );
  });

  it("lets go of the gate on the way past, so a swipe never also fills a circle", () => {
    expect(source).toMatch(
      /const way = swipeTurn\(p\.x - from\.x, p\.y - from\.y\);[\s\S]*?swiped = true;\s*if \(down\) \{\s*down = false;\s*hold\(false\);\s*\}\s*turn\(way === "back"\);/,
    );
  });

  it("forgets where the thumb went down when it lifts, whatever it was doing", () => {
    // Before the early return, which is the one a press that never became a
    // hold takes: a start point left behind would measure the next swipe from
    // the last press.
    expect(source).toMatch(/const lift = \(\): void => \{\s*from = null;\s*if \(!down\) return;/);
  });
});
