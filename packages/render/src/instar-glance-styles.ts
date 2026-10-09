import { smoothstep } from "./ease.js";

/**
 * **THE INSTAR's three glances, taken in turn** — the owner, 9 October 2026,
 * on VERSUS `instar:glance`: *all really cool ... apply all three across the
 * levels for more variety*, and of the three *the cock variant looks the
 * best*. So the head does one round of each, six seconds a round, COCK first:
 *
 * - **COCK** turns from looking left to looking right and back, and cocks
 *   side to side three times as fast.
 * - **SWAY** turns the same way and does not cock.
 * - **LOOK** holds a look at the middle, the left, the middle and the right,
 *   turning briskly between them, the head tilted toward where it looks.
 *
 * Every round begins and ends at the middle of the swing with the head level,
 * so one hands over to the next without a jump. The swing is in head radii on
 * top of the head's own turn, + toward the screen's right; the roll is in
 * radians, + clockwise (`instar-glance.ts`, `instar-turn.ts`).
 */

/** Seconds a round of one glance takes. */
export const GLANCE_ROUND = 6;
/** Where every round begins and ends: past the head's rest, toward the right. */
const MIDDLE = 0.05;
/** How far a turning round swings either way from the middle. */
const REACH = { sway: 0.19, cock: 0.17 } as const;
/** How far the head cocks, radians, and how many times a round. */
const COCK = 0.09;
const COCKS = 3;

/** LOOK's looks: the swing at each, and how long it is held, seconds. With the turns, one round. */
const LOOKS: readonly { swing: number; hold: number }[] = [
  { swing: MIDDLE, hold: 0.6 },
  { swing: -0.14, hold: 1.3 },
  { swing: MIDDLE, hold: 0.8 },
  { swing: 0.24, hold: 1.5 },
];
/** Seconds LOOK's turn from one look to the next takes. */
const LOOK_TURN = 0.45;
/** How far LOOK tilts the head toward where it looks, radians per head radius of swing off the middle. */
const TILT = 0.28;

export interface GlancePose {
  swing: number;
  roll: number;
}

/** A turn on one sine, `t` seconds into its round. */
function turning(t: number, reach: number): number {
  return MIDDLE + reach * Math.sin((2 * Math.PI * t) / GLANCE_ROUND);
}

/** LOOK's swing `t` seconds into its round: held, or turning from one look to the next. */
function looking(t: number): number {
  for (let i = 0; i < LOOKS.length; i++) {
    const here = LOOKS[i] as (typeof LOOKS)[number];
    if (t < here.hold) return here.swing;
    t -= here.hold;
    const next = LOOKS[(i + 1) % LOOKS.length] as (typeof LOOKS)[number];
    if (t < LOOK_TURN) return here.swing + (next.swing - here.swing) * smoothstep(t / LOOK_TURN);
    t -= LOOK_TURN;
  }
  return MIDDLE;
}

const STYLES: readonly ((t: number) => GlancePose)[] = [
  (t) => ({
    swing: turning(t, REACH.cock),
    roll: COCK * Math.sin((2 * Math.PI * COCKS * t) / GLANCE_ROUND),
  }),
  (t) => ({ swing: turning(t, REACH.sway), roll: 0 }),
  (t) => {
    const swing = looking(t);
    return { swing, roll: (swing - MIDDLE) * TILT };
  },
];

/** Where the head glances `time` seconds in: whichever round it is in, and how far through. */
export function glanceAt(time: number): GlancePose {
  const round = Math.floor(time / GLANCE_ROUND);
  const style = STYLES[((round % STYLES.length) + STYLES.length) % STYLES.length];
  return (style as (typeof STYLES)[number])(time - round * GLANCE_ROUND);
}
