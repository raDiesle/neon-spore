import { describe, expect, it } from "bun:test";
import { CURTAIN_COLS, type CurtainState, DEFAULT_CONFIG, type SimConfig } from "@neon-spore/sim";
import { curtainHem } from "../src/curtain-hem.js";
import { CURTAIN_SWAY, curtainSway } from "../src/curtain-sway.js";
import { computeLayout } from "../src/layout.js";

/**
 * THE CURTAIN's sway (`curtain-sway.ts`): the hem swings across by more than
 * half a tile and never past its cap, both ways, less as it is gathered, and
 * not at all once the sheet is out.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const L = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, "p1");

function hung(overrides: Partial<CurtainState> = {}): CurtainState {
  return {
    kind: "curtain",
    creatureId: 1,
    lobes: [true, true, true, true, true, true, true],
    soft: [],
    coreCol: 3,
    coreColor: "red",
    coreHits: 0,
    softBeat: -1,
    fireBeat: -1,
    moveBeat: -1,
    phase: "hung",
    phaseBeat: 0,
    liftMilli: 0,
    ...overrides,
  };
}

/** The swing at every quarter beat of 240, in tiles. */
function swung(c: CurtainState): number[] {
  const out: number[] = [];
  for (let quarter = 0; quarter < 4 * 240; quarter++) {
    out.push(curtainSway(L, CFG, c, Math.floor(quarter / 4), (quarter % 4) / 4) / L.tile);
  }
  return out;
}

describe("THE CURTAIN sways in a draught", () => {
  it("swings its hem by more than half a tile each way, and never past its cap", () => {
    const s = swung(hung());
    expect(Math.max(...s)).toBeGreaterThan(0.5);
    expect(Math.min(...s)).toBeLessThan(-0.5);
    expect(Math.max(...s.map(Math.abs))).toBeLessThanOrEqual(CURTAIN_SWAY);
  });

  it("swings a hem gathered halfway half as far, and one gathered to the rail not at all", () => {
    const whole = swung(hung({ phase: "pinned" }));
    const half = swung(hung({ phase: "pinned", liftMilli: CFG.curtainLiftMilli / 2 }));
    for (const [i, v] of half.entries()) expect(v).toBeCloseTo((whole[i] ?? 0) / 2, 9);
    const full = swung(hung({ phase: "pinned", liftMilli: CFG.curtainLiftMilli }));
    expect(Math.max(...full.map(Math.abs))).toBe(0);
  });

  it("is still once the sheet is out", () => {
    expect(Math.max(...swung(hung({ phase: "out" })).map(Math.abs))).toBe(0);
  });
});

describe("THE CURTAIN's cloth in the draught", () => {
  const X0 = 100;
  const CY = 400;
  const ALL = [true, true, true, true, true, true, true];
  /** The hem's two ends, swung by `sway` pixels. */
  function ends(sway: number): { left: number; right: number } {
    const hem = curtainHem(L, X0, CY, ALL, 0, 0, 0, sway);
    const first = hem[0]; // The rightmost scallop: its joint is the middle of its chord.
    const last = hem[hem.length - 1];
    if (first === undefined || last === undefined) throw new Error("no hem");
    return { left: last.to.x, right: 2 * first.joint.x - first.to.x };
  }

  it("reaches out on the side it swings toward and keeps the trailing edge over its column", () => {
    const swing = 0.7 * L.tile;
    const right = X0 + CURTAIN_COLS * L.tile;
    expect(ends(swing).left).toBe(X0);
    expect(ends(swing).right).toBeCloseTo(right + swing, 9);
    expect(ends(-swing).left).toBeCloseTo(X0 - swing, 9);
    expect(ends(-swing).right).toBeCloseTo(right, 9);
  });
});
