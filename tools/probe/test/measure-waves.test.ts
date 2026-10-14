import { describe, expect, it } from "bun:test";
import { WAVES } from "@neon-spore/content";
import { bossRows, measureWave, waveRows } from "../measure-waves.js";

/** `bun run waves:measure`, on two cheap waves rather than all of them. */
describe("waves:measure", () => {
  const two = WAVES.findIndex((w) => w.id === "twoColours");
  const bastion = WAVES.findIndex((w) => w.id === "theBastion");

  it("clears a wave of two colours with AUTO and calls it regular", () => {
    const m = measureWave(two);
    expect(m.clearBeat).toBeGreaterThan(0);
    const row = waveRows([m])[2] ?? "";
    expect(row).toContain("TWO COLOURS");
    expect(row).toContain("**regular**");
  });

  it("puts a boss in the boss table and nothing else", () => {
    const rows = bossRows([measureWave(two), measureWave(bastion)]);
    expect(rows).toHaveLength(3);
    expect(rows[2]).toContain("THE BASTION");
  });
});
