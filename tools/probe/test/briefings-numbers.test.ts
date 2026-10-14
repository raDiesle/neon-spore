import { describe, expect, it } from "bun:test";
import { WAVES } from "@neon-spore/content";
import { renumberBriefings } from "../briefings-numbers.js";

/**
 * `bun run briefings:renumber` (`briefings-numbers.ts`): the wave numbers and
 * the guided count put back on today's order, and nothing else moved.
 */

const PAGE = [
  "# Briefings",
  "",
  "Only a wave that introduces something new carries one — two of the four",
  "waves today, and a wave with no guide has no circles either.",
  "",
  "## 1 · What has to be taught",
  "",
  "| # | Block | What is new | Who holds what | Wave |",
  "|---|---|---|---|---|",
  "| 1 | **The opening** | two devices | see §2 | 1 · FIRST STEP |",
  "| 2 | **The bosses** | one guide each | each | 3 · THE MIRROR, 4 · THE MAZE |",
  "",
  "Wave 3 is named in prose and left alone.",
  "",
  "## 2 · The opening, in detail",
  "",
  "| 1 | not this table | 2 · FIRST STEP |",
  "",
].join("\n");

/** A wave ahead of THE MIRROR and a guided one more: what a block lane's insert does. */
const WAVES_AFTER = [
  { name: "FIRST STEP", guide: {} },
  { name: "CYAN" },
  { name: "NEW ONE", guide: {} },
  { name: "THE MIRROR", guide: {} },
  { name: "THE MAZE" },
];

describe("renumberBriefings", () => {
  it("moves every named wave to its number now, and spells the count again", () => {
    const after = renumberBriefings(PAGE, WAVES_AFTER);
    expect(after).toContain("| 4 · THE MIRROR, 5 · THE MAZE |");
    expect(after).toContain("| 1 · FIRST STEP |");
    expect(after).toContain("three of the five waves today");
  });

  it("touches nothing outside the section's table and the count", () => {
    const after = renumberBriefings(PAGE, WAVES_AFTER);
    expect(after).toContain("Wave 3 is named in prose and left alone.");
    expect(after).toContain("| 1 | not this table | 2 · FIRST STEP |");
    expect(after.split("\n").length).toBe(PAGE.split("\n").length - 1);
  });

  it("refuses a name no wave carries rather than guessing", () => {
    expect(() => renumberBriefings(PAGE, [{ name: "FIRST STEP" }])).toThrow(
      "names THE MIRROR, and no wave is called that",
    );
  });

  it("finds today's page already in today's order", async () => {
    const page = await Bun.file(new URL("../../../docs/spec/briefings.md", import.meta.url)).text();
    expect(renumberBriefings(page, WAVES)).toBe(page);
  });
});
