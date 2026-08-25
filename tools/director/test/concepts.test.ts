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
      { name: "Warding", status: "built", note: "Both halves.", table: null },
      { name: "Marking", status: "not built", note: "Needs re-inventing.", table: null },
    ]);

    expect(sheet.assists).toEqual([
      {
        name: "The three forms",
        status: "",
        note: "",
        table: { headers: ["Form", "Price"], rows: [["Share sight", "fainter"]] },
      },
    ]);

    expect(sheet.systems).toEqual([
      { name: "Information split", status: "not built", note: "One device today.", table: null },
    ]);

    expect(sheet.ideas).toEqual([
      { name: "Echo", note: "a creature appears one second earlier for one player" },
      {
        name: "Reverb",
        note: "repeats an action with a delay (a different thing from the Echo; see the name clash in bestiary)",
      },
      { name: "Moulting", note: "" },
    ]);

    expect(sheet.deferred).toEqual([{ name: "Freighter", note: "overlaps with the runt" }]);
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
  });
});
