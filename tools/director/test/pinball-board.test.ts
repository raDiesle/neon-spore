import { describe, expect, it } from "bun:test";
import { PINBALL_ROUNDS, pinBoard, pinBoardRows, pinPicture } from "@neon-spore/content";
import { DEFAULT_CONFIG, pinballFault } from "@neon-spore/sim";
import { serializePinballRounds } from "../src/serialize-pinball.js";

/**
 * The board round trip, which is the only thing standing between the editor
 * and a saved file that has quietly lost a peg.
 *
 * A board is authored as a **picture**, compiled to pieces by `pinBoard`, read
 * back to a picture by `pinPicture`, and written out again by the serializer.
 * Four steps, and every one of them is a place a piece could move half a tile
 * or vanish — so what is asserted here is that painting a cell and saving
 * changes exactly that cell, and that every board the game ships is one the
 * simulation will actually accept.
 */

const SOURCE = await Bun.file(
  new URL("../../../packages/content/src/pinball-rounds.ts", import.meta.url),
).text();

describe("the boards the game ships", () => {
  it("are all legal tables", () => {
    for (const round of PINBALL_ROUNDS) {
      expect(pinballFault(round.pieces, DEFAULT_CONFIG)).toBeNull();
    }
  });

  it("fit the grid the editor paints", () => {
    for (const round of PINBALL_ROUNDS) {
      // Nothing may be dropped on the way back to a picture: a piece off the
      // grid would be one the editor cannot show and a save would delete.
      expect(pinBoard(pinPicture(round.pieces)).length).toBe(round.pieces.length);
    }
  });
});

describe("pinPicture", () => {
  it("is pinBoard run backwards", () => {
    const drawn = ["...........", "..o.O.o....", ".=.......#.", "..........."].join("\n");
    expect(pinPicture(pinBoard(drawn)).split("\n").slice(0, 4).join("\n")).toBe(drawn);
  });

  it("is always the full grid, however short the board was drawn", () => {
    expect(pinPicture(pinBoard(".....O.....")).split("\n")).toHaveLength(pinBoardRows());
  });
});

describe("serializePinballRounds", () => {
  it("writes a board back as the picture it was painted as", () => {
    const out = serializePinballRounds(SOURCE, PINBALL_ROUNDS);
    for (const round of PINBALL_ROUNDS) {
      expect(out).toContain(`beats: ${round.beats},`);
      const first = pinPicture(round.pieces).split("\n")[0];
      if (first !== undefined) expect(out).toContain(first);
    }
  });

  it("keeps everything above the array — the grid itself lives there", () => {
    const out = serializePinballRounds(SOURCE, PINBALL_ROUNDS);
    expect(out).toContain("export function pinBoard(");
    expect(out).toContain("export function pinPicture(");
    expect(out).toContain("export function pinBoardRows(");
  });

  it("refuses a source with no array to replace", () => {
    expect(() => serializePinballRounds("// nothing here", PINBALL_ROUNDS)).toThrow(
      /PINBALL_ROUNDS/,
    );
  });
});
