import { describe, expect, test } from "bun:test";
import { guideSteps, WAVES } from "@neon-spore/content";
import { waveOpeningStates } from "../src/wave-opening.js";

/**
 * What the note above the wave's fields says a pair will meet, read off the
 * `Wave` object `currentWave(store)` actually hands `main.ts` — so an unsaved
 * edit shows there immediately.
 *
 * It used to replay the wave's queue, pods and boss through `openBriefings` to
 * work out which catalogue cards it would raise. There is nothing left to
 * derive: a wave opens on the pages of the guide written inside it, ending on
 * the one that carries its own name and the ready button.
 */
describe("waveOpeningStates", () => {
  test("a guided wave opens on its guide's pages and ends on its own name", () => {
    const wave = WAVES[0];
    if (!wave) throw new Error("WAVES[0] missing — is the wave list empty?");
    const states = waveOpeningStates(wave);
    expect(states.length).toBe(guideSteps(wave.guide) + 1);
    expect(states[0]).toBe("GUIDE 1");
    expect(states[states.length - 1]).toBe("INTRODUCTION + READY");
  });

  test("a guide made of prose is read in pages too, not in a card", () => {
    const prose = WAVES.find((w) => w.guide && !w.guide.scene);
    if (!prose) throw new Error("no wave carries a guide made of prose");
    expect(waveOpeningStates(prose)).toEqual(["GUIDE 1", "GUIDE 2", "INTRODUCTION + READY"]);
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
