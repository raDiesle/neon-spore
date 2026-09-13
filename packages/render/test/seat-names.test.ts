import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { gripLabel } from "../src/grip.js";
import { computeLayout } from "../src/layout.js";
import { type SeatNames, seatName, withNames } from "../src/seat-name.js";
import { sirenCentre } from "../src/siren.js";
import { PILL_W, pillWidth, SIREN_PAD, seatChip } from "../src/siren-seats.js";

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

  it("stands clear of the corner button, wherever menu.css puts it", async () => {
    // The first two phones with names on them showed the right chip's last
    // letters and its ear under the ☰ (13 September 2026). The button's box is
    // read off the stylesheet rather than copied, so a moved button fails here
    // instead of on a phone.
    const css = await Bun.file(
      Bun.fileURLToPath(new URL("../../../apps/game/src/menu.css", import.meta.url)),
    ).text();
    const block = css.slice(css.indexOf("#menuChip {"), css.indexOf("#menuChip.on"));
    const right = Number(/right:\s*(\d+)px/.exec(block)?.[1]);
    const width = Number(/width:\s*(\d+)px/.exec(block)?.[1]);
    expect(right + width).toBeGreaterThan(0);
    expect(SIREN_PAD).toBeGreaterThanOrEqual(right + width);
  });
});

describe("the siren's place", () => {
  // The narrowest phone the game is drawn on, and no plate over it.
  const l = computeLayout({ width: 320, height: 640, dpr: 2 }, DEFAULT_CONFIG, "p1");
  /** The dial's radius and the gap to a chip, as `siren.ts` has them. */
  const REACH = 15 + 3;

  it("is the middle of the screen, whatever the names measure", () => {
    // The owner asked for it in the middle on 13 September 2026, with the
    // beat dots that held the top left gone. A cluster pinned to one edge
    // grew towards the middle with every letter of a name; centred, a chip
    // grows outward on its own side and the dial stays put.
    expect(sirenCentre(l).x).toBe(160);
    expect(sirenCentre(l, longest).x).toBe(160);
  });

  it("keeps the longest names clear of the corner button and of the left edge", () => {
    const { x } = sirenCentre(l, longest);
    expect(x + REACH + pillWidth(seatChip("p2", longest))).toBeLessThanOrEqual(l.width - SIREN_PAD);
    expect(x - REACH - pillWidth(seatChip("p1", longest))).toBeGreaterThanOrEqual(0);
  });

  it("drops under a rehearsal's plate the way a round's header does", () => {
    // The plate is top left and a long name's chip reaches under it.
    expect(sirenCentre(l, longest, 60).y).toBeGreaterThan(sirenCentre(l, longest).y);
    expect(sirenCentre(l, longest, 60).y).toBeGreaterThanOrEqual(60);
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
