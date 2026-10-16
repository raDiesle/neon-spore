import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { WAVES, type Wave } from "@neon-spore/content";
import { readBlock } from "../src/compose-block.js";
import { serializeWaveArray } from "../src/serialize.js";

/**
 * **A set piece written after a block stands outside its steps**
 * (`Wave.setPiece`). THE ROE, THE CLUTCH, THE DROP, THE WATCH and THE
 * NEIGHBOUR were written after THE HUSK's eight, and counted as five of them:
 * `waves:order` composed three husk waves where there had been eight
 * (`docs/queue.md`, 16 October 2026).
 */

const SET_PIECES = ["theRoe", "theClutch", "theDrop", "theWatch", "theNeighbour"];

describe("THE HUSK's set pieces", () => {
  test("are marked, and none of the block's eight", () => {
    for (const id of SET_PIECES) expect(WAVES.find((w) => w.id === id)?.setPiece, id).toBe(true);
    const block = readBlock(WAVES, "theHusk");
    if (typeof block === "string") throw new Error(block);
    expect(block.existing).toBe(8);
  });

  test("would be five of its steps unmarked", () => {
    const bare = WAVES.map(({ setPiece: _s, ...w }) => w as Wave);
    const block = readBlock(bare, "theHusk");
    if (typeof block === "string") throw new Error(block);
    expect(block.existing).toBe(8 + SET_PIECES.length);
  });

  test("keep the mark through a save", () => {
    const roe = WAVES.find((w) => w.id === "theRoe") as Wave;
    const act = join(import.meta.dir, "../../../packages/content/src/waves/act-3.ts");
    const written = serializeWaveArray(readFileSync(act, "utf8"), [roe], "WAVES_ACT_3");
    expect(written).toContain('    name: "THE ROE",\n    variant: true,\n    setPiece: true,\n');
  });
});
