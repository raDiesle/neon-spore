import { beforeAll, describe, expect, it } from "bun:test";
import { type Creature, hullRow, NO_SHELL } from "@neon-spore/sim";
import { CoilFlightFx } from "../src/coil-flight.js";
import { computeLayout, tileCX, tileCY } from "../src/layout.js";
import { StubContext } from "./canvas-stub.js";
import { CFG, installCanvasGlobals, VIEWPORT } from "./frame-harness.js";

/**
 * The owner's ask, 11 September 2026: *the torches must release from the
 * exact position the coil was removing its shield, then fly in a diagonal to
 * the farthest border to hit the ship — and immediately.* The simulation
 * writes the throw as one glide (`sim/coil.ts`); this pins what the picture
 * adds — that a dome opened late in the beat still releases from the dome's
 * tile rather than partway down the line, that the rock is on the far wall's
 * hull when the beat line comes, and that the line stays lit a moment after
 * the hit and then goes.
 */

beforeAll(installCanvasGlobals);

const L = computeLayout(VIEWPORT, CFG, "test");
const BEAT = 0.625;
const HULL = hullRow(CFG);

/** The rock the dome at column 8, row 5 left: thrown to column 0's hull. */
function freed(): Creature {
  return {
    id: 3,
    kind: "torch",
    span: 1,
    col: 0,
    fromCol: 8,
    row: HULL,
    fromRow: 5,
    color: null,
    holes: 0,
    petals: 0,
    dragMilli: 0,
    shell: NO_SHELL,
  } as Creature;
}

function opened(): CoilFlightFx {
  const fx = new CoilFlightFx();
  fx.ingest([{ type: "coilBreak", id: 3, col: 8, row: 5, ward: true }], L, BEAT);
  return fx;
}

describe("THE COIL's rock thrown from the dome", () => {
  it("leaves from the dome's tile on the frame it is first drawn, late in the beat", () => {
    const fx = opened();
    const at = fx.place(freed(), L, 20 + 0.85);
    expect(at?.x).toBeCloseTo(tileCX(L, 8), 3);
    expect(at?.y).toBeCloseTo(tileCY(L, 5), 3);
    expect(at?.row).toBeCloseTo(5, 3);
    expect(at?.from).toEqual({ x: tileCX(L, 8), y: tileCY(L, 5) });
    // A torch that did not come out of a dome is not placed here.
    expect(fx.place({ ...freed(), id: 9 }, L, 20.85)).toBeUndefined();
  });

  it("is on the far wall's hull when the beat line comes, whatever phase it left on", () => {
    for (const phase0 of [0, 0.4, 0.85]) {
      const fx = opened();
      fx.place(freed(), L, 20 + phase0);
      const left = (1 - phase0) * BEAT;
      fx.update(left);
      const at = fx.place(freed(), L, 21);
      expect(at?.x).toBeCloseTo(tileCX(L, 0), 3);
      expect(at?.y).toBeCloseTo(tileCY(L, HULL), 3);
      expect(at?.row).toBeCloseTo(HULL, 3);
      expect(fx.landed(0)).toBe(true);
      expect(fx.landed(CFG.cols - 1)).toBe(false);
    }
  });

  it("is on the straight line between the two, halfway through", () => {
    const fx = opened();
    fx.place(freed(), L, 20.5);
    fx.update(0.25 * BEAT);
    const at = fx.place(freed(), L, 20.75);
    expect(at?.x).toBeCloseTo((tileCX(L, 8) + tileCX(L, 0)) / 2, 1);
    expect(at?.y).toBeCloseTo((tileCY(L, 5) + tileCY(L, HULL)) / 2, 1);
  });

  it("keeps the line lit behind the hit for a moment, then lets it go", () => {
    const fx = opened();
    fx.place(freed(), L, 20);
    // Nothing of its own while the rock is still flying: the body draws the tail.
    const flying = new StubContext();
    fx.draw(flying as unknown as CanvasRenderingContext2D, L);
    expect(flying.calls).toBe(0);
    fx.update(BEAT + 0.05);
    const lit = new StubContext();
    fx.draw(lit as unknown as CanvasRenderingContext2D, L);
    expect(lit.calls).toBeGreaterThan(0);
    expect(fx.landed(0)).toBe(true);
    fx.update(1);
    const gone = new StubContext();
    fx.draw(gone as unknown as CanvasRenderingContext2D, L);
    expect(gone.calls).toBe(0);
    expect(fx.landed(0)).toBe(false);
  });
});
