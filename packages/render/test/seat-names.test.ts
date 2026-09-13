import { describe, expect, it } from "bun:test";
import { gripLabel } from "../src/grip.js";
import { type SeatNames, seatName, withNames } from "../src/seat-name.js";
import { PILL_W, pillWidth, seatChip } from "../src/siren-seats.js";

/**
 * **The two people's names, where the game used to write P1 and P2.**
 *
 * The owner asked for the nicknames wherever a person reads a seat's name in
 * play. Three labels carry one mid-wave — the siren's chip, the word under a
 * hand, and a rehearsal's caption — and each of them answers the same two
 * questions: what does it say when the room knows a name, and what does it say
 * when it does not. A device playing alone, a seat nobody has claimed and every
 * frame test in this package are all the second case, and none of them may
 * change at all.
 *
 * All four functions are pure, so this needs no canvas.
 */

const pair: SeatNames = ["Ada", "Jean-Luc"];
/** The longest a name may be — `NAME_MAX` in `packages/net`, which this package
 * does not depend on: `@neon-spore/render` draws a world and knows nothing
 * about a wire. Written out here, where what it is being used for is the width
 * of a chip rather than the rule for a name. */
const NAME_MAX = 12;
const longest: SeatNames = ["A".repeat(NAME_MAX), "B".repeat(NAME_MAX)];

describe("a caption's own words", () => {
  it("says the names where content wrote the seats", () => {
    expect(withNames("PLAYER 2 SEES ONE WIRE", pair)).toBe("JEAN-LUC SEES ONE WIRE");
    expect(withNames("ONLY PLAYER 1 SEES ITS LANE", pair)).toBe("ONLY ADA SEES ITS LANE");
  });

  it("leaves the line exactly as it was written when nobody is named", () => {
    expect(withNames("PLAYER 1 SEES INSIDE")).toBe("PLAYER 1 SEES INSIDE");
    expect(withNames("PLAYER 1 SEES INSIDE", ["", ""])).toBe("PLAYER 1 SEES INSIDE");
  });

  it("names one seat without touching the other", () => {
    expect(withNames("PLAYER 1 AND PLAYER 2", ["Ada", ""])).toBe("ADA AND PLAYER 2");
  });

  it("is not fooled by a longer word that starts the same way", () => {
    expect(withNames("PLAYER 12 IS NOBODY", pair)).toBe("PLAYER 12 IS NOBODY");
  });
});

describe("the siren's chip", () => {
  it("is the two letters it has always been until a name arrives", () => {
    expect(seatChip("p1")).toBe("P1");
    expect(seatChip("p2", ["", ""])).toBe("P2");
  });

  it("is the person once the room knows who is sitting there", () => {
    expect(seatChip("p1", pair)).toBe("ADA");
    expect(seatChip("p2", pair)).toBe("JEAN-LUC");
  });

  it("keeps its old box for the old label, and grows for a name", () => {
    // The pill is the narrowest thing on this HUD and P1 is what it was drawn
    // for, so nothing about a solo screen may move.
    expect(pillWidth("P1")).toBe(PILL_W);
    expect(pillWidth("JEAN-LUC")).toBeGreaterThan(PILL_W);
  });

  it("leaves the field's top row visible at the longest name there can be", () => {
    // Two chips and the dial between them, against the narrowest phone this
    // game is drawn on. The name's own limit is chosen against this sum
    // (`packages/net/src/nickname.ts`), so it is worth measuring here.
    const cluster = pillWidth(seatChip("p1", longest)) + pillWidth(seatChip("p2", longest)) + 36;
    expect(cluster).toBeLessThan(320 * 0.75);
  });
});

describe("the word under a hand", () => {
  it("says the partner's name rather than their seat", () => {
    expect(gripLabel("p1", "brake", false, true, pair)).toBe("JEAN-LUC PULLS");
    expect(gripLabel("p2", "aim", true, false, pair)).toBe("ADA AIMS");
  });

  it("still says YOU about your own hand, which no name improves", () => {
    expect(gripLabel("p2", "brake", false, true, pair)).toBe("YOU PULL");
    expect(gripLabel("p1", "aim", true, false, pair)).toBe("YOU AIM");
  });

  it("says BOTH when the two of them are on it, named or not", () => {
    expect(gripLabel("p1", "brake", true, true, pair)).toBe("BOTH PULL");
    expect(gripLabel("p1", "brake", true, true)).toBe("BOTH PULL");
  });

  it("is the seat's letters when the room knows no name", () => {
    expect(gripLabel("p1", "brake", false, true)).toBe("P2 PULLS");
  });
});

describe("a seat with no name of its own", () => {
  it("is PLAYER n, which is what every screen said before there were names", () => {
    expect(seatName(1)).toBe("PLAYER 1");
    expect(seatName(2, ["Ada", ""])).toBe("PLAYER 2");
  });
});
