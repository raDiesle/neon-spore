import { describe, expect, it } from "bun:test";
import { samplesOf } from "../src/coalesced.js";

/**
 * A `pointermove` is not one position, and the app read it as one.
 *
 * The browser coalesces moves to roughly one event per animation frame and
 * keeps the samples in between on the event. Nothing here asked for them, so
 * a gesture that reads a *bearing* — the crank, THE INSTAR's turn mark, THE
 * GIMBAL's rings — was sampled at ~60 Hz against a rule built on the opposite
 * assumption (`sim/bearing.ts`'s `MAX_BEARING_STEP`). What that costs is in
 * `packages/sim/test/crank.test.ts`: a flick read as the other way round.
 */

const move = (
  clientX: number,
  clientY: number,
  coalesced?: { clientX: number; clientY: number }[],
) => ({
  clientX,
  clientY,
  ...(coalesced === undefined ? {} : { getCoalescedEvents: () => coalesced }),
});

describe("the positions a pointermove carries", () => {
  it("is every sample the event kept, oldest first", () => {
    const path = [
      { clientX: 10, clientY: 10 },
      { clientX: 20, clientY: 14 },
      { clientX: 30, clientY: 18 },
    ];
    expect(samplesOf(move(30, 18, path))).toEqual(path);
  });

  it("is the event itself where the browser has no such method", () => {
    expect(samplesOf(move(7, 9))).toEqual([{ clientX: 7, clientY: 9 }]);
  });

  it("is the event itself when the list comes back empty", () => {
    // Specified for an event a script dispatched, which is every event a test
    // sends. Reading an empty list as "this move carried no positions" would
    // drop the gesture rather than sample it coarsely.
    const e = move(7, 9, []);
    expect(samplesOf(e)).toEqual([e]);
  });
});
