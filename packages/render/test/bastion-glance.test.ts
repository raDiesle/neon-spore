import { describe, expect, it } from "bun:test";
import type { BastionLayer, BastionState } from "@neon-spore/sim";
import { bastionGlanceHush } from "../src/bastion-glance.js";

/**
 * **THE BASTION's sphere steadies while its own shell is lit**
 * (`bastion-glance.ts`): the cage's nodes and the hull's port are judged with
 * no clock, so the turn is gone by the second beat of a lit lattice or port
 * and back by the second beat after it; the armour and the ring never hush it.
 */
const SCRIPT: BastionLayer[] = ["plates", "ring", "lattice", "port"];
const at = (phase: BastionState["phase"], cursor: number, phaseBeat: number) =>
  ({ phase, cursor, phaseBeat, steps: SCRIPT.map((layer) => ({ layer })) }) as BastionState;

describe("THE BASTION's glance hush", () => {
  it("is gone a beat into a lit lattice or port, and stays gone", () => {
    for (const cursor of [2, 3]) {
      expect(bastionGlanceHush(at("layer", cursor, 10), 10)).toBe(1);
      expect(bastionGlanceHush(at("layer", cursor, 10), 10.5)).toBeCloseTo(0.5, 6);
      for (const t of [11, 14, 40]) expect(bastionGlanceHush(at("layer", cursor, 10), t)).toBe(0);
    }
  });

  it("never hushes for the armour or the ring", () => {
    for (const cursor of [0, 1]) {
      for (const t of [10, 10.5, 30]) expect(bastionGlanceHush(at("layer", cursor, 10), t)).toBe(1);
    }
    expect(bastionGlanceHush(at("enter", 0, 0), 0)).toBe(1);
    // The ring flung off: the lattice is next, but it is not lit yet.
    expect(bastionGlanceHush(at("shed", 2, 20), 20)).toBe(1);
  });

  it("comes back over the first beat after its own shell", () => {
    expect(bastionGlanceHush(at("shed", 3, 20), 20)).toBe(0);
    expect(bastionGlanceHush(at("shed", 3, 20), 20.25)).toBeCloseTo(0.25, 6);
    expect(bastionGlanceHush(at("regrow", 2, 20), 20)).toBe(0);
    expect(bastionGlanceHush(at("regrow", 2, 20), 23)).toBe(1);
  });
});
