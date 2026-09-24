import { describe, expect, test } from "bun:test";
import type { ClientMessage } from "@neon-spore/net";
import { createWorld, DEFAULT_CONFIG, type World } from "@neon-spore/sim";
import { createRun, type Run } from "../src/link-run.js";

/** A run in seat 1, with the wire tapped so a test can read what went out. */
function seatOne(): { run: Run; sent: ClientMessage[]; world: World } {
  const sent: ClientMessage[] = [];
  const world = createWorld(DEFAULT_CONFIG, 1);
  const run = createRun({
    cfg: DEFAULT_CONFIG,
    world,
    buffer: { drain: () => [] },
    send: (message) => sent.push(message),
  });
  run.begin(1);
  return { run, sent, world };
}

/**
 * A peer that breaks its promise has already split the two worlds, and the
 * fingerprints will not say so for up to four beats — and when they do, the
 * tick they name says nothing about the cause. So the promise is the report.
 */
describe("a run whose peer broke its promise", () => {
  test("an input for a tick the peer already gave up is reported at once", () => {
    const { run } = seatOne();
    expect(run.brokenPromises).toBe(0);

    // "Nothing more from me through tick 20", and then something for tick 20.
    expect(run.receive({ t: "confirm", player: 2, tick: 20 })).toBe(false);
    expect(run.receive({ t: "input", player: 2, tick: 20, commands: [{ kind: "guard" }] })).toBe(
      true,
    );
    expect(run.brokenPromises).toBe(1);
  });

  test("it stays reported, so the state does not flicker back to live", () => {
    const { run } = seatOne();
    run.receive({ t: "confirm", player: 2, tick: 20 });
    run.receive({ t: "input", player: 2, tick: 20, commands: [{ kind: "guard" }] });
    // An ordinary message afterwards still says the run is not trustworthy.
    expect(run.receive({ t: "confirm", player: 2, tick: 40 })).toBe(true);
  });

  test("an ordinary exchange reports nothing", () => {
    const { run } = seatOne();
    expect(run.receive({ t: "confirm", player: 2, tick: 20 })).toBe(false);
    expect(run.receive({ t: "input", player: 2, tick: 30, commands: [{ kind: "guard" }] })).toBe(
      false,
    );
    expect(run.brokenPromises).toBe(0);
  });

  test("a run with no scheduler has no promises to break", () => {
    const { run } = seatOne();
    run.end();
    expect(run.brokenPromises).toBe(0);
    expect(run.receive({ t: "confirm", player: 2, tick: 20 })).toBe(false);
  });
});

/**
 * **A press is answered the same number of milliseconds later on every beat.**
 *
 * The delay was a number of *ticks* until 17 September 2026, and THE SLOW
 * makes a tick worth four of its ordinary self — so the same delay was four
 * times as long in the hand on exactly the beats a boss made dramatic, with
 * nothing about the link having changed. What is held constant now is the
 * milliseconds (`net/delay.ts`), and the tick count is asked for every frame
 * at the rate in force (`tick-rate.ts`).
 */
describe("the delay inside one of THE SLOW's windows", () => {
  /** The two boundaries, set the way `openSlow` would from this beat. */
  function slow(world: World, beats: number): void {
    world.slowFromBeat = world.beat;
    world.slowToBeat = world.beat + beats;
  }

  test("is fewer ticks, because each of them is longer", () => {
    const { run, world } = seatOne();
    run.observeLink(150, 16);
    const ordinary = run.delayTicks;
    // 195 ms at 120 Hz is 24 ticks, and a quarter of that when a tick is
    // worth four times as much wall clock.
    expect(ordinary).toBe(24);

    slow(world, 4);
    run.observeLink(150, 16);
    expect(run.delayTicks).toBe(6);
    // The same wait in the hand, which is the whole of the fix.
    expect(run.delayMs).toBe(195);
  });

  test("goes back to what it was when the window closes", () => {
    const { run, world } = seatOne();
    slow(world, 4);
    run.observeLink(150, 16);
    expect(run.delayTicks).toBe(6);

    world.beat = world.slowToBeat;
    run.observeLink(150, 16);
    expect(run.delayTicks).toBe(24);
    expect(run.delayMs).toBe(195);
  });

  test("says nothing at all with no peer in the room", () => {
    const { run } = seatOne();
    run.end();
    run.observeLink(150, 16);
    expect(run.delayTicks).toBe(0);
    expect(run.delayMs).toBe(0);
  });
});
