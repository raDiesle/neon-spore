import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { parsePlainWords, plainWordsFor } from "../src/plain-words.js";
import { parseRoster } from "../src/roster.js";

const bestiary = readFileSync(new URL("../../../docs/spec/bestiary.md", import.meta.url), "utf8");
const bosses = readFileSync(new URL("../../../docs/spec/bosses.md", import.meta.url), "utf8");

describe("parsePlainWords", () => {
  it("reads a name and its rows in written order", () => {
    const words = parsePlainWords(`
## 10.5 In plain words

Preamble.

### Crystal

- **What it does:** it breaks in two.
- **Player 1:** two columns instead of one.
- **Player 2:** not decided yet.
- **To finish it:** decide what the halves are.

### Gum

- **What it does:** it sticks.
`);
    expect(plainWordsFor(words, "Crystal").map((r) => r.label)).toEqual([
      "What it does",
      "Player 1",
      "Player 2",
      "To finish it",
    ]);
    expect(plainWordsFor(words, "Gum")[0]?.text).toBe("it sticks.");
  });

  it("joins a row wrapped over two lines", () => {
    const words = parsePlainWords(`
## In plain words

### The Kernel

- **What it does:** the last boss before
  the finale.
`);
    expect(plainWordsFor(words, "The Kernel")[0]?.text).toBe("the last boss before the finale.");
  });

  it("strips the article, so the act order and a heading name the same thing", () => {
    const words = parsePlainWords("## In plain words\n\n### The Vessel\n\n- **A:** b\n");
    expect(plainWordsFor(words, "Vessel")).toHaveLength(1);
  });

  it("stops at the next section", () => {
    const words = parsePlainWords(
      "## In plain words\n\n### Gum\n\n- **A:** b\n\n## Next\n\n### Crystal\n\n- **A:** c\n",
    );
    expect(plainWordsFor(words, "Crystal")).toHaveLength(0);
  });
});

describe("the spec's own sections", () => {
  const roster = parseRoster(bestiary, bosses);
  const unbuilt = [...roster.creatures, ...roster.accepted, ...roster.bosses].filter(
    (r) => !r.built,
  );

  // Bosses only, since 11 September 2026: every creature row left in the
  // bestiary is built, and its idea rows were retired (docs/decisions.md #28).
  it("finds something unbuilt to explain", () => {
    expect(unbuilt.length).toBeGreaterThan(5);
  });

  // The whole point of the page: a name with a table cell under it told a
  // reader nothing about who says what to whom, or about what is missing.
  it("gives every unbuilt entry all four rows", () => {
    for (const row of unbuilt) {
      expect(row.plain.map((r) => r.label)).toEqual([
        "What it does",
        "Player 1",
        "Player 2",
        "To finish it",
      ]);
      for (const cell of row.plain) expect(cell.text.length).toBeGreaterThan(0);
    }
  });

  it("leaves a built entry alone — it is not on that page", () => {
    const slick = roster.creatures.find((c) => c.name === "Slick");
    expect(slick?.built).toBe(true);
    expect(slick?.plain).toEqual([]);
  });

  it("counts the pod as built, since it is and is not a CreatureKind", () => {
    expect(roster.creatures.find((c) => c.name === "Pod")?.built).toBe(true);
  });
});
