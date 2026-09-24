import { describe, expect, it } from "bun:test";
import { bossSpec, parseBoss, parseBossJson } from "../boss.js";
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

/**
 * `--boss-json`, which is the flag that lets a list be photographed at all.
 *
 * `--boss` is scalars by design, and the states that most need a picture are
 * lists — THE BATON's thread, THE UNDERTOW's breaches, THE TASTER's blades, THE
 * GORGE's intakes. The page still owns every question about the boss: whether
 * the field exists, whether it is a list, and whether its items are the right
 * kind are all checked against the state that is actually installed
 * (`boss-check.ts`), so what is asked here is the same thing as above — that the
 * text becomes the right names and the right kinds of value.
 */
describe("parseBossJson", () => {
  it("is nothing when nobody asked", () => {
    expect(parseBossJson(undefined)).toBeUndefined();
  });

  it("carries a list across whole, in the order the object was written", () => {
    expect(parseBossJson('{"sockets":[1,1,0],"merged":2}')).toEqual([
      { key: "sockets", value: [1, 1, 0] },
      { key: "merged", value: 2 },
    ]);
  });

  it("reads `now` at the top level, the way --boss does", () => {
    expect(parseBossJson('{"phaseBeat":"now"}')).toEqual([{ key: "phaseBeat", value: null }]);
  });

  it("leaves a `now` inside a list alone, because nothing substitutes in there", () => {
    expect(parseBossJson('{"beats":["now"]}')).toEqual([{ key: "beats", value: ["now"] }]);
  });

  it("refuses what is not an object of fields", () => {
    expect(() => parseBossJson("{sockets:1}")).toThrow(/not JSON/);
    expect(() => parseBossJson("[1,2]")).toThrow(/an object of the boss's own fields/);
    expect(() => parseBossJson("7")).toThrow(/an object of the boss's own fields/);
    expect(() => parseBossJson("null")).toThrow(/an object of the boss's own fields/);
    expect(() => parseBossJson("{}")).toThrow(/a field or two/);
  });
});

describe("the two boss flags as one list", () => {
  it("is nothing when neither was written", () => {
    expect(bossSpec(undefined, undefined)).toBeUndefined();
  });

  it("writes the scalars first and the whole fields after", () => {
    expect(bossSpec(parseBoss("phase=shed"), parseBossJson('{"sockets":[1,0]}'))).toEqual([
      { key: "phase", value: "shed" },
      { key: "sockets", value: [1, 0] },
    ]);
  });

  it("refuses a field written by both, rather than quietly taking one", () => {
    expect(() => bossSpec(parseBoss("sockets=1"), parseBossJson('{"sockets":[1,0]}'))).toThrow(
      /--boss and --boss-json both/,
    );
  });
});

describe("--boss-json on the command line", () => {
  const waves = [{ name: "THE DRIFT" }, { name: "THE BATON" }];

  it("reaches the spec beside --boss", () => {
    const { spec } = parseFrameSpec(
      [".", "--wave", "2", "--boss", "merged=2", "--boss-json", '{"sockets":[1,1,0]}'],
      waves,
    );
    expect(spec.boss).toEqual([
      { key: "merged", value: 2 },
      { key: "sockets", value: [1, 1, 0] },
    ]);
  });

  it("is not read as --boss, which is a different flag", () => {
    const { spec } = parseFrameSpec([".", "--wave", "2", "--boss-json", '{"a":1}'], waves);
    expect(spec.boss).toEqual([{ key: "a", value: 1 }]);
  });

  it("is absent from every capture that does not ask", () => {
    expect(parseFrameSpec([".", "--wave", "2"], waves).spec.boss).toBeUndefined();
  });
});
