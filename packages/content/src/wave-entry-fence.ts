/**
 * **THE FENCE's three fields**: where a wall is open, and where it can be cut.
 *
 * Its own file rather than three more entries in `wave-entry.ts`, which THE
 * MOULT's cargo took past the 250-line limit — the immediate reason, and the
 * one `creature-state-mine.ts` records for itself next door in the simulation.
 * The seam is a real one as well, and it is the only one that file has: every
 * other field on an entry is **one** number or one word out of a short set,
 * and these three are **lists**. That is not a detail of shape. A field with
 * one value is a picker in the director's panel; a list is a row of chips, one
 * per column of the field, and it is authored by painting across a wall rather
 * than by choosing from a menu. The whole of what makes a wall different to
 * author is in here.
 *
 * `WaveEntry extends FenceEntry`, so every call site still reads `e.gaps` and
 * nothing moved.
 */
export interface FenceEntry {
  /**
   * Which columns THE FENCE is open in, authored in the same seven columns
   * every wave is written in and remapped by `queueFromWave`. Absent on every
   * other kind, and absent on a wall with **one** gap — which is the cell the
   * author painted it in, so a wall placed in column three has its way through
   * at column three and the map reads the way it looks.
   *
   * **A list on the entry and a bitmask on the body** (`Creature.fenceGaps`).
   * An author names places, in the order they were painted; the field asks
   * *is this column open* of one column on every beat, and `fenceMask` is the
   * one crossing between the two shapes.
   *
   * **A field and not a kind per shape of wall**, the asymmetry `size` argues
   * for said about a hole: a wall with one gap and a wall with two are not two
   * creatures — the pair says exactly the same sentence about both, a number
   * out loud — and what changes is how much being wrong costs. Two kinds in
   * the bestiary would teach two words for one thing, and it would double
   * again with every gap.
   */
  gaps?: number[];
  /**
   * Where this wall is **cracked**, one list of authored columns per colour a
   * cannon can load. A crack is the only column a bolt opens, and the colour
   * naming the list is the only bolt that opens it (`sim/fence-crack.ts`).
   *
   * Absent on every other kind, and absent on a wall the author left
   * uncracked — except a wall with **no gaps at all**, which `queueFromWave`
   * gives one red crack in the cell it was painted in, exactly as it gives an
   * ungapped wall one gap there. A wall nobody can pass and nobody can cut is
   * a price with a picture on it rather than a creature.
   *
   * **Two lists rather than one list of pairs**, and the reason is the file
   * the director writes: an entry is serialised on one line, and
   * `{ col: 3, color: "red" }` inside it puts a fence past the formatter's
   * width and out of the round trip `serialize.test.ts` holds. Two lists read
   * exactly like `gaps` — a row of columns — which is also how the brush
   * offers them: one chip per column, cycling dark, red, cyan.
   */
  cracksRed?: number[];
  cracksCyan?: number[];
}
