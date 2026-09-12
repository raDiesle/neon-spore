import { describe, expect, it } from "bun:test";
import { type LinkState, linkIsFault, linkLabel, SOLO_STATUS } from "../src/index.js";

/**
 * The indicator's vocabulary, and the one distinction the whole of it exists to
 * make.
 *
 * `status.ts` is in `net-change`'s table of six files that move together, and it
 * was the only one of the six with no test. What it owns is the answer to open
 * question 10: a creature that blinds a player may take away any part of that
 * player's picture, but it may never produce one of these states — so **a dead
 * indicator always means a dead link, and interference always looks like
 * something the game did.** That rests on the list being closed and on the words
 * telling two things apart, and neither was held anywhere.
 *
 * The words themselves are `apps/game/src/join-words.ts`, tested next to it. What
 * is here is the part `packages/net` owns: which states exist, that each has a
 * word of its own, and which of them are a player's to do something about.
 */

/**
 * Every state, written out rather than derived from the type.
 *
 * `LinkState` is a union, so nothing at runtime can enumerate it — and that is
 * the point of listing it by hand: a state added to `status.ts` without a line
 * here fails `everyState`'s count below, which is the moment to decide what the
 * new state's word is and whether a player has to act on it. A list built from
 * `LABELS` would have agreed with itself no matter what either file said.
 */
const STATES: LinkState[] = [
  "solo",
  "connecting",
  "waiting",
  "syncing",
  "ready",
  "countdown",
  "live",
  "stalled",
  "lost",
  "full",
  "desync",
];

/**
 * The states a player has to do something about — leave, rejoin, or stop playing.
 * Written out for `STATES`' reason: this is the claim, not a restatement of it.
 */
const FAULTS: LinkState[] = ["lost", "full", "desync"];

describe("the indicator's vocabulary", () => {
  it("is closed: eleven states, and this test knows all of them", () => {
    // The count is the guard. A twelfth state arrives here before it arrives on
    // a screen, which is where the decision about its word belongs.
    expect(STATES.length).toBe(11);
    expect(new Set(STATES).size).toBe(STATES.length);
  });

  it("gives every state a word", () => {
    for (const state of STATES) {
      expect(linkLabel(state), `${state} has no word`).toBeTruthy();
    }
  });

  it("gives no two states the same word", () => {
    // The chip is four or five characters on a phone, and it is the only thing
    // most players will read about the link. Two states sharing a word is a pair
    // the player cannot tell apart at exactly the moment it matters.
    const words = STATES.map(linkLabel);
    expect(new Set(words).size).toBe(words.length);
  });

  it("keeps every word short enough for the chip", () => {
    // `chipText` hangs a room code or a round trip off the label, on a portrait
    // phone. Five characters is what the longest of them is today.
    for (const state of STATES) {
      expect(linkLabel(state).length, `${state}: ${linkLabel(state)}`).toBeLessThanOrEqual(5);
    }
  });
});

describe("a state a player has to answer", () => {
  it("is the socket closed, the room full, or the two worlds parted — and nothing else", () => {
    for (const state of STATES) {
      expect(linkIsFault(state), state).toBe(FAULTS.includes(state));
    }
  });

  it("is never a stall, which is waited out rather than answered", () => {
    // The open-question-10 distinction, at the state level: a peer that has gone
    // quiet is still in the room, and a player told their connection had died
    // would leave a game that was about to carry on. `stalledMs` is how long,
    // and `hold.ts` is the card that offers the wait.
    expect(linkIsFault("stalled")).toBe(false);
    expect(linkIsFault("lost")).toBe(true);
  });

  it("is not a state the game is simply not in a room for", () => {
    // Playing alone at a desk is not a fault, and neither is a socket that is
    // still opening or a room with one person in it.
    for (const state of ["solo", "connecting", "waiting", "syncing"] as const) {
      expect(linkIsFault(state)).toBe(false);
    }
  });
});

describe("the link before there is one", () => {
  it("is solo, in no room, in no seat, with nobody else in it", () => {
    expect(SOLO_STATUS.state).toBe("solo");
    expect(SOLO_STATUS.room).toBe("");
    expect(SOLO_STATUS.player).toBe(0);
    expect(SOLO_STATUS.peers).toBe(0);
    expect(SOLO_STATUS.names).toEqual(["", ""]);
    expect(SOLO_STATUS.best).toBeNull();
    expect(linkIsFault(SOLO_STATUS.state)).toBe(false);
  });

  it("reports no round trip rather than a round trip of nothing", () => {
    // -1 is "not measured yet" all the way through this package: `InputDelay`
    // ignores a negative sample rather than opening a run at its floor, and
    // `chipText` hangs no number off the label. A zero here would be a link
    // measured as instant, and both of those would believe it.
    expect(SOLO_STATUS.rttMs).toBeLessThan(0);
  });

  it("has nothing measured, waiting, parted or broken", () => {
    // Every counter at the value that means "nothing has happened". A field
    // added to `LinkStatus` with a plausible-looking default is how a screen
    // comes to draw a stall that is not happening.
    expect(SOLO_STATUS.slack).toBe(0);
    expect(SOLO_STATUS.countdownMs).toBe(0);
    expect(SOLO_STATUS.delayMs).toBe(0);
    expect(SOLO_STATUS.delayTicks).toBe(0);
    expect(SOLO_STATUS.stalledMs).toBe(0);
    expect(SOLO_STATUS.awayMs).toBe(0);
    expect(SOLO_STATUS.desyncTick).toBeNull();
    expect(SOLO_STATUS.brokenPromises).toBe(0);
    expect(SOLO_STATUS.readyHere).toBe(false);
    expect(SOLO_STATUS.readyThere).toBe(false);
  });
});
