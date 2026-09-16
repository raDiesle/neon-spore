import { describe, expect, test } from "bun:test";
import { AUTHORED_COL_MAX, AUTHORED_COLS, mapCol } from "@neon-spore/content";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { authoredFor, columnNote, columnNotes } from "../press-column.js";
import type { PressSpec } from "../spec.js";

/**
 * What `--press cannonCol=N` actually points at.
 *
 * The ledger's own account of the failure is the first case below: a wave is
 * authored in seven columns and played in eleven, `--press cannonCol=1` put
 * the cannon under a column no body can stand in, and three sheets showed a
 * bolt sailing past something it was never aimed at. The numbers here are the
 * shipped field's, so a change to `cols` or to `mapCol` fails this file rather
 * than quietly making its sentences wrong.
 */

const COLS = DEFAULT_CONFIG.cols;

function press(kind: string, col: number): PressSpec {
  return { tick: 0, player: 1, command: { kind, col } };
}

describe("which authored column lands on a field column", () => {
  test("finds the authored number for a column that has one", () => {
    // Whatever the field's width, authored 0 is field 0 and the last is the
    // last: `mapCol` is a ratio between the two ends.
    expect(authoredFor(0, COLS)).toBe(0);
    expect(authoredFor(COLS - 1, COLS)).toBe(AUTHORED_COL_MAX);
  });

  test("answers null for a column no wave can put a body in", () => {
    // The gap the ledger recorded. On the shipped field this is column 1.
    expect(authoredFor(1, COLS)).toBeNull();
  });

  test("agrees with mapCol wherever it answers a number", () => {
    for (let col = 0; col < COLS; col++) {
      const authored = authoredFor(col, COLS);
      if (authored !== null) expect(mapCol(authored, COLS)).toBe(col);
    }
  });
});

describe("the line a press is owed", () => {
  test("says nothing at all on a seven-column field", () => {
    // There the two numbering systems are the same one, and a line on every
    // capture teaches a reader to skip the place the real warning appears.
    expect(columnNote("cannonCol", 3, AUTHORED_COLS)).toBeNull();
  });

  test("names the authored column standing there, when one does", () => {
    const said = columnNote("cannonCol", 0, COLS);
    expect(said).toContain("field column 0");
    expect(said).toContain("authored column 0");
  });

  test("says plainly when nothing authored lands there", () => {
    const said = columnNote("cannonCol", 1, COLS) ?? "";
    expect(said).toContain("no authored column lands there");
    // And says what the reader probably meant: the wave file's 1 is elsewhere.
    expect(said).toContain(`field column ${mapCol(1, COLS)}`);
  });
});

describe("a whole run of presses", () => {
  test("says one line per column press, in the order written", () => {
    const said = columnNotes([press("cannonCol", 1), press("shieldCol", 0)], COLS);
    expect(said).toHaveLength(2);
    expect(said[0]).toContain("cannonCol=1");
    expect(said[1]).toContain("shieldCol=0");
  });

  test("keeps both of two presses that disagree about the same control", () => {
    // De-duplicating by column would hide the second, which is the one the
    // picture was actually taken under.
    const said = columnNotes([press("cannonCol", 1), press("cannonCol", 4)], COLS);
    expect(said).toHaveLength(2);
  });

  test("is silent about presses that name no column", () => {
    const fire: PressSpec = { tick: 0, player: 2, command: { kind: "fire", color: "red" } };
    expect(columnNotes([fire], COLS)).toEqual([]);
  });

  test("is silent about an empty run", () => {
    expect(columnNotes([], COLS)).toEqual([]);
  });
});
