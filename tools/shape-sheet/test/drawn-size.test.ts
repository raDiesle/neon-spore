import { describe, expect, it } from "bun:test";
import { CATALOGUE } from "../src/catalogue.js";
import { drawnSize, FLOOR_HI, FLOOR_LO, isWide } from "../src/drawn-size.js";

/**
 * Pins the arithmetic in `drawn-size.ts` to the numbers the paired-cards lane
 * found by hand and threw away (`docs/queue.md`'s "THE 26 PX FLOOR..." entry,
 * and the comment atop `tools/director/src/shapes-panel.ts`): at the 92 px
 * card every square body clears the 26 px floor, and halving a card's width
 * to 46 — the alternative to widening it that the paired-cards lane rejected —
 * would have put 32 of the 49 square catalogue entries under 26 px and 17
 * under 20, with the Bulb specifically landing at about 16 px.
 *
 * The catalogue has grown twenty-five bodies since — THE SHELL, the ten
 * converted off other games' screenshots in `drafts/tower-defence.ts`, and the
 * fourteen grown out of `src/parts/` — so the counts read 73, 43 and 21 rather
 * than 49, 32 and 17. The finding is the lane's; only the denominator moved,
 * and it moves again every time a body is added. Every one of the converted
 * bodies falls under 26 px at the halved width, which is the finding holding
 * rather than drifting: a rim of small features is exactly the kind of body
 * that loses most when the frame narrows.
 *
 * The fourteen grown bodies are the one group that mostly does *not* fall
 * under it — thirteen of them clear 26 px at the halved width, where all ten
 * converted bodies fail. That is not the parts library being better drawn. It
 * is what a part does to a bounding box: a body wearing a lash is measured
 * across the lash, so the same soft centre is fitted at a scale that keeps a
 * limb in frame and reads larger by the axis this floor happens to score. The
 * floor is about whether a body stays nameable, and a picture that is nameable
 * *because* of the thing sticking out of it is exactly the claim
 * `grown-bodies.ts` was written to put in front of an eye rather than settle
 * with a number.
 *
 * If `shapeFigure`'s fit ever changes, this is the test that notices: it goes
 * through `drawnSize`, which calls the director's own `FIT_TIMES`, `isWide`,
 * `tilePixels` and `transformedBounds` rather than re-deriving them, so a
 * changed fit changes these numbers here too, not silently.
 */

const SQUARE = CATALOGUE.filter((e) => !isWide(e));

describe("drawn size against the 20-26 px floor", () => {
  it("has the 73 square cards the catalogue now holds", () => {
    expect(SQUARE.length).toBe(73);
  });

  it("clears the floor for every square card at the 92 px frame it actually gets", () => {
    for (const entry of SQUARE) {
      const d = drawnSize(entry, 92);
      expect(d.long).toBeGreaterThanOrEqual(FLOOR_HI);
    }
  });

  it("stays inside the range the paired-cards lane read off the 92 px card (41-70 px)", () => {
    const longs = SQUARE.map((e) => drawnSize(e, 92).long);
    expect(Math.min(...longs)).toBeGreaterThan(41);
    expect(Math.max(...longs)).toBeLessThan(70);
  });

  it("reproduces the paired-cards lane's finding at a halved 46 px width", () => {
    // `box` stays 92 — the card's height, and the basis `shapeFigure` pads
    // from — while only `width` halves, the same question the paired-cards
    // lane asked before widening the card instead of halving it.
    let under26 = 0;
    let under20 = 0;
    for (const entry of SQUARE) {
      const d = drawnSize(entry, 92, 46);
      if (d.long < FLOOR_HI) under26++;
      if (d.long < FLOOR_LO) under20++;
    }
    expect(under26).toBe(43);
    expect(under20).toBe(21);
  });

  it("puts the Bulb at about the 16 px the paired-cards lane read off it", () => {
    const bulb = SQUARE.find((e) => e.subject.name === "BULB");
    expect(bulb).toBeDefined();
    const d = drawnSize(bulb!, 92, 46);
    expect(d.long).toBeGreaterThan(15);
    expect(d.long).toBeLessThan(17);
  });

  it("never reports a short axis longer than the long one", () => {
    for (const entry of SQUARE) {
      const d = drawnSize(entry, 92);
      expect(d.short).toBeLessThanOrEqual(d.long);
    }
  });
});
