import { describe, expect, it } from "bun:test";
import { join } from "node:path";
import { WAVES } from "@neon-spore/content";
import { itCosts } from "../../test/figure.js";
import { resolveWaveFlag, waveNamesAt, waveNamesHere } from "../wave.js";

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
    expect(resolveWaveFlag("the shell", WAVES)).toBe(
      WAVES.findIndex((w) => w.name === "THE SHELL"),
    );
  });

  it("rejects wave 0 — the HUD never shows W0", () => {
    expect(() => resolveWaveFlag("0", WAVES)).toThrow(/start at 1/);
  });

  it("rejects a name that matches no wave", () => {
    expect(() => resolveWaveFlag("NOT A REAL WAVE", WAVES)).toThrow(/no wave/);
  });
});

/**
 * A checkout in a scratch worktree, the workspace's links and an import, which
 * is what `waveNamesAt` is — scaled to the load by `itCosts`
 * (`tools/test/figure.ts`), since checking out is git's work and slows as git
 * does. It timed out at bun's five seconds on four landings on 10 September
 * 2026, when it still ran `bun install`, and was given a flat minute; on 30
 * September it took 44 s alone under three lanes' checks, 18 s of it deleting
 * the `node_modules` the install had made. Linking the workspace instead
 * (`linkWorkspaces`), it took 2363 to 3182 ms over four runs at a load
 * average of sixteen to thirty, at a slowdown of one. So 1200.
 */
const SCRATCH_TREE_MS = 1200;

describe("waveNamesAt", () => {
  itCosts(
    SCRATCH_TREE_MS,
    "reads today's WAVES from the working tree's own HEAD commit",
    async () => {
      const head = await Bun.$`git rev-parse HEAD`
        .cwd(join(import.meta.dir, "..", "..", ".."))
        .text();
      const names = await waveNamesAt(head.trim());
      expect(names.map((w) => w.name)).toEqual(WAVES.map((w) => w.name));
    },
  );
});

/**
 * And the same question asked of the working tree, which is what `.` needs:
 * there is no commit to stand in, and a scratch worktree would be answering
 * about a list that is sitting right here.
 */
describe("waveNamesHere", () => {
  it("reads the working tree's own WAVES", async () => {
    expect((await waveNamesHere()).map((w) => w.name)).toEqual(WAVES.map((w) => w.name));
  });
});
