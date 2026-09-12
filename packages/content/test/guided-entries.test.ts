import { describe, expect, it } from "bun:test";
import { WAVES, type WaveKind } from "../src/index.js";

/**
 * A guided wave carries its lesson and nothing else.
 *
 * The owner's rule, 12 September 2026: a wave that teaches something has
 * only the minimum number of enemies the lesson needs, and no other enemy
 * kind. Rocks and every other special kind that are not the lesson go; plain
 * slicks stay only where the lesson needs a target, at the fewest that make
 * the point. Until then most guided waves carried a stray rock and a couple
 * of slicks beside the thing they were about — padding a wave with entries,
 * which `waves.test.ts` names as the same failure as padding it with a guide.
 *
 * What a test can hold of that: every entry with a `kind` on a guided wave is
 * either a kind that first appears on that wave — the thing the guide is
 * about — or one the table below says the lesson keeps, with the reason. How
 * *many* slicks a lesson needs is a judgement, so plain slicks are not counted
 * here. The films (`scenes/`) are not touched by the rule; it is about the
 * wave the pair plays.
 */

/** The kinds a guided wave keeps although it did not introduce them, and why. */
const THE_LESSON_KEEPS: Record<string, readonly WaveKind[]> = {
  // Two rocks on one beat, then three: the rock is the lesson, a wave on.
  "TWO ROCKS": ["meteor"],
  "THE HAND": ["meteor"],
  // The arm folds what comes in under it, and the guide names the rocks.
  "THE VANE": ["meteor"],
  // Four rocks answered untriggered and a fifth on its own — the rocks are
  // what the ward is shown against, the plain one included.
  "THE WARD": ["meteor"],
  // A rock in the lane between plate and dome takes the whole reach; the
  // guide says so, and one rock is kept to show it.
  "THE COIL": ["meteor"],
  // The jammed gun's lesson is what not to point it at.
  "THE JAM": ["lure"],
  // The fence waves after THE FENCE: the wire is the material of both.
  "THE GAP": ["fence"],
  "THE CUT": ["fence"],
  // The hand reaches for rocks, in two sizes.
  "THE CLAW": ["meteor", "meteorMedium"],
  // A rock over a side wall is a rock; what is new is the `cross`.
  "THE CROSSING": ["meteor"],
  // A rock is what asks the plate to stand somewhere, and a plate that has
  // to meet one and be gone on the next beat is the limpet's lesson.
  "THE LIMPET": ["meteor"],
};

describe("a guided wave's entries", () => {
  it("are the kind it introduces, the kinds its lesson keeps, and plain slicks", () => {
    const seen = new Set<WaveKind>();
    for (const [i, wave] of WAVES.entries()) {
      const introduced = new Set<WaveKind>();
      for (const e of wave.entries) {
        if (e.kind === undefined || seen.has(e.kind)) continue;
        seen.add(e.kind);
        introduced.add(e.kind);
      }
      if (!wave.guide) continue;
      const kept = new Set(THE_LESSON_KEEPS[wave.name] ?? []);
      for (const e of wave.entries) {
        if (e.kind === undefined) continue;
        expect(
          introduced.has(e.kind) || kept.has(e.kind),
          `wave ${i + 1} · ${wave.name} teaches ${[...introduced].join(", ") || "nothing new"} and carries a ${e.kind} at beat ${e.beat}`,
        ).toBe(true);
      }
    }
  });

  it("names in the table only waves that exist, carry a guide, and carry the kind", () => {
    for (const [name, kinds] of Object.entries(THE_LESSON_KEEPS)) {
      const wave = WAVES.find((w) => w.name === name);
      expect(wave, `${name} is in the table and not in the game`).toBeDefined();
      expect(wave?.guide, `${name} is in the table and carries no guide`).toBeDefined();
      for (const kind of kinds) {
        expect(
          wave?.entries.some((e) => e.kind === kind),
          `${name} is said to keep a ${kind} and carries none`,
        ).toBe(true);
      }
    }
  });
});
