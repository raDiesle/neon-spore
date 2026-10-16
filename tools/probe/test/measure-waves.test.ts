import { describe, expect, it } from "bun:test";
import { WAVES } from "@neon-spore/content";
import { measureWave } from "../measure-waves.js";
import { bossRows, summaryRows, waveRows } from "../measure-waves-page.js";

/** `bun run waves:measure`, on two cheap waves rather than all of them. */
describe("waves:measure", () => {
  const two = WAVES.findIndex((w) => w.id === "twoColours");
  const bastion = WAVES.findIndex((w) => w.id === "theBastion");

  it("clears a wave of two colours with AUTO and calls it regular", () => {
    const m = measureWave(two);
    expect(m.clearBeat).toBeGreaterThan(0);
    const row = waveRows([m])[2] ?? "";
    expect(row).toContain(WAVES[two]?.name ?? "—");
    expect(row).toContain("**regular**");
  });

  it("puts a boss in the boss table and nothing else", () => {
    const rows = bossRows([measureWave(two), measureWave(bastion)]);
    expect(rows).toHaveLength(3);
    expect(rows[2]).toContain("THE BASTION");
  });

  it("gives a row its block, AUTO's seconds and a pair's, each in its own column", () => {
    const row = waveRows([measureWave(two)])[2] ?? "";
    const cells = row.split("|").map((c) => c.trim());
    expect(cells[4]).toBe("CYAN");
    const [beats, s, pair] = [Number(cells[9]), Number(cells[10]), Number(cells[11])];
    expect(beats).toBeGreaterThan(0);
    expect(pair).toBe(s * 2);
  });

  it("sums each kind in the whole-game table", () => {
    const rows = summaryRows([measureWave(two), measureWave(bastion)]);
    expect(rows).toHaveLength(6);
    expect(rows[2]).toContain("| regular | 1 |");
    expect(rows[4]).toContain("| boss | 1 |");
    expect(rows[5]).toContain("| every wave | 2 |");
  });
});
