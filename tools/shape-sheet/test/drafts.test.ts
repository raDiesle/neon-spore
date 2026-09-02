import { describe, expect, it } from "bun:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beats, beatsFromSeconds } from "@neon-spore/content";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { CATALOGUE } from "../src/catalogue.js";
import { contourAt } from "../src/contour.js";
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

/**
 * English number words, as far as this page will ever need them. A table
 * rather than a library because the alternative was leaving the count in
 * `docs/asset-catalogue.md` unchecked, and it had already been wrong twice in
 * one day: two sessions each incremented the number they found instead of
 * counting the catalogue.
 */
const UNITS = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
];
const TENS: Record<string, number> = {
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
};

function wordsToNumber(words: string): number | null {
  const parts = words.toLowerCase().split("-");
  const tens = TENS[parts[0] ?? ""];
  if (tens !== undefined) {
    if (parts.length === 1) return tens;
    const unit = UNITS.indexOf(parts[1] ?? "");
    return unit > 0 ? tens + unit : null;
  }
  const unit = UNITS.indexOf(parts[0] ?? "");
  return unit >= 0 ? unit : null;
}

describe("the shape catalogue", () => {
  it("has drafts in it at all", () => {
    expect(CATALOGUE.filter((e) => e.status === "draft").length).toBeGreaterThan(12);
  });

  it("says how many drafts it has, and is right about it", async () => {
    const page = await Bun.file(join(ROOT, "docs/asset-catalogue.md")).text();
    const said = /\*\*Status:\s+([a-z-]+)\s+drafts/.exec(page);
    expect(said, "docs/asset-catalogue.md has no `**Status: N drafts` line").not.toBeNull();
    expect(wordsToNumber(said?.[1] ?? ""), `"${said?.[1]}" is not a number word`).toBe(
      CATALOGUE.filter((e) => e.status === "draft").length,
    );
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
        // A contour marched radially from the middle falls to the centre when
        // there is nothing for a ray to cross — a pinwheel where two bodies
        // should be. It is the one way a shape here can be drawn wrongly
        // rather than not drawn at all, which is why it is checked rather than
        // looked at.
        //
        // A subject that reports loops is traced on a grid instead and cannot
        // fail that way; what it can do is emit a degenerate ring, so each of
        // its loops is checked for enclosing something instead. A body that
        // has just separated legitimately passes within a hair of the centre,
        // which is exactly what the radial test forbade.
        if (entry.subject.open) return;
        if (entry.subject.loopsAt) {
          for (let t = 0; t < 24; t += 0.25) {
            for (const loop of entry.subject.loopsAt(t)) {
              expect(loop.length).toBeGreaterThan(3);
              let a = 0;
              for (let i = 0; i < loop.length; i++) {
                const p = loop[i]!;
                const q = loop[(i + 1) % loop.length]!;
                a += p.x * q.y - q.x * p.y;
              }
              expect(Math.abs(a) / 2).toBeGreaterThan(4);
            }
          }
          return;
        }
        const still = boundsOver(entry.subject, TIMES);
        const reach = Math.max(still.x1 - still.x0, still.y1 - still.y0) / 2;
        for (let t = 0; t < 24; t += 0.25) {
          const pts = entry.subject.pointsAt(t);
          const mid = { x: (still.x0 + still.x1) / 2, y: (still.y0 + still.y1) / 2 };
          for (const p of pts) {
            expect(Math.hypot(p.x - mid.x, p.y - mid.y)).toBeGreaterThan(reach * 0.08);
          }
        }
      });

      it("builds a path string with no NaN in it", () => {
        for (const t of TIMES) {
          const d = contourAt(entry.subject, t);
          expect(d.length).toBeGreaterThan(0);
          expect(d).not.toContain("NaN");
        }
      });

      it("moves, if it claims a motion", () => {
        if (!entry.motion) return;
        const poses = TIMES.map((t) =>
          entry.motion?.poseAt(beatsFromSeconds(t, DEFAULT_CONFIG.bpm)),
        );
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
      // Beats, not seconds: fifty of them is a little over half a minute at
      // 96 BPM, which still covers CANT's eight-beat cycle several times over.
      for (let t = 0; t < 50; t += 0.01) {
        const p = m.poseAt(beats(t));
        expect(Math.abs(p.dx)).toBeLessThan(0.25);
        expect(Math.abs(p.dy)).toBeLessThan(0.25);
        expect(p.sx).toBeGreaterThan(0.5);
        expect(p.sy).toBeGreaterThan(0.5);
        // All five numbers, not the three this used to read. JET moves in `dy`
        // alone — it lifts a bell on the squeeze and sets no scale at all —
        // and was reported motionless by a check that looked at dx, rot and
        // sx. A motion that only bobs, or only flattens, is a motion; the
        // omission was a hole rather than a threshold, and a registry test
        // that can call a working motion dead is worse than none.
        if (
          Math.abs(p.dx) > 0.01 ||
          Math.abs(p.dy) > 0.01 ||
          Math.abs(p.rot) > 0.01 ||
          Math.abs(p.sx - 1) > 0.01 ||
          Math.abs(p.sy - 1) > 0.01
        ) {
          moved = true;
        }
      }
      expect(moved).toBe(true);
    });
  }
});

/**
 * The drafts whose idea is the separation itself.
 *
 * Symbiosis is vulnerable only while its two bodies are apart, The Choir is
 * three voices that merge on the beat they are hit, and the Colony's whole
 * behaviour is spreading. A picture that can only thin to a waist cannot show
 * any of that, and for a while none of them could: the contour was marched
 * radially from the centre, which has one answer per angle and so has one
 * outline. This is the claim the change was made for, checked rather than
 * remembered — a spread tuned back down far enough to stop parting is a draft
 * that quietly stops saying what it was drawn to say.
 *
 * Exactly the body count, not merely more than one: a stray extra loop is a
 * fragment, which is what a mis-oriented trace produces instead of a ring.
 */
describe("the clusters that have to come apart", () => {
  const BODIES: Array<[string, number]> = [
    ["HERALD", 2],
    ["SYMBIOSIS", 2],
    ["COLONY", 5],
    ["THE CHOIR", 3],
  ];

  const loopsOver = (name: string): number => {
    const subject = CATALOGUE.find((e) => e.subject.name === name)?.subject;
    let most = 0;
    for (let t = 0; t < 24; t += 0.05) most = Math.max(most, subject?.loopsAt?.(t).length ?? 0);
    return most;
  };

  for (const [name, bodies] of BODIES) {
    it(`${name} parts into ${bodies} bodies and no more`, () => {
      expect(loopsOver(name)).toBe(bodies);
    });
  }

  // The one cluster drawn to stay one contour: two lobes that lean and never
  // resolve into a single body, and never separate into two either.
  it("INTERFERENCE stays one contour, which is what it was drawn for", () => {
    expect(loopsOver("INTERFERENCE")).toBe(1);
  });
});
