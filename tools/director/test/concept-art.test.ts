import { describe, expect, test } from "bun:test";
import { CATALOGUE } from "@neon-spore/shape-sheet";
import { specNames } from "./spec-names.js";

/**
 * The join between a shape and the concept it was drawn at.
 *
 * A draft carries `suggests: "Echo"` and the spec carries an idea called Echo,
 * and the backlog page puts them side by side wherever it draws that idea.
 * Nothing enforces the spelling: renaming an idea in `docs/spec/ideas.md` is
 * one edit, and the shape drawn at it would go quietly back to being a picture
 * beside other pictures — which is the state this whole join exists to end.
 *
 * So the test is the spelling, against the spec rather than against the page
 * (`spec-names.ts` says why the difference started to matter). It fails on the
 * rename rather than a month later on somebody noticing the Echo has stopped
 * showing its shape.
 *
 * One of the five places a new concept has to reach;
 * `tools/director/test/concept-places.ts` is the list, and
 * `concept-places.test.ts` fails with all five at once so the rest are not
 * learned one red run at a time.
 */

const suggested = (): string[] => [
  ...new Set(CATALOGUE.map((e) => e.suggests).filter((s): s is string => Boolean(s))),
];

describe("a shape drawn at a concept", () => {
  test("names a concept the backlog actually has", async () => {
    const names = await specNames();
    const orphans = suggested().filter((s) => !names.has(s.toLowerCase()));
    expect(orphans).toEqual([]);
  });

  test("is drawn at enough of them to be worth joining", async () => {
    // Not a count that has to be kept up to date — a floor. If this drops to
    // nothing the join is still correct and no longer does anything, and a
    // green test that proves nothing is the failure mode being guarded here.
    const names = await specNames();
    const hit = suggested().filter((s) => names.has(s.toLowerCase()));
    expect(hit.length).toBeGreaterThan(10);
  });

  test("is offered rather than claimed: a draft is never marked taken", () => {
    // The suggestion is a proposal and a person accepts it. A draft that has
    // become `taken` has moved into `packages/content` and should have lost
    // its `suggests` on the way, or the backlog would keep offering a shape
    // that is already spent.
    const claimed = CATALOGUE.filter((e) => e.suggests && e.status === "taken");
    expect(claimed.map((e) => e.subject.name)).toEqual([]);
  });
});
