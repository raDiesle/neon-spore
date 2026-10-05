import { describe, expect, it } from "bun:test";
import { antiphonIsOrgan } from "../src/antiphon.js";
import { antiphonAlongVein, antiphonVein } from "../src/antiphon-vein.js";
import { hashWorld } from "../src/index.js";
import { body, CFG, grown, open, thumb, tick } from "./antiphon-kit.js";

/**
 * THE ANTIPHON's answer: the chooser carries a candidate down its vein to
 * the organ's place (`antiphon-hand.ts`, `antiphon-vein.ts`). The receipts
 * are the owner's sentence of 5 October 2026 taken apart — *drag and drops
 * it through the organ vene pipe to the original organ position. when its
 * reached, it will reveal if its correct one or not* — and what has to hold
 * beside it: the chooser's thumb and nobody else's, nothing before the organ
 * stands, a thumb off the vein carrying nothing, a candidate let go short
 * springing back, and the carry a fact both devices hash.
 */

describe("the vein", () => {
  it("runs from each candidate across and down to the middle, antiphonVeinRows deep", () => {
    const world = open();
    const s = grown(world);
    for (let i = 0; i < s.rail.length; i++) {
      const v = antiphonVein(CFG, s, i);
      expect(v?.dy).toBe(CFG.antiphonVeinRows);
      expect((s.rail[i]?.col ?? 0) + (v?.dx ?? 0)).toBe(Math.floor(CFG.cols / 2));
    }
  });

  it("reads a displacement along the vein, clamped, and nothing far off it", () => {
    const world = open();
    const s = grown(world);
    const i = 0;
    const v = antiphonVein(CFG, s, i);
    if (v === null) throw new Error("no vein");
    expect(antiphonAlongVein(CFG, s, i, v.dx * 500, v.dy * 500)).toBe(500);
    expect(antiphonAlongVein(CFG, s, i, v.dx * 2000, v.dy * 2000)).toBe(1000);
    expect(antiphonAlongVein(CFG, s, i, -v.dx * 300, -v.dy * 300)).toBe(0);
    // Straight across, two tiles off a vein that is mostly down: off it.
    expect(antiphonAlongVein(CFG, s, i, -v.dy * 1000, v.dx * 1000)).toBeNull();
  });
});

describe("a thumb on the rail", () => {
  it("carries the candidate down as far as the thumb has come, and back up with it", () => {
    const world = open();
    const s = grown(world);
    const d = s.rail.findIndex((_, i) => !antiphonIsOrgan(s, i));
    tick(world, [thumb(world, d, 0)]);
    expect(s.carried).toBe(d);
    tick(world, [thumb(world, d, 600)]);
    expect(s.carryMilli).toBe(600);
    tick(world, [thumb(world, d, 200)]);
    expect(s.carryMilli).toBe(200);
  });

  it("springs back to the rail when let go short, nothing said", () => {
    const world = open();
    const s = grown(world);
    const d = s.rail.findIndex((_, i) => !antiphonIsOrgan(s, i));
    tick(world, [thumb(world, d, 700)]);
    const seen = tick(world, [thumb(world, d, 700, { on: false })]);
    expect(s.carried).toBe(-1);
    expect(s.carryMilli).toBe(0);
    expect([...seen].some((e) => e.startsWith("antiphon"))).toBe(false);
    expect(s.rail).toHaveLength(CFG.antiphonRail);
  });

  it("stays put while the thumb wanders off the vein", () => {
    const world = open();
    const s = grown(world);
    tick(world, [thumb(world, 0, 400)]);
    tick(world, [thumb(world, 0, 0, { raw: { fromMilli: 4000, fromYMilli: -3000 } })]);
    expect(s.carryMilli).toBe(400);
  });

  it("arrives at antiphonReachMilli of the way and not before", () => {
    const world = open();
    const s = grown(world);
    tick(world, [thumb(world, s.answer, CFG.antiphonReachMilli - 10)]);
    expect(s.pits).toHaveLength(0);
    const seen = tick(world, [thumb(world, s.answer, CFG.antiphonReachMilli)]);
    expect(seen.has("antiphonPit")).toBe(true);
  });

  it("is the chooser's alone: the explainer's thumb on the rail is dropped", () => {
    const world = open();
    const s = grown(world);
    tick(world, [thumb(world, s.answer, 1000, { player: 1 })]);
    expect(s.carried).toBe(-1);
    expect(s.pits).toHaveLength(0);
  });

  it("carries nothing before the organ has pushed all the way out", () => {
    const world = open();
    const s = body(world);
    while (s.organ === null) tick(world, []);
    tick(world, [thumb(world, s.answer, 1000)]);
    expect(s.carried).toBe(-1);
    expect(s.pits).toHaveLength(0);
  });

  it("carries one at a time: a second candidate under another thumb is refused", () => {
    const world = open();
    const s = grown(world);
    tick(world, [thumb(world, 0, 300)]);
    tick(world, [thumb(world, 1, 600)]);
    expect(s.carried).toBe(0);
    expect(s.carryMilli).toBe(300);
  });

  it("is in the fingerprint: a candidate half way down is another fight", () => {
    const a = open(5);
    const b = open(5);
    grown(a);
    grown(b);
    tick(a, [thumb(a, 0, 500)]);
    tick(b, []);
    expect(hashWorld(a)).not.toBe(hashWorld(b));
  });
});
