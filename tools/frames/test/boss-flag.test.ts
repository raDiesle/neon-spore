import { describe, expect, it } from "bun:test";
import { parseBoss } from "../boss.js";
import { parseFrameSpec } from "../flags.js";

/**
 * `--boss`, which is the flag that stopped three look lanes in a row landing a
 * picture of a first phase.
 *
 * **Almost nothing about a boss is checked here**, and that is the design
 * rather than a gap: the names are checked in the page against the boss that is
 * actually installed, so there is no second copy of fourteen states in this
 * tree to go stale (`boss.ts`, and `flags.test.ts` beside this file for what
 * happened when `--fault` kept one). What this file asks is whether the text
 * becomes the right names and the right *kinds* of value — because a `5` that
 * crossed into the page as `"5"` would be refused by a field holding a number,
 * and a `now` that crossed as the word would be written on a beat count.
 */

describe("parseBoss", () => {
  it("is nothing when nobody asked", () => {
    expect(parseBoss(undefined)).toBeUndefined();
  });

  it("reads a field per comma, in the order they were written", () => {
    expect(parseBoss("slack=5,phase=everts")).toEqual([
      { key: "slack", value: 5 },
      { key: "phase", value: "everts" },
    ]);
  });

  it("tells a number from a word from a flag", () => {
    // The field's own type is the rule in the page, so the *kind* that crosses
    // has to be right or a correct assignment is refused for looking wrong.
    expect(parseBoss("a=5,b=-3,c=1.5,d=quick,e=true,f=false")).toEqual([
      { key: "a", value: 5 },
      { key: "b", value: -3 },
      { key: "c", value: 1.5 },
      { key: "d", value: "quick" },
      { key: "e", value: true },
      { key: "f", value: false },
    ]);
  });

  it("carries `now` as its own thing, for the page to resolve", () => {
    // Not the string "now" and not a number picked here: the beat a phase
    // began on is `world.beat` at the moment the fields are written, which is
    // a number this process has no way of knowing (`installBoss`).
    expect(parseBoss("phaseBeat=now")).toEqual([{ key: "phaseBeat", value: null }]);
  });

  it("ignores the spaces a shell leaves behind", () => {
    expect(parseBoss(" slack = 2 , phase = quick ")).toEqual([
      { key: "slack", value: 2 },
      { key: "phase", value: "quick" },
    ]);
  });

  it("refuses text that is not a field assignment", () => {
    expect(() => parseBoss("slack")).toThrow(/key=value/);
    expect(() => parseBoss("=5")).toThrow(/key=value/);
    expect(() => parseBoss("slack=")).toThrow(/not an empty one/);
    expect(() => parseBoss(",")).toThrow(/--boss <key>=<value>/);
  });
});

describe("--boss on the command line", () => {
  const waves = [{ name: "THE DRIFT" }, { name: "THE THROAT" }];

  it("reaches the spec", () => {
    const { spec } = parseFrameSpec([".", "--wave", "2", "--boss", "slack=5,phase=everts"], waves);
    expect(spec.boss).toEqual([
      { key: "slack", value: 5 },
      { key: "phase", value: "everts" },
    ]);
  });

  it("is not confused with --boss-round, which is a different flag", () => {
    const { spec } = parseFrameSpec([".", "--wave", "2", "--boss-round", "3"], waves);
    expect(spec.boss).toBeUndefined();
    expect(spec.bossRound).toBe(3);
  });

  it("is absent from every capture that does not ask", () => {
    // Which is every capture this tool has ever taken: a picture without the
    // flag is byte for byte the boss the wave installed.
    expect(parseFrameSpec([".", "--wave", "2"], waves).spec.boss).toBeUndefined();
  });
});
