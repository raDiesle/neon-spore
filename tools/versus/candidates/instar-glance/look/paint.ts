import { smoothstep } from "../../../../../packages/render/src/ease.js";
import { bodyLife } from "../../../../../packages/render/src/motion-life.js";

/**
 * The head looks the way an animal looks round: it holds a look, then turns
 * briskly to the next and holds that — left, the middle, right, the middle —
 * with a slight tilt of the head toward the side it looks at. Only the snout
 * swings and the eyes are held (`instar-turn.ts`); the tilt moves them by a
 * few pixels at most.
 */

/**
 * The snout's swing at each look, in head radii off the shipped turn, and how
 * long each is held, seconds. With the turns the round is six seconds, the
 * length the pair replays its pose over, so the page shows all of it.
 */
const LOOKS: readonly { swing: number; hold: number }[] = [
  { swing: -0.14, hold: 1.2 },
  { swing: 0.07, hold: 0.8 },
  { swing: 0.24, hold: 1.4 },
  { swing: 0.07, hold: 0.8 },
];
/** Seconds a turn from one look to the next takes. */
const TURN = 0.45;
/** How far the head tilts toward the side it looks at, radians per head radius of swing off the middle. */
const TILT = 0.28;
const MIDDLE = 0.05;

const CYCLE = LOOKS.reduce((t, k) => t + k.hold + TURN, 0);

/** Where the snout is `time` seconds in: held, or turning from one look to the next. */
function swingAt(time: number): number {
  let t = ((time % CYCLE) + CYCLE) % CYCLE;
  for (let i = 0; i < LOOKS.length; i++) {
    const here = LOOKS[i] as (typeof LOOKS)[number];
    if (t < here.hold) return here.swing;
    t -= here.hold;
    const next = LOOKS[(i + 1) % LOOKS.length] as (typeof LOOKS)[number];
    if (t < TURN) return here.swing + (next.swing - here.swing) * smoothstep(t / TURN);
    t -= TURN;
  }
  return (LOOKS[0] as (typeof LOOKS)[number]).swing;
}

export function lookGlance(time: number): number {
  return swingAt(time) * bodyLife();
}

export function lookRoll(time: number): number {
  return (swingAt(time) - MIDDLE) * TILT * bodyLife();
}
