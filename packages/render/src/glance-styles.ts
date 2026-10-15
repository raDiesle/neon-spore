import { smoothstep } from "./ease.js";
import type { Glance } from "./glance.js";
import { GLANCE_ROUND, type GlanceTemper, STEADY, temperedAt } from "./glance-temper.js";
import { bodyLife } from "./motion-life.js";

/**
 * **The three ways a part glances**, as the owner took them for THE INSTAR's
 * head on 9 October 2026 (`instar-glance-styles.ts`) and asked for on every
 * other boss the next day — COCK, which he liked best, SWAY and LOOK:
 *
 * - **SWAY** turns from looking left to looking right and back on one sine.
 * - **COCK** turns the same way and cocks side to side three times as fast.
 * - **LOOK** holds a look at the middle, the left, the middle and the right,
 *   turning briskly between them, the part tilted toward where it looks.
 * - **ROVE** holds looks as LOOK does, but up and down as well as across —
 *   the middle, up, left, down, right — cocked toward a look to the side and
 *   level on one up or down (the owner, 15 October 2026: *glance him not only
 *   to left and right, but also to top and bottom*). It nods (`glance.ts`).
 *
 * A steady round is six seconds — each boss plays it its own way
 * (`glance-temper.ts`) — and every round begins and ends at the middle of the
 * swing with the part level, so one hands over to the next without a jump. The swing is in part radii, +
 * toward the screen's right; the roll in radians, + clockwise (`glance.ts`).
 */

/** Seconds a steady round of one glance takes; a boss's own temper stretches it (`glance-temper.ts`). */
export { GLANCE_ROUND } from "./glance-temper.js";

/** How big a part's glance is. */
export interface GlanceSize {
  /** How far the middle swings either way, part radii. */
  reach: number;
  /** COCK's widest roll, radians. */
  cock: number;
  /** LOOK's tilt toward where it looks, radians per part radius of swing. */
  tilt: number;
}

export interface GlancePose {
  swing: number;
  roll: number;
  /** How far the middle swings up or down, part radii, + down: only a style that nods has one. */
  nod?: number;
}

/** How many times COCK cocks a steady round; a temper says how many its own rounds take. */
const COCKS = 3;
/** LOOK's looks, as shares of the reach, and how long each is held, seconds. With the turns, one round. */
const LOOKS: readonly { at: number; hold: number }[] = [
  { at: 0, hold: 0.6 },
  { at: -1, hold: 1.3 },
  { at: 0, hold: 0.8 },
  { at: 1, hold: 1.5 },
];
/** Seconds LOOK's turn from one look to the next takes. */
const LOOK_TURN = 0.45;
/**
 * ROVE's looks — across and down, as shares of the reach — and how long each
 * is held, seconds. With a turn of `ROVE_TURN` into each, one round.
 */
const ROVES: readonly { x: number; y: number; hold: number }[] = [
  { x: 0, y: 0, hold: 0.5 },
  { x: 0, y: -1, hold: 0.9 },
  { x: -1, y: 0, hold: 0.8 },
  { x: 0, y: 1, hold: 1 },
  { x: 1, y: 0, hold: 0.8 },
];
/** Seconds ROVE's turn from one look to the next takes. */
const ROVE_TURN = 0.4;

/** A turn on one sine, `t` seconds into its round, as a share of the reach. */
const turning = (t: number): number => Math.sin((2 * Math.PI * t) / GLANCE_ROUND);

/** LOOK's swing `t` seconds into its round, as a share of the reach: held, or turning to the next look. */
function looking(t: number): number {
  for (let i = 0; i < LOOKS.length; i++) {
    const here = LOOKS[i] as (typeof LOOKS)[number];
    if (t < here.hold) return here.at;
    t -= here.hold;
    const next = LOOKS[(i + 1) % LOOKS.length] as (typeof LOOKS)[number];
    if (t < LOOK_TURN) return here.at + (next.at - here.at) * smoothstep(t / LOOK_TURN);
    t -= LOOK_TURN;
  }
  return 0;
}

/** ROVE's look `t` seconds into its round, as shares of the reach: held, or turning to the next look. */
function roving(t: number): { x: number; y: number } {
  for (let i = 0; i < ROVES.length; i++) {
    const here = ROVES[i] as (typeof ROVES)[number];
    if (t < here.hold) return here;
    t -= here.hold;
    const next = ROVES[(i + 1) % ROVES.length] as (typeof ROVES)[number];
    if (t < ROVE_TURN) {
      const k = smoothstep(t / ROVE_TURN);
      return { x: here.x + (next.x - here.x) * k, y: here.y + (next.y - here.y) * k };
    }
    t -= ROVE_TURN;
  }
  return { x: 0, y: 0 };
}

/** A style: where a part of size `z` is, `t` seconds into one of its rounds, cocking `cocks` times a round. */
export type GlanceStyle = (t: number, z: GlanceSize, cocks?: number) => GlancePose;

export const sway: GlanceStyle = (t, z) => ({ swing: z.reach * turning(t), roll: 0 });
export const cock: GlanceStyle = (t, z, cocks = COCKS) => ({
  swing: z.reach * turning(t),
  roll: z.cock * Math.sin((2 * Math.PI * cocks * t) / GLANCE_ROUND),
});
export const look: GlanceStyle = (t, z) => {
  const swing = z.reach * looking(t);
  return { swing, roll: swing * z.tilt };
};
export const rove: GlanceStyle = (t, z) => {
  const at = roving(t);
  return { swing: z.reach * at.x, roll: z.cock * at.x, nod: z.reach * at.y };
};

/** `style` round after round, on any clock: where the part is `time` seconds in. */
export function glanceRound(style: GlanceStyle, time: number, z: GlanceSize): GlancePose {
  const round = Math.floor(time / GLANCE_ROUND);
  return style(time - round * GLANCE_ROUND, z);
}

/**
 * A glance record running `style` over and over on `temper` — a boss's own,
 * read off its name (`temperOf`), or every round alike — halved on a device
 * asking for less motion (`bodyLife`): what a boss's record is.
 */
export function glanceOf(style: GlanceStyle, z: GlanceSize, temper: GlanceTemper = STEADY): Glance {
  const at = (time: number): GlancePose => {
    const { t, gain } = temperedAt(temper, time);
    const p = style(t, z, temper.cocks);
    return { swing: p.swing * gain, roll: p.roll * gain, nod: (p.nod ?? 0) * gain };
  };
  const glance: Glance = {
    swing: (time) => at(time).swing * bodyLife(),
    roll: (time) => at(time).roll * bodyLife(),
  };
  // Only a style that nods gives its record a nod, so every other part is drawn as it always was.
  if (style(0, z).nod === undefined) return glance;
  return { ...glance, nod: (time) => (at(time).nod ?? 0) * bodyLife() };
}
