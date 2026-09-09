import { describe, expect, it } from "bun:test";
import { livingMotion, livingSilhouette } from "@neon-spore/content";
import { VARIANTS } from "../../versus/candidates/index.js";
import type { Variant } from "../../versus/variant.js";
import { CANDIDATE_SHAPES, candidateEntries, contourCandidates } from "../src/candidates.js";
import { CATALOGUE } from "../src/catalogue.js";
import { drawnSize } from "../src/drawn-size.js";
import { confusable, nameability, nameabilityOf } from "../src/nameability.js";
import { blob } from "../src/subjects.js";

/**
 * A contour candidate is measured before it is voted on, not after.
 *
 * `bun run shapes:report` prints geometry for the records in
 * `packages/content`, and a candidate is not one — it is a set of fields held
 * over a shipped record for the length of one `draw()`. So *does it survive
 * its own drawn size* and *is it still its own word* were both unanswerable
 * until the candidate had won and been adopted, which is precisely backwards:
 * they are the cheap disqualifiers, and the vote is the expensive step they
 * exist to save.
 *
 * Most of what follows is written against a candidate made here rather than
 * against the registry, and on purpose: no contour candidate is open today, so
 * a test that only walked `VARIANTS` would pass by having nothing to do and
 * would go on passing the day one arrives broken.
 */

const SHIPPED = livingSilhouette("slick");
/** The card every body on the SHAPES page is fitted to. */
const CARD = 92;

/** A candidate for the slick's own outline, drawn far too small. */
function tiny(): Variant {
  return {
    slot: "creature:slick",
    name: "speck",
    sentence: "the same body at a fifth the size",
    dir: "tools/versus/candidates/creature-slick/speck",
    patches: [
      {
        target: SHIPPED,
        reached: () => livingSilhouette("slick"),
        where: {
          file: "packages/content/src/silhouettes.ts",
          symbol: "SLICK",
          type: "CreatureSilhouette",
        },
        fields: { sizeMul: 0.2 },
      },
    ],
  };
}

/** A candidate for a *look* — a colour, not a contour. */
function aLook(): Variant {
  return {
    slot: "creature:slick",
    name: "amber",
    sentence: "the same body in another colour",
    dir: "tools/versus/candidates/creature-slick/amber",
    patches: [
      {
        target: { tint: "#fff" },
        reached: () => ({ tint: "#fff" }),
        where: { file: "packages/render/src/living-skin.ts", symbol: "SKIN" },
        fields: { tint: "#000" },
      },
    ],
  };
}

describe("contourCandidates", () => {
  it("reads a silhouette patch as a shape, under the candidate's own name", () => {
    const found = contourCandidates([tiny()]);
    expect(found).toHaveLength(1);
    expect(found[0]?.subjectName).toBe("SLICK · SPECK");
    // Derived and never authored: the shipped record with the patch written
    // over it, so the two cannot drift.
    expect(found[0]?.shape.lobes).toBe(SHIPPED.lobes);
    expect(found[0]?.shape.sizeMul).toBe(0.2);
  });

  it("leaves the shipped record alone", () => {
    contourCandidates([tiny()]);
    expect(livingSilhouette("slick").sizeMul).toBe(SHIPPED.sizeMul);
  });

  it("passes over a candidate that patches a look rather than an outline", () => {
    expect(contourCandidates([aLook()])).toEqual([]);
  });

  it("puts every contour candidate open today on the sheet", () => {
    const names = new Set(CATALOGUE.map((e) => e.subject.name));
    for (const one of contourCandidates(VARIANTS)) {
      expect({ name: one.subjectName, onTheSheet: names.has(one.subjectName) }).toEqual({
        name: one.subjectName,
        onTheSheet: true,
      });
    }
    expect(CANDIDATE_SHAPES).toHaveLength(contourCandidates(VARIANTS).length);
  });
});

describe("what a candidate can now be asked", () => {
  it("is measured for its drawn size, so a shrunken one reads as smaller", () => {
    const entry = candidateEntries([tiny()])[0];
    expect(entry).toBeDefined();
    // The 92 px card the SHAPES page draws every body on.
    const shrunk = drawnSize(entry!, CARD);
    const shipped = drawnSize(
      { subject: blob("SLICK", SHIPPED), status: "taken", slot: "creature", owner: "" },
      CARD,
    );
    // The whole point: this is answerable at all. Before the join there was
    // no subject to hand `drawnSize`, so the 20 px floor and the 11 px cliff
    // could not be applied to a candidate until after it had won.
    expect(shrunk.short).toBeLessThan(shipped.short);
    expect(Number.isFinite(shrunk.long)).toBe(true);
  });

  it("is measured against the nameability gate, so one that lost its word is caught", () => {
    // A slick patched all the way into the bulb's own contour: the failure the
    // gate exists for, put *before* the vote rather than after it.
    const asCandidate = nameabilityOf(
      "SLICK · ROUND",
      livingSilhouette("bulb"),
      livingMotion("bulb").poseAt,
    );
    expect(confusable(asCandidate, nameability("bulb"))).toBe(true);
    expect(confusable(nameability("slick"), nameability("bulb"))).toBe(false);
  });
});
