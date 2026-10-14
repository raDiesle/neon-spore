import { describe, expect, it } from "bun:test";
import type { BastionLayer, BastionState } from "@neon-spore/sim";
import { bastionBreath, bastionRingSway } from "../src/bastion-idle.js";

/**
 * **THE BASTION's ring and armour idle** (`bastion-idle.ts`): the ring sways
 * while it is not the shell lit and is steady a beat into being lit, where a
 * bolt stops on its front gun; the armour breathes a hair out and never in.
 */
const SCRIPT: BastionLayer[] = ["plates", "ring", "lattice", "port"];
const at = (phase: BastionState["phase"], cursor: number, phaseBeat: number) =>
  ({ phase, cursor, phaseBeat, steps: SCRIPT.map((layer) => ({ layer })) }) as BastionState;

describe("THE BASTION's ring sway", () => {
  it("rolls and nods while the armour is lit", () => {
    const seen = [0.7, 1.4, 2.6, 3.3].map((t) => bastionRingSway(at("layer", 0, 0), 5, t));
    expect(seen.some((w) => Math.abs(w.roll) > 0.02)).toBe(true);
    expect(seen.some((w) => Math.abs(w.nod) > 0.05)).toBe(true);
  });

  it("is steady a beat into the ring lit, and stays so", () => {
    for (const t of [0.7, 1.4, 2.6, 3.3]) {
      const w = bastionRingSway(at("layer", 1, 10), 11, t);
      expect(Math.abs(w.roll)).toBe(0);
      expect(Math.abs(w.nod)).toBe(0);
    }
  });
});

describe("THE BASTION's armour breath", () => {
  it("stands out a hair and never sinks in", () => {
    for (let t = 0; t < 6; t += 0.25) {
      for (let a = 0; a < Math.PI * 2; a += 0.5) {
        const b = bastionBreath(a, t);
        expect(b).toBeGreaterThanOrEqual(0);
        expect(b).toBeLessThanOrEqual(0.1 + 1e-9);
      }
    }
  });

  it("runs round the moon: slabs on opposite sides are out of step", () => {
    expect(Math.abs(bastionBreath(0, 0.75) - bastionBreath(Math.PI, 0.75))).toBeGreaterThan(0.05);
  });
});
