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
    expect(roster.accepted).toHaveLength(7);
    expect(roster.bosses).toHaveLength(11);

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
  });

  test("parses a minimal example", () => {
    const bestiary = `
# Bestiary

## 10.1 The first thirteen

| Creature | Form | Role |
|---|---|---|
| **Slick** | wide flat blob | match the colour |
| **Dart** | small, banded | match the colour |

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
      { name: "Slick", kind: "wide flat blob", note: "match the colour", built: true },
      { name: "Dart", kind: "small, banded", note: "match the colour", built: false },
    ]);

    expect(roster.accepted).toEqual([
      {
        name: "Thread",
        kind: "Future",
        note: "a trace of its future movement",
        built: false,
      },
      {
        name: "The Shadow",
        kind: "Order",
        note: "invulnerable while behind another",
        built: false,
      },
    ]);

    expect(roster.bosses).toEqual([
      { name: "Bulb Queen", kind: "10", note: "", built: false },
      { name: "Strand Nest", kind: "20", note: "", built: false },
      { name: "The Vessel", kind: "finale", note: "", built: false },
    ]);
  });
});
