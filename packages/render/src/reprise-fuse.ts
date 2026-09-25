import type { RepriseClock } from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawFuseLine, fuseColours } from "./slow-fuse.js";

/**
 * **THE REPRISE's measure along the top of the screen: how long until the
 * dark, and how far through the dark the pair is.**
 *
 * The owner, 25 September 2026: *some loading indicator (can use new boss
 * loader on top of screen) when the next invisible starts again, and also
 * loading when it's the beats of invisible time*. So it is THE SLOW's fuse
 * (`slow-fuse.ts`) — the same line in the same place, drawn by the same
 * function — counting this fight's two clocks, and one line carries both:
 *
 * - **While a stretch is recorded it burns down**, in from both ends, and meets
 *   in the middle on the beat the field goes dark. It goes orange at half and
 *   red for the last two beats, the slow's colours for the slow's reason: the
 *   thing it counts down to is the thing the pair has to be ready for.
 * - **While the echo plays it fills back up**, out from the middle, in the
 *   tear's rock grey, and is whole again on the beat the last body is sent —
 *   which is the beat the next stretch starts burning it down.
 *
 * It says nothing the tear does not: the dark opens on a beat the pair could
 * have counted, and the fill reaches its ends on the beat the tear shuts. What
 * it adds is *how long*, which is the thing the owner asked for.
 */

/** How much of the line to draw, and in which of the two clocks. */
export interface RepriseMeasure {
  echo: boolean;
  /** The share of the line drawn, 0 to 1. */
  rest: number;
  /** Beats left until the dark, fractional; only read while recording. */
  left: number;
}

/**
 * The measure for a clock at a drawn beat's phase. Recording runs over the
 * stretch's `beats`; the echo over one fewer, because its last body is sent on
 * the beat the clock says `beats - 1` and the echo is already shut by then.
 */
export function repriseMeasure(clock: RepriseClock, beatPhase: number): RepriseMeasure {
  const now = clock.done + beatPhase;
  if (clock.echo) {
    const span = Math.max(1, clock.beats - 1);
    return { echo: true, rest: clamp(now / span), left: 0 };
  }
  const left = Math.max(0, clock.beats - now);
  return { echo: false, rest: clamp(left / clock.beats), left };
}

const clamp = (v: number): number => Math.min(1, Math.max(0, v));

/** Draws the measure for this frame. */
export function drawRepriseFuse(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  clock: RepriseClock,
  beatPhase: number,
): void {
  const m = repriseMeasure(clock, beatPhase);
  if (m.rest <= 0) return;
  if (m.echo) {
    drawFuseLine(ctx, l, m.rest, PALETTE.rock, PALETTE.text);
    return;
  }
  const { body, core } = fuseColours({ beats: clock.beats, through: 1 - m.rest, left: m.left });
  drawFuseLine(ctx, l, m.rest, body, core);
}
