import { describe, expect, it } from "bun:test";
import { bossSpec, parseBoss, parseBossJson, parseCreature } from "../boss.js";
import { parseFrameSpec } from "../flags.js";

/**
 * `--creature`, which is the flag that reaches the half of a boss that is not
 * in `world.boss`.
 *
 * BULB QUEEN's phase is read off `queen.petals` every beat (`enterPhase`,
 * sim/boss.ts), so `--boss phase=1` was undone on the first beat after it was
 * written and her BROOD could not be photographed from the game at all — the
 * picture the look lane sent was the director's pose (`docs/queue.md`,
 * 18 September 2026).
 *
 * What is asked here is the same thing `boss-flag.test.ts` asks of its own
 * flag, and for the same reason: nothing about the creature is checked in this
 * tree, because the names are checked in the page against the body that is
 * actually on the field (`boss-install.ts`). So this is about whether the text
 * becomes the right names, the right *kinds* of value, and the right **object**
 * — a `petals` that crossed untagged would be written on the state beside
 * `startPetals` and refused there, which is the one failure the tag exists to
 * stop.
 */

describe("parseCreature", () => {
  it("is nothing when nobody asked", () => {
    expect(parseCreature(undefined)).toBeUndefined();
  });

  it("tags every field with the body, which is what tells it from --boss", () => {
    expect(parseCreature("petals=6,row=4")).toEqual([
      { key: "petals", value: 6, where: "creature" },
      { key: "row", value: 4, where: "creature" },
    ]);
  });

  it("reads a value's kind exactly as --boss does", () => {
    // One `read`, so a number, a word, a flag and `now` mean the same thing
    // whichever object they are written on.
    expect(parseCreature("a=5,b=-3,c=1.5,d=quick,e=true,f=false,g=now")).toEqual([
      { key: "a", value: 5, where: "creature" },
      { key: "b", value: -3, where: "creature" },
      { key: "c", value: 1.5, where: "creature" },
      { key: "d", value: "quick", where: "creature" },
      { key: "e", value: true, where: "creature" },
      { key: "f", value: false, where: "creature" },
      { key: "g", value: null, where: "creature" },
    ]);
  });

  it("says its own name when it refuses, and not the other flag's", () => {
    expect(() => parseCreature("petals")).toThrow(/--creature/);
    expect(() => parseCreature("petals")).not.toThrow(/--boss/);
    expect(() => parseCreature("petals=")).toThrow(/not an empty one/);
  });
});

describe("the three flags as one list", () => {
  it("writes the body's fields after the state's", () => {
    // The order is the order they are written in the page, and the body is
    // last because the state is what a caller writes first when both matter.
    expect(bossSpec(parseBoss("phase=1"), undefined, parseCreature("petals=6"))).toEqual([
      { key: "phase", value: 1 },
      { key: "petals", value: 6, where: "creature" },
    ]);
  });

  it("does not call a name shared between the two objects a clash", () => {
    // A boss and its body having a field spelled the same way is a
    // coincidence, not two intentions about one field.
    expect(bossSpec(parseBoss("row=2"), undefined, parseCreature("row=9"))).toEqual([
      { key: "row", value: 2 },
      { key: "row", value: 9, where: "creature" },
    ]);
  });

  it("still refuses one field written by --boss and --boss-json both", () => {
    expect(() =>
      bossSpec(parseBoss("sockets=1"), parseBossJson('{"sockets":[1,0]}'), parseCreature("row=1")),
    ).toThrow(/--boss and --boss-json both/);
  });
});

describe("--creature on the command line", () => {
  const waves = [{ name: "THE DRIFT" }, { name: "BULB QUEEN" }];

  it("reaches the spec beside --boss, in one list", () => {
    const { spec } = parseFrameSpec(
      [".", "--wave", "2", "--boss", "openBeat=now", "--creature", "petals=6"],
      waves,
    );
    expect(spec.boss).toEqual([
      { key: "openBeat", value: null },
      { key: "petals", value: 6, where: "creature" },
    ]);
  });

  it("is enough on its own, with no --boss beside it", () => {
    const { spec } = parseFrameSpec([".", "--wave", "2", "--creature", "petals=6"], waves);
    expect(spec.boss).toEqual([{ key: "petals", value: 6, where: "creature" }]);
  });

  it("is absent from every capture that does not ask", () => {
    expect(parseFrameSpec([".", "--wave", "2"], waves).spec.boss).toBeUndefined();
  });
});
