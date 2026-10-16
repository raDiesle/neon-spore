import { describe, expect, test } from "bun:test";
import { WAVES } from "@neon-spore/content";
import { createRng } from "@neon-spore/sim";
import { CLAW_STEPS, clawPressure, clawStep, placeClaw } from "../src/compose-claw.js";
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

  test("a claw draw's pressure rises with its pods, and dips at R5", () => {
    // Pods alone scored 0 under `wavePressure`, so no step could rise and
    // `waves:order` stopped at THE CLAW (`docs/queue.md`, 16 October 2026).
    const median = (id: string) => {
      const step = clawStep(STEPS.find((s) => s.id === id) as never);
      const rng = createRng(7);
      const all = Array.from({ length: 101 }, () => clawPressure(placeClaw(step, rng)));
      return all.sort((a, b) => a - b)[50] ?? 0;
    };
    const [r1, r2, r3, r4, r5, r6, r7, r8] = STEPS.map((s) => median(s.id));
    for (const [lo, hi] of [
      [r1, r2],
      [r2, r3],
      [r3, r4],
      [r5, r4],
      [r5, r6],
      [r6, r7],
      [r7, r8],
    ])
      expect(lo as number).toBeLessThan(hi as number);
  });

  test("more pods, a switch of edge, a quick crossing and a nearer pod each cost more", () => {
    const pod = (beat: number, col: number, speed?: number) => ({
      beat,
      col,
      row: 4,
      kind: "pod" as const,
      ...(speed ? { speed } : {}),
    });
    const two = clawPressure({ pods: [pod(0, 0), pod(12, 0)] });
    expect(clawPressure({ pods: [pod(0, 0), pod(12, 0), pod(24, 0)] })).toBeGreaterThan(two);
    expect(clawPressure({ pods: [pod(0, 0), pod(12, 10)] })).toBeGreaterThan(two);
    expect(clawPressure({ pods: [pod(0, 0), pod(12, 0, 3)] })).toBeGreaterThan(two);
    expect(clawPressure({ pods: [pod(0, 0), pod(8, 0)] })).toBeGreaterThan(two);
  });
});
