import { describe, expect, it } from "bun:test";
import { join } from "node:path";
import { WAVES } from "@neon-spore/content";
import { resolveWaveFlag, waveNamesAt } from "../run.js";

/**
 * "A frame of the wrong wave proves nothing" — the two faults that survive now
 * that `--wave` is required and nothing derives a wave from prose: `--wave N`
 * disagreeing with the HUD by one, and an identical pair being written
 * silently. The third fault, reading a `where` field, went with the `Check:`
 * restatements the field lived in.
 */

describe("resolveWaveFlag", () => {
  it("converts the HUD's W21 to jumpToWave's 0-based 20", () => {
    expect(resolveWaveFlag("21", WAVES)).toBe(20);
  });

  it("converts wave 1 (W1) to index 0", () => {
    expect(resolveWaveFlag("1", WAVES)).toBe(0);
  });

  it("accepts a wave name, case-insensitively", () => {
    expect(resolveWaveFlag("the third shot", WAVES)).toBe(
      WAVES.findIndex((w) => w.name === "THE THIRD SHOT"),
    );
  });

  it("rejects wave 0 — the HUD never shows W0", () => {
    expect(() => resolveWaveFlag("0", WAVES)).toThrow(/start at 1/);
  });

  it("rejects a name that matches no wave", () => {
    expect(() => resolveWaveFlag("NOT A REAL WAVE", WAVES)).toThrow(/no wave/);
  });
});

describe("waveNamesAt", () => {
  it("reads today's WAVES from the working tree's own HEAD commit", async () => {
    const head = await Bun.$`git rev-parse HEAD`
      .cwd(join(import.meta.dir, "..", "..", ".."))
      .text();
    const names = await waveNamesAt(head.trim());
    expect(names.map((w) => w.name)).toEqual(WAVES.map((w) => w.name));
  });
});
