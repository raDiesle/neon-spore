import { describe, expect, test } from "bun:test";
import { isRegularWave, WAVES, type Wave, wavePressure } from "@neon-spore/content";
import { composeBlock, composeBlockAt } from "../src/compose.js";
import { type Block, leadingBlock, readBlock } from "../src/compose-block.js";
import {
  BLOCKS_PER_NOTCH,
  grownStep,
  notchOf,
  TWINS_EVERY,
  TWINS_FROM,
} from "../src/compose-grow.js";
import { chooseRamp } from "../src/compose-ramp.js";
import { BLOCK_STEPS, START_RISE, stepById, stepsToCompose } from "../src/compose-steps.js";

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

/** The list as it stood before a block's regular waves were written, and
 * the block read off it. */
function unwritten(id: string): { waves: Wave[]; b: Block } {
  const waves = WAVES.filter((w) => !(w.variant && w.id.startsWith(id)));
  const b = readBlock(waves, id);
  if (typeof b === "string") throw new Error(b);
  return { waves, b };
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
    // THE HUSK is the first body after the arc, the owner's pick
    // (`FIRST_AFTER_ARC`, `curriculum-order.ts`); THE MORSEL and THE SEEDER
    // are the bodies after it, then THE LANCE, a lesson, and THE GLUTTON and
    // THE CROSSING the bodies after.
    expect(block("theHusk").sinceTutorial).toBe(0);
    expect(block("theMorsel").sinceTutorial).toBe(1);
    expect(block("theSeeder").sinceTutorial).toBe(2);
    expect(block("theGlutton").sinceTutorial).toBe(3);
    expect(block("theCrossing").sinceTutorial).toBe(4);
  });

  test("its floor is the gentlest composed regular wave of the block before", () => {
    const [from, to] = [block("theGlutton").intro, block("theCrossing").intro];
    // THE GLUTTON's block is the one before THE CROSSING's since 16 October
    // 2026, when it came in after THE LANCE.
    const regular = WAVES.slice(from + 1, to).filter(
      (w, k) => w.variant && w.id.startsWith("theGlutton") && isRegularWave(WAVES, from + 1 + k),
    );
    expect(block("theCrossing").floor).toBe(Math.min(...regular.map((w) => wavePressure(w) ?? 0)));
  });

  test("a hand-made wave does not set it: it stands for a block's last steps", () => {
    // THE COIL's one regular wave is hand-made, and its block, before its
    // own were composed, had no other.
    const { waves } = unwritten("theCoil");
    const read = (id: string) => readBlock(waves, id) as Block;
    expect(read("theLure").floor).toBe(read("theCoil").floor);
  });

  test("its first step lands at or above the aim where anything there fits", () => {
    // Pressures come in tenths with gaps: 8.8 asked, 8.7 and 8.9 in reach.
    // The tie went to 8.7, the next floor was 8.7 again, and every review
    // block from the thirteenth started there.
    const r1 = [stepById("R1")];
    expect(chooseRamp(r1, [[8.7, 8.9]], 8.6 + START_RISE + START_RISE)).toEqual([8.9]);
    // A floor and a rise added in floating point are a hair off a tenth.
    expect(chooseRamp(r1, [[8.7, 8.9]], 8.6 + START_RISE)).toEqual([8.7]);
    // Nothing at or above it: the nearest below, rather than no block.
    expect(chooseRamp(r1, [[8.5, 8.7]], 8.8)).toEqual([8.7]);
  });

  test("a composed block's first wave is not below that floor and a rise", () => {
    const { waves, b } = unwritten("theLure");
    const first = composeBlock(waves, { ...b, floor: 3.5 }, "theLure")[0];
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
    test(`${id} composes all five steps`, () => {
      const { waves, b } = unwritten(id);
      const out = composeBlock(waves, b, id);
      expect(out.map((c) => c.faults.join("; ") || c.step.id)).toEqual([...BLOCK_STEPS]);
    }, 120_000);
  }
});

/**
 * THE COIL's block (`docs/queue.md`, 15 October 2026): its composed waves
 * must fit under the written one, THE TWITCH at 8, or — when four steps
 * cannot climb under it in small rises — follow it, the written wave leading
 * (`leadingBlock`). Either way the composer draws again rather than stopping.
 */
test("THE COIL composes its four steps under its written wave, or after it", () => {
  const { waves, b } = unwritten("theCoil");
  const { block: used, composed } = composeBlockAt(waves, b, "theCoil");
  const steps = used.leads ? BLOCK_STEPS.slice(1) : BLOCK_STEPS.slice(0, -1);
  expect(composed.map((c) => c.faults.join("; ") || c.step.id)).toEqual(steps);
  const twitch = wavePressure(waves.find((w) => w.id === "theTwitch") as Wave) ?? 0;
  if (used.leads) expect(composed[0]?.pressure ?? 0).toBeGreaterThan(twitch);
  else expect(composed.at(-1)?.pressure ?? 99).toBeLessThanOrEqual(twitch);
}, 300_000);

test("a block's written waves can lead: the composed ones go after them", () => {
  const { waves, b } = unwritten("theCoil");
  const lead = leadingBlock(waves, b);
  const twitch = waves.findIndex((w) => w.id === "theTwitch");
  expect([lead?.leads, lead?.insertAt, lead?.after]).toEqual([
    true,
    twitch + 1,
    wavePressure(waves[twitch] as Wave),
  ]);
  // Then they are the first steps, and the composed ones the rest.
  expect(stepsToCompose(false, 1, true)[0]?.id).toBe("R3");
  const count = unwritten("theCount");
  expect(leadingBlock(count.waves, count.b)).toBeUndefined();
});
