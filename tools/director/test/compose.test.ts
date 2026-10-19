import { describe, expect, test } from "bun:test";
import { isRegularWave, WAVES, type Wave, wavePressure } from "@neon-spore/content";
import { composeBlock } from "../src/compose.js";
import { type Block, readBlock } from "../src/compose-block.js";
import { autoClears, paperFaults } from "../src/compose-check.js";
import { chooseRamp } from "../src/compose-ramp.js";
import {
  RISE,
  rampOf,
  STEPS,
  stepById,
  stepsToCompose,
  TUTORIAL_LAST_ID,
} from "../src/compose-steps.js";

/**
 * The composer (`bun run waves:compose`, `docs/spec/wave-curriculum.md` §6):
 * which block a wave opens, which steps it still needs, and that what it
 * composes passes its own checks — and the waves it already wrote into the
 * tutorial arc.
 */

function block(id: string): Block {
  const b = readBlock(WAVES, id);
  if (typeof b === "string") throw new Error(b);
  return b;
}

describe("a block, read off the list", () => {
  test("FIRST STEP opens the first, on the slick, with nothing before it", () => {
    const b = block("firstStep");
    expect([b.number, b.x, b.y, b.tutorial]).toEqual([0, "slick", undefined, true]);
  });

  test("SALVAGE's block is its one, and CATCH AND AIM is no block", () => {
    // CATCH AND AIM opened a block of its own on THE PURGE until the cargoes
    // were rejected (16 October 2026): it introduces no body or pod now.
    // SALVAGE's block comes after THE BLISTER's gestures (moved before THE
    // BASTION the same day); BULB QUEEN closes it since its review went
    // with the cut to one regular wave (19 October 2026).
    const b = block("salvage");
    expect([b.x, b.y]).toEqual(["pod", "blister"]);
    expect(typeof readBlock(WAVES, "catchAndAim")).toBe("string");
    // One written, up to BULB QUEEN: the arc's block is full.
    expect(b.existing).toBe(1);
    expect(stepsToCompose(b.x, b.existing)).toEqual([]);
  });

  test("a wave that introduces only a panel is not a block", () => {
    expect(typeof readBlock(WAVES, "theLance")).toBe("string");
  });
});

describe("the steps", () => {
  test("a block is one step, and a written regular wave stands for it", () => {
    // The owner, 19 October 2026: *only one wave without introducing
    // something new*.
    expect(stepsToCompose("bulb", 0).map((s) => s.id)).toEqual(["R4"]);
    expect(stepsToCompose("bulb", 1)).toEqual([]);
    expect(stepsToCompose("gyre", 1)).toHaveLength(0);
  });

  test("only the slick, the bulb and the rock climb the ladder; the rest are mixed", () => {
    // The owner, 19 October 2026: the positioning rule *only makes sense for
    // "bulb", "slick" and "meteor"*.
    for (const x of ["slick", "bulb", "meteor", "meteorFast"]) {
      expect(stepsToCompose(x, 0).map((s) => s.mix)).toEqual(["xy"]);
    }
    for (const x of ["gyre", "morsel", "pod"]) {
      expect(stepsToCompose(x, 0).map((s) => s.mix)).toEqual(["xz"]);
    }
  });

  test("a rise is at most two over the wave before it, and R5 dips", () => {
    expect(rampOf(stepById("R2"), 4, undefined)).toEqual([4 + RISE[0], 4 + RISE[1]]);
    const [lo, hi] = rampOf(stepById("R5"), 8, undefined);
    expect(hi).toBeLessThan(8);
    expect(lo).toBeGreaterThan(0);
  });

  test("the ramp is chosen whole, closest to an even rise", () => {
    const steps = [stepById("R1"), stepById("R2"), stepById("R3")];
    expect(
      chooseRamp(
        steps,
        [
          [2, 3],
          [3, 5, 9],
          [4, 6],
        ],
        2,
      ),
    ).toEqual([2, 3, 4]);
    // Nothing within two of R2's only value: R3 is where it breaks.
    expect(chooseRamp(steps, [[2], [3], [9]], 2)).toBe(2);
  });
});

describe("a composed block", () => {
  test("is the same every time, passes its checks, and rises step on step", () => {
    // As the block stood before its waves were written: none of its own, and
    // TORCH next.
    const torch = WAVES.findIndex((w) => w.id === "torch");
    const b = { ...block("theRock"), existing: 0, insertAt: torch };
    const steps = stepsToCompose("meteor", 0);
    const once = composeBlock(WAVES, b, "theRock");
    expect(composeBlock(WAVES, b, "theRock")).toEqual(once);
    expect(once.map((c) => c.step.id)).toEqual(steps.map((s) => s.id));
    let before = 0;
    for (const c of once) {
      if (!c.wave) throw new Error(c.faults.join("; "));
      expect(paperFaults(c.wave, c.step, b)).toEqual([]);
      expect(autoClears(c.wave, b)).toBeGreaterThan(0);
      expect(c.pressure ?? 0).toBeGreaterThan(before);
      before = c.pressure ?? 0;
    }
  });

  test("never keeps a mine beside a soundbox, which `tap-waves.test.ts` refuses", () => {
    // BLISTERS AGAIN, as first drawn on 15 October 2026, recalled a beatbox
    // into THE MINE's stretch and passed every check but the game's own.
    const b = block("theBlister");
    const step = stepById("R1");
    const wave = {
      id: "clash",
      name: "CLASH",
      entries: [
        { beat: 0, col: 2, kind: "mine" as const, color: null },
        { beat: 8, col: 6, kind: "beatbox" as const, color: null },
      ],
    };
    expect(paperFaults(wave, step, b)).toContain("a mine and a soundbox on one wave");
  });

  test("names every step in the table it was read from", () => {
    expect(STEPS.map((s) => s.id)).toEqual(["R1", "R2", "R3", "R4", "R5", "R6", "R7", "R8"]);
  });
});

describe("the tutorial arc's composed waves", () => {
  // Up to FINALE: the arc's short blocks only rise. A full block dips at R5.
  const last = WAVES.findIndex((w) => w.id === TUTORIAL_LAST_ID);
  // Known by id, as `floorOf` knows them: the intro's id and a step's name.
  // The flag that folds a wave in the director's list is not it — the arc's
  // written waves fold too.
  const ids = new Set(WAVES.map((w) => w.id));
  const isComposed = (w: Wave | undefined): boolean =>
    w !== undefined &&
    STEPS.some((s) => w.id.endsWith(s.name) && ids.has(w.id.slice(0, -s.name.length)));
  const composed = WAVES.map((w, i) => ({ w, i })).filter(
    ({ w, i }) => isComposed(w) && !w.boss && i <= last,
  );

  test("are there, regular, and each block's rise on the one before it", () => {
    expect(composed.length).toBeGreaterThanOrEqual(12);
    for (const { w, i } of composed) {
      expect(isRegularWave(WAVES, i), w.id).toBe(true);
      const prev = WAVES[i - 1];
      if (prev && isComposed(prev))
        expect(wavePressure(w) ?? 0, w.id).toBeGreaterThan(wavePressure(prev) ?? 0);
    }
  });
});
