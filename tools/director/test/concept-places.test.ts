import { describe, expect, test } from "bun:test";
import { CATALOGUE, SCENES } from "@neon-spore/shape-sheet";
import { buildBacklog } from "../src/backlog.js";
import { missingPlaces, PLACES, type Tree } from "./concept-places.js";
import { specNames } from "./spec-names.js";

/**
 * The five places one new concept has to reach, met in one run.
 *
 * `concept-places.ts` has the argument. The short of it: each of these was
 * already checked, correctly, in a file of its own, and a lane adding a
 * concept learned the list one red run at a time — twenty minutes on one
 * afternoon, 165 across the ledger. Nothing here replaces those cases. It
 * arrives first and names everything.
 */

const ROOT = new URL("../../../", import.meta.url);
const read = (rel: string) => Bun.file(Bun.fileURLToPath(new URL(rel, ROOT))).text();

const WORDS = [
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

/**
 * The number word off the catalogue page. `tools/shape-sheet/test/drafts.test.ts`
 * owns the same reading and keeps it: that file is where the count is *held*,
 * and this is where it is reported beside the other four places. Two readers of
 * one sentence is the thing this lane is against, and it is the one row where
 * a shared module would mean the director importing a shape-sheet test.
 */
function wordsToNumber(words: string): number | null {
  const parts = words.toLowerCase().split("-");
  const tens = TENS[parts[0] ?? ""];
  if (tens !== undefined) {
    if (parts.length === 1) return tens;
    const unit = WORDS.indexOf(parts[1] ?? "");
    return unit > 0 ? tens + unit : null;
  }
  const unit = WORDS.indexOf(parts[0] ?? "");
  return unit >= 0 ? unit : null;
}

async function realTree(): Promise<Tree> {
  const backlog = buildBacklog(
    await read("docs/spec/systems.md"),
    await read("docs/spec/ideas.md"),
    await read("docs/spec/bosses.md"),
    await read("docs/spec/bosses-choreographed.md"),
  );
  const page = await read("docs/asset-catalogue.md");
  const said = /\*\*Status:\s+([a-z-]+)\s+drafts/.exec(page);
  const drafts = CATALOGUE.filter((e) => e.status === "draft");
  return {
    specNames: await specNames(),
    draftSuggests: CATALOGUE.map((e) => e.suggests).filter((s): s is string => Boolean(s)),
    sceneSuggests: SCENES.map((s) => s.suggests).filter((s): s is string => s !== undefined),
    draftsOfferedToNothing: drafts.filter((e) => !e.suggests).map((e) => e.subject.name),
    drafts: drafts.length,
    draftsSaid: said === null ? null : wordsToNumber(said[1] ?? ""),
    backlogNames: backlog.mechanics.flatMap((g) => g.entries.map((e) => e.name)),
  };
}

describe("every place one concept has to reach", () => {
  test("is right about the tree as it stands", async () => {
    expect(missingPlaces(await realTree())).toEqual([]);
  });

  test("is five, and a place added here is a place a lane is told about", () => {
    // The count is the guard: a check that becomes a fifth copy of one fact
    // belongs on this list, and one deleted from it silently is the failure
    // the list exists to end.
    expect(PLACES.map((p) => p.where)).toEqual([
      "docs/spec/ideas.md or docs/spec/bosses.md",
      "docs/spec/ideas.md or docs/spec/bosses.md, for the scenes",
      "tools/shape-sheet/src/drafts/",
      "docs/asset-catalogue.md, the **Status:** line",
      "the director's NOT BUILT YET page",
    ]);
  });
});

/**
 * The fixture, and it is the case the whole lane is about: a concept that
 * reached **one** of the five. The old arrangement answered with the first
 * place it happened to run; this has to answer with the other four.
 */
describe("a concept that reached one place and not the rest", () => {
  const halfDone: Tree = {
    // The spec never learned the name, so both joins and the page fail on it.
    specNames: new Set(["husk"]),
    draftSuggests: ["Fathom"],
    sceneSuggests: ["Fathom"],
    draftsOfferedToNothing: ["FATHOM 2"],
    drafts: 26,
    draftsSaid: 25,
    backlogNames: ["Husk", "Fathom"],
  };

  test("names every place it is missing from, in one message", () => {
    const missing = missingPlaces(halfDone);
    expect(missing).toHaveLength(5);
    // On the whole prefix including the dash: two of the five name the same
    // pair of spec files, and one of them is the other's prefix.
    for (const where of PLACES.map((p) => p.where)) {
      expect(missing.filter((line) => line.startsWith(`${where} — `))).toHaveLength(1);
    }
  });

  test("says what is wrong at each one, not merely that something is", () => {
    const missing = missingPlaces(halfDone);
    expect(missing[0]).toContain('a shape is drawn at "Fathom"');
    expect(missing[1]).toContain("a scene is a picture");
    expect(missing[2]).toContain("FATHOM 2");
    expect(missing[3]).toContain("says 25 drafts and the catalogue holds 26");
    expect(missing[4]).toContain("emptied a column");
  });

  test("says a name once however many shapes claim it", () => {
    const twice: Tree = { ...halfDone, draftSuggests: ["Fathom", "Fathom", "fathom"] };
    expect(missingPlaces(twice).filter((l) => l.includes("a shape is drawn at"))).toHaveLength(1);
  });

  test("is empty when every place has it", () => {
    const done: Tree = {
      specNames: new Set(["husk", "fathom"]),
      draftSuggests: ["Fathom"],
      sceneSuggests: ["Fathom"],
      draftsOfferedToNothing: [],
      drafts: 26,
      draftsSaid: 26,
      backlogNames: ["Husk", "Fathom"],
    };
    expect(missingPlaces(done)).toEqual([]);
  });

  test("says so when the catalogue page has no count line at all", () => {
    expect(missingPlaces({ ...halfDone, draftsSaid: null }).join("\n")).toContain(
      "no `**Status: N drafts` line",
    );
  });
});
