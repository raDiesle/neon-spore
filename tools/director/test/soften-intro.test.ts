import { describe, expect, test } from "bun:test";
import { WAVES, type Wave, wavePressure } from "@neon-spore/content";
import { hardHeads, soften, softened } from "../src/soften-intro.js";

/**
 * A GROUP'S HEAD IS NO HARDER THAN ITS GENTLEST CHILD (`soften-intro.ts`, the
 * owner, 17 October 2026). A block composed again, or a head written harder
 * in the director, turns the first test red; `bun run waves:soften --write`
 * is the fix.
 */

/** Heads no softening reaches, each with its reason. None today: CATCH AND
 * AIM stood here, its red and cyan in turn harder than AIM RISING's one
 * colour, until a block became one regular wave and its one was LONG AIM
 * ROAD (19 October 2026). */
const STAYS = new Set<string>();

describe("the shipped list", () => {
  test("no head is harder than its gentlest child", () => {
    const hard = hardHeads(WAVES)
      .filter(({ i }) => !STAYS.has(WAVES[i]?.id ?? ""))
      .map(({ i, head, child }) => `${i + 1} ${WAVES[i]?.name}: ${head} over ${child}`);
    expect(hard).toEqual([]);
  });

  test("every head that stays is still one, and still harder", () => {
    const hard = new Set(hardHeads(WAVES).map(({ i }) => WAVES[i]?.id));
    for (const id of STAYS) expect(hard.has(id)).toBe(true);
  });
});

const wave = (over: Partial<Wave>): Wave => ({ id: "w", name: "W", entries: [], ...over });

describe("softening a wave", () => {
  const climax = wave({
    entries: [
      { beat: 0, col: 5, color: "red" },
      { beat: 8, col: 9, color: "red" },
      { beat: 10, col: 1, color: "red" },
      { beat: 11, col: 5, color: "red" },
    ],
  });

  test("keeps every arrival, its colour and its order", () => {
    const next = softened(climax, 0.5, 8);
    expect(next.entries.map((e) => e.color)).toEqual(["red", "red", "red", "red"]);
    expect(next.entries.map((e) => e.beat)).toEqual([0, 8, 16, 24]);
    expect(next.entries.map((e) => e.col)).toEqual([5, 7, 3, 5]);
  });

  test("moves a fault and a pod with the arrivals around them", () => {
    const next = softened(
      wave({
        entries: climax.entries,
        faults: [{ kind: "steer", at: 9, beats: 3 }],
        pods: [{ beat: 10, col: 9, row: 3, kind: "pod" }],
      }),
      1,
      8,
    );
    // It enters at 9, behind the arrival at 8, which stays; it ends at 12,
    // behind the one at 11, which goes to 24 — so it ends at 25.
    expect(next.faults).toEqual([{ kind: "steer", at: 9, beats: 16 }]);
    expect(next.pods).toEqual([{ beat: 16, col: 9, row: 3, kind: "pod" }]);
  });

  test("reaches its target and moves the wave as little as that takes", () => {
    const target = 2;
    const next = soften(climax, target);
    expect(next).toBeDefined();
    expect(wavePressure(next as Wave)).toBeLessThanOrEqual(target);
    // Spreading alone would do it; nothing is pulled in that need not be.
    expect(wavePressure(climax)).toBeGreaterThan(target);
  });

  test("is refused a softening `accept` turns down, and takes the next", () => {
    const first = soften(climax, 2);
    const next = soften(climax, 2, (w) => JSON.stringify(w) !== JSON.stringify(first));
    expect(next).toBeDefined();
    expect(JSON.stringify(next)).not.toBe(JSON.stringify(first));
  });
});
