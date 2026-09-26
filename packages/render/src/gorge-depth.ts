import { breath } from "./solid-motion.js";

/**
 * **THE GORGE in depth**: the sack is not a strip painted across the top of
 * the field but a body bowed round toward the pair, its middle lobes nearest
 * and its outer ones going away into the dark on either side — and it turns,
 * slowly, all the time, so one end comes forward as the other goes back.
 *
 * **The columns do not move.** A lobe stands over its column however the sack
 * is turned, because a shot up that column is the rule (`sim/gorge-step.ts`):
 * only what depth does to a thing *in place* is used — the lens swells what
 * is near and shrinks what is far, the far is hazed toward the field, and the
 * near is drawn over the far where they meet. The lens is the rig's divide,
 * `lens / (lens - z)`, with the centre left where it stands.
 *
 * Nothing here keeps state: the turn is a breath of the clock
 * (`solid-motion.ts`), so a restart starts it again.
 */

/** How far the sack's middle bows toward the player, in tiles, over its ends. */
const BOW = 0.9;
/** How far its turn brings one end forward and takes the other back, in tiles. */
const SWAY = 0.55;
/** How far off the eye is, in tiles. */
const LENS = 9;
/** The turn's period, in seconds: slower than the beat, so it is the body's and not the music's. */
const TURN_PERIOD = 7.5;
/** How much of the way toward the field the furthest lobe is hazed. */
const HAZE = 0.28;
const HAZE_STEPS = 6;

export interface LobeDepth {
  /** The lens at this lobe: above 1 is nearer than the sack's rim, below 1 further. */
  readonly s: number;
  /** How far it is hazed toward the field: 0 at the nearest lobe, `HAZE` at the furthest, stepped. */
  readonly back: number;
  /** The sack's turn, -1..1, for the light that slides across it as it goes. */
  readonly turn: number;
}

/** Every lobe's depth this frame, `n` lobes across the sack. */
export function lobeDepths(n: number, time: number): LobeDepth[] {
  const turn = breath(time, TURN_PERIOD, 0.35, 11);
  const mid = (n - 1) / 2 || 1;
  const z = Array.from({ length: n }, (_, i) => {
    const u = (i - mid) / mid;
    return BOW * (1 - u * u) + SWAY * u * turn;
  });
  const near = Math.max(...z);
  const far = Math.min(...z);
  const span = near - far || 1;
  return z.map((d) => ({
    s: LENS / (LENS - d),
    back: (Math.round(((near - d) / span) * HAZE_STEPS) / HAZE_STEPS) * HAZE,
    turn,
  }));
}
