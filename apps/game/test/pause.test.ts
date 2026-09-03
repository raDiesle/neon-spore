import { describe, expect, test } from "bun:test";
import type { LinkStatus } from "@neon-spore/net";
import { HOLD_AFTER_MS, troubleOf } from "../src/hold.js";
import { peerHere, seatWord } from "../src/join-words.js";
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

const SOLO: LinkStatus = {
  state: "solo",
  room: "",
  player: 0,
  rttMs: -1,
  slack: 0,
  countdownMs: 0,
  delayMs: 0,
  stalledMs: 0,
  awayMs: 0,
  desyncTick: null,
  brokenPromises: 0,
};

const status = (over: Partial<LinkStatus>): LinkStatus => ({ ...SOLO, ...over });

describe("what a bad line is called", () => {
  test("a line that is fine is not a card", () => {
    expect(troubleOf(SOLO)).toBeNull();
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

describe("who is in the room", () => {
  test("nobody, before the second phone arrives", () => {
    const alone = status({ state: "waiting", room: "ACDE", player: 1 });
    expect(peerHere(alone)).toBe(false);
    expect(seatWord(alone, 1)).toBe("YOU");
    expect(seatWord(alone, 2)).toBe("WAITING…");
  });

  test("both, from the moment the clocks start agreeing", () => {
    const two = status({ state: "syncing", room: "ACDE", player: 2 });
    expect(peerHere(two)).toBe(true);
    expect(seatWord(two, 1)).toBe("HERE");
    expect(seatWord(two, 2)).toBe("YOU");
  });

  test("a stall is the other seat's word, never this one's", () => {
    const quiet = status({ state: "stalled", room: "ACDE", player: 1, stalledMs: 3000 });
    expect(seatWord(quiet, 1)).toBe("YOU");
    expect(seatWord(quiet, 2)).toBe("QUIET");
  });
});
