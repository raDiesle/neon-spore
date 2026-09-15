import { describe, expect, it } from "bun:test";
import {
  afterPlayingWith,
  afterReaching,
  newPartner,
  PARTNERS_KEPT,
  parsePartners,
} from "../src/partners.js";

/**
 * What a device remembers about the people it has played with.
 *
 * The PLAY page is a list of them — *Continue game with David · wave 7* — so
 * what is stored is a record and not a name, and the rules that change it are
 * the ones somebody could get wrong: a partner played with again keeps the
 * wave they were on, a wave only ever goes up, and a list written by a build
 * that stored plain names still reads.
 */

const names = (kept: { name: string }[]): string[] => kept.map((one) => one.name);

describe("who this device has played with", () => {
  it("remembers the first partner, at no wave and the default tempo", () => {
    expect(afterPlayingWith([], "David")).toEqual([newPartner("David")]);
  });

  it("puts the most recent first, which is the row the page opens on", () => {
    expect(names(afterPlayingWith([newPartner("David")], "Ada"))).toEqual(["Ada", "David"]);
  });

  it("moves a partner played with again rather than listing them twice", () => {
    const kept = [newPartner("Ada"), newPartner("David")];
    expect(names(afterPlayingWith(kept, "David"))).toEqual(["David", "Ada"]);
    expect(names(afterPlayingWith([newPartner("David")], "DAVID"))).toEqual(["DAVID"]);
  });

  /** The whole of what the list is for: the row says where the two of them
   * got to, and meeting again is not losing it. */
  it("keeps the wave a partner was on when they are played with again", () => {
    const kept = [{ name: "David", furthest: 6, level: "hard" as const }];
    expect(afterPlayingWith(kept, "David")).toEqual([
      { name: "David", furthest: 6, level: "hard" },
    ]);
  });

  /** The room's own level, which is the pair's — and a room that has not said
   * yet says nothing about the tempo they last played at. */
  it("takes the level from the room, and leaves it alone when there is none", () => {
    const kept = [{ name: "David", furthest: 6, level: "hard" as const }];
    expect(afterPlayingWith(kept, "David", "easy")[0]?.level).toBe("easy");
    expect(afterPlayingWith(kept, "David", null)[0]?.level).toBe("hard");
  });

  it("keeps a few and forgets the rest", () => {
    let kept = afterPlayingWith([], "Player0");
    for (let i = 1; i < 20; i++) kept = afterPlayingWith(kept, `Player${i}`);
    expect(kept.length).toBe(PARTNERS_KEPT);
    expect(kept[0]?.name).toBe("Player19");
  });

  it("ignores a partner who is not one", () => {
    const kept = [newPartner("Ada")];
    for (const not of ["", "!!", "Jo"]) expect(afterPlayingWith(kept, not)).toEqual(kept);
  });
});

describe("the wave a pair reached", () => {
  const kept = [
    { name: "Ada", furthest: 2, level: "medium" as const },
    { name: "David", furthest: 6, level: "hard" as const },
  ];

  it("is written against that partner and nobody else", () => {
    expect(afterReaching(kept, "Ada", 9)).toEqual([
      { name: "Ada", furthest: 9, level: "medium" },
      { name: "David", furthest: 6, level: "hard" },
    ]);
  });

  it("only ever goes up: a wave gone again was reached already", () => {
    expect(afterReaching(kept, "David", 1)).toEqual(kept);
    expect(afterReaching(kept, "David", 6)).toEqual(kept);
  });

  it("is the same wave however either of them capitalised the name", () => {
    expect(afterReaching(kept, "ADA", 9)[0]?.furthest).toBe(9);
  });

  /** The list is written where a room holds two named people; a wave reached
   * is not evidence of who it was reached with. */
  it("adds nobody the list does not already hold", () => {
    expect(afterReaching(kept, "Grace", 9)).toEqual(kept);
  });

  it("says nothing on a number that is not one", () => {
    expect(afterReaching(kept, "Ada", Number.NaN)).toEqual(kept);
  });
});

describe("reading what was stored", () => {
  it("reads a list it wrote", () => {
    const kept = [{ name: "Ada", furthest: 3, level: "easy" as const }];
    expect(parsePartners(JSON.stringify(kept))).toEqual(kept);
  });

  /** Every device that played before the record existed has a list of plain
   * names under this key, and the honest reading of one is wave zero. */
  it("reads the plain names an older build stored", () => {
    expect(parsePartners(JSON.stringify(["Ada", "David"]))).toEqual([
      newPartner("Ada"),
      newPartner("David"),
    ]);
  });

  it("says nobody rather than throwing on anything unreadable", () => {
    for (const raw of [null, "", "{", "null", "7", '"Ada"', "{}"]) {
      expect(parsePartners(raw)).toEqual([]);
    }
  });

  it("drops entries that are not partners, and keeps the ones that are", () => {
    // "Jo" is two characters, which is not a name — the same rule the field
    // that asks for one applies.
    const raw = JSON.stringify(["Ada", 7, null, "Jo", { furthest: 4 }, { name: "David" }]);
    expect(names(parsePartners(raw))).toEqual(["Ada", "David"]);
  });

  /** Forgiving in one direction only, the way `progress.ts` is: a hand-edited
   * wave or a level from a build that did not have them is the default rather
   * than a refusal. */
  it("reads a record whose fields have gone strange as the person at wave zero", () => {
    const raw = JSON.stringify([{ name: "Ada", furthest: -3, level: "brutal" }]);
    expect(parsePartners(raw)).toEqual([newPartner("Ada")]);
  });

  it("never returns more than it keeps, whatever is in storage", () => {
    const many = Array.from({ length: 40 }, (_, i) => `Player${i}`);
    expect(parsePartners(JSON.stringify(many)).length).toBe(PARTNERS_KEPT);
  });
});
