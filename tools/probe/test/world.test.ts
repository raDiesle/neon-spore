import { describe, expect, it } from "bun:test";
import { WAVES } from "@neon-spore/content";
import { beats, field, waveWorld } from "../world.js";

/**
 * The rig itself, which is the one part of this package worth a test.
 *
 * A probe is a throwaway and asserts nothing; these three helpers are what
 * every probe is written on top of, and a session reaching for them at the
 * moment it has a question is a session that cannot afford to find out they
 * have gone stale. The wave id lookup in particular: it is the difference
 * between "no wave with the id x, here are the ones there are" and a world
 * quietly built from wave 0.
 */

describe("a probe's world", () => {
  it("is the wave named, and the wave named is stood up", () => {
    const world = waveWorld("theCoil");
    expect(world.wave).toBe(WAVES.findIndex((w) => w.id === "theCoil"));
    expect(world.tick).toBe(0);
  });

  it("says what the ids are when the one asked for is not among them", () => {
    // The message is the whole value: a session typing a wave's *name* rather
    // than its id gets the list rather than an empty field to puzzle over.
    expect(() => waveWorld("coil")).toThrow(/no wave with the id "coil"/);
    expect(() => waveWorld("coil")).toThrow(/theCoil/);
  });

  it("is deterministic, so two runs of the same probe say the same thing", () => {
    const once = waveWorld("theCoil");
    const twice = waveWorld("theCoil");
    beats(once, 13);
    beats(twice, 13);
    expect(field(once)).toBe(field(twice));
  });

  it("counts beats, and a body has somewhere to be by the thirteenth", () => {
    const world = waveWorld("theCoil");
    beats(world, 13);
    expect(world.creatures.length).toBeGreaterThan(0);
    expect(field(world)).toContain("col");
  });

  it("says so plainly when there is nothing on the field", () => {
    expect(field(waveWorld("theCoil"))).toContain("(empty)");
  });
});
