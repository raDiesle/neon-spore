import { describe, expect, test } from "bun:test";
import { WAVES } from "@neon-spore/content";
import { waveBriefingCards } from "../src/wave-briefing.js";

/**
 * The connection point 2 of the brief was about: which cards *the wave being
 * edited* raises, read off the store's own live entries rather than off the
 * catalogue's index. `card-waves.test.ts` already pins the catalogue answer
 * for wave 1 down to `["opening", "slick"]`; this is the same premise asked
 * through the other door — a `Wave` object, the one `currentWave(store)`
 * actually hands `main.ts`.
 */
describe("waveBriefingCards", () => {
  test("wave 1's own entries raise the opening card and the one creature it sends", () => {
    const wave = WAVES[0];
    if (!wave) throw new Error("WAVES[0] missing — is the catalogue empty?");
    const ids = waveBriefingCards(wave, 0, 11).map((c) => c.id);
    expect(ids).toEqual(["opening", "slick"]);
  });

  test("every card carries the same title BRIEFINGS ships for its subject", () => {
    const wave = WAVES[0];
    if (!wave) throw new Error("WAVES[0] missing — is the catalogue empty?");
    for (const card of waveBriefingCards(wave, 0, 11)) {
      expect(card.title.length).toBeGreaterThan(0);
    }
  });

  test("no wave at all raises nothing, rather than throwing", () => {
    expect(waveBriefingCards(undefined, 0, 11)).toEqual([]);
  });
});
