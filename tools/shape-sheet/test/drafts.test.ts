import { describe, expect, it } from "bun:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CATALOGUE } from "../src/catalogue.js";
import { boundsOver, WOBBLE_PERIOD } from "../src/metrics.js";
import { MOTIONS } from "../src/motions.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

/**
 * A draft is a picture, so the failure that matters is a picture that is not
 * there: a contour that samples to NaN draws as an empty card, and an empty
 * card in a catalogue of twenty reads as a shape nobody liked rather than as a
 * bug. Nothing here judges whether a shape is *good* — that needs an eye, and
 * the director's SHAPES tab is where the eye goes.
 */
const TIMES = [0, 0.7, 1.9, 4.3, 9.1, WOBBLE_PERIOD, WOBBLE_PERIOD * 1.5, 31.4];

describe("the shape catalogue", () => {
  it("has drafts in it at all", () => {
    expect(CATALOGUE.filter((e) => e.status === "draft").length).toBeGreaterThan(12);
  });

  it("names every shape exactly once", () => {
    const names = CATALOGUE.map((e) => e.subject.name);
    expect(new Set(names).size).toBe(names.length);
  });

  for (const entry of CATALOGUE) {
    describe(entry.subject.name, () => {
      it("samples to finite points at every moment", () => {
        for (const t of TIMES) {
          for (const p of entry.subject.pointsAt(t)) {
            expect(Number.isFinite(p.x)).toBe(true);
            expect(Number.isFinite(p.y)).toBe(true);
          }
        }
      });

      it("occupies a box with both dimensions in it", () => {
        const b = boundsOver(entry.subject, TIMES);
        expect(b.x1 - b.x0).toBeGreaterThan(1);
        expect(b.y1 - b.y0).toBeGreaterThan(1);
      });

      it("never collapses part of its outline onto its own centre", () => {
        // A metaball contour is marched radially from the middle, so pulling
        // its bodies too far apart leaves a ray with nothing to cross and the
        // outline falls to the centre — a pinwheel where two bodies should be.
        // It is the one way a shape here can be drawn wrongly rather than not
        // drawn at all, which is why it is checked rather than looked at.
        const still = boundsOver(entry.subject, TIMES);
        const reach = Math.max(still.x1 - still.x0, still.y1 - still.y0) / 2;
        for (let t = 0; t < 24; t += 0.25) {
          const pts = entry.subject.pointsAt(t);
          if (entry.subject.open) continue;
          const mid = { x: (still.x0 + still.x1) / 2, y: (still.y0 + still.y1) / 2 };
          for (const p of pts) {
            expect(Math.hypot(p.x - mid.x, p.y - mid.y)).toBeGreaterThan(reach * 0.08);
          }
        }
      });

      it("builds a path string with no NaN in it", () => {
        for (const t of TIMES) {
          const d = entry.subject.path(entry.subject.pointsAt(t));
          expect(d.length).toBeGreaterThan(0);
          expect(d).not.toContain("NaN");
        }
      });

      it("moves, if it claims a motion", () => {
        if (!entry.motion) return;
        const poses = TIMES.map((t) => entry.motion?.poseAt(t));
        for (const p of poses) {
          if (!p) continue;
          expect(Number.isFinite(p.dx + p.dy + p.rot + p.sx + p.sy)).toBe(true);
          // Spec 5.8: own-motion never touches the lane.
          expect(Math.abs(p.dx)).toBeLessThan(0.25);
          expect(Math.abs(p.dy)).toBeLessThan(0.25);
        }
      });
    });
  }
});

/**
 * A suggestion that names something the spec does not have is worse than no
 * suggestion: it points a future session at a heading that is not there, and
 * the whole value of a draft is that it is attached to something.
 *
 * Two places count, because a shape can be drawn at two kinds of thing: a
 * bullet in the idea store, and a boss with a worked-out section and no code.
 * What is checked is only that the name resolves — an idea store bullet is
 * bold, a boss is a numbered heading, and either is somewhere to go and read.
 */
describe("what the drafts are offered to", () => {
  const ideas = Bun.file(join(ROOT, "docs", "spec", "ideas.md")).text();
  const bosses = Bun.file(join(ROOT, "docs", "spec", "bosses.md")).text();

  for (const entry of CATALOGUE) {
    if (!entry.suggests) continue;
    it(`${entry.subject.name} is offered to something that exists`, async () => {
      const name = entry.suggests ?? "";
      const asIdea = (await ideas).includes(`**${name}**`);
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const asBoss = new RegExp(`^##\\s+[\\d.]+\\s+${escaped}\\b`, "m").test(await bosses);
      expect({ name, found: asIdea || asBoss }).toEqual({ name, found: true });
    });
  }

  it("gives every draft something to be offered to", () => {
    for (const entry of CATALOGUE.filter((e) => e.status === "draft")) {
      expect(entry.suggests).toBeTruthy();
    }
  });
});

describe("the spare motions", () => {
  it("names each one once", () => {
    const names = MOTIONS.map((m) => m.name);
    expect(new Set(names).size).toBe(names.length);
  });

  for (const m of MOTIONS) {
    it(`${m.name} stays in its lane and actually moves`, () => {
      let moved = false;
      for (let t = 0; t < 32; t += 0.01) {
        const p = m.poseAt(t);
        expect(Math.abs(p.dx)).toBeLessThan(0.25);
        expect(Math.abs(p.dy)).toBeLessThan(0.25);
        expect(p.sx).toBeGreaterThan(0.5);
        expect(p.sy).toBeGreaterThan(0.5);
        if (Math.abs(p.dx) > 0.01 || Math.abs(p.rot) > 0.01 || Math.abs(p.sx - 1) > 0.01) {
          moved = true;
        }
      }
      expect(moved).toBe(true);
    });
  }
});
