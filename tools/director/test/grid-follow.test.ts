import { describe, expect, test } from "bun:test";
import { followTop } from "../src/grid-follow.js";

/**
 * THE MAP FOLLOWS THE BEAT THAT IS PLAYING — AND THE ROWS AFTER IT.
 *
 * `followTop` is the whole decision (`grid-follow.ts`): where the scrolling
 * column should go, or null for "leave it alone". Null is the answer that
 * matters most — it is what keeps the map still while a wave runs, and a
 * version that returned a number every beat would be unusable however right
 * the number was.
 *
 * A row is 34px here: a 32px cell and the 2px gap under it (`grid-metrics.ts`).
 */

const ROW = 34;
/** A column showing ten rows. */
const VIEW = 340;
/** A thirty-beat wave. */
const CONTENT = 30 * ROW;
/** Four rows of map after the one playing (what `grid.ts` asks for). */
const AHEAD = 4 * ROW;

function box(scrollTop: number) {
  return { scrollTop, viewH: VIEW, contentH: CONTENT };
}
function row(beat: number) {
  return { top: beat * ROW, height: 32 };
}

describe("followTop", () => {
  test("does nothing while the row and the rows after it are on screen", () => {
    // Beat 2 of ten showing: beat 6 is the last row needed and it is up.
    expect(followTop(box(0), row(2), AHEAD)).toBeNull();
    expect(followTop(box(0), row(5), AHEAD)).toBeNull();
  });

  test("moves as soon as the rows after the beat run off the bottom", () => {
    // Beat 6 is visible, beat 10 is not — so it moves although the beat
    // playing is still on screen, which is the whole point of the lookahead.
    const next = followTop(box(0), row(6), AHEAD);
    expect(next).not.toBeNull();
    expect(next as number).toBeGreaterThan(0);
  });

  test("puts the row one row down from the top, and gives the rest to what comes after", () => {
    const at = followTop(box(0), row(6), AHEAD) as number;
    expect(at).toBe(6 * ROW - 32);
    // And from there nothing moves again for five beats, which is what makes
    // it a step rather than a crawl.
    for (let beat = 6; beat <= 10; beat++) {
      expect(followTop(box(at), row(beat), AHEAD)).toBeNull();
    }
    expect(followTop(box(at), row(11), AHEAD)).not.toBeNull();
  });

  test("comes back when the wave restarts above the view", () => {
    expect(followTop(box(500), row(0), AHEAD)).toBe(0);
  });

  test("never scrolls past the end of the map", () => {
    const at = followTop(box(0), row(29), AHEAD) as number;
    expect(at).toBe(CONTENT - VIEW);
  });

  test("keeps the beat playing on screen when the lookahead cannot fit", () => {
    // A short column: the row and four rows after it are taller than it is.
    const short = { scrollTop: 400, viewH: 80, contentH: CONTENT };
    expect(followTop(short, row(10), AHEAD)).toBe(10 * ROW);
  });

  test("says nothing when the answer is where the column already is", () => {
    const at = followTop(box(0), row(6), AHEAD) as number;
    expect(followTop(box(at), row(6), AHEAD)).toBeNull();
  });
});
