import { describe, expect, it } from "bun:test";
import type { BossSpec } from "../boss.js";
import { type BossSeen, bossRefusal, kindOf } from "../boss-check.js";

/** What the page would read for `list` off a boss holding `state`. */
function seen(list: BossSpec, state: Record<string, unknown>, body = true): BossSeen {
  return {
    kind: "scuttle",
    hasBody: body,
    beatIsNumber: true,
    fields: list.map((f) => ({
      present: f.key in state,
      have: f.key in state ? [] : Object.keys(state).sort(),
      was: state[f.key],
    })),
  };
}

function refusal(list: BossSpec, state: Record<string, unknown>): string {
  return bossRefusal(list, seen(list, state));
}

describe("kindOf", () => {
  it("names the kinds a refusal says", () => {
    expect([null, [], {}, "a", 1, true].map(kindOf)).toEqual([
      "nothing",
      "list",
      "shape",
      "word",
      "number",
      "boolean",
    ]);
  });
});

/**
 * The owner, 24 September 2026: a list is checked by the type of its items,
 * not by its length — every list a boss grows was unwritable while the length
 * had to match (`docs/queue.md`'s entry, now gone).
 */
describe("a list field", () => {
  it("takes a longer list of the same kind of item", () => {
    expect(refusal([{ key: "loose", value: [10, 4] }], { loose: [3] })).toBe("");
  });

  it("takes any list when it is empty, having no item to judge by", () => {
    expect(refusal([{ key: "loose", value: [10] }], { loose: [] })).toBe("");
    expect(refusal([{ key: "beads", value: [{ col: 2 }] }], { beads: [] })).toBe("");
  });

  it("takes a shorter one, and an empty one", () => {
    expect(refusal([{ key: "body", value: [1] }], { body: [1, 2, 3] })).toBe("");
    expect(refusal([{ key: "body", value: [] }], { body: [1, 2, 3] })).toBe("");
  });

  it("refuses an item of another kind, by its place in the list", () => {
    expect(refusal([{ key: "loose", value: [1, "x"] }], { loose: [3] })).toMatch(
      /--boss-json loose\[1\]: that list holds number items, e.g. 3, and a word came/,
    );
  });

  it("takes every kind the list already mixes", () => {
    expect(refusal([{ key: "slots", value: [null, 2] }], { slots: [4, null] })).toBe("");
  });

  it("refuses a shape item missing a key the items carry", () => {
    const state = { breaches: [{ col: 1, tall: false }] };
    expect(refusal([{ key: "breaches", value: [{ col: 2 }] }], state)).toMatch(
      /breaches\[0\]: an item of that list carries tall, and this one has none/,
    );
  });

  it("refuses a shape item with a key no item carries", () => {
    const state = { breaches: [{ col: 1 }] };
    expect(refusal([{ key: "breaches", value: [{ col: 2, colr: 3 }] }], state)).toMatch(
      /breaches\[0\]: no item of that list carries colr/,
    );
  });

  it("still refuses a scalar written over a list", () => {
    expect(refusal([{ key: "loose", value: 3 }], { loose: [3] })).toMatch(/write it whole/);
  });
});

describe("the fields of the boss and its body", () => {
  it("refuses a name the boss does not have, and says the ones it does", () => {
    expect(refusal([{ key: "sokets", value: 1 }], { sockets: 1, phase: "shed" })).toBe(
      "--boss sokets: the scuttle has no such field. It has phase, sockets",
    );
  });

  it("refuses the body when the boss is drawn as none", () => {
    const list: BossSpec = [{ key: "hp", value: 1, where: "creature" }];
    expect(bossRefusal(list, seen(list, { hp: 3 }, false))).toMatch(/drawn as no body/);
  });

  it("refuses the kind, which is the wave's", () => {
    expect(refusal([{ key: "kind", value: "baton" }], { kind: "scuttle" })).toMatch(
      /the wave's, not a flag's/,
    );
  });

  it("holds a scalar to the type already there", () => {
    expect(refusal([{ key: "live", value: "x" }], { live: 3 })).toMatch(/holds a number/);
    expect(refusal([{ key: "phase", value: 2 }], { phase: "shed" })).toMatch(/a word, e\.g\. shed/);
    expect(refusal([{ key: "open", value: 1 }], { open: false })).toMatch(/true or false/);
    expect(refusal([{ key: "live", value: [1] }], { live: 3 })).toMatch(/not a list or a shape/);
  });

  it("takes `now` for a number field", () => {
    expect(refusal([{ key: "phaseBeat", value: null }], { phaseBeat: 0 })).toBe("");
  });

  it("refuses the whole list when one field is wrong, naming the first", () => {
    const list: BossSpec = [
      { key: "live", value: 10 },
      { key: "loose", value: ["x"] },
    ];
    expect(refusal(list, { live: 3, loose: [3] })).toMatch(/loose\[0\]/);
  });
});
