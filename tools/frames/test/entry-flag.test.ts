import { afterAll, describe, expect, it } from "bun:test";
import { queueFromWave, WAVES } from "@neon-spore/content";
import { createWorld, DEFAULT_CONFIG, step } from "@neon-spore/sim";
import { writeEntry } from "../entry.js";
import { parseFrameSpec } from "../flags.js";

/**
 * `--entry`, the flag that photographs a gesture no wave sends (`entry.ts`):
 * the text becomes an arrival's number and its fields, and the write in the
 * page reaches the body that arrives — THE BLISTER's first arrival, written
 * HOLD, comes up a HOLD blister without a wave file touched.
 */

const parse = (...flags: string[]) =>
  parseFrameSpec([".", "--wave", "THE BLISTER", ...flags], [{ name: "THE BLISTER" }]).spec;

describe("--entry off the command line", () => {
  it("is nothing when nobody asked", () => {
    expect(parse().entry).toBeUndefined();
  });

  it("is an arrival's number and its fields, read as --boss reads them", () => {
    expect(parse("--entry", "1:gesture=hold,count=4,by=both").entry).toEqual({
      index: 1,
      fields: [
        { key: "gesture", value: "hold" },
        { key: "count", value: 4 },
        { key: "by", value: "both" },
      ],
    });
  });

  it("refuses a value with no arrival, and now", () => {
    expect(() => parse("--entry", "gesture=hold")).toThrow(/<n>:/);
    expect(() => parse("--entry", "0:beat=now")).toThrow(/wave's clock/);
  });
});

describe("--entry in the page", () => {
  const saved = (globalThis as { window?: unknown }).window;
  afterAll(() => {
    (globalThis as { window?: unknown }).window = saved;
  });
  const wave = WAVES.find((w) => w.name === "THE BLISTER")!;
  const stage = () => {
    const world = createWorld({ ...DEFAULT_CONFIG }, 0, queueFromWave(wave, DEFAULT_CONFIG.cols));
    (globalThis as { window?: unknown }).window = { neonSpore: { world } };
    return world;
  };

  it("reaches the body that arrives", () => {
    const world = stage();
    expect(writeEntry({ index: 0, fields: [{ key: "gesture", value: "hold" }] })).toBeNull();
    for (let t = 0; t < 600 && world.creatures.length === 0; t++) step(world, []);
    expect(world.creatures.find((c) => c.kind === "blister")?.blisterGesture).toBe("hold");
  });

  it("refuses an arrival the wave has not got, and one already arrived", () => {
    const world = stage();
    expect(writeEntry({ index: 9, fields: [] })).toMatch(/2 arrivals/);
    world.spawned = 1;
    expect(writeEntry({ index: 0, fields: [] })).toMatch(/already arrived/);
  });
});
