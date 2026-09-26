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
    what: "The ship becomes a snake that never stops. One of you turns it. The other shoots and eats. You both see all of it.",
    reach: "spawn",
  },
  pinball: {
    what: "The ship folds into a bucket. One of you slides it and stops the needle. The other picks the strength and fires. Then catch the ball in the bucket.",
    reach: "spawn",
  },
  pulse: {
    what: "Bodies fall into four sockets in the hull. You share four buttons. Some show as grey on one screen, so the other must say which. Missed ones drain the meter.",
    reach: "spawn",
  },
  scout: {
    what: "Player 1 flies a small ship that coasts, and sees only where it points. Player 2 sees everything else. Collect every mote, and touch nothing that moves.",
    reach: "spawn",
  },
} as const satisfies Record<string, Mechanic>;
