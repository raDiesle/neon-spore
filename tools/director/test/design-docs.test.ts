import { describe, expect, test } from "bun:test";
import { buildDesigns } from "../src/design-docs.js";

const ROOT = new URL("../../../", import.meta.url);
const read = (rel: string) => Bun.file(Bun.fileURLToPath(new URL(rel, ROOT))).text();

describe("buildDesigns", () => {
  test("splits a synthetic document into one entry per ## section", () => {
    const groups = buildDesigns([
      {
        name: "made-up.md",
        text: [
          "# THE MADE-UP PLAN",
          "",
          "One sentence about what this plan is for.",
          "",
          "## The decision",
          "",
          "Build the thing. Several sentences follow, because a design",
          "document argues a case rather than cataloguing entries.",
          "",
          "### a nested detail",
          "",
          "This line belongs to the section above it, not a section of its own.",
          "",
          "## Open questions",
          "",
          "What the plan does not decide.",
        ].join("\n"),
      },
    ]);

    expect(groups).toHaveLength(1);
    const group = groups[0]!;
    expect(group.title).toBe("THE MADE-UP PLAN");
    expect(group.note).toContain("One sentence about what this plan is for");
    expect(group.note).toContain("made-up.md");

    expect(group.entries.map((e) => e.name)).toEqual(["The decision", "Open questions"]);
    // The ### sub-heading stays inside its parent section rather than
    // starting one of its own.
    expect(group.entries[0]!.detail).toContain("a nested detail");
    expect(group.entries[0]!.detail).toContain("nested detail");
    for (const entry of group.entries) expect(entry.ref).toBe("made-up.md");
  });

  test("an empty file contributes no group at all", () => {
    expect(buildDesigns([{ name: "empty.md", text: "" }])).toEqual([]);
    expect(buildDesigns([{ name: "blank.md", text: "\n\n  \n" }])).toEqual([]);
  });

  test("the three real design documents each parse into more than one section", async () => {
    const files = await Promise.all(
      ["versus.md", "teaching.md", "alive.md"].map(async (name) => ({
        name,
        text: await read(`docs/${name}`),
      })),
    );
    const groups = buildDesigns(files);
    expect(groups).toHaveLength(3);
    for (const group of groups) {
      expect(group.entries.length).toBeGreaterThan(1);
      for (const entry of group.entries) {
        expect(entry.name.length).toBeGreaterThan(0);
        expect(entry.detail.length).toBeGreaterThan(0);
      }
    }
  });
});
