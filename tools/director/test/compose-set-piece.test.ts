import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { WAVES, type Wave } from "@neon-spore/content";
import { readBlock } from "../src/compose-block.js";
import { BLOCK_STEPS } from "../src/compose-steps.js";
import { serializeWaveArray } from "../src/serialize.js";

/**
 * **A set piece written after a block stands outside its steps**
 * (`Wave.setPiece`). THE ROE, THE CLUTCH, THE DROP, THE WATCH and THE
 * NEIGHBOUR were written after THE HUSK's block, and once counted as five of
 * its steps (`docs/queue.md`, 16 October 2026). Since a block is one regular
 * wave (19 October 2026) the owner kept THE NEIGHBOUR, unmarked, as THE
 * HUSK's one, and no wave is a set piece; the mark still works for the next.
 */

const neighbour = WAVES.find((w) => w.id === "theNeighbour") as Wave;

describe("THE HUSK's one regular wave", () => {
  test("is THE NEIGHBOUR, written by hand, so nothing is composed for it", () => {
    expect(neighbour.setPiece).toBeUndefined();
    const block = readBlock(WAVES, "theHusk");
    if (typeof block === "string") throw new Error(block);
    expect(block.existing).toBe(BLOCK_STEPS.length);
  });

  test("would be none of its steps marked as a set piece", () => {
    const marked = WAVES.map((w) =>
      w.id === "theNeighbour" ? { ...w, setPiece: true as const } : w,
    );
    const block = readBlock(marked, "theHusk");
    if (typeof block === "string") throw new Error(block);
    expect(block.existing).toBe(0);
  });

  test("a mark is kept through a save", () => {
    const act = join(import.meta.dir, "../../../packages/content/src/waves/act-3.ts");
    const marked: Wave = { ...neighbour, setPiece: true };
    const written = serializeWaveArray(readFileSync(act, "utf8"), [marked], "WAVES_ACT_3");
    expect(written).toContain(
      '    name: "THE NEIGHBOUR",\n    variant: true,\n    setPiece: true,\n',
    );
  });
});
