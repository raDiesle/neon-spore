import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { burstFor } from "../src/effects-spark.js";
import { isSilent, SILENT } from "../src/effects-spark-silent.js";
import { computeLayout, tileCX, tileCY } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";

/**
 * THE LURE's one burst on the field, and what it is now for.
 *
 * `effects-spark.ts`'s own switch is exhaustive over every `SimEvent` on
 * purpose, because this is exactly the burst that went missing once already:
 * the sim stopped reusing `destroy` for a runt hit (`bullet-hit.ts`'s
 * `resolveRunt`) and the particle burst silently stopped existing along with
 * it, caught by nothing, because a `default: return null` does not care which
 * event it is refusing to draw. `frame.test.ts` runs every burst through a
 * real canvas; this file is the one place that checks what this particular
 * burst actually looks like, and that "handled elsewhere" really does mean a
 * deliberate `null` rather than a forgotten one.
 *
 * What it checks changed with the creature. This used to be a burst that must
 * *not* read as a kill: eight grey particles, fewer than a destroy, so a shot
 * that felt satisfying to fire read as smaller than it felt. A lure now goes
 * up and takes the hull with it in three places, so the burst is the ignition
 * of that and is the other way round on both counts — bigger than a kill, and
 * in the body's own colour.
 */
const CFG = DEFAULT_CONFIG;
const L = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, "test");

describe("the lure hit's burst", () => {
  it("lands where the lure was", () => {
    const b = burstFor({ type: "lureHit", col: 3, row: 5, color: "cyan" }, L);
    expect(b).not.toBeNull();
    expect(b?.x).toBeCloseTo(tileCX(L, 3), 6);
    expect(b?.y).toBeCloseTo(tileCY(L, 5), 6);
  });

  it("carries the disguise's own colour, which is the one both players saw", () => {
    // The same colour the blast over the stage and the breaches at the hull
    // are drawn in, so the three read as one event rather than as three.
    expect(burstFor({ type: "lureHit", col: 0, row: 0, color: "red" }, L)?.hex).toBe(PALETTE.red);
    expect(burstFor({ type: "lureHit", col: 0, row: 0, color: "cyan" }, L)?.hex).toBe(PALETTE.cyan);
  });

  it("is a bigger burst than an ordinary kill, not a smaller one", () => {
    const lure = burstFor({ type: "lureHit", col: 2, row: 2, color: "red" }, L);
    const destroyed = burstFor({ type: "destroy", col: 2, row: 2, color: "red" }, L);
    expect(lure?.n ?? 0).toBeGreaterThan(destroyed?.n ?? Infinity);
  });
});

describe("events with nothing to burst", () => {
  it("returns null for bookkeeping and for events another effect already owns", () => {
    // Not exhaustive — the type checker already is, at compile time, via
    // `assertNever`. This only proves that a sample of "handled elsewhere"
    // really does resolve to null rather than to a burst nobody meant to draw.
    const noBurst = [
      { type: "beat", beat: 0 },
      { type: "needWave", wave: 1 },
      {
        type: "breach",
        col: 0,
        damage: 0,
        span: 1,
        kind: "meteor",
        fromRow: 0,
        color: null,
        beat: 0,
      },
      { type: "tether", col: 0, control: "shield", color: "red" },
      { type: "mirrorDown", col: 0 },
    ] as const;
    for (const e of noBurst) expect(burstFor(e, L)).toBeNull();
  });
});

/**
 * The seam between the two files. The compile-time half — an event accounted
 * for in neither of them stops `assertNever` from type-checking — cannot be
 * written as a test, because a test that failed to compile would not run. This
 * is the runtime half: the list and the guard say the same thing, and nothing
 * that bursts is on it.
 */
describe("the list of events that are not a burst", () => {
  it("is what the guard answers", () => {
    for (const type of SILENT) expect(isSilent({ type } as never), type).toBe(true);
  });

  it("holds nothing that the burst table draws", () => {
    for (const type of ["destroy", "reject", "grip", "lureHit", "shellBare"] as const) {
      expect(isSilent({ type } as never), type).toBe(false);
    }
  });
});
