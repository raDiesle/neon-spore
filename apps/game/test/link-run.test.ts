import { describe, expect, test } from "bun:test";
import type { ClientMessage } from "@neon-spore/net";
import { createWorld, DEFAULT_CONFIG } from "@neon-spore/sim";
import { createRun, type Run } from "../src/link-run.js";

/** A run in seat 1, with the wire tapped so a test can read what went out. */
function seatOne(): { run: Run; sent: ClientMessage[] } {
  const sent: ClientMessage[] = [];
  const run = createRun({
    cfg: DEFAULT_CONFIG,
    world: createWorld(DEFAULT_CONFIG, 1),
    buffer: { drain: () => [] },
    send: (message) => sent.push(message),
  });
  run.begin(1);
  return { run, sent };
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
