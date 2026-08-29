import { describe, expect, test } from "bun:test";
import { WAVES } from "@neon-spore/content";
import { waveOpeningStates } from "../src/wave-opening.js";

/**
 * What the note above the wave's fields says a pair will meet, read off the
 * `Wave` object `currentWave(store)` actually hands `main.ts` — so an unsaved
 * edit shows there immediately.
 *
 * It used to replay the wave's queue, pods and boss through `openBriefings` to
 * work out which catalogue cards it would raise. There is nothing left to
 * derive: a wave opens on its introduction, then on the guide written inside
 * it or on nothing.
 */
describe("waveOpeningStates", () => {
  test("wave 1 opens on its introduction and then its guide", () => {
    const wave = WAVES[0];
    if (!wave) throw new Error("WAVES[0] missing — is the wave list empty?");
    expect(waveOpeningStates(wave)).toEqual(["INTRODUCTION", "GUIDE"]);
  });

  test("a wave that introduces nothing opens on its introduction alone", () => {
    const plain = WAVES.find((w) => !w.guide);
    if (!plain) throw new Error("every wave carries a guide — the padding test would be red too");
    expect(waveOpeningStates(plain)).toEqual(["INTRODUCTION"]);
  });

  test("no wave at all opens on nothing, rather than throwing", () => {
    expect(waveOpeningStates(undefined)).toEqual([]);
  });
});
