import { describe, expect, it } from "bun:test";
import { isRoomCode, type LinkStatus, ROOM_ALPHABET, SOLO_STATUS } from "@neon-spore/net";
import {
  afterPlayingWith,
  PARTNERS_KEPT,
  parsePartners,
  partnerIn,
  roomForPair,
} from "../src/pairing.js";

/**
 * The way back into a room, for two people who have played before.
 *
 * The four-character code stays the way in the first time — it is read aloud,
 * and that is the game. What is tested here is the second meeting onwards:
 * that both of them derive the same room from their two names, and that a
 * device remembers who it played with.
 */

describe("the room a pair share", () => {
  it("is the same room whichever of them works it out", () => {
    // A pair is a pair, not a caller and a callee: whoever opens it, the other
    // one has to land in it.
    expect(roomForPair("Ada", "David")).toBe(roomForPair("David", "Ada"));
  });

  it("is the same room however either of them capitalised their name", () => {
    // The same person types their own name differently on a different phone.
    expect(roomForPair("ada", "DAVID")).toBe(roomForPair("Ada", "David"));
  });

  it("is an ordinary room code, because the server accepts nothing else", () => {
    const room = roomForPair("Ada", "David");
    expect(isRoomCode(room)).toBe(true);
    for (const character of room) expect(ROOM_ALPHABET).toContain(character);
  });

  it("is a different room for a different pair", () => {
    expect(roomForPair("Ada", "David")).not.toBe(roomForPair("Ada", "Grace"));
    expect(roomForPair("Ada", "David")).not.toBe(roomForPair("Alan", "David"));
  });

  it("is nothing at all when either of them has no name", () => {
    // There is nobody to share a room with, so there is no room to offer.
    expect(roomForPair("Ada", "")).toBe("");
    expect(roomForPair("", "David")).toBe("");
    expect(roomForPair("Ada", "!!")).toBe("");
    // And not merely non-empty: a partner must be a name by the same rules.
    expect(roomForPair("Ada", "Jo")).toBe("");
  });

  it("spreads pairs across the whole alphabet rather than a corner of it", () => {
    // A derivation that used one character of the code would put every pair in
    // twenty-five rooms, and the second pair to try would be told it was full.
    const rooms = new Set<string>();
    for (let i = 0; i < 200; i++) rooms.add(roomForPair("Ada", `Partner${i}`));
    expect(rooms.size).toBeGreaterThan(190);
  });
});

describe("who this device has played with", () => {
  it("remembers the first partner", () => {
    expect(afterPlayingWith([], "David")).toEqual(["David"]);
  });

  it("puts the most recent first, which is the one the menu offers", () => {
    expect(afterPlayingWith(["David"], "Ada")).toEqual(["Ada", "David"]);
  });

  it("moves a partner played with again rather than listing them twice", () => {
    expect(afterPlayingWith(["Ada", "David"], "David")).toEqual(["David", "Ada"]);
    expect(afterPlayingWith(["David"], "DAVID")).toEqual(["DAVID"]);
  });

  it("keeps a few and forgets the rest", () => {
    let kept: string[] = [];
    for (let i = 0; i < 20; i++) kept = afterPlayingWith(kept, `Player${i}`);
    expect(kept.length).toBe(PARTNERS_KEPT);
    expect(kept[0]).toBe("Player19");
  });

  it("ignores a partner who is not one", () => {
    expect(afterPlayingWith(["Ada"], "")).toEqual(["Ada"]);
    expect(afterPlayingWith(["Ada"], "!!")).toEqual(["Ada"]);
    expect(afterPlayingWith(["Ada"], "Jo")).toEqual(["Ada"]);
  });
});

describe("reading what was stored", () => {
  it("reads a list it wrote", () => {
    expect(parsePartners(JSON.stringify(["Ada", "David"]))).toEqual(["Ada", "David"]);
  });

  it("says nobody rather than throwing on anything unreadable", () => {
    for (const raw of [null, "", "{", "null", "7", '"Ada"', "{}"]) {
      expect(parsePartners(raw)).toEqual([]);
    }
  });

  it("drops entries that are not names, and keeps the ones that are", () => {
    // "Jo" is two characters, which is not a name — the same rule the field
    // that asks for one applies.
    expect(parsePartners(JSON.stringify(["Ada", 7, null, "Jo", "David"]))).toEqual([
      "Ada",
      "David",
    ]);
  });

  it("never returns more than it keeps, whatever is in storage", () => {
    const many = Array.from({ length: 40 }, (_, i) => `Player${i}`);
    expect(parsePartners(JSON.stringify(many)).length).toBe(PARTNERS_KEPT);
  });
});

describe("the pair a link is", () => {
  const at = (over: Partial<LinkStatus>): LinkStatus => ({ ...SOLO_STATUS, ...over });

  it("is the other seat's name, whichever seat this device holds", () => {
    expect(partnerIn(at({ player: 1, peers: 2, names: ["Ada", "David"] }))).toBe("David");
    expect(partnerIn(at({ player: 2, peers: 2, names: ["Ada", "David"] }))).toBe("Ada");
  });

  it("is nobody while the room has one person in it", () => {
    expect(partnerIn(at({ player: 1, peers: 1, names: ["Ada", ""] }))).toBe("");
  });

  it("is nobody when the other seat gave no name", () => {
    // A partner with no name cannot be offered by one.
    expect(partnerIn(at({ player: 1, peers: 2, names: ["Ada", ""] }))).toBe("");
  });

  it("is nobody at all when this device has no seat", () => {
    expect(partnerIn(at({ player: 0, peers: 2, names: ["Ada", "David"] }))).toBe("");
  });
});
