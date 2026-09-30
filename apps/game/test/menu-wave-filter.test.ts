import { describe, expect, test } from "bun:test";
import { WAVES, waveMarksOn } from "@neon-spore/content";
import { filterTerms, marksMatch, waveMatches } from "../src/menu-wave-filter.js";

/**
 * The JUMP TO WAVE filter, tested against the shipped campaign rather than
 * fixtures invented here — the claim is that typing a word actually finds the
 * waves it describes, and a fixture would only prove the matcher matches
 * itself.
 */

const indexOf = (name: string): number => {
  const i = WAVES.findIndex((w) => w.name === name);
  expect(i, `no wave named ${name}`).toBeGreaterThan(-1);
  return i;
};

describe("filterTerms", () => {
  test("an empty or blank field asks nothing", () => {
    expect(filterTerms("")).toEqual([]);
    expect(filterTerms("   ")).toEqual([]);
  });

  test("terms are lowercased and split on any run of whitespace", () => {
    expect(filterTerms("  BOSS   ward ")).toEqual(["boss", "ward"]);
  });
});

describe("waveMatches", () => {
  test("an empty query matches every wave", () => {
    for (let i = 0; i < WAVES.length; i++) expect(waveMatches(i, "")).toBe(true);
  });

  test("a wave's own number and name find it", () => {
    const i = indexOf(WAVES[0]!.name);
    expect(waveMatches(i, String(i + 1))).toBe(true);
    expect(waveMatches(i, WAVES[0]!.name)).toBe(true);
  });

  test("a term matches from the start of a word and not mid-word", () => {
    // THE WARDEN must not answer `arden`, or the filter would be a
    // substring search wearing this one's name.
    const warden = indexOf("THE WARDEN");
    expect(warden, "no wave is called THE WARDEN").toBeGreaterThan(-1);
    expect(waveMatches(warden, "arden")).toBe(false);
    expect(waveMatches(warden, "warden")).toBe(true);
  });

  test("every boss wave answers boss", () => {
    let checked = 0;
    for (const [i, wave] of WAVES.entries()) {
      if (!wave.boss) continue;
      expect(waveMatches(i, "boss")).toBe(true);
      checked++;
    }
    expect(checked).toBeGreaterThan(0);
  });

  test("terms are ANDed: more of them narrows rather than widens", () => {
    const i = indexOf(WAVES[0]!.name);
    expect(waveMatches(i, `${WAVES[0]!.name} nonsenseterm`)).toBe(false);
  });
});

describe("marks", () => {
  test("no mark pressed is not a filter", () => {
    for (let i = 0; i < WAVES.length; i++) expect(marksMatch(i, new Set())).toBe(true);
  });

  test("the boss mark is exactly the boss waves", () => {
    for (const [i, wave] of WAVES.entries()) {
      expect(marksMatch(i, new Set(["boss"]))).toBe(wave.boss !== undefined);
    }
  });

  test("marks are ORed: a second press widens", () => {
    const boss = new Set(
      WAVES.flatMap((_, i) => (waveMarksOn(WAVES, i).includes("boss") ? [i] : [])),
    );
    const either = WAVES.filter((_, i) => marksMatch(i, new Set(["boss", "fault"]))).length;
    expect(either).toBeGreaterThan(boss.size);
  });

  test("a boss's type is a word the field finds", () => {
    const special = WAVES.findIndex((w) => w.bossType === "special");
    expect(special, "no special boss").toBeGreaterThan(-1);
    expect(waveMatches(special, "special")).toBe(true);
    expect(waveMatches(indexOf(WAVES[0]!.name), "special")).toBe(false);
  });
});
