import type { Mechanic } from "./mechanics.js";

/**
 * The rounds that are not the field, as mechanic rows.
 *
 * Lifted out of `mechanics-table.ts` when THE PULSE took that file past the
 * 250-line limit, along the seam the four of them already form: everything
 * left next door is a body that falls onto the grid, and each of these
 * *replaces* the grid with a picture of its own (`docs/spec/interludes.md`).
 * Nine more are designed and each is a row of five lines, so the half that
 * grows lives on its own — the arrangement `mechanics-rocks.ts` and
 * `mechanics-split.ts` already have.
 *
 * `as const satisfies` for `MECHANICS`' reason: the check has to fail when a
 * round is added and left out, and the literals have to survive so `WaveKind`
 * can still be read back out of the table this is spread into.
 */
export const ROUND_MECHANICS = {
  gauge: {
    what: "One needle and two marks, and the field does not come back until the needle has been held between them five times.",
    reach: "spawn",
  },
  fleet: {
    what: "A chart of squares with ships hidden in it. Only one of you is shown where they are, and only the other one can move the sights.",
    reach: "spawn",
  },
  snake: {
    what: "The ship shrinks into a snake that never stops. One of you turns it a quarter turn at a time and is shown only the body and the meteors; the other has a shot and a mouth and is shown everything else.",
    reach: "spawn",
  },
  pinball: {
    what: "The ship folds into a bucket that is both the gun and the glove. One of you slides it and stops the aiming needle, the other picks the strength off a bar and fires — and then the same bucket has to be under the ball when it comes back down.",
    reach: "spawn",
  },
  pulse: {
    what: "Slicks, bulbs, rocks and pods fall down four lanes into four sockets cut into the hull, and both of you have the same four buttons, against one chart. Some arrive on one screen as a grey shape cycling through all four, readable only on the other, so a bar of a song is a bar of being told what to press. Anything nobody presses sinks into the ship and drains the shared meter; empty it and the hull pays.",
    reach: "spawn",
  },
} as const satisfies Record<string, Mechanic>;
