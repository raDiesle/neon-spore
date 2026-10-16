import { describe, expect, test } from "bun:test";
import { WAVES } from "@neon-spore/content";
import { createRng } from "@neon-spore/sim";
import { CLAW_STEPS, clawStep, placeClaw } from "../src/compose-claw.js";
import { gentlestBefore } from "../src/compose-starts.js";
import { STEPS } from "../src/compose-steps.js";

/**
 * **THE CLAW's block is placed as pods and the rocks they answer**
 * (`compose-claw.ts`): the panel has no shield and no colours, so every rock
 * comes behind a pod the arm can take, and the eight are played on the claw.
 */

const claw = WAVES.findIndex((w) => w.id === "theClaw");
const eight = WAVES.filter((w) => w.variant && w.id.startsWith("theClaw"));

describe("THE CLAW's block", () => {
  test.each(STEPS.map((s) => s.id))("%s: a pod first, every group's rocks behind it", (id) => {
    const step = clawStep(STEPS.find((s) => s.id === id) as never);
    const rng = createRng(7);
    for (let draw = 0; draw < 40; draw++) {
      const { entries, pods = [] } = placeClaw(step, rng);
      expect(pods.length).toBeGreaterThanOrEqual(1);
      // Pods and nothing else: the panel has no shield, and nothing answers a
      // rock since the cargoes went (`compose-claw.ts`).
      expect(entries).toEqual([]);
      for (const p of pods) expect(p.kind).toBe("pod");
      expect(pods.length).toBeLessThanOrEqual(CLAW_STEPS[id].groups[1]);
    }
  });

  test("its eight are on THE CLAW's panel, right after it", () => {
    expect(eight.map((w) => w.controls)).toEqual(Array(8).fill("claw"));
    expect(WAVES.slice(claw + 1, claw + 9)).toEqual(eight);
  });

  test("a block after it aims above the block before, not above a claw wave", () => {
    expect(gentlestBefore(WAVES, claw + 9)).toBe(gentlestBefore(WAVES, claw));
  });
});
