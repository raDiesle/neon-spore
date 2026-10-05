import { describe, expect, it } from "bun:test";
import { antiphonIsOrgan, antiphonSinkBeat } from "../src/antiphon.js";
import { slowing, step } from "../src/index.js";
import { body, CFG, carryHome, grown, open } from "./antiphon-kit.js";

/**
 * THE ANTIPHON doubled (`docs/spec/choreographed-windows.md`, 24 September
 * 2026): the window 28 beats and the tight one 16 — and **THE SLOW over the
 * window exactly**, opened on the beat the organ has pushed all the way out
 * and shut by every way the level ends (`antiphon-step.ts`). Its meter is
 * the one every slowed boss has. The fight is `antiphon.test.ts` and the
 * carry `antiphon-carry.test.ts`.
 */

describe("THE ANTIPHON, doubled", () => {
  it("stands an organ twenty-eight beats, and sixteen once the rail is tight", () => {
    expect(CFG.antiphonWindowBeats).toBe(28);
    expect(CFG.antiphonTightWindowBeats).toBe(16);
  });

  it("asks nothing slowly while the organ is still pushing out", () => {
    const world = open();
    const s = body(world);
    while (s.organ === null) step(world, []);
    expect(slowing(world)).toBe(false);
  });

  it("slows the window for exactly its beats from the beat the organ stands", () => {
    const world = open();
    const s = grown(world);
    expect(slowing(world)).toBe(true);
    expect(world.slowFromBeat).toBe(world.beat);
    expect(world.slowToBeat).toBe(antiphonSinkBeat(s, CFG));
  });

  it("shuts THE SLOW the tick the organ is carried home to a pit", () => {
    const world = open();
    const s = grown(world);
    carryHome(world, s.answer);
    expect(s.pits).toHaveLength(1);
    expect(slowing(world)).toBe(false);
  });

  it("shuts THE SLOW the tick a decoy is carried home", () => {
    const world = open(3, false);
    const s = grown(world);
    carryHome(
      world,
      s.rail.findIndex((_, i) => !antiphonIsOrgan(s, i)),
    );
    expect(s.organ).toBeNull();
    expect(slowing(world)).toBe(false);
  });

  it("shuts THE SLOW with a window that ran out, the organ sunk", () => {
    const world = open(3, false);
    const s = grown(world);
    const end = antiphonSinkBeat(s, CFG);
    while (world.beat < end) step(world, []);
    expect(s.organ).toBeNull();
    expect(slowing(world)).toBe(false);
  });
});
