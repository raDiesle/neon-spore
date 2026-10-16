import { describe, expect, test } from "bun:test";
import { isRegularWave, WAVES } from "@neon-spore/content";
import { moodName, nameWaves } from "../src/compose-names.js";
import { MOODS, SPARE_WORDS } from "../src/compose-names-moods.js";

/**
 * THE NAMES THE COMPOSER MAKES UP (`src/compose-names.ts`): every one fits
 * the HUD, no two waves share one, the same list names the same way twice,
 * and no word the namer adds is one the game already means something by.
 */

const named = nameWaves(WAVES);
const regular = WAVES.flatMap((_, i) => (isRegularWave(WAVES, i) ? [i] : []));

/** Words a name must not lend a second meaning: every intro's and boss's
 * name, and the words `CLAUDE.md` and the game-words skill fix. */
const MEANT = new Set([
  ...WAVES.flatMap((w, i) => (isRegularWave(WAVES, i) ? [] : w.name.split(/[ ,]+/))),
  ...["HULL", "LOBE", "BEAT", "GUARD", "CANNON", "SHIELD", "SCAR", "TICK", "COLUMN"],
  ...["SLICK", "BULB", "POD", "MAW", "TWIN", "WARD", "PLATE", "LANE", "BOLT", "SHOT"],
]);
// The small words of FIRST STEP, CATCH AND AIM and ONE LAST CHANCE name nothing.
for (const w of ["THE", "AND", "FIRST", "ONE", "LAST"]) MEANT.delete(w);

describe("the composer's wave names", () => {
  test("every regular wave gets one that fits: at most 20 letters and four words", () => {
    const long = regular
      .map((i) => named[i]?.name ?? "")
      .filter((n) => n.length > 20 || n.split(" ").length > 4);
    expect(long).toEqual([]);
  });

  test("no two waves share a name", () => {
    const seen = new Map<string, number>();
    for (const w of named) seen.set(w.name, (seen.get(w.name) ?? 0) + 1);
    expect([...seen].filter(([, n]) => n > 1).map(([name]) => name)).toEqual([]);
  });

  test("only a regular wave is renamed, and the same list names the same way twice", () => {
    for (const [i, w] of WAVES.entries()) {
      if (!isRegularWave(WAVES, i)) expect(named[i]?.name).toBe(w.name);
    }
    expect(nameWaves(WAVES).map((w) => w.name)).toEqual(named.map((w) => w.name));
  });

  test("a wave left out of `only` keeps its name, and its name is taken", () => {
    const at = regular[0] ?? 0;
    const id = WAVES[at]?.id ?? "";
    const one = nameWaves(WAVES, new Set([id]));
    expect(one.filter((w, i) => w.name !== WAVES[i]?.name).map((w) => w.id)).toEqual(
      one[at]?.name === WAVES[at]?.name ? [] : [id],
    );
  });

  test("no word the namer adds already means something in the game", () => {
    const words = [...Object.values(MOODS).flat(), ...SPARE_WORDS]
      .flatMap((t) => t.split(" "))
      .filter((w) => w !== "#" && w !== "%" && MEANT.has(w));
    expect(words).toEqual([]);
  });

  test("a mood whose names are all taken reaches for a spare word", () => {
    const taken = new Set(MOODS.Peak.map((t) => t.replace("#", "ROCK")));
    expect(moodName("ROCK", "Peak", "x", taken)).toStartWith(`${SPARE_WORDS[0]} `);
  });
});
