import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { burstFor } from "../src/effects-spark.js";
import { computeLayout, tileCX, tileCY } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";

/**
 * The Runt's one visible answer: a burst that must not read as a kill.
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
 */
const CFG = DEFAULT_CONFIG;
const L = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, "test");

describe("the runt's burst", () => {
  it("lands where the runt was", () => {
    const b = burstFor({ type: "runtHit", col: 3, row: 5 }, L);
    expect(b).not.toBeNull();
    expect(b?.x).toBeCloseTo(tileCX(L, 3), 6);
    expect(b?.y).toBeCloseTo(tileCY(L, 5), 6);
  });

  it("is never red or cyan — the two colours a real kill spends", () => {
    const b = burstFor({ type: "runtHit", col: 0, row: 0 }, L);
    expect(b?.hex).not.toBe(PALETTE.red);
    expect(b?.hex).not.toBe(PALETTE.cyan);
  });

  it("spends the same colour the game already uses for 'not what you wanted'", () => {
    // The same choice `reject` and `podLost` make, not a new one invented for
    // this — the palette already has a word for it, and it is grey.
    const b = burstFor({ type: "runtHit", col: 0, row: 0 }, L);
    expect(b?.hex).toBe(PALETTE.sparkDim);
  });

  it("is a smaller burst than an ordinary kill, not a bigger one", () => {
    const runt = burstFor({ type: "runtHit", col: 2, row: 2 }, L);
    const destroyed = burstFor({ type: "destroy", col: 2, row: 2, color: "red" }, L);
    expect(runt?.n ?? 0).toBeGreaterThan(0);
    expect(runt?.n ?? Infinity).toBeLessThan(destroyed?.n ?? 0);
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
      { type: "forkWait" },
      { type: "breach", col: 0, damage: 0, span: 1, kind: "meteor", fromRow: 0, beat: 0 },
      { type: "tether", col: 0, control: "shield", color: "red" },
      { type: "mirrorDown", col: 0 },
    ] as const;
    for (const e of noBurst) expect(burstFor(e, L)).toBeNull();
  });
});
