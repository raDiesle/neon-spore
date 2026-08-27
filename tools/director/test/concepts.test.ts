import { describe, expect, test } from "bun:test";
import { parseConcepts } from "../src/concepts.js";
import { firstParagraph, firstTable, parseNumberedSections } from "../src/sections.js";

describe("sections", () => {
  test("splits numbered headings and captures the tail", () => {
    const text = `
# Doc

## 1. Warding — built

Position AND trigger.

## 2. Marking — not built

Player 1 holds the beam.
`;
    const sections = parseNumberedSections(text);
    expect(sections).toHaveLength(2);
    expect(sections[0]).toMatchObject({ number: "1.", title: "Warding", tail: "built" });
    expect(sections[1]).toMatchObject({ number: "2.", title: "Marking", tail: "not built" });
  });

  test("firstParagraph skips blockquotes and tables", () => {
    const lines = [
      "",
      "> a tagline",
      "",
      "The real paragraph, in **bold** partly.",
      "Still the same paragraph.",
      "",
      "| a | b |",
      "|---|---|",
    ];
    expect(firstParagraph(lines)).toBe(
      "The real paragraph, in bold partly. Still the same paragraph.",
    );
  });

  test("firstTable reads header and rows", () => {
    const lines = ["| Form | Price |", "|---|---|", "| Share sight | fainter |"];
    expect(firstTable(lines)).toEqual([
      ["Form", "Price"],
      ["Share sight", "fainter"],
    ]);
  });
});

describe("parseConcepts", () => {
  const couplings = `
## 1. Warding — built

Both halves.

## 2. Marking — not built

Needs re-inventing.
`;

  const assists = `
## 6.1 The three forms

| Form | Price |
|---|---|
| Share sight | fainter |
`;

  const systems = `
## 5.2 Information split — not built

One device today.
`;

  const ideas = `
## Accepted, not yet worked out

- **Echo** — a creature appears one second earlier for one player
- **Reverb** — repeats an action with a delay (a different thing from the Echo;
  see the name clash in [bestiary](bestiary.md#103))
- **Moulting**

## Deliberately deferred

- **Freighter** — overlaps with the runt
`;

  test("parses every doc into its shape", () => {
    const sheet = parseConcepts(couplings, assists, systems, ideas);

    expect(sheet.couplings).toEqual([
      {
        name: "Warding",
        status: "built",
        note: "Both halves.",
        table: null,
        detail: "Both halves.",
        ref: "couplings.md 1.",
      },
      {
        name: "Marking",
        status: "not built",
        note: "Needs re-inventing.",
        table: null,
        detail: "Needs re-inventing.",
        ref: "couplings.md 2.",
      },
    ]);

    expect(sheet.assists).toEqual([
      {
        name: "The three forms",
        status: "",
        note: "",
        table: { headers: ["Form", "Price"], rows: [["Share sight", "fainter"]] },
        detail: "| Form | Price |\n|---|---|\n| Share sight | fainter |",
        ref: "assists.md 6.1",
      },
    ]);

    expect(sheet.systems).toEqual([
      {
        name: "Information split",
        status: "not built",
        note: "One device today.",
        table: null,
        detail: "One device today.",
        ref: "systems.md 5.2",
      },
    ]);

    expect(sheet.ideas).toEqual([
      {
        name: "Echo",
        note: "a creature appears one second earlier for one player",
        ref: "ideas.md",
      },
      {
        name: "Reverb",
        note: "repeats an action with a delay (a different thing from the Echo; see the name clash in bestiary)",
        ref: "ideas.md",
      },
      { name: "Moulting", note: "", ref: "ideas.md" },
    ]);

    expect(sheet.deferred).toEqual([
      { name: "Freighter", note: "overlaps with the runt", ref: "ideas.md" },
    ]);
  });

  test("parses the real spec files without throwing", async () => {
    const root = new URL("../../../", import.meta.url);
    const read = (rel: string) => Bun.file(Bun.fileURLToPath(new URL(rel, root))).text();

    const sheet = parseConcepts(
      await read("docs/spec/couplings.md"),
      await read("docs/spec/assists.md"),
      await read("docs/spec/systems.md"),
      await read("docs/spec/ideas.md"),
    );

    expect(sheet.couplings.length).toBeGreaterThan(0);
    expect(sheet.systems.length).toBeGreaterThan(0);
    expect(sheet.ideas.length).toBeGreaterThan(0);

    // A concept's detail is the section as written, not the sentence the panel
    // used to show — warding is the argument the whole control model rests on.
    const warding = sheet.couplings.find((c) => c.name === "Warding");
    expect(warding?.detail).toContain("column four, I trigger on the three");
    expect(warding?.detail.length).toBeGreaterThan(warding?.note.length ?? 0);
  });
});
