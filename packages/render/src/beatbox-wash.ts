import type { Creature, World } from "@neon-spore/sim";
import { beatboxWrongThrough } from "./beatbox.js";
import { colorTrio, type Wash } from "./creature-tint.js";
import { PALETTE } from "./palette.js";

/**
 * **The colour laid over a soundbox**, which is the half of this creature that
 * is about *when* rather than about *how far in*.
 *
 * Its own file beside `beatbox.ts` when the beat flash took that one over its
 * 250-line limit, and along a seam the two halves already had: next door is how
 * big a box is drawn and how far through each of its timed pictures it is —
 * sizes and clocks — and this is the one thing that is neither, a decision about
 * hue taken from two of those readings. They change for different reasons and
 * were argued about separately every time.
 */

/**
 * **What colour is laid over a soundbox, and how far.**
 *
 * Two states, and the order between them is the creature: a body that has just
 * come apart is red for two beats whatever the clock is doing, because the pair
 * has to be told what went wrong before they are told what they may do next.
 * Only a box with nothing wrong with it goes blue.
 *
 * **The blue is the beat**, a flash on the boundary that is over a third of a
 * beat later (`beatboxBeatFlash`). It was the acceptance *window* — which is
 * the rule about which presses count — and that read as a colour changing at
 * neither of the moments the pair cares about, because the window is two thirds
 * of a beat wide. The owner asked for it to *switch to colour only on the beat
 * and then switch again*, and the switch back is the half that matters: a box
 * that were blue throughout would say nothing at all.
 *
 * `PALETTE.arc` and not the shield's cyan — `arc` is the hard electric blue THE
 * FENCE's current wears, chosen there precisely because it is neither
 * ammunition colour and touches neither, which is what a body no bolt can
 * answer needs.
 *
 * The red eases *out* rather than in: it is loudest on the frame the run came
 * apart, the frame the pair is looking for an answer on. The blue does not ease
 * at all — a window is open or shut, and a colour that faded up would put its
 * brightest instant somewhere in the middle of one.
 */
export function beatboxWash(world: World, c: Creature, beatPhase: number): Wash | undefined {
  const wrong = beatboxWrongThrough(world, c);
  if (wrong !== null) return { ...colorTrio("red"), amount: (1 - wrong) ** 0.7 };
  const beat = beatboxBeatFlash(beatPhase);
  if (beat <= 0) return undefined;
  return { rim: PALETTE.arcRim, hex: PALETTE.arc, dark: PALETTE.grid, amount: WINDOW_WASH * beat };
}

/**
 * **How blue the body is, this instant** — full on the boundary and gone a
 * third of a beat later.
 *
 * It was the acceptance window itself, and the owner reported that the colour
 * *is not visible on the beat but some other time*, asking for it to work the
 * way the rings do. He was right and the arithmetic says why: the window is
 * `beatboxWindowMs` **either side** of a beat, which at the shipped numbers is
 * forty-nine ticks of a seventy-five-tick beat. The box was blue for two thirds
 * of every beat, so what the eye actually read was the *gap* in the middle —
 * a colour changing twice a beat, at neither of the moments that matter.
 *
 * So this is the beat and not the window: it starts on the boundary, where the
 * thumb is aiming, and it is over well before the next one. That leaves part of
 * the window uncoloured, and deliberately — the window is a rule about which
 * presses count and the pair never needed a picture of its edges. What they
 * need is *now*, and now is an edge.
 *
 * `IDLE_LIFE`'s own figure in `beatbox-air.ts`, and the same one for the same
 * reason: the ring and the colour are one flash said twice, and two lengths
 * would make them two events.
 */
function beatboxBeatFlash(beatPhase: number): number {
  const t = beatPhase / BEAT_FLASH_LIFE;
  return t >= 1 ? 0 : (1 - t) ** 0.8;
}

/** How much of a beat the blue lasts — the ring's own life (`beatbox-air.ts`).
 * A third: the flash has to be over before the eye stops calling it *now*. */
const BEAT_FLASH_LIFE = 0.34;

/** How far a box goes towards blue on the beat itself. Most of the way:
 * the whole of what it says is *now*, and a tint the pair has to look twice at
 * is one they will not time a thumb against. */
const WINDOW_WASH = 0.8;
