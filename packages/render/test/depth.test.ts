import { describe, expect, it } from "bun:test";
import { type Creature, DEFAULT_CONFIG, NO_SHELL } from "@neon-spore/sim";
import { creatureCenter, creatureRadius } from "../src/creature-place.js";
import { byDepth, depthScale, drawnRow, hazed, nearness } from "../src/depth.js";
import { computeLayout } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";

/**
 * The field recedes, and the arithmetic that says how far it may recede.
 *
 * `depth.ts` derives `depthNearScale` twice — half the column gutter, and the
 * point where the shape sheet's drawn-size axis stops telling SLICK and BULB
 * apart — and a derivation nobody can run is a paragraph. Both are asserted
 * below against the constants they were derived from, so the number cannot be
 * raised past its own justification without this file going red.
 */

const CFG = DEFAULT_CONFIG;
const L = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, "test");

/** The radius every living body is drawn at, in tiles — `creatures.ts`. */
const BODY_TILES = 0.4;

function creature(row: number, kind: Creature["kind"] = "bulb"): Creature {
  return {
    id: 1,
    kind,
    col: 3,
    row,
    fromRow: row,
    color: "red",
    holes: 0,
    petals: 0,
    dragMilli: 0,
    shell: NO_SHELL,
  } as Creature;
}

describe("perspective by row", () => {
  it("leaves the top row exactly as it was, and does not leave the hull row", () => {
    expect(depthScale(CFG, L, 0)).toBe(1);
    expect(depthScale(CFG, L, CFG.rows - 1)).toBeCloseTo(CFG.depthNearScale, 10);
    expect(depthScale(CFG, L, CFG.rows - 1)).toBeGreaterThan(1);
  });

  it("never shrinks a body below what the flat field drew", () => {
    // The direction is the constraint: `docs/spec/graphics.md` puts the floor
    // at a body still nameable at 20–26 px, and a far row drawn smaller than
    // today would walk straight through it.
    for (let row = -2; row <= CFG.rows + 2; row += 0.25) {
      expect(depthScale(CFG, L, row)).toBeGreaterThanOrEqual(1);
    }
  });

  it("grows monotonically downward and is clamped outside the grid", () => {
    let last = 0;
    for (let row = 0; row <= CFG.rows - 1; row += 0.5) {
      const k = depthScale(CFG, L, row);
      expect(k).toBeGreaterThanOrEqual(last);
      last = k;
    }
    expect(depthScale(CFG, L, 99)).toBe(depthScale(CFG, L, CFG.rows - 1));
    expect(depthScale(CFG, L, -99)).toBe(1);
  });

  it("spends at most half the gutter between two neighbouring columns", () => {
    // A body covers `2 * BODY_TILES` of a tile, leaving a fifth of one clear
    // between adjacent columns. Half of that gutter is the budget; all of it
    // (a scale of 1.25) would put two columns' bodies in contact, and the
    // column read is the pair's whole control scheme.
    const covered = 2 * BODY_TILES * CFG.depthNearScale;
    expect(covered).toBeLessThanOrEqual(1 - (1 - 2 * BODY_TILES) / 2);
    expect(covered).toBeLessThan(1);
  });

  it("stays under the row scale at which drawn size stops naming a shape", () => {
    // `bun run shapes:report`, TOLD APART BY: SLICK's drawn-size span tops out
    // at 26.0 px and BULB's starts at 29.4. A uniform row multiplier stretches
    // every kind's span upward together, so 29.4 / 26.0 is where those two
    // stop being told apart by size at all.
    expect(CFG.depthNearScale).toBeLessThan(29.4 / 26.0);
  });
});

describe("the drawn radius follows the row", () => {
  it("is the flat radius at the top and the scaled one at the hull", () => {
    expect(creatureRadius(L, creature(0))).toBeCloseTo(L.tile * BODY_TILES, 10);
    expect(creatureRadius(L, creature(CFG.rows - 1))).toBeCloseTo(
      L.tile * BODY_TILES * CFG.depthNearScale,
      10,
    );
  });

  it("does not move the body — `creatureCenter` stays exactly linear", () => {
    const c = { ...creature(9), fromRow: 8 };
    // The scale is a drawing decision and nothing else: a body mid-glide is
    // still at the arithmetic mean of the two rows it is between.
    const mid = creatureCenter(L, c, 0.5);
    const from = creatureCenter(L, { ...c, row: 8 }, 0);
    const to = creatureCenter(L, { ...c, fromRow: 9 }, 0);
    expect(mid.y).toBeCloseTo((from.y + to.y) / 2, 10);
    expect(drawnRow(c, 0.5)).toBeCloseTo(8.5, 10);
  });
});

/** One channel of a `#rrggbb`, 0 red, 1 green, 2 blue. */
function channel(hex: string, i: number): number {
  return Number.parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
}

describe("atmospheric perspective", () => {
  it("leaves the hull row's colours untouched", () => {
    expect(hazed(CFG, PALETTE.red, nearness(L, CFG.rows - 1))).toBe(PALETTE.red);
  });

  it("pulls the top row toward the field's far colour", () => {
    const far = hazed(CFG, PALETTE.red, nearness(L, 0));
    expect(far).not.toBe(PALETTE.red);
    expect(far).toMatch(/^#[0-9a-f]{6}$/);
    // Dimmer: every channel falls toward the darker target.
    expect(channel(far, 0)).toBeLessThan(channel(PALETTE.red, 0));
    // Cooler: and the warm channel falls faster than the cool one, so the hue
    // itself walks toward blue rather than the colour merely going grey.
    expect(channel(far, 0) / channel(far, 2)).toBeLessThan(
      channel(PALETTE.red, 0) / channel(PALETTE.red, 2),
    );
  });

  it("lowers contrast — a body's fill and its rim converge as they recede", () => {
    const gap = (near: number): number =>
      Math.abs(
        channel(hazed(CFG, PALETTE.red, near), 0) - channel(hazed(CFG, PALETTE.redDark, near), 0),
      );
    expect(gap(nearness(L, 0))).toBeLessThan(gap(nearness(L, CFG.rows - 1)));
  });

  it("quantises, so the halo sprite cache cannot grow a canvas per frame", () => {
    const seen = new Set<string>();
    for (let row = 0; row <= CFG.rows - 1; row += 0.01) {
      seen.add(hazed(CFG, PALETTE.cyan, nearness(L, row)));
    }
    expect(seen.size).toBeLessThanOrEqual(CFG.rows);
  });
});

describe("draw-order occlusion", () => {
  it("puts the nearest body last and leaves the world's own array alone", () => {
    const spawned = [creature(11), creature(2), creature(7)];
    const frozen = [...spawned];
    const order = byDepth(spawned, 0);
    expect(order.map((c) => c.row)).toEqual([2, 7, 11]);
    expect(spawned).toEqual(frozen);
  });

  it("is stable, so two bodies on one row draw the same way on both devices", () => {
    const a = { ...creature(5), id: 9 };
    const b = { ...creature(5), id: 4 };
    expect(byDepth([a, b], 0).map((c) => c.id)).toEqual([9, 4]);
  });

  it("sorts by where a body is drawn, not by where it is going", () => {
    // Mid-glide the two have swapped: `byDepth` reads the interpolated row,
    // the same one `creatureCenter` turns into a y.
    const high = { ...creature(9), id: 1, fromRow: 8 };
    const low = { ...creature(8), id: 2, fromRow: 9 };
    expect(byDepth([high, low], 0).map((c) => c.id)).toEqual([1, 2]);
    expect(byDepth([high, low], 1).map((c) => c.id)).toEqual([2, 1]);
  });
});
