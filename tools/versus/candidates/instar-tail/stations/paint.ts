import { smoothstep } from "../../../../../packages/render/src/ease.js";

/**
 * The resting tail stands in one place a while, then swings to the next:
 * straight up, up to the left, straight up again, then up to the right of
 * the rear, where it ships — starting in the middle so the first frame is
 * not the shipped one. A lash takes it over wherever it is
 * (`instar-tail.ts`), so the fork is always over its marks.
 */

/**
 * The lean at each place, 1 right to -1 left, and how long it is held there,
 * seconds. With the swings the round is six seconds, the length the pair
 * replays its pose over, so the page shows all of it.
 */
const PLACES: readonly { lean: number; hold: number }[] = [
  { lean: 0, hold: 1 },
  { lean: -1, hold: 1.2 },
  { lean: 0, hold: 1 },
  { lean: 1, hold: 1.2 },
];
/** Seconds the swing from one place to the next takes. */
const SWING = 0.4;

const CYCLE = PLACES.reduce((t, p) => t + p.hold + SWING, 0);

export function stationsLean(time: number): number {
  let t = ((time % CYCLE) + CYCLE) % CYCLE;
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
