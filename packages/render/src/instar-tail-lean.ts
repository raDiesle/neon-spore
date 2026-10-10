import { smoothstep } from "./ease.js";

/**
 * **THE INSTAR's resting tail, in two ways taken in turn** — the owner, 9
 * October 2026, on VERSUS `instar:tail`: *i like both again ... apply both to
 * different times during play and levels*. So the tail does a round of each,
 * six seconds a round, STATIONS first:
 *
 * - **STATIONS** stands straight up a while, swings to up and to the left,
 *   back to straight up, then to up and to the right of the rear, holding
 *   each place before it swings on.
 * - **PENDULUM** sweeps on one slow swing, never stopping: left, over the
 *   middle to the right, and back to the middle.
 *
 * Every round begins and ends straight up, so one hands over to the next
 * without a jump. The head's glances run in fours of the same length
 * (`instar-glance-styles.ts`), so after every four rounds the tail swaps
 * which way comes first, and each glance meets both ways in turn.
 * The lean is 1 up and to the right of the rear, 0 straight up, -1 up and to
 * the left (`instar-glance.ts`); a lash takes it over (`instar-tail.ts`).
 */

/** Seconds a round of one way takes. */
export const TAIL_ROUND = 6;

/** STATIONS' places: the lean at each, and how long it is held, seconds. With the swings, one round. */
const PLACES: readonly { lean: number; hold: number }[] = [
  { lean: 0, hold: 1 },
  { lean: -1, hold: 1.2 },
  { lean: 0, hold: 1 },
  { lean: 1, hold: 1.2 },
];
/** Seconds STATIONS' swing from one place to the next takes. */
const SWING = 0.4;

/** STATIONS' lean `t` seconds into its round: held, or swinging from one place to the next. */
function stations(t: number): number {
  for (let i = 0; i < PLACES.length; i++) {
    const here = PLACES[i] as (typeof PLACES)[number];
    if (t < here.hold) return here.lean;
    t -= here.hold;
    const next = PLACES[(i + 1) % PLACES.length] as (typeof PLACES)[number];
    if (t < SWING) return here.lean + (next.lean - here.lean) * smoothstep(t / SWING);
    t -= SWING;
  }
  return 0;
}

/** PENDULUM's lean `t` seconds into its round: one sine, begun from the middle swinging left. */
function pendulum(t: number): number {
  return -Math.sin((2 * Math.PI * t) / TAIL_ROUND);
}

const WAYS: readonly ((t: number) => number)[] = [stations, pendulum];

/** Which way the resting tail leans `time` seconds in: whichever round it is in, and how far through. */
export function tailLeanAt(time: number): number {
  const round = Math.floor(time / TAIL_ROUND);
  const turn = round + Math.floor(round / 4);
  const way = WAYS[((turn % WAYS.length) + WAYS.length) % WAYS.length];
  return (way as (typeof WAYS)[number])(time - round * TAIL_ROUND);
}
