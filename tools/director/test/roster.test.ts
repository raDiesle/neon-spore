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

    expect(roster.creatures).toHaveLength(13);
    // The Silent and The Jammer joined for the torch's radar-ownership work —
    // docs/decisions.md #15.
    expect(roster.accepted).toHaveLength(9);
    // Eleven named in the act order, plus THE MIRROR, which holds no slot in
    // it and is built (docs/spec/bosses.md 11.3).
    expect(roster.bosses).toHaveLength(12);
    expect(roster.bosses.find((b) => b.name === "The Mirror")?.built).toBe(true);
    expect(roster.bosses.find((b) => b.name === "Bulb Queen")?.built).toBe(true);

    const slick = roster.creatures.find((c) => c.name === "Slick");
    expect(slick?.built).toBe(true);

    const bulb = roster.creatures.find((c) => c.name === "Bulb");
    expect(bulb?.built).toBe(true);

    const meteor = roster.creatures.find((c) => c.name === "Meteor");
    expect(meteor?.built).toBe(true);

    const dart = roster.creatures.find((c) => c.name === "Dart");
    expect(dart?.built).toBe(false);

    const veil = roster.creatures.find((c) => c.name === "Veil");
    expect(veil?.built).toBe(false);

    // Only the three worked-out bosses carry a note off their own heading's tail.
    const queen = roster.bosses.find((b) => b.name === "Bulb Queen");
    expect(queen?.note).toBe("armoured everywhere but the mark");

    const strandNest = roster.bosses.find((b) => b.name === "Strand Nest");
    expect(strandNest?.note).toBe("");

    // The one this panel used to get wrong: a table cell of one sentence where
    // the spec spends a paragraph saying what the kind actually does.
    const jammer = roster.accepted.find((c) => c.name === "The Jammer");
    expect(jammer?.ref).toBe("bestiary.md 10.2");
    expect(jammer?.detail).toContain("the danger is the strip going dark");
    expect(jammer?.detail).toContain("fall back on the other player's picture");
    expect(jammer?.detail.length).toBeGreaterThan(jammer?.note.length ?? 0);

    // A block with no bold lead of its own stays with the entry above it.
    const blind = roster.accepted.find((c) => c.name === "The Blind One");
    expect(blind?.detail).toContain("Two requirements, unchanged from the original draft");

    // The bosses carry their whole section, tables and all, not just the tail.
    expect(queen?.ref).toBe("bosses.md 11.0");
    expect(queen?.detail).toContain("A bloom has two halves");

    // Nothing is attributed to a name the paragraph never mentions.
    const dartDetail = roster.creatures.find((c) => c.name === "Dart")?.detail;
    expect(dartDetail).toBe("");
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
      },
      {
        name: "Dart",
        kind: "small, banded",
        note: "match the colour",
        built: false,
        detail: "**The dart is fast.** Two lines,\nwrapped like the spec wraps them.",
        ref: "bestiary.md 10.1",
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
      },
      {
        name: "The Shadow",
        kind: "Order",
        note: "invulnerable while behind another",
        built: false,
        detail: "",
        ref: "bestiary.md 10.2",
      },
    ]);

    expect(roster.bosses).toEqual([
      { name: "Bulb Queen", kind: "10", note: "", built: true, detail: "", ref: "bosses.md" },
      { name: "Strand Nest", kind: "20", note: "", built: false, detail: "", ref: "bosses.md" },
      { name: "The Vessel", kind: "finale", note: "", built: false, detail: "", ref: "bosses.md" },
    ]);
  });
});
