import { describe, expect, test } from "bun:test";
import { type LinkState, type LinkStatus, SOLO_STATUS } from "@neon-spore/net";
import { chipText, explain, lastTimeLine, roomLine } from "../src/join-words.js";

/**
 * The sentences the network wears, and the one pair of them that must never read
 * alike.
 *
 * `join-words.ts` says in its own header why it is a file at all: "the other
 * phone has gone quiet" and "the connection is gone" have to be different
 * sentences, so that a creature which blinds a player can never be mistaken for
 * a dropped line. That is open question 10, and it was held by nothing —
 * `readyLine`, `seatWord` and `startButton` have `start-press.test.ts`, and the
 * three functions that carry the actual sentences had no test at all.
 *
 * The state side of the same rule is `packages/net/test/status.test.ts`, beside
 * the closed list it is about.
 */

const at = (over: Partial<LinkStatus>): LinkStatus => ({ ...SOLO_STATUS, ...over });

/** Every state, for the reason `status.test.ts` writes its own list out. */
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

/** A room with both phones in it, which is what most of these states need. */
const inRoom = { room: "ACDE", player: 1, peers: 2, rttMs: 40 } as const;

describe("every state gets a sentence", () => {
  test("on the room screen, and on the menu's own line", () => {
    for (const state of STATES) {
      const status = at({ ...inRoom, state, desyncTick: 900 });
      expect(explain(status).length, `explain: ${state}`).toBeGreaterThan(10);
      expect(roomLine(status).length, `roomLine: ${state}`).toBeGreaterThan(10);
    }
  });

  test("and no two states share one", () => {
    // A sentence copied from the state above it is how a player comes to read
    // the same line about two different problems.
    const said = STATES.map((state) => explain(at({ ...inRoom, state, desyncTick: 900 })));
    expect(new Set(said).size).toBe(said.length);
  });
});

describe("a quiet phone and a dead line", () => {
  test("are never the same sentence, on any of the three surfaces", () => {
    // The whole reason `join-words.ts` exists. A player told their connection
    // had gone would leave a room that was about to carry on.
    const stalled = at({ ...inRoom, state: "stalled", stalledMs: 4000 });
    const lost = at({ ...inRoom, state: "lost", awayMs: 4000 });
    expect(explain(stalled)).not.toBe(explain(lost));
    expect(roomLine(stalled)).not.toBe(roomLine(lost));
    expect(chipText(stalled)).not.toBe(chipText(lost));
  });

  test("and a stall says the line is still there", () => {
    expect(explain(at({ ...inRoom, state: "stalled" }))).toContain("Still connected");
  });

  test("while a full room says the line is fine and the room is not", () => {
    // A third phone typing the code is not a network fault, and telling somebody
    // it was sends them to check a signal that is working.
    const full = explain(at({ ...inRoom, state: "full" }));
    expect(full).toContain("ACDE");
    expect(full).toContain("Your line is fine");
  });
});

describe("a parting", () => {
  test("names the peer that broke the model when that is what happened", () => {
    // Two ways to a `desync`, found in two different places. Saying which saves
    // the next hour.
    const broken = explain(at({ ...inRoom, state: "desync", brokenPromises: 3 }));
    expect(broken).toContain("3");
    expect(broken).toContain("promised not to send");
  });

  test("names the tick when the two worlds simply drifted", () => {
    const drifted = explain(at({ ...inRoom, state: "desync", desyncTick: 1200 }));
    expect(drifted).toContain("1200");
    expect(drifted).not.toContain("promised not to send");
  });

  test("says it is a bug either way, so nobody goes looking at their signal", () => {
    for (const over of [{ brokenPromises: 2 }, { desyncTick: 60 }]) {
      expect(explain(at({ ...inRoom, state: "desync", ...over }))).toContain("not a lag spike");
    }
  });
});

describe("the chip", () => {
  test("shows no round trip before one has been measured", () => {
    // -1 is `ClockSync` before it has a median worth believing. "LINK -1" on a
    // phone is worse than no number at all.
    const chip = chipText(at({ ...inRoom, state: "live", rttMs: -1 }));
    expect(chip).not.toContain("-1");
    expect(chip).toBe("LINK ACDE");
  });

  test("shows the round trip once there is one, while playing and while stalled", () => {
    expect(chipText(at({ ...inRoom, state: "live", rttMs: 40 }))).toBe("LINK 40");
    expect(chipText(at({ ...inRoom, state: "stalled", rttMs: 40 }))).toBe("HOLD 40");
  });

  test("counts the last seconds down in whole seconds, rounded up", () => {
    // 800 ms left is "1", not "0" — a countdown that reaches zero before beat
    // zero does is a pair looking up at the wrong moment.
    expect(chipText(at({ ...inRoom, state: "countdown", countdownMs: 800 }))).toBe("READY 1");
    expect(chipText(at({ ...inRoom, state: "countdown", countdownMs: 2001 }))).toBe("READY 3");
  });

  test("carries the room code wherever there is one and no number to show", () => {
    expect(chipText(at({ ...inRoom, state: "waiting" }))).toBe("WAIT ACDE");
    expect(chipText(SOLO_STATUS)).toBe("SOLO");
  });
});

describe("what the pair got to last time", () => {
  test("is nothing at all for a room never played in", () => {
    expect(lastTimeLine(SOLO_STATUS)).toBe("");
    expect(lastTimeLine(at({ best: { wave: 0, seconds: 0, retries: 0 } }))).toBe("");
  });

  test("counts the wave the way a player does, from one", () => {
    // `world.wave` is an index and the screen says a number. Wave 0 cleared is
    // "wave 1" to the two people who cleared it.
    expect(lastTimeLine(at({ best: { wave: 0, seconds: 40, retries: 0 } }))).toContain("wave 1");
    expect(lastTimeLine(at({ best: { wave: 6, seconds: 240, retries: 2 } }))).toContain("wave 7");
  });

  test("says the clock and the retries beside it, and neither for a mark from the old wire", () => {
    expect(lastTimeLine(at({ best: { wave: 2, seconds: 222, retries: 1 } }))).toContain("3:42");
    expect(lastTimeLine(at({ best: { wave: 2, seconds: 222, retries: 1 } }))).toContain("1 retry");
    expect(lastTimeLine(at({ best: { wave: 2, seconds: 0, retries: 0 } }))).toBe(
      "Last time you two reached wave 3.",
    );
  });
});
