import { describe, expect, it } from "bun:test";
import { boundsOver, CATALOGUE, type CatalogueEntry } from "@neon-spore/shape-sheet";
import { FIT_TIMES, figureLayout, isWide, WIDE_RATIO } from "../src/shape-fit.js";
import { extentOf, longAxisOf } from "../src/shapes-motion.js";

/**
 * `shape-fit.ts` decides how big a frame every card on the SHAPES page needs,
 * and it is the largest director module no test imported. Its neighbour
 * `long-axis.test.ts` covers `shapes-motion.ts`, which is a different question:
 * that one asks which way a body is long, this one asks how much room it wants.
 *
 * The failure this guards is the one the page cannot show you — a frame fitted
 * a few percent too tight reads as the shape being wrong rather than the card
 * being small, so it looks like a drawing bug in a file that draws nothing.
 *
 * Everything here goes through the two exported functions rather than the memo
 * tables behind them. That is the surface `shape-figure.ts` and `skin-still.ts`
 * call, and the memo is only correct if the answers it hands back are.
 */

/** A tall round body, and the hull, which is the whole reason `isWide` exists. */
const named = (name: string): CatalogueEntry => {
  const entry = CATALOGUE.find((e) => e.subject.name === name);
  if (!entry) throw new Error(`no ${name} in CATALOGUE`);
  return entry;
};

/**
 * The transform the layout writes, read back rather than re-derived:
 * `translate(w/2 box/2) scale(s) translate(-cx -cy)`, which is five numbers.
 * Parsing the string tests what reaches the DOM; recomputing it here would
 * only test a second copy of the arithmetic.
 */
function placer(transform: string): (x: number, y: number) => { x: number; y: number } {
  const [tx, ty, s, mx, my] = [...transform.matchAll(/-?\d+(?:\.\d+)?/g)].map(Number) as [
    number,
    number,
    number,
    number,
    number,
  ];
  return (x, y) => ({ x: tx + s * (x + mx), y: ty + s * (y + my) });
}

const BOX = 92;

describe("which shapes need the wide frame", () => {
  it("gives the hull one and a bulb none", () => {
    expect(isWide(named("HULL · PASSIVE"))).toBe(true);
    expect(isWide(named("BULB"))).toBe(false);
  });

  it("asks the question over one wobble, at the ratio it names", () => {
    // Not a restatement of the implementation: the point is that `isWide` uses
    // the *rest* box over `FIT_TIMES` and not the box own-motion needs, which
    // is the only reason a swaying hull and a still one land in the same frame.
    for (const entry of CATALOGUE) {
      const b = boundsOver(entry.subject, FIT_TIMES);
      expect(isWide(entry)).toBe((b.x1 - b.x0) / (b.y1 - b.y0) > WIDE_RATIO);
    }
  });
});

describe("a figure's layout", () => {
  it("draws every rest pose inside the frame it fitted", () => {
    const escaped: string[] = [];
    for (const entry of CATALOGUE) {
      const layout = figureLayout(entry, entry.motion, BOX, isWide(entry) ? BOX * 2 : undefined);
      const place = placer(layout.transform);
      for (const t of FIT_TIMES) {
        for (const p of entry.subject.pointsAt(t)) {
          const q = place(p.x, p.y);
          if (q.x < 0 || q.x > layout.w || q.y < 0 || q.y > layout.box)
            escaped.push(`${entry.subject.name} at t=${t.toFixed(2)}`);
        }
      }
    }
    // One assertion for the whole catalogue, naming the offender: the same
    // guarantee as an expect per point, without the eleven million calls that
    // made `shapes-motion.test.ts` the slowest file in this suite.
    expect(escaped).toEqual([]);
  });

  it("never gives own-motion a smaller frame than rest", () => {
    for (const entry of CATALOGUE) {
      if (!entry.motion) continue;
      const still = figureLayout(entry, undefined, BOX);
      const moving = figureLayout(entry, entry.motion, BOX);
      // A sway can only add room, so the drawing can only get smaller. Equal is
      // allowed: a motion whose excursion stays inside the wobble adds nothing.
      expect(moving.scale).toBeLessThanOrEqual(still.scale + 1e-9);
      expect(moving.reach).toBeGreaterThanOrEqual(still.reach - 1e-9);
    }
  });

  it("answers the same on a second call", () => {
    // The memo hands out stored boxes by reference; the claim is that reading
    // them twice cannot differ, which is what makes keeping them forever safe.
    for (const entry of CATALOGUE) {
      expect(figureLayout(entry, entry.motion, BOX)).toEqual(
        figureLayout(entry, entry.motion, BOX),
      );
    }
  });

  it("carries the body's own extent through, unswapped", () => {
    for (const entry of CATALOGUE) {
      const e = extentOf(entry.subject);
      const layout = figureLayout(entry, entry.motion, BOX);
      expect(layout.extent.w).toBeCloseTo(e.x1 - e.x0, 6);
      expect(layout.extent.h).toBeCloseTo(e.y1 - e.y0, 6);
      // `longAxisOf` called rather than its rule spelled out again: it answers
      // `null` for a body that is not decisively long either way, and a second
      // copy of that threshold here would drift the moment the first one moved.
      expect(layout.long).toBe(longAxisOf(e));
    }
  });

  it("takes a width without moving the box", () => {
    const layout = figureLayout(named("HULL · PASSIVE"), undefined, BOX, BOX * 3);
    expect(layout.box).toBe(BOX);
    expect(layout.w).toBe(BOX * 3);
    expect(figureLayout(named("BULB"), undefined, BOX).w).toBe(BOX);
  });

  it("pads a glow evenly and leaves the centre alone", () => {
    const entry = named("BULB");
    const plain = figureLayout(entry, undefined, BOX);
    const haloed = figureLayout(entry, undefined, BOX, undefined, 0.4);
    expect(haloed.scale).toBeLessThan(plain.scale);
    // Symmetric padding, so only the scale moves: the pivot the frame turns
    // about is the same point, or a card slices itself at its own frame edge.
    const centre = (t: string) => t.slice(t.lastIndexOf("translate("));
    expect(centre(haloed.transform)).toBe(centre(plain.transform));
    // A glow is not the body, so what a skin sizes against must not have grown.
    expect(haloed.reach).toBeCloseTo(plain.reach, 6);
  });

  it("gives a tail its room above the body and nowhere else", () => {
    const entry = named("BULB");
    const plain = figureLayout(entry, undefined, BOX);
    const tailed = figureLayout(entry, undefined, BOX, undefined, 0, 1);
    expect(tailed.scale).toBeLessThan(plain.scale);
    // The centre rises by half the room added, which drops the body toward the
    // bottom of its frame — the space is where the tail actually is.
    const cy = (t: string) => Number(t.slice(t.lastIndexOf(" ") + 1, t.lastIndexOf(")")));
    expect(cy(tailed.transform)).toBeGreaterThan(cy(plain.transform));
  });
});
