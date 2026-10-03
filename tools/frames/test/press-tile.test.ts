import { describe, expect, it } from "bun:test";
import { WAVES } from "@neon-spore/content";
import { parsePress } from "../press.js";

/**
 * A square of the field tapped, written on the command line as `COLxROW`:
 * THE MIMIC's paint and THE MINE's press (`sim/command-touch.ts`), from either
 * seat — who owes a picture moves with the script.
 */

const MIMIC = WAVES.findIndex((w) => w.boss?.kind === "mimic");

describe("--press, a tile", () => {
  it("taps a square by its column and row, from either seat", () => {
    expect(parsePress("300:2:tapTile=3x5", MIMIC)[0]?.command).toEqual({
      kind: "tapTile",
      col: 3,
      row: 5,
    });
    expect(parsePress("300:1:tapTile=0x12", MIMIC)[0]?.player).toBe(1);
  });

  it("refuses a square that is not COLxROW, or none", () => {
    expect(() => parsePress("300:2:tapTile=3", MIMIC)).toThrow(/a tile is COLxROW/);
    expect(() => parsePress("300:2:tapTile=ax5", MIMIC)).toThrow(/a tile is COLxROW/);
    expect(() => parsePress("300:2:tapTile=1.5x2", MIMIC)).toThrow(/a tile is COLxROW/);
    expect(() => parsePress("300:2:tapTile", MIMIC)).toThrow(/takes a value/);
  });
});
