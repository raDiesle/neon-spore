import type { Layout } from "./layout.js";
import type { SeatNames } from "./seat-name.js";

/**
 * The move from one player's screen to the other, and what the band that says
 * whose screen it is has to be told.
 *
 * The owner's first instruction was that the switch must be something a pair
 * can *follow* — a cut between two screens that look alike is a screen that
 * seems to have changed by itself, and the whole lesson of the tutorial is that
 * there are two devices and they carry different halves. So the picture slides
 * (`guide-scene.ts` owns the slide) and a lit seam travels with the join.
 *
 * **The band itself left this file on 16 September 2026.** It had been through
 * six answers here — a word across the middle of the picture that arrived with
 * the slide, then one that never left because *a label that comes and goes is
 * only true while it is on screen*, then a grown plate, then a lobe in the
 * corner, then a band across the whole screen — and the seventh was a vote.
 * TIDE draws it now (`guide-tide.ts`), through `GUIDE_LOOK.band`, and what is
 * left here is the seam, which is not a look, and `CornerPlate`, which is the
 * question every answer to that slot is asked.
 *
 * The things the band had to be true of are now the record's to state:
 * `GUIDE_LOOK.bandFoot` is where it ends, a caption keeps clear of that
 * (`guide-tide-caption.ts`) and a round's header drops under it
 * (`round-header.ts`).
 */

/** How far the seam's glow reaches either side of the join. */
const SEAM = 5;

/** The join between the outgoing and incoming screens, lit as it travels. */
export function drawSwitchSeam(ctx: CanvasRenderingContext2D, l: Layout, x: number): void {
  const g = ctx.createLinearGradient(x - SEAM, 0, x + SEAM, 0);
  g.addColorStop(0, "rgba(255,86,168,0)");
  g.addColorStop(0.5, "rgba(255,86,168,.42)");
  g.addColorStop(1, "rgba(255,86,168,0)");
  ctx.fillStyle = g;
  ctx.fillRect(x - SEAM, 0, SEAM * 2, l.height);
}

export interface CornerPlate {
  /** Whose screen is on show, when a film is playing one. */
  seat?: 1 | 2;
  names?: SeatNames;
  /**
   * 1 the instant this screen arrived, falling to 0 — the switch said a second
   * time, in the one place that names the seat. 0 on a page that did not change
   * seat, and on every page of a guide made of words.
   */
  flash?: number;
  /** Seconds the page has been up, for the slime. */
  age?: number;
}
