import { describe, expect, test } from "bun:test";
import { controlSet, WAVES, type Wave } from "@neon-spore/content";
import { filterTerms, waveHaystack, waveMatches } from "../src/rail-filter.js";
import { brushOf } from "../src/state.js";

/**
 * The wave list's filter, tested against the shipped campaign rather than
 * against waves invented here — the whole claim the field makes is that typing
 * the name of a creature finds the waves that creature actually arrives in,
 * and a fixture would only prove the matcher matches itself.
 *
 * The field, the count line and the dimmed selected row are a browser's, and
 * are checked in the markup below and by eye.
 */

/** Every word a wave writes about itself, which a term matches as readily as
 * it matches what the wave sends. */
function prose(wave: Wave): string {
  const g = wave.guide;
  return `${wave.name} ${wave.sentence} ${g ? `${g.both} ${g.p1} ${g.p2}` : ""}`.toLowerCase();
}

/** The index of a wave by name, so a test can say what it means. */
function indexOf(name: string): number {
  const i = WAVES.findIndex((w) => w.name === name);
  expect(i, `no wave named ${name}`).toBeGreaterThan(-1);
  return i;
}

describe("filterTerms", () => {
  test("an empty or blank field asks nothing", () => {
    expect(filterTerms("")).toEqual([]);
    expect(filterTerms("   ")).toEqual([]);
  });

  test("terms are lowercased and split on any run of whitespace", () => {
    expect(filterTerms("  SLICK   ward ")).toEqual(["slick", "ward"]);
  });
});

describe("a wave's haystack", () => {
  test("carries its number, name and sentence", () => {
    const i = indexOf(WAVES[0]!.name);
    const hay = waveHaystack(WAVES, i);
    expect(hay).toContain(WAVES[0]!.name.toLowerCase());
    expect(hay).toContain(WAVES[0]!.sentence.toLowerCase());
    expect(hay).toContain(String(i + 1));
  });

  test("carries the name of every creature that arrives in it", () => {
    // Whatever a wave sends, it can be found by the name of the brush that
    // would have placed it — which is the word on the palette's button, and
    // the only vocabulary a wave author already has.
    let checked = 0;
    for (const [i, wave] of WAVES.entries()) {
      if (wave.entries.length === 0) continue;
      const hay = waveHaystack(WAVES, i);
      for (const entry of wave.entries) expect(hay, wave.name).toContain(brushOf(entry));
      checked++;
    }
    expect(checked).toBeGreaterThan(0);
  });

  test("carries the panel the wave is played on, by name", () => {
    for (const [i, wave] of WAVES.entries()) {
      const set = controlSet(wave.controls);
      expect(waveHaystack(WAVES, i), wave.name).toContain(set.name.toLowerCase());
    }
  });

  test("is empty for an index no wave is at, rather than throwing", () => {
    expect(waveHaystack(WAVES, WAVES.length)).toBe("");
  });
});

describe("waveMatches", () => {
  test("an empty query is not a filter — every wave answers it", () => {
    for (let i = 0; i < WAVES.length; i++) expect(waveMatches(WAVES, i, "  ")).toBe(true);
  });

  test("`boss` finds exactly the waves that carry one", () => {
    const found = WAVES.map((_, i) => waveMatches(WAVES, i, "boss"));
    for (const [i, wave] of WAVES.entries()) {
      if (wave.boss) expect(found[i], `${wave.name} carries a boss`).toBe(true);
    }
    expect(found.filter(Boolean).length).toBeGreaterThan(0);
  });

  test("`guide` finds exactly the waves that carry one", () => {
    for (const [i, wave] of WAVES.entries()) {
      if (wave.guide) expect(waveMatches(WAVES, i, "guide"), wave.name).toBe(true);
    }
  });

  test("a creature's name finds the waves it arrives in", () => {
    // Both the brush and the word on its button: a rock is placed with the one
    // METEOR brush, and neither name is the one a wave author has to have
    // guessed. Not an equality — a term is matched against the wave's prose
    // too, so `rock` also finds a wave whose sentence says "two rocks", which
    // is the filter doing its job rather than a leak.
    let checked = 0;
    for (const [i, wave] of WAVES.entries()) {
      if (!wave.entries.some((e) => brushOf(e) === "rock")) continue;
      expect(waveMatches(WAVES, i, "rock"), wave.name).toBe(true);
      expect(waveMatches(WAVES, i, "meteor"), wave.name).toBe(true);
      checked++;
    }
    expect(checked).toBeGreaterThan(0);
  });

  test("and does not find the waves it does not arrive in", () => {
    // Skipping the waves whose own prose says the word — a guide that tells
    // the pair to "load the colour burning through the shell" is a wave an
    // author looking for shells wants back, and finding it is the filter
    // reading the wave rather than leaking through it.
    let checked = 0;
    for (const [i, wave] of WAVES.entries()) {
      if (wave.entries.some((e) => brushOf(e) === "shell")) continue;
      if (prose(wave).includes("shell")) continue;
      expect(waveMatches(WAVES, i, "shell"), wave.name).toBe(false);
      checked++;
    }
    expect(checked).toBeGreaterThan(0);
  });

  test("a power-up's name finds the waves that hang one", () => {
    const withPods = WAVES.map((w) => (w.pods ?? []).length > 0);
    const found = WAVES.map((_, i) => waveMatches(WAVES, i, "pod"));
    expect(found).toEqual(withPods);
  });

  test("several terms all have to match", () => {
    const nonsense = WAVES.map((_, i) => waveMatches(WAVES, i, "boss zzzznothing"));
    expect(nonsense.some(Boolean)).toBe(false);
  });

  test("a term nothing carries matches nothing rather than everything", () => {
    for (let i = 0; i < WAVES.length; i++) {
      expect(waveMatches(WAVES, i, "zzzznothing")).toBe(false);
    }
  });

  test("a term matches from the start of a word, never from inside one", () => {
    // The failure this rule exists for: eight waves' guides say *toward*, and
    // a plain substring made every one of them an answer to `ward`.
    for (const [i, wave] of WAVES.entries()) {
      if (!prose(wave).includes("toward")) continue;
      if ((wave.pods ?? []).some((p) => p.kind === "ward")) continue;
      if (prose(wave).includes(" ward")) continue;
      expect(waveMatches(WAVES, i, "ward"), wave.name).toBe(false);
    }
  });

  test("but a prefix of a word still matches it — `war` finds THE WARDEN", () => {
    const warden = WAVES.findIndex((w) => w.name === "THE WARDEN");
    expect(warden).toBeGreaterThan(-1);
    expect(waveMatches(WAVES, warden, "war")).toBe(true);
  });
});

const html = await Bun.file(Bun.fileURLToPath(new URL("../index.html", import.meta.url))).text();

describe("the filter is one field above the list, in the real markup", () => {
  test("the field and its count line are there, and the field comes first", () => {
    expect(html).toContain('id="waveFilter"');
    expect(html.indexOf('id="waveFilter"')).toBeLessThan(html.indexOf('id="waveList"'));
    expect(html.indexOf('id="waveFilterNote"')).toBeLessThan(html.indexOf('id="waveList"'));
  });

  test("nothing beside the list: the WAVES column spends no width on it", () => {
    // The rule this file exists to keep. A chip rail, a second column or a
    // dropdown beside the field would each take room from the wave names,
    // which is the one thing the 210px track is for.
    const start = html.indexOf('id="waveFilter"');
    const section = html.slice(start, html.indexOf('id="waveList"'));
    expect(section).not.toContain("<select");
    expect(section).not.toContain("<button");
  });
});
