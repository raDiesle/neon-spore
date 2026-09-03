import { describe, expect, test } from "bun:test";
import { type LinkStatus, SOLO_STATUS } from "@neon-spore/net";
import { HOLD_AFTER_MS, troubleOf } from "../src/hold.js";
import { seatWord } from "../src/join-words.js";
import { createRunState } from "../src/run-state.js";

/**
 * The three rules that decide what a player sees when the game is not running:
 * who is holding it still, what a bad line is called, and who is in the room.
 *
 * All three used to be expressions inside a DOM binding, where the only way to
 * check them was to open the game and try. They are pure now, so they are
 * tested here — and the first of them is the one that was actually wrong: four
 * different things paused the game through one boolean, so whichever spoke
 * last won.
 */
describe("the holds on the world", () => {
  test("a run is the absence of every hold, not the last thing that spoke", () => {
    const seen: boolean[] = [];
    const run = createRunState();
    run.onChange((running) => seen.push(running));

    run.hold("menu", true);
    run.hold("panel", true);
    expect(run.running()).toBe(false);
    // The bug this replaces: closing the panel resumed a game the menu was
    // still covering.
    run.hold("panel", false);
    expect(run.running()).toBe(false);
    run.hold("menu", false);
    expect(run.running()).toBe(true);

    // One report per change of answer, not one per hold.
    expect(seen).toEqual([false, true]);
  });

  test("coming back to the tab does not resume a deliberate pause", () => {
    const run = createRunState();
    run.hold("hand", true);
    run.hold("hidden", true);
    run.hold("hidden", false);
    expect(run.running()).toBe(false);
    expect(run.held("hand")).toBe(true);
  });

  test("beat zero lets go of everything", () => {
    const run = createRunState();
    run.hold("hand", true);
    run.hold("menu", true);
    run.release();
    expect(run.running()).toBe(true);
  });
});

const status = (over: Partial<LinkStatus>): LinkStatus => ({ ...SOLO_STATUS, ...over });

describe("what a bad line is called", () => {
  test("a line that is fine is not a card", () => {
    expect(troubleOf(SOLO_STATUS)).toBeNull();
    expect(troubleOf(status({ state: "live", room: "ACDE", player: 1 }))).toBeNull();
  });

  test("a hiccup shorter than the grace window says nothing", () => {
    // A socket that drops and comes back inside a second is the ordinary case
    // on a handset. A card that flashed for it would be the fault itself.
    expect(troubleOf(status({ state: "stalled", stalledMs: HOLD_AFTER_MS - 1 }))).toBeNull();
    expect(troubleOf(status({ state: "live", awayMs: HOLD_AFTER_MS - 1 }))).toBeNull();
  });

  test("the other phone going quiet and this one losing its line are different cards", () => {
    const quiet = troubleOf(status({ state: "stalled", stalledMs: 4000 }));
    const away = troubleOf(status({ state: "live", awayMs: 4000 }));
    expect(quiet?.title).toBe("THE OTHER PHONE HAS GONE QUIET");
    expect(quiet?.ms).toBe(4000);
    expect(away?.title).toBe("REACHING THE ROOM AGAIN");
    expect(away?.title).not.toBe(quiet?.title);
  });

  test("a connection that is gone says so without waiting out the grace window", () => {
    // There is nothing left to be patient about, and the count on the card is
    // how long it has been gone.
    const lost = troubleOf(status({ state: "lost", awayMs: 200 }));
    expect(lost?.title).toBe("THE CONNECTION IS GONE");
  });
});

describe("who the seat pills say is in the room", () => {
  test("the other seat is empty until the room counts two", () => {
    // Alone in the room: the room's own head count is 1, so the pill for the
    // seat this device does not hold is still waiting on a second phone.
    const alone = status({ state: "waiting", room: "ACDE", player: 1, peers: 1 });
    expect(seatWord(alone, 1)).toBe("YOU");
    expect(seatWord(alone, 2)).toBe("WAITING…");
  });

  test("both, from the moment the room's count reaches two", () => {
    const two = status({ state: "syncing", room: "ACDE", player: 2, peers: 2 });
    expect(seatWord(two, 1)).toBe("HERE");
    expect(seatWord(two, 2)).toBe("YOU");
  });

  test("the count is the fact, not the state it was guessed from", () => {
    // A state the pill has no case for — imagine one added tomorrow — falls
    // back to the count rather than to WAITING. Here `live` with two present
    // reads HERE for the other seat because the room says two are in it, and
    // would keep reading HERE whatever new state sat beside `live`.
    const both = status({ state: "live", room: "ACDE", player: 1, peers: 2 });
    expect(seatWord(both, 2)).toBe("HERE");
    const solo = status({ state: "live", room: "ACDE", player: 1, peers: 1 });
    expect(seatWord(solo, 2)).toBe("WAITING…");
  });

  test("a stall is the other seat's word, never this one's", () => {
    const quiet = status({ state: "stalled", room: "ACDE", player: 1, peers: 2, stalledMs: 3000 });
    expect(seatWord(quiet, 1)).toBe("YOU");
    expect(seatWord(quiet, 2)).toBe("QUIET");
  });
});
