import { describe, expect, test } from "bun:test";
import { type LinkStatus, SOLO_STATUS } from "@neon-spore/net";
import { circleLook, holdFraction, mayHold, mayShape } from "../src/join-room.js";
import { readyLine, seatWord } from "../src/join-words.js";

/**
 * Step 4 from the screen's side: the hold that says READY, and who may shape
 * the room.
 *
 * Beat zero used to be stamped the moment the second phone landed, three
 * seconds ahead, so the pair was dropped onto a field whether or not either of
 * them had looked up. Nothing is stamped now until both seats have held —
 * which means the screen has to say *which of three waits* a player is in,
 * because "waiting" said to all three leaves the one whose circle is already
 * full wondering whether it counted.
 */

const at = (over: Partial<LinkStatus>): LinkStatus => ({ ...SOLO_STATUS, ...over });
const bothHere = { state: "ready", room: "ACDE", player: 1, peers: 2, host: 1 } as const;

describe("the READY circle", () => {
  test("cannot be held before the clocks have agreed", () => {
    // A hold that stamped a beat zero the two devices place differently is
    // the whole failure the clock sync exists to prevent.
    expect(circleLook(at({ state: "syncing", peers: 2, player: 1 }), 1).holdable).toBe(false);
    expect(circleLook(at({ state: "waiting", peers: 1, player: 1 }), 1).holdable).toBe(false);
  });

  test("can be held once both are here and the clocks agree, and only the own one", () => {
    const mine = circleLook(at(bothHere), 1);
    expect(mine.holdable).toBe(true);
    expect(mine.calling).toBe(true);
    expect(mine.word).toBe("");
    expect(circleLook(at(bothHere), 2).holdable).toBe(false);
  });

  test("is full and says so once this phone has held, and cannot be held again", () => {
    const mine = circleLook(at({ ...bothHere, readyHere: true }), 1);
    expect(mine.done).toBe(true);
    expect(mine.holdable).toBe(false);
    expect(mine.word).toBe("READY");
  });

  test("shows the other phone's hold on this screen, which is the point of two", () => {
    const theirs = circleLook(at({ ...bothHere, readyThere: true }), 2);
    expect(theirs.done).toBe(true);
    expect(circleLook(at(bothHere), 2).done).toBe(false);
  });

  test("counts down in both once both have held", () => {
    const status = at({ state: "countdown", peers: 2, player: 1, countdownMs: 800 });
    expect(circleLook(status, 1).word).toBe("1");
    expect(circleLook(status, 2).done).toBe(true);
  });

  test("can be held again once the worlds have parted, which is the mend", () => {
    // The owner's call, 17 September 2026: the room screen opens on a parting
    // and the same two holds start the pair again — the room stamps a fresh
    // beat zero on two presses whatever it was doing (`room-start.ts`). It
    // was the menu's CONTINUE before, and that row is gone.
    const parted = at({ ...bothHere, state: "desync" });
    expect(circleLook(parted, 1).holdable).toBe(true);
    expect(circleLook(parted, 1).calling).toBe(true);
    expect(circleLook(parted, 2).holdable).toBe(false);
    expect(circleLook(at({ ...parted, readyHere: true }), 1).done).toBe(true);
  });

  test("can be held again while a QUIT stands, and not under a run that is running", () => {
    // Whether a QUIT stands is `quit.ts`'s fact, not the link's, so it is
    // handed in: a live run with nobody quit is a field, not a room screen.
    const live = at({ ...bothHere, state: "live" });
    expect(circleLook(live, 1).holdable).toBe(false);
    expect(circleLook(live, 1, true).holdable).toBe(true);
    expect(circleLook(at({ ...live, state: "stalled" }), 1, true).holdable).toBe(true);
    expect(mayHold(at({ ...live, peers: 1 }), true)).toBe(false);
    expect(mayHold(at({ ...live, state: "lost" }), true)).toBe(false);
  });

  test("fills over the hold and empties when the thumb lifts early", () => {
    expect(holdFraction(1000, 1075, 150)).toBe(0.5);
    expect(holdFraction(1000, 1300, 150)).toBe(1);
    expect(holdFraction(null, 1300, 150)).toBe(0);
  });
});

describe("who shapes the room", () => {
  test("is the host, and only before beat zero", () => {
    expect(mayShape(at(bothHere))).toBe(true);
    expect(mayShape(at({ ...bothHere, state: "waiting", peers: 1 }))).toBe(true);
    expect(mayShape(at({ ...bothHere, state: "countdown" }))).toBe(false);
    expect(mayShape(at({ ...bothHere, state: "live" }))).toBe(false);
  });

  test("is not the other phone, whoever holds seat 1", () => {
    expect(mayShape(at({ ...bothHere, player: 2 }))).toBe(false);
    expect(mayShape(at({ ...bothHere, host: 2, player: 1 }))).toBe(false);
    expect(mayShape(at({ ...bothHere, host: 2, player: 2 }))).toBe(true);
  });

  test("is nobody in a room that has no host, which is the old wire", () => {
    expect(mayShape(at({ ...bothHere, host: 0 }))).toBe(false);
  });
});

describe("the line under it", () => {
  test("asks for the hold when neither has given one", () => {
    expect(readyLine(at(bothHere))).toContain("Hold your circle");
  });

  test("tells the host the seats are theirs to swap, and nobody else", () => {
    expect(readyLine(at(bothHere))).toContain("Tap a seat");
    expect(readyLine(at({ ...bothHere, player: 2 }))).not.toContain("Tap a seat");
  });

  test("says whose turn it is when this phone has pressed", () => {
    expect(readyLine(at({ ...bothHere, readyHere: true }))).toBe("Waiting for the other phone.");
  });

  test("says so when the other phone is waiting on you", () => {
    expect(readyLine(at({ ...bothHere, readyThere: true }))).toContain("Hold your circle");
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

const join = await Bun.file(Bun.fileURLToPath(new URL("../src/join.ts", import.meta.url))).text();

/**
 * **A NEW GAME overrides the game these two had** (the owner, 15 September
 * 2026): the wave goes back to nothing at whatever tempo the new room settles
 * on, because a wave cleared at one tempo was not cleared at another.
 *
 * There is no DOM in this runner, so the wiring is read out of the source the
 * way `menu-front.test.ts` reads the menu's. What matters is that it is an
 * *edge* — `paint` runs on every message the room sends, and a write on every
 * one of them would put the pair back to wave nothing each time they reached a
 * wave — and that a rejoin never reaches it, which `mode` is what says.
 */
describe("a new game with somebody already on the list", () => {
  test("starts their record over, once, and only when the steps were walked", () => {
    expect(join).toContain('const fresh = mode === "" ? "" : partnerIn(last);');
    expect(join).toContain('if (fresh !== "" && fresh !== startedOverWith) {');
    expect(join).toContain("startOverWith(fresh, last.level);");
    expect(join).toContain("startedOverWith = fresh;");
  });

  test("forgets it again when the screen opens on a pair with no room", () => {
    // The same line that resets `mode`, and for the same reason: a screen
    // opened solo is a game about to be made rather than one being played.
    expect(join).toMatch(
      /if \(isOpen && last\.state === "solo"\) \{\s+mode = "";\s+startedOverWith = "";/,
    );
  });
});
