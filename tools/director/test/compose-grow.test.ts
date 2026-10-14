import { describe, expect, test } from "bun:test";
import { isRegularWave, WAVES, wavePressure } from "@neon-spore/content";
import { composeBlock } from "../src/compose.js";
import { type Block, readBlock } from "../src/compose-block.js";
import {
  BLOCKS_PER_NOTCH,
  grownStep,
  notchOf,
  TWINS_EVERY,
  TWINS_FROM,
} from "../src/compose-grow.js";
import { START_RISE, stepById } from "../src/compose-steps.js";

/**
 * A rise across blocks (the owner, 14 October 2026): each block's gentlest
 * wave aims a little above the block before's, and the steps grow wider, then
 * mixed, so that it can — gaps and counts as the table says.
 */

function block(id: string): Block {
  const b = readBlock(WAVES, id);
  if (typeof b === "string") throw new Error(b);
  return b;
}

describe("a step, grown", () => {
  test("is the table's own in the tutorial arc and the first blocks after it", () => {
    expect(notchOf(-1)).toBe(0);
    expect(notchOf(BLOCKS_PER_NOTCH - 1)).toBe(0);
    expect(grownStep(stepById("R1"), 0)).toEqual(stepById("R1"));
  });

  test("widens a column each side a notch, then brings older things in", () => {
    const r1 = stepById("R1");
    expect(grownStep(r1, 1).cols).toEqual([3, 7]);
    expect([grownStep(r1, 4).cols, grownStep(r1, 4).mix]).toEqual([[0, 10], "x"]);
    expect(grownStep(r1, 5).mix).toBe("xb");
    expect(grownStep(r1, 7).mix).toBe("xyz");
    expect(grownStep(r1, 30).mix).toBe("xyz");
  });

  test("keeps its gaps and its span, and R7's lever", () => {
    for (const id of ["R1", "R5", "R7", "R8"] as const) {
      const [was, now] = [stepById(id), grownStep(stepById(id), 12)];
      expect([now.gaps, now.span]).toEqual([was.gaps, was.span]);
    }
    expect(grownStep(stepById("R7"), 12).mix).toBe("xyLever");
    // The gentler half takes no twins, so its counts never move.
    expect(grownStep(stepById("R1"), 12).arrivals).toEqual(stepById("R1").arrivals);
  });

  test("lands more twins in the harder half from the plateau on", () => {
    const r8 = stepById("R8");
    const r4 = stepById("R4");
    expect(grownStep(r4, TWINS_FROM - 1).twins).toBeUndefined();
    expect(grownStep(r4, TWINS_FROM).twins).toBe(1);
    expect(grownStep(r4, TWINS_FROM + TWINS_EVERY).twins).toBe(2);
    // R7 and R8 start with one of their own.
    expect(grownStep(stepById("R7"), TWINS_FROM).twins).toBe(2);
    expect(grownStep(r8, TWINS_FROM).twins).toBe(2);
    expect(grownStep(r8, 99).twins).toBe(3);
    // A twin is an arrival of its own: a third more for each.
    expect(grownStep(r4, TWINS_FROM).arrivals).toEqual([8, 11]);
  });
});

describe("where a block's first wave aims", () => {
  test("a block counts from the tutorial's end", () => {
    expect(block("firstStep").sinceTutorial).toBe(-1);
    expect(block("theLure").sinceTutorial).toBe(0);
  });

  test("its floor is the gentlest composed regular wave of the block before", () => {
    const [from, to] = [block("catchAndAim").intro, block("theLure").intro];
    const regular = WAVES.slice(from + 1, to).filter(
      (w, k) => w.variant && isRegularWave(WAVES, from + 1 + k),
    );
    expect(block("theLure").floor).toBe(Math.min(...regular.map((w) => wavePressure(w) ?? 0)));
  });

  test("a hand-made wave does not set it: it stands for a block's last steps", () => {
    // THE COIL's one regular wave is hand-made, and its block has no other.
    expect(block("theCrossing").floor).toBe(block("theCoil").floor);
  });

  test("a composed block's first wave is not below that floor and a rise", () => {
    const b = block("theLure");
    const first = composeBlock(WAVES, { ...b, floor: 3.5 }, "theLure")[0];
    expect(first?.pressure ?? 0).toBeGreaterThanOrEqual(3.5 + START_RISE);
  });
});

/**
 * Blocks the composer once could not fill (`docs/queue.md`, 14 October 2026):
 * THE CLASP's peak could not sit over R7's twin, and THE FENCE's R7 doubled a
 * fence, which AUTO never clears. Composed dry, as `waves:compose` would.
 */
describe("blocks that used to stall", () => {
  for (const id of ["theClasp", "theFence"]) {
    test(`${id} composes all eight steps`, () => {
      const out = composeBlock(WAVES, block(id), id);
      expect(out.map((c) => c.faults.join("; ") || c.step.id)).toEqual([
        "R1",
        "R2",
        "R3",
        "R4",
        "R5",
        "R6",
        "R7",
        "R8",
      ]);
    }, 120_000);
  }
});
