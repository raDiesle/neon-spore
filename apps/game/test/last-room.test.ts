import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { freshRoom, type Held, parseRoom, ROOM_FRESH_MS } from "../src/last-room.js";

/**
 * **The room this device was in a moment ago**, and how long it is worth
 * offering a way back into.
 *
 * The case is one the menu had no answer for. Two people are playing, one of
 * them reloads, and the other phone loses nothing — it is still sitting in the
 * room with the field up. The reloaded phone knew where it had been for exactly
 * as long as its socket lived, which is to say not across the reload.
 *
 * The deciding is pure so it can be tested at all: this runner has no DOM and
 * therefore no `localStorage` (`progress.ts` made the same split), and the
 * storage around it is four wrapped lines.
 */

const held = (over: Partial<Held> = {}): Held => ({ room: "ACDE", at: 1_000_000, ...over });

describe("what a stored room means", () => {
  it("reads back the code and the stamp it was written with", () => {
    expect(parseRoom(JSON.stringify(held()))).toEqual({ room: "ACDE", at: 1_000_000 });
  });

  it("is nothing at all on a device that has never been in a room", () => {
    expect(parseRoom(null)).toBeNull();
  });

  it("is nothing when the value is not a value", () => {
    // A half-written key, or one from a version that stored something else.
    expect(parseRoom("")).toBeNull();
    expect(parseRoom("{")).toBeNull();
    expect(parseRoom("null")).toBeNull();
    expect(parseRoom('"ACDE"')).toBeNull();
    expect(parseRoom(JSON.stringify({ room: "ACDE" }))).toBeNull();
    expect(parseRoom(JSON.stringify({ at: 1 }))).toBeNull();
  });

  it("refuses a code the server would refuse, however it got there", () => {
    // Clamped on the way out as well as in: a button offering a code no room
    // can have is a button that cannot work.
    expect(parseRoom(JSON.stringify(held({ room: "AC" })))).toBeNull();
    // *ACDEF* is the dangerous one: normalising it would give the perfectly
    // valid *ACDE*, which is a different room under a button that looks right.
    expect(parseRoom(JSON.stringify(held({ room: "ACDEF" })))).toBeNull();
    expect(parseRoom(JSON.stringify(held({ room: "ac-e" })))).toBeNull();
  });

  it("refuses a stamp that is not a number of milliseconds", () => {
    expect(parseRoom(JSON.stringify(held({ at: Number.NaN })))).toBeNull();
    expect(parseRoom(JSON.stringify(held({ at: Number.POSITIVE_INFINITY })))).toBeNull();
    expect(parseRoom('{"room":"ACDE","at":"soon"}')).toBeNull();
  });
});

describe("how long it is worth offering", () => {
  it("offers a room this device was in a moment ago", () => {
    expect(freshRoom(held({ at: 1000 }), 1000)).toBe("ACDE");
    expect(freshRoom(held({ at: 1000 }), 1000 + ROOM_FRESH_MS - 1)).toBe("ACDE");
  });

  it("stops at the window's edge, because a button that fails is worse than none", () => {
    expect(freshRoom(held({ at: 1000 }), 1000 + ROOM_FRESH_MS)).toBe("");
    expect(freshRoom(held({ at: 1000 }), 1000 + ROOM_FRESH_MS * 4)).toBe("");
  });

  it("reads a stamp from the future as stale rather than as eternally fresh", () => {
    // A phone whose clock moved. The offer is wrong either way; the harmless
    // wrong answer is the one that stops offering.
    expect(freshRoom(held({ at: 9000 }), 1000)).toBe("");
  });

  it("has nothing to offer for nothing stored", () => {
    expect(freshRoom(null, 1000)).toBe("");
  });
});

/**
 * **Where it is written and where it is torn up.**
 *
 * Read off the source, the way `intro.test.ts` holds its own two: the parts
 * this runner can execute are above, and what is left is a question about a
 * call site in a file that wants a socket, a relay and two phones before it
 * will run at all. A wrong answer here is not a failing assertion anywhere —
 * it is a button that never appears, or one that appears after somebody
 * pressed LEAVE ROOM.
 */
const shell = readFileSync(new URL("../src/shell.ts", import.meta.url), "utf8");

describe("the way it is wired", () => {
  it("writes the room down on every status the room sends, not once on joining", () => {
    // The stamp has to be *when this device was last in the room*: a pair an
    // hour into a session who reload are owed the offer as much as a pair who
    // joined a minute ago.
    const status = shell.slice(shell.indexOf("onStatus: (status) =>"));
    expect(status).toContain("rememberRoom(status.room, Date.now())");
  });

  it("writes nothing down for a device that is not in a room", () => {
    expect(shell).toMatch(/status\.state !== "solo" && status\.room !== ""/);
  });

  it("tears it up on every deliberate leave, so all three go through one door", () => {
    // The card that comes up when the other phone goes quiet, the room
    // screen's own leave, and the menu's LEAVE ROOM. A device that kept the
    // room after one of them would put BACK INTO THE GAME in front of somebody
    // who had just pressed the way out of it.
    expect(shell).toMatch(
      /const leaveRoom = \(\): void => \{\s*forgetRoom\(\);\s*link\.leave\(\);/,
    );
    expect(shell).toContain("bindHoldCard({ leave: leaveRoom })");
    expect(shell).toContain("leave: leaveRoom,");
    expect(shell).toMatch(/^\s+leaveRoom,$/m);
    // And no leave goes around it.
    expect(shell.match(/link\.leave\(\)/g)).toHaveLength(1);
  });
});
