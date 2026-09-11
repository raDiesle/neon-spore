import { describe, expect, it } from "bun:test";
import { type Creature, NO_SHELL, type SimEvent } from "@neon-spore/sim";
import { drawnCol, drawnRow } from "../src/depth.js";
import { RecoilLeapFx } from "../src/recoil-leap.js";

/**
 * The owner's report of 11 September 2026: *jumping when hit is sometimes
 * not natural and fluent — it's like jumping, so the animation must be more
 * smooth.* A bounce is written mid-tick and glided over the rest of the beat,
 * so the frame of the hit jumped and a late hit crossed two rows in a tenth
 * of a beat. `recoil-leap.ts` is a throw a beat long from where the body was
 * drawn; these pin the three things a throw has to get right — no jump when
 * it leaves, the simulation's own place when it lands, and the colour turning
 * along it — at the worst phase the old glide had, nine tenths of a beat.
 */

const BEAT = 0.625;
const PHASE0 = 0.9;

/** A red recoil in column 4 that has fallen to row 8 and is one row into its
 * next beat, then struck: the simulation puts it on row 6, column 5, cyan. */
function before(): Creature {
  return {
    id: 7,
    kind: "recoil",
    col: 4,
    fromCol: 4,
    row: 8,
    fromRow: 7,
    color: "red",
    holes: 0,
    petals: 0,
    dragMilli: 0,
    shell: NO_SHELL,
    recoilBounces: 3,
  } as Creature;
}
function struck(): Creature {
  return { ...before(), fromRow: 8, row: 6, fromCol: 4, col: 5, color: "cyan", recoilBounces: 2 };
}
/** The same body in the beat after the hit, falling from row 6. */
function nextBeat(): Creature {
  return { ...struck(), fromRow: 6, row: 7, fromCol: 5, col: 5 };
}
const BOUNCE: SimEvent = {
  type: "recoilBounce",
  id: 7,
  col: 4,
  row: 8,
  toCol: 5,
  toRow: 6,
  color: "cyan",
  left: 2,
};

/** A throw started at `PHASE0` of beat 12, with the body drawn there first. */
function thrown(): { fx: RecoilLeapFx; left: { row: number; col: number } } {
  const fx = new RecoilLeapFx();
  const c = before();
  const left = fx.place(c, 12 + PHASE0, PHASE0);
  fx.ingest([BOUNCE], BEAT);
  return { fx, left };
}

describe("THE RECOIL's throw", () => {
  it("leaves from where the body was drawn, not from the tile's centre", () => {
    const { fx, left } = thrown();
    expect(left.row).toBeCloseTo(7.9);
    fx.update(0.001);
    const p = fx.place(struck(), 12 + PHASE0 + 0.001 / BEAT, PHASE0 + 0.001 / BEAT);
    // The simulation's own glide would have jumped up to row 6.2 here.
    expect(drawnRow(struck(), PHASE0)).toBeCloseTo(6.2);
    expect(Math.abs(p.row - left.row)).toBeLessThan(0.02);
    expect(Math.abs(p.col - left.col)).toBeLessThan(0.02);
    expect(p.turn).toBeCloseTo(0, 1);
  });

  it("rises, tops out above the landing row and comes down into the fall", () => {
    const { fx } = thrown();
    fx.update(0.001);
    fx.place(struck(), 12 + PHASE0, PHASE0);
    const rows: number[] = [];
    // Through the rest of the struck beat and into the next one.
    for (let i = 1; i <= 10; i++) {
      fx.update(BEAT / 10);
      const t = PHASE0 + i / 10;
      const c = t < 1 ? struck() : nextBeat();
      rows.push(fx.place(c, 12 + t, t % 1).row);
    }
    // Over one beat the body nets one row up — from 7.9 to the 6.9 the
    // simulation has it at when the throw is up — and the arc overshoots that
    // by an eighth of a row before coming down at the fall's own speed.
    const top = Math.min(...rows);
    expect(top).toBeLessThan(6.9);
    expect(top).toBeGreaterThan(6.7);
    // Up, then down: one change of direction, after the top.
    const apex = rows.indexOf(top);
    for (let i = 1; i <= apex; i++) expect(rows[i]!).toBeLessThanOrEqual(rows[i - 1]!);
    for (let i = apex + 1; i < rows.length; i++)
      expect(rows[i]!).toBeGreaterThanOrEqual(rows[i - 1]!);
  });

  it("lands exactly where the simulation has the body when the beat is up", () => {
    const { fx } = thrown();
    fx.update(0.001);
    fx.place(struck(), 12 + PHASE0, PHASE0);
    fx.update(BEAT - 0.002);
    const c = nextBeat();
    const p = fx.place(c, 13 + PHASE0, PHASE0);
    expect(p.row).toBeCloseTo(drawnRow(c, PHASE0), 1);
    expect(p.col).toBeCloseTo(drawnCol(c, PHASE0), 1);
    expect(p.turn).toBeCloseTo(1, 1);
    // And after it, the body is the simulation's again.
    fx.update(0.01);
    expect(fx.place(c, 13 + PHASE0, PHASE0)).toEqual({ row: drawnRow(c, PHASE0), col: 5, turn: 1 });
  });

  it("forgets everything on a restart, the point it left from included", () => {
    const { fx } = thrown();
    fx.clear();
    expect(fx.drawnAt(7)).toBeUndefined();
    const c = struck();
    expect(fx.place(c, 12 + PHASE0, PHASE0).row).toBeCloseTo(drawnRow(c, PHASE0));
  });
});
