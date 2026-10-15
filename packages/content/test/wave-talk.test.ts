import { describe, expect, test } from "bun:test";
import { arrivalTalk, WAVES, type Wave, waveTalk } from "../src/index.js";

/**
 * What a wave asks the pair to say out loud (`wave-talk.ts`) — the owner, 15
 * October 2026: a body one of you cannot see, or whose colour has to be told,
 * is harder than one both can read.
 */

const wave = (entries: Wave["entries"], over: Partial<Wave> = {}): Wave => ({
  id: "w",
  name: "W",
  entries,
  ...over,
});

describe("arrivalTalk", () => {
  test("a slick or a rock is one sentence: where", () => {
    expect(arrivalTalk({})).toBe(1);
    expect(arrivalTalk({ kind: "meteor" })).toBe(1);
  });

  test("a body only one of you can see costs more than one both can read", () => {
    expect(arrivalTalk({ kind: "ghost" })).toBeGreaterThan(arrivalTalk({ kind: "rind" }));
    expect(arrivalTalk({ kind: "rind" })).toBeGreaterThan(arrivalTalk({}));
  });
});

describe("waveTalk", () => {
  test("the busiest eight beats, not the whole wave", () => {
    const spread = wave([0, 8, 16, 24].map((beat) => ({ beat, col: 5, color: "red" as const })));
    const packed = wave([0, 2, 4, 6].map((beat) => ({ beat, col: 5, color: "red" as const })));
    expect(waveTalk(spread)).toBe(1);
    expect(waveTalk(packed)).toBe(4);
  });

  test("a fault adds what it costs to say", () => {
    const quiet = wave([{ beat: 0, col: 5, color: "red" }]);
    const codex = wave(quiet.entries, { faults: [{ kind: "codex" }] });
    expect((waveTalk(codex) ?? 0) - (waveTalk(quiet) ?? 0)).toBe(3);
  });

  test("a boss wave has none, and every other wave in the game has one", () => {
    for (const w of WAVES) {
      if (w.boss) expect(waveTalk(w)).toBeUndefined();
      else expect(waveTalk(w)).toBeGreaterThanOrEqual(0);
    }
  });
});
