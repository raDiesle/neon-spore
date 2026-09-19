import type { SceneStep } from "@neon-spore/content";
import { smoothstep } from "./ease.js";
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
 * (`guide-slide.ts` owns the slide) and a lit seam travels with the join.
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
 * `GUIDE_LOOK.bandFoot` is where it ends, and a caption keeps clear of that
 * (`guide-tide-caption.ts`). A round's header used to drop under it too, back
 * when a rehearsal's seat draw handed the band's foot on as `ViewState.clearTop`
 * — that stopped being true on 18 September 2026 (`guide-film.ts`), and the
 * header code that still read it came out on 19 September 2026
 * (`docs/queue.md`).
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

/** Ticks the slide from one screen to the other takes. */
const SWITCH_TICKS = 26;
/**
 * And how long the corner goes on saying so after it. Longer than the slide,
 * deliberately: the slide is over before an eye that was reading the words has
 * looked up, and the corner is the thing it looks up *at*.
 */
const FLASH_TICKS = 40;

/** Where a page is in its move from the seat before it — all three clocks. */
export interface PageSwitch {
  /** The seat being slid away from, or null when this page is not a switch. */
  from: 1 | 2 | null;
  /** 0 at the join's start, 1 once the incoming screen has arrived. */
  k: number;
  /** What the corner plate is told: 1 the instant it arrived, falling to 0. */
  flash: number;
}

/**
 * Read off the page before rather than remembered, so the drawing holds no
 * state a rebuild would have to clear.
 *
 * **A page asked for again is not a page arrived at.** REPLAY re-runs the film
 * on the screen the seat is already on, so there is nothing to slide from and
 * no arrival for the corner to flare at — the owner's *when I press reset, skip
 * the switch player animation*. `repeated` is the play's own answer to that.
 */
export function pageSwitch(
  scene: { steps: readonly SceneStep[] },
  step: SceneStep,
  tick: number,
  repeated: boolean,
): PageSwitch {
  const i = scene.steps.indexOf(step);
  const before = i > 0 ? scene.steps[i - 1] : undefined;
  const from = repeated || !before || before.seat === step.seat ? null : before.seat;
  if (from === null) return { from: null, k: 1, flash: 0 };
  const since = tick - step.tick;
  return {
    from,
    k: smoothstep(Math.min(1, since / SWITCH_TICKS)),
    flash: Math.max(0, 1 - since / FLASH_TICKS),
  };
}
