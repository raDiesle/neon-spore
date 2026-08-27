import { describe, expect, it } from "bun:test";
import { CATALOGUE } from "../src/catalogue.js";

/**
 * The three bosses collected in `transfers-bosses.md`, and the two claims
 * their drawings make that an eye cannot settle.
 *
 * `drafts.test.ts` already proves every shape in the catalogue is *drawn* — no
 * NaN, no collapse onto its own centre. What is checked here is narrower and
 * is the reason these two forms were written: a pile that is one body until a
 * rock is pulled out of it, and a slab on which exactly one plate is live.
 * Both are the mechanic, so a drawing that stops saying them is not a shape
 * that needs retuning, it is a proposal that has quietly withdrawn itself.
 */

const subject = (name: string) => {
  const found = CATALOGUE.find((e) => e.subject.name === name)?.subject;
  if (!found) throw new Error(`${name} is not in the catalogue`);
  return found;
};

/**
 * A pile held together by a field is held together by arithmetic, not by
 * looking right in the one still somebody happened to render. Two units touch
 * while their centres are inside 2.245 facet-radii, and the jitter, the sizes
 * and the settling drift all push on that number — so a spacing that reads
 * fine at `t = 0` can shed a rock four seconds later and nobody would know.
 *
 * Sampled far more finely than the eye would, though a sample is all this is:
 * the failure it replaces was six bad moments in four hundred and eighty, and
 * the spacing was settled against a sweep of fifteen thousand. Three hundred
 * moments is what a regression guard can afford at five milliseconds a trace.
 */
describe("THE CAIRN holds together", () => {
  it("is one outline at every moment while it is stacked", () => {
    const s = subject("THE CAIRN");
    const wrong: number[] = [];
    for (let t = 0; t < 30; t += 0.1) {
      if (s.loopsAt?.(t).length !== 1) wrong.push(Number(t.toFixed(2)));
    }
    expect(wrong).toEqual([]);
  });

  it("is exactly two outlines once a unit is dragged clear, never three", () => {
    const s = subject("THE CAIRN · PULLED");
    const wrong: number[] = [];
    for (let t = 0; t < 30; t += 0.1) {
      if (s.loopsAt?.(t).length !== 2) wrong.push(Number(t.toFixed(2)));
    }
    expect(wrong).toEqual([]);
  });

  it("keeps its facets: the trace is drawn corner to corner, not smoothed", () => {
    // A curve command anywhere in the path means the pile went through
    // `catmullRomToBezierPath`, which rounds every seam away and turns the
    // one argument for drawing this shape into a bloom.
    const d = subject("THE CAIRN").path(subject("THE CAIRN").pointsAt(0));
    expect(d).not.toContain("C");
    expect(d).toContain("L");
  });
});

/**
 * The live plate reaches rather than lights, because a silhouette has no
 * colours. Read back off the outline the way a player reads it: the lowest
 * point on the body, and which of the seven columns it sits in.
 */
describe("THE TITHE says which column is live", () => {
  const PLATES = 7;
  const HALF_WIDTH = 124;

  /** Which plate reaches furthest down, and how many are tied for it. */
  const reaching = (name: string, t: number) => {
    const pts = subject(name).pointsAt(t);
    const low = Math.max(...pts.map((p) => p.y));
    const at = pts.filter((p) => Math.abs(p.y - low) < 0.01);
    const columns = new Set(
      at.map((p) =>
        Math.min(PLATES - 1, Math.floor(((p.x + HALF_WIDTH) / (HALF_WIDTH * 2)) * PLATES)),
      ),
    );
    return { columns, low };
  };

  it("has exactly one plate reaching, at every moment", () => {
    for (let t = 0; t < 40; t += 0.05) {
      expect(reaching("THE TITHE", t).columns.size).toBe(1);
    }
  });

  it("steps the live plate along the underside, visiting all seven", () => {
    const seen = new Set<number>();
    for (let t = 0; t < 40; t += 0.05) {
      for (const c of reaching("THE TITHE", t).columns) seen.add(c);
    }
    expect(seen.size).toBe(PLATES);
  });

  it("reaches far enough that the live plate is not a dormant one wobbling", () => {
    // The tell has to survive being looked at on a phone, so it is measured
    // the way it is seen: how far each plate hangs *below the slab*, not how
    // far it sits from the origin. The live one goes more than twice as far,
    // which makes the difference a shape rather than a tolerance.
    const UNDERSIDE = 30;
    const pts = subject("THE TITHE").pointsAt(0);
    const low = Math.max(...pts.map((p) => p.y));
    const dormant = Math.max(...pts.map((p) => p.y).filter((y) => low - y > 0.01));
    expect(low - UNDERSIDE).toBeGreaterThan((dormant - UNDERSIDE) * 2);
  });

  it("draws the edge case too, so the worst reading has a card", () => {
    // The outermost column of seven is where "which part is live" is a fine
    // distinction. If it is only ever drawn in the middle, it is not drawn.
    expect(reaching("THE TITHE · EDGE", 0).columns).toEqual(new Set([0]));
  });
});

/**
 * THE VANE is the arm plus the one part of it that can be hit. Both claims are
 * checked, because the first attempt had neither: an arm offset in phase from
 * THE CONDUCTOR's, which came out as its mirror image and drew no bearing at
 * all — a picture of the part of the boss that is not the encounter.
 */
describe("THE VANE draws the bearing it hangs on", () => {
  const PIVOT = { x: 0, y: -75 };
  const HUB = 18;

  it("puts a rim of points around the pivot, which the plain arm has not", () => {
    const onRim = (name: string) =>
      subject(name)
        .pointsAt(0)
        .filter((p) => Math.abs(Math.hypot(p.x - PIVOT.x, p.y - PIVOT.y) - HUB) < HUB * 0.05);
    expect(onRim("THE VANE").length).toBeGreaterThan(10);
    expect(onRim("THE CONDUCTOR").length).toBe(0);
  });

  it("leans the other way, so the two pendulum cards are not one shape twice", () => {
    const tipX = (name: string) => {
      const pts = subject(name).pointsAt(0);
      return pts[pts.length - 1]?.x ?? 0;
    };
    expect(Math.sign(tipX("THE VANE"))).toBe(-Math.sign(tipX("THE CONDUCTOR")));
  });
});
