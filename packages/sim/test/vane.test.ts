import { describe, expect, it } from "bun:test";
import {
  type SpawnEntry,
  VANE_CYCLE_BEATS,
  vaneFold,
  vanePhase,
  vaneTipCol,
} from "../src/index.js";
import { colSpan } from "../src/types.js";
import { ARM, beats, CFG, open, PIVOT, vane } from "./vane-fixture.js";

/**
 * THE VANE: the boss that bends the field instead of the beat.
 *
 * The claim the whole encounter rests on is one sentence — *something crossing
 * the arm three columns to its left comes out three columns to its right* —
 * and most of what is checked here is that sentence staying true and staying
 * the *only* one. A field that moved a second time, or moved something already
 * standing on it, would not be a harder boss, it would be a radar the pair
 * cannot believe, and `docs/spec/bosses.md` §11.5 says that is the failure
 * mode this design is one edit away from.
 *
 * Here is the arm and the fold; the shot that takes a pin is
 * `vane-bearing.test.ts`, and one whole cycle played out is
 * `vane-pinned.test.ts`.
 */

/**
 * Where a body authored into `col` actually comes down, and the wave beat it
 * crossed the arm on — the beat whose tip it was folded about.
 */
function crossing(col: number, kind: SpawnEntry["kind"], atBeat: number) {
  const world = open(undefined, [{ beat: atBeat, col, kind, color: null }]);
  for (let n = 0; n < 32; n++) {
    beats(world, 1);
    const body = world.creatures[0];
    if (body && body.row >= ARM) return { col: body.col, beat: world.waveBeat };
  }
  throw new Error("nothing crossed the arm");
}

const landed = (col: number, kind: SpawnEntry["kind"], atBeat: number): number =>
  crossing(col, kind, atBeat).col;

describe("the arm", () => {
  it("takes the field as a mechanism, not a body", () => {
    const world = open();
    // Nothing of it is on the grid: no creature to fall, to shoot, to ward or
    // to put a hand on. It hangs off the top edge.
    expect(world.creatures).toEqual([]);
    expect(vane(world).pins).toBe(CFG.vanePins);
  });

  it("holds the wave open even with an empty field", () => {
    const world = open();
    beats(world, VANE_CYCLE_BEATS * 2);
    expect(world.boss).not.toBeNull();
    expect(world.restBeat).toBe(0);
  });

  it("folds an arrival about the column its tip is standing in as it crosses", () => {
    // Held hard left for the first beats of the wave, tip at PIVOT - reach.
    const { beat } = crossing(0, "meteor", 0);
    const tip = vaneTipCol(CFG, CFG.vanePins, beat);
    expect(landed(0, "meteor", 0)).toBe(vaneFold(CFG, tip, 0, colSpan("meteor")));
    expect(landed(PIVOT, "meteor", 0)).toBe(vaneFold(CFG, tip, PIVOT, colSpan("meteor")));
  });

  it("leaves a body alone above the arm, in the column the radar said", () => {
    const world = open(undefined, [{ beat: 0, col: 0, kind: "meteor", color: null }]);
    beats(world, 1);
    const body = world.creatures[0]!;
    expect(body.row).toBeLessThan(ARM);
    expect(body.col).toBe(0);
  });

  it("leaves a body that comes in under the tip exactly where it was aimed", () => {
    const tip = vaneTipCol(CFG, CFG.vanePins, crossing(0, "meteor", 0).beat);
    expect(landed(tip, "meteor", 0)).toBe(tip);
  });

  it("throws in the other direction when the arm is at the other end", () => {
    // The wave's beat 7 is the far end of the sweep; a body authored to beat 4
    // crosses the arm on it.
    const early = landed(0, "meteor", 0);
    const { col: late, beat } = crossing(0, "meteor", 4);
    expect(beat).toBe(7);
    expect(late).not.toBe(early);
    expect(late).toBe(vaneFold(CFG, vaneTipCol(CFG, CFG.vanePins, 7), 0, colSpan("meteor")));
  });

  /**
   * The honesty guarantee, and the reason this boss is a rule rather than
   * noise: it touches an arrival once, on the beat it crosses the arm, and
   * never again.
   * Everything standing on the field keeps the column it is standing in for the
   * whole of its fall, so a column the pair have said out loud stays said.
   */
  it("never moves anything twice", () => {
    const world = open(undefined, [{ beat: 0, col: 0, kind: "meteor", color: null }]);
    do beats(world, 1);
    while (world.creatures[0]!.row < ARM);
    const col = world.creatures[0]!.col;
    for (let b = 0; b < 8; b++) {
      beats(world, 1);
      const body = world.creatures.find((c) => c.kind === "meteor");
      if (!body) break;
      expect(body.col).toBe(col);
    }
  });

  it("reaches further for every pin that comes out", () => {
    const near = vanePhase(CFG.vanePins).reach;
    const far = vanePhase(1).reach;
    expect(far).toBeGreaterThan(near);
    expect(vaneTipCol(CFG, 1, 1)).toBeLessThan(vaneTipCol(CFG, CFG.vanePins, 1));
  });
});
