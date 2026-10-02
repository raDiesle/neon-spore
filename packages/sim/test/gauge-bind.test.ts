import { describe, expect, it } from "bun:test";
import { gaugeBound, gaugeSeated, gaugeSpanNow, hashWorld, step } from "../src/index.js";
import { band, CFG, call, callable, heard, playing, TPB } from "./gauge-rig.js";

/**
 * **THE GAUGE's bind, and both hands at the end of the play**
 * (`src/gauge-hand.ts`, `.claude/skills/new-boss` §6.2).
 *
 * Once the half of `gauge-hand.test.ts` that was not about the jam; the jam
 * went on 2 October 2026, when a mistake began to lose the round, and took
 * that file with it. A mark winds the band every other time and her thumb
 * holds it open; what is proved here is that the bind costs her the call
 * rather than a miss, that only she can hold it, and that her thumb comes off
 * and stays off once the round leaves its play.
 */

describe("the bind", () => {
  it("winds on every other mark and lets go on the one after", () => {
    const { world, g } = playing();
    for (let n = 1; n <= 3; n++) {
      g.needleMilli = g.markMilli;
      callable(world, g);
      heard(world, 2, call(world));
      expect(g.marks).toBe(n);
      expect(gaugeBound(g)).toBe(n % CFG.gaugeBindMarks === 0);
    }
  });

  it("narrows the window the round is judged against, and her thumb gives it back", () => {
    const { world, g } = playing();
    g.boundBeat = world.beat;
    expect(gaugeSpanNow(CFG, g)).toBe(CFG.gaugeBoundSpanMilli);
    g.needleMilli = g.markMilli + CFG.gaugeSpanMilli;
    expect(gaugeSeated(world, g)).toBe(false);
    heard(world, 2, band(true));
    expect(gaugeSpanNow(CFG, g)).toBe(CFG.gaugeSpanMilli);
    expect(gaugeSeated(world, g)).toBe(true);
  });

  it("stops the band walking while she holds it, and it walks again when she lets go", () => {
    const { world, g } = playing();
    g.boundBeat = world.beat;
    heard(world, 2, band(true));
    const held = g.markMilli;
    for (let i = 0; i < 2 * TPB; i++) step(world, []);
    expect(g.markMilli).toBe(held);
    heard(world, 2, band(false));
    for (let i = 0; i < 2 * TPB; i++) step(world, []);
    expect(g.markMilli).not.toBe(held);
  });

  it("costs her the call, and refuses it rather than charging a miss", () => {
    const { world, g } = playing();
    g.boundBeat = world.beat;
    g.needleMilli = g.markMilli;
    heard(world, 2, band(true));
    callable(world, g);
    heard(world, 2, call(world));
    expect(g.marks).toBe(0);
    expect(g.misses).toBe(0);
    heard(world, 2, band(false));
    heard(world, 2, call(world));
    expect(g.marks).toBe(1);
  });

  it("is hers alone, and there is nothing to hold while the band is loose", () => {
    const { world, g } = playing();
    g.boundBeat = world.beat;
    heard(world, 1, band(true));
    expect(g.openThumb).toBe(false);
    heard(world, 2, band(true));
    expect(g.openThumb).toBe(true);
    heard(world, 2, band(false));
    g.boundBeat = -1;
    heard(world, 2, band(true));
    expect(g.openThumb).toBe(false);
  });
});

describe("her thumb", () => {
  it("comes off when the round leaves its play", () => {
    const { world, g } = playing();
    g.boundBeat = world.beat;
    heard(world, 2, band(true));
    expect(g.openThumb).toBe(true);
    g.marks = CFG.gaugeLevels * CFG.gaugeLevelMarks;
    step(world, []);
    expect(g.phase).toBe("verdict");
    expect(g.openThumb).toBe(false);
    // What the pair *did* is not undone: the verdict's picture may show it.
    expect(gaugeBound(g)).toBe(true);
  });

  it("reaches nothing outside the play at all", () => {
    const { world, g } = playing();
    g.boundBeat = world.beat;
    g.phase = "verdict";
    heard(world, 2, band(true));
    expect(g.openThumb).toBe(false);
  });

  it("is in the hash, on both sides of the wire", () => {
    const { world, g } = playing();
    g.boundBeat = world.beat;
    const quiet = hashWorld(world);
    heard(world, 2, band(true));
    expect(hashWorld(world)).not.toBe(quiet);
  });
});
