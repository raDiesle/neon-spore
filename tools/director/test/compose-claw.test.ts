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
      expect(Math.min(...pods.map((p) => p.beat))).toBeLessThan(
        Math.min(...entries.map((e) => e.beat)),
      );
      // It never ends on a pod, and only the kinds the step allows cross.
      expect(Math.max(...pods.map((p) => p.beat))).toBeLessThan(
        Math.max(...entries.map((e) => e.beat)),
      );
      for (const p of pods) expect(CLAW_STEPS[id].kinds).toContain(p.kind);
      for (const e of entries) expect(e.kind?.startsWith("meteor")).toBe(true);
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
