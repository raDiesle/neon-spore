import {
  cock,
  GLANCE_ROUND,
  type GlancePose,
  type GlanceSize,
  type GlanceStyle,
  look,
  sway,
} from "./glance-styles.js";

/**
 * **THE INSTAR's three glances, taken in turn, COCK most** — the owner, 9 October 2026,
 * on VERSUS `instar:glance`: *all really cool ... apply all three across the
 * levels for more variety*, and of the three *the cock variant looks the
 * best*, and asked on 10 October for COCK to get the bigger share. So the head
 * goes COCK, SWAY, COCK, LOOK, six seconds a round — COCK two rounds in four:
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

/** Where every round begins and ends: past the head's rest, toward the right. */
const MIDDLE = 0.05;
/** How big each round is: COCK a little narrower than the other two (`glance-styles.ts`). */
const SIZE = {
  sway: { reach: 0.19, cock: 0, tilt: 0 },
  cock: { reach: 0.17, cock: 0.09, tilt: 0 },
  look: { reach: 0.19, cock: 0, tilt: 0.28 },
} as const;

export { GLANCE_ROUND, type GlancePose } from "./glance-styles.js";

/** A round of `style` at its size, about the head's own middle. */
const about =
  (style: GlanceStyle, z: GlanceSize) =>
  (t: number): GlancePose => {
    const p = style(t, z);
    return { swing: MIDDLE + p.swing, roll: p.roll };
  };

/** The rounds in order, then again: COCK, the owner's favourite, every other one. */
const STYLES: readonly ((t: number) => GlancePose)[] = [
  about(cock, SIZE.cock),
  about(sway, SIZE.sway),
  about(cock, SIZE.cock),
  about(look, SIZE.look),
];

/** Where the head glances `time` seconds in: whichever round it is in, and how far through. */
export function glanceAt(time: number): GlancePose {
  const round = Math.floor(time / GLANCE_ROUND);
  const style = STYLES[((round % STYLES.length) + STYLES.length) % STYLES.length];
  return (style as (typeof STYLES)[number])(time - round * GLANCE_ROUND);
}
