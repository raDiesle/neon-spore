import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { parseRoster } from "../src/roster.js";

const ROOT = new URL("../../../", import.meta.url);

describe("roster", () => {
  test("parses the real spec files", async () => {
    const bestiaryPath = join(Bun.fileURLToPath(ROOT), "docs/spec/bestiary.md");
    const bossesPath = join(Bun.fileURLToPath(ROOT), "docs/spec/bosses.md");

    const bestiary = await Bun.file(bestiaryPath).text();
    const bosses = await Bun.file(bossesPath).text();

    const roster = parseRoster(bestiary, bosses);

    // Twelve of the first thirteen: the Glyph left the table when THE MIRROR's
    // Simon Says turned out to be it (docs/decisions.md #28). Thirteen again
    // the same day, when the Countdown was built (docs/decisions.md #29).
    expect(roster.creatures).toHaveLength(13);
    // The Wisp alone — the nine idea rows beside it were retired the same day.
    expect(roster.accepted).toHaveLength(1);
    // Four named in the act order, plus THE MIRROR, which holds no slot in it
    // and is built (docs/spec/bosses.md 11.3). The seven names that held
    // empty slots, and THE TELL, left the order on 11 September 2026
    // (docs/decisions.md #30) — every name still in it is built.
    expect(roster.bosses).toHaveLength(5);
    for (const boss of roster.bosses) expect(boss.built, boss.name).toBe(true);
    expect(roster.bosses.find((b) => b.name === "The Tell")).toBeUndefined();
    expect(roster.bosses.find((b) => b.name === "The Mirror")?.built).toBe(true);
    expect(roster.bosses.find((b) => b.name === "Bulb Queen")?.built).toBe(true);

    const slick = roster.creatures.find((c) => c.name === "Slick");
    expect(slick?.built).toBe(true);

    const bulb = roster.creatures.find((c) => c.name === "Bulb");
    expect(bulb?.built).toBe(true);

    const meteor = roster.creatures.find((c) => c.name === "Meteor");
    expect(meteor?.built).toBe(true);

    const dart = roster.creatures.find((c) => c.name === "Dart");
    expect(dart?.built).toBe(true);

    const veil = roster.creatures.find((c) => c.name === "Veil");
    expect(veil?.built).toBe(true);

    const strand = roster.creatures.find((c) => c.name === "Strand");
    expect(strand?.built).toBe(true);

    // Every row left in both tables is built: the tables are a record now,
    // and the NOT BUILT YET page draws its creature ideas from ideas.md alone.
    // The row this used to be about — the one thing the bestiary listed and
    // `CREATURES` did not — was the strand, then the choke, then the glyph,
    // and the last of them was retired rather than built (#28).
    for (const row of [...roster.creatures, ...roster.accepted]) {
      expect(row.built, row.name).toBe(true);
    }

    // Only a boss with a section of its own carries a note off its heading's
    // tail; THE CHOIR is a creature with a slot and has none.
    const queen = roster.bosses.find((b) => b.name === "Bulb Queen");
    expect(queen?.note).toBe("armoured everywhere but the mark");

    const choir = roster.bosses.find((b) => b.name === "The Choir");
    expect(choir?.note).toBe("");

    // The one this panel used to get wrong: a table cell of one sentence where
    // the spec spends a paragraph saying what the kind actually does.
    const wisp = roster.accepted.find((c) => c.name === "Wisp");
    expect(wisp?.ref).toBe("bestiary.md 10.2");
    expect(wisp?.detail).toContain("the first body one player cannot see at all");
    expect(wisp?.detail.length).toBeGreaterThan(wisp?.note.length ?? 0);
    // The note under the table about the retired rows has no bold lead and
    // stands before any owner, so it goes to nobody — not to the Wisp.
    expect(wisp?.detail).not.toContain("retired them");

    // The bosses carry their whole section, tables and all, not just the tail.
    expect(queen?.ref).toBe("bosses.md 11.0");
    expect(queen?.detail).toContain("A bloom has two halves");

    // A bolded paragraph goes to the creature it names: the dart's own, which
    // arrived with the creature and says what the table row has no room for.
    const dartDetail = roster.creatures.find((c) => c.name === "Dart")?.detail;
    expect(dartDetail).toContain("the first body that does not hold its lane");

    // A paragraph under the table that names a creature is attributed to it.
    // THE VEIL landed with one, and the two sentences it is about are the
    // reason: it is THE LURE's split turned over, and the flash the original
    // row described became a morph.
    const veilDetail = roster.creatures.find((c) => c.name === "Veil")?.detail;
    expect(veilDetail).toContain("the lure's split turned over");

    // And nothing is attributed to a name the paragraphs never mention.
    const gumDetail = roster.creatures.find((c) => c.name === "Gum")?.detail;
    expect(gumDetail).toBe("");
  });

  test("parses a minimal example", () => {
    const bestiary = `
# Bestiary

## 10.1 The first thirteen

| Creature | Form | Role |
|---|---|---|
| **Slick** | wide flat blob | match the colour |
| **Dart** | small, banded | match the colour |

**The dart is fast.** Two lines,
wrapped like the spec wraps them.

**The torch is a rock**, and no row in this table — so it belongs to nobody,
and neither does what follows it.

Loose prose, of the kind the SPEC tab exists for.

## 10.2 Newly accepted

| Creature | Pillar | Description |
|---|---|---|
| **Thread** | Future | a trace of its future movement |
| **The Shadow** | Order | invulnerable while behind another |
`;

    const bosses = `
# Bosses

Order: Bulb Queen (10) · Strand Nest (20) · The Vessel (finale).
`;

    const roster = parseRoster(bestiary, bosses);

    expect(roster.creatures).toEqual([
      {
        name: "Slick",
        kind: "wide flat blob",
        note: "match the colour",
        built: true,
        detail: "",
        ref: "bestiary.md 10.1",
        plain: [],
      },
      {
        name: "Dart",
        kind: "small, banded",
        note: "match the colour",
        built: true,
        detail: "**The dart is fast.** Two lines,\nwrapped like the spec wraps them.",
        ref: "bestiary.md 10.1",
        plain: [],
      },
    ]);

    expect(roster.accepted).toEqual([
      {
        name: "Thread",
        kind: "Future",
        note: "a trace of its future movement",
        built: false,
        detail: "",
        ref: "bestiary.md 10.2",
        plain: [],
      },
      {
        name: "The Shadow",
        kind: "Order",
        note: "invulnerable while behind another",
        built: false,
        detail: "",
        ref: "bestiary.md 10.2",
        plain: [],
      },
    ]);

    expect(roster.bosses).toEqual([
      {
        name: "Bulb Queen",
        kind: "10",
        note: "",
        built: true,
        detail: "",
        ref: "bosses.md",
        plain: [],
      },
      {
        name: "Strand Nest",
        kind: "20",
        note: "",
        built: false,
        detail: "",
        ref: "bosses.md",
        plain: [],
      },
      {
        name: "The Vessel",
        kind: "finale",
        note: "",
        built: false,
        detail: "",
        ref: "bosses.md",
        plain: [],
      },
    ]);
  });
});
