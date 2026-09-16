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

  test("firstParagraph skips a list whole, wrapped lines and all", () => {
    const lines = [
      "",
      "- ~100 beats/min, every fourth accented",
      "- Sync window = the same beat, instead of an invisible",
      "  250 ms that nobody sees",
      "",
      "The prose after it.",
    ];
    expect(firstParagraph(lines)).toBe("The prose after it.");
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
  const systems = `
## 5.2 Information split — not built

One device today.

## 6.1 The three forms

| Form | Price |
|---|---|
| Share sight | fainter |
`;

  const ideas = `
## Accepted, not yet worked out

### Creatures

- **Echo** — a creature appears one second earlier for one player
- **Reverb** — repeats an action with a delay (a different thing from the Echo;
  see the name clash in [bestiary](bestiary.md#103))
- **Moulting**
- **Prism** (working name only) — falls like a creature, never destroyed

### Controls

- **Inverted instructions** — the Spaceteam principle

## Deliberately deferred

- **Freighter** — overlaps with the runt
`;

  test("parses every doc into its shape", () => {
    const sheet = parseConcepts(systems, ideas);

    // A section with a heading tail and a section with a table: both shapes
    // `toConcepts` has to carry, and the table one is why `table` exists at
    // all. They were two files' worth of fixture — `couplings.md` and
    // `assists.md` — until the reads of both went on 16 September 2026, and
    // the parser is the same parser.
    expect(sheet.systems).toEqual([
      {
        name: "Information split",
        status: "not built",
        note: "One device today.",
        table: null,
        detail: "One device today.",
        ref: "systems.md 5.2",
      },
      {
        name: "The three forms",
        status: "",
        note: "",
        table: { headers: ["Form", "Price"], rows: [["Share sight", "fainter"]] },
        detail: "| Form | Price |\n|---|---|\n| Share sight | fainter |",
        ref: "systems.md 6.1",
      },
    ]);

    expect(sheet.ideas).toEqual([
      {
        name: "Echo",
        note: "a creature appears one second earlier for one player",
        ref: "ideas.md",
        group: "Creatures",
      },
      {
        name: "Reverb",
        note: "repeats an action with a delay (a different thing from the Echo; see the name clash in bestiary)",
        ref: "ideas.md",
        group: "Creatures",
      },
      { name: "Moulting", note: "", ref: "ideas.md", group: "Creatures" },
      // No em dash after the name: the note is whatever the rest of the line
      // is, or this bullet matches nothing and folds into the one above it.
      {
        name: "Prism",
        note: "(working name only) — falls like a creature, never destroyed",
        ref: "ideas.md",
        group: "Creatures",
      },
      {
        name: "Inverted instructions",
        note: "the Spaceteam principle",
        ref: "ideas.md",
        group: "Controls",
      },
    ]);

    expect(sheet.deferred).toEqual([
      { name: "Freighter", note: "overlaps with the runt", ref: "ideas.md", group: "" },
    ]);
  });

  test("a group's own introduction does not become the tail of the bullet above it", () => {
    const withIntro = `
## Accepted, not yet worked out

### Creatures

- **Wave gate** — never removed by reaching the hull

### Bosses

Three encounters worked out far enough to be worth keeping.

- **THE CHOIR** — warding turned into a weapon
`;
    const sheet = parseConcepts("", withIntro);
    const gate = sheet.ideas.find((i) => i.name === "Wave gate");
    expect(gate?.note).toBe("never removed by reaching the hull");
    expect(sheet.ideas.map((i) => i.group)).toEqual(["Creatures", "Bosses"]);
  });

  test("parses the real spec files without throwing", async () => {
    const root = new URL("../../../", import.meta.url);
    const read = (rel: string) => Bun.file(Bun.fileURLToPath(new URL(rel, root))).text();

    const sheet = parseConcepts(
      await read("docs/spec/systems.md"),
      await read("docs/spec/ideas.md"),
    );

    expect(sheet.systems.length).toBeGreaterThan(0);
    expect(sheet.ideas.length).toBeGreaterThan(0);

    // A concept's detail is the section as written, not the sentence the panel
    // used to show — 5.6 keeps its design bullets, its built half and the
    // sentence naming what is missing, and the page decides which of those a
    // reader sees (`backlog.ts`).
    const damage = sheet.systems.find((c) => c.name === "Destruction and damage");
    expect(damage?.detail).toContain("Not built: polygon clipping, splinters, debris");
    expect(damage?.detail.length).toBeGreaterThan(damage?.note.length ?? 0);

    // The sub-headings the backlog groups by: an idea with no group would
    // silently vanish from every section of the page.
    expect(sheet.ideas.every((i) => i.group !== "")).toBe(true);
    expect(new Set(sheet.ideas.map((i) => i.group))).toEqual(
      new Set(["Creatures", "Mechanics", "Controls", "Weapons", "Rounds"]),
    );
  });
});
