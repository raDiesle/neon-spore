import { type MantleState, mantleBuckling, mantleTurning, type SimConfig } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";

/**
 * **How far along THE MANTLE's four story beats are** (§23 rows 7 to 12,
 * `sim/mantle-story.ts`): the buckle, the vent, the crosswise crack and the
 * turn, each a number off the world and the beat, so the pose, the grip and
 * the drawing all read the one answer. What draws them: `mantle-vent.ts`.
 *
 * - **The buckle bulges.** The weakened valves swell out past any pull's bow
 *   and throb, and flatten a step with every beat both thumbs lie eased on
 *   them — the count the simulation keeps in `braceBeats`.
 * - **The vent opens** on the seam's crack, half a beat to gape.
 * - **The crosswise crack grows** across the seam over the cross's beats and
 *   stays through the brace and the last pull; the split takes it with the
 *   seam's own.
 * - **The turn swings the halves part-way**, rocking on their hinges, and
 *   opens further as the lesser of the two pulls nears the floor — the pair
 *   guiding them. The heartbeat opens the rest of the way from where the
 *   guided swing left them, never from shut.
 */

/** How far the guided turn opens the halves, unguided and guided to the floor. */
const TURN_LOOSE = 0.25;
export const MANTLE_TURN_TOP = 0.6;
/** How far the unguided halves rock on their hinges, as a share of the open. */
const TURN_ROCK = 0.06;
/** How far the buckle flattens at the count, as a share of its swell. */
const FLATTEN = 0.85;

/** How far into its phase the shell is, in beats, the fraction of this one included. */
export function mantleInto(s: MantleState, beat: number, beatPhase: number): number {
  return Math.max(0, beat - s.phaseBeat + beatPhase);
}

/** How far the buckled valves bulge: 0 unless buckling, eased up, pressed flatter as the hold counts. */
export function mantleBulge(
  s: MantleState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  if (!mantleBuckling(s)) return 0;
  const pressed = Math.min(1, s.braceBeats / Math.max(1, cfg.mantleBuckleBeats));
  const throb = 1 + 0.12 * (1 - pressed) * Math.sin(beatPhase * Math.PI * 2);
  return smoothstep(mantleInto(s, beat, beatPhase)) * (1 - FLATTEN * pressed) * throb;
}

/** How wide the vent gapes: 0 unless venting, open over half a beat. */
export function mantleVentOpen(s: MantleState, beat: number, beatPhase: number): number {
  if (s.phase !== "vent") return 0;
  return smoothstep(mantleInto(s, beat, beatPhase) / 0.5);
}

/**
 * How far the crosswise crack runs, 0 to 1: grown over the cross's beats,
 * whole through the brace and the last pull, and none before or after.
 */
export function mantleCrossCrack(
  s: MantleState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  const pairs = s.thresholds.length;
  if (pairs < 2) return 0;
  if (s.phase === "cross") {
    return smoothstep(mantleInto(s, beat, beatPhase) / Math.max(1, cfg.mantleCrossBeats));
  }
  const last = s.cursor === pairs - 1;
  return last && (s.phase === "brace" || s.phase === "pull" || s.phase === "spark") ? 1 : 0;
}

/** How near the pair are to guiding the halves open: the lesser pull against the floor. */
export function mantleTurnGuide(s: MantleState, cfg: SimConfig): number {
  if (!mantleTurning(s)) return 0;
  const least = Math.min(s.depthMilli[0], s.depthMilli[1]);
  return Math.min(1, least / Math.max(1, cfg.mantleFloorMilli));
}

/** How far the halves stand open while turning: part-way, rocking, further as they are guided. */
export function mantleTurnOpen(
  s: MantleState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  const into = mantleInto(s, beat, beatPhase);
  const guide = mantleTurnGuide(s, cfg);
  const rock = TURN_ROCK * (1 - guide) * Math.sin(into * Math.PI * 2);
  const open = TURN_LOOSE + (MANTLE_TURN_TOP - TURN_LOOSE) * guide + rock;
  return smoothstep(into) * open;
}
