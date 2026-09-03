import { describe, expect, test } from "bun:test";
import { type LinkStatus, SOLO_STATUS } from "@neon-spore/net";
import { readyLine, seatWord, startButton } from "../src/join-words.js";

/**
 * The press that starts a run, from the screen's side.
 *
 * Beat zero used to be stamped the moment the second phone landed, three
 * seconds ahead, so the pair was dropped onto a field whether or not either of
 * them had looked up. Nothing is stamped now until both seats press — which
 * means the screen has to say *which of three waits* a player is in, because
 * "waiting" said to all three leaves the one who has already pressed
 * wondering whether their tap landed.
 */

const at = (over: Partial<LinkStatus>): LinkStatus => ({ ...SOLO_STATUS, ...over });
const bothHere = { state: "ready", room: "ACDE", player: 1, peers: 2 } as const;

describe("the START button", () => {
  test("cannot be pressed before the clocks have agreed", () => {
    // A press that stamped a beat zero the two devices place differently is
    // the whole failure the clock sync exists to prevent.
    expect(startButton(at({ state: "syncing", peers: 2 })).enabled).toBe(false);
    expect(startButton(at({ state: "waiting", peers: 1 })).enabled).toBe(false);
  });

  test("can be pressed once both are here and the clocks agree", () => {
    const button = startButton(at(bothHere));
    expect(button.enabled).toBe(true);
    expect(button.label).toBe("START");
  });

  test("goes quiet once this phone has pressed, and says what it is waiting for", () => {
    const button = startButton(at({ ...bothHere, readyHere: true }));
    expect(button.enabled).toBe(false);
    expect(button.label).toBe("WAITING…");
  });

  test("counts down once both have, and cannot be pressed again", () => {
    const button = startButton(at({ state: "countdown", peers: 2, countdownMs: 800 }));
    expect(button.enabled).toBe(false);
    expect(button.label).toBe("STARTING 1");
  });
});

describe("the line under it", () => {
  test("asks for the press when neither has given one", () => {
    expect(readyLine(at(bothHere))).toContain("Press START");
  });

  test("says whose turn it is when this phone has pressed", () => {
    expect(readyLine(at({ ...bothHere, readyHere: true }))).toBe("Waiting for the other phone.");
  });

  test("says so when the other phone is waiting on you", () => {
    expect(readyLine(at({ ...bothHere, readyThere: true }))).toContain("Press START");
    expect(readyLine(at({ ...bothHere, readyThere: true }))).toContain("other phone is ready");
  });

  test("tells the three waits apart, which is the whole reason it exists", () => {
    const neither = readyLine(at(bothHere));
    const mine = readyLine(at({ ...bothHere, readyHere: true }));
    const theirs = readyLine(at({ ...bothHere, readyThere: true }));
    expect(new Set([neither, mine, theirs]).size).toBe(3);
  });
});

describe("the seat pills", () => {
  test("say the other player's name once there is one", () => {
    const status = at({ state: "live", peers: 2, player: 1, names: ["Ada", "David"] });
    expect(seatWord(status, 2)).toBe("David");
  });

  test("say YOU for your own seat, whatever it is called", () => {
    const status = at({ state: "live", peers: 2, player: 1, names: ["Ada", "David"] });
    expect(seatWord(status, 1)).toBe("YOU");
  });

  test("fall back to HERE for a player who gave no name", () => {
    const status = at({ state: "live", peers: 2, player: 1, names: ["Ada", ""] });
    expect(seatWord(status, 2)).toBe("HERE");
  });

  test("still say what the line is doing, which outranks a name", () => {
    // A name on a seat that has gone quiet would say somebody is there.
    const names: [string, string] = ["Ada", "David"];
    expect(seatWord(at({ state: "stalled", peers: 2, player: 1, names }), 2)).toBe("QUIET");
    expect(seatWord(at({ state: "lost", peers: 2, player: 1, names }), 2)).toBe("GONE");
    expect(seatWord(at({ state: "waiting", peers: 1, player: 1, names }), 2)).toBe("WAITING…");
  });
});
