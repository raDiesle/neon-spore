import { RATCHET_TEETH, type RatchetState, type SimConfig } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";

/**
 * **How far through a pose THE RATCHET is** — the clock the rack is posed
 * off (§22, *Animation*).
 *
 * Its own page off `ratchet-draw.ts` for `hasp-pose.ts`'s reason: next door
 * is *what the rack looks like*, and here is *where the fight has got to*,
 * read off the boss and the beat alone, so nothing is kept between frames and
 * a restart poses the rack from the state (`restart.test.ts`).
 *
 * **The poses are one number for the rack** — how many plates have passed
 * the pawl, fractional while it climbs — and one each for the three ends it
 * can come to: the still easing in, the strut folding away at the top, and
 * the rack driving down into the hull. A pose is never cut to.
 */

/** How long the rack takes to drive into the hull once it jams, in beats. */
const JAM_BEATS = 1;
/** How far through a climb the pawl's tip has ridden to the top of a tooth and drops. */
const SNAP = 0.7;

/** How far through a phase the scene is, 0..1, counted from the beat it began. */
function through(s: RatchetState, beats: number, beat: number, beatPhase: number): number {
  const done = (beat - s.phaseBeat + beatPhase) / Math.max(1, beats);
  return Math.min(1, Math.max(0, done));
}

/** How far up out of the dark the rack has come, 0..1 — 1 everywhere but the opening still. */
export function ratchetStillPhase(
  s: RatchetState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  return s.phase === "still" ? through(s, cfg.ratchetStillBeats, beat, beatPhase) : 1;
}

/** How far the current climb has come, 0..1; 1 outside a climb. */
function climbed(s: RatchetState, cfg: SimConfig, beat: number, beatPhase: number): number {
  return s.phase === "climb" ? through(s, cfg.ratchetClimbBeats, beat, beatPhase) : 1;
}

/**
 * **How many plates have passed the pawl**, fractional while the rack
 * climbs: the simulation has already spent the tooth by the time the climb
 * begins, so the rack eases up from the last one over the climb's own beats.
 * It is the health read off the body — the teeth left are the plates still
 * below the pawl, and nothing prints the number.
 */
export function ratchetRise(
  s: RatchetState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  const spent = RATCHET_TEETH - s.teeth;
  if (s.phase !== "climb") return spent;
  return spent - 1 + smoothstep(climbed(s, cfg, beat, beatPhase));
}

/**
 * **The click**: how far the pawl's tip stands lifted, 0..1, as the tooth it
 * bore on rides up under it — out over the tooth's slope and then dropping
 * flat onto the next shoulder, quick, the one visible snap of a step that
 * cannot be taken back. Nought outside a climb.
 */
export function ratchetPawlLift(
  s: RatchetState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  if (s.phase !== "climb") return 0;
  const t = climbed(s, cfg, beat, beatPhase);
  return t < SNAP ? smoothstep(t / SNAP) : Math.max(0, 1 - (t - SNAP) / 0.08);
}

/**
 * **The strut folding away**, 0..1, once the top catch has given: the
 * perspective change §22's payoff asks for, the whole strut tipping down and
 * away from the ship about the lock at its top, so the rack is seen
 * foreshortening rather than fading. Nought until the rack opens.
 */
export function ratchetFold(
  s: RatchetState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  return s.phase === "open" ? smoothstep(through(s, cfg.ratchetOpenBeats, beat, beatPhase)) : 0;
}

/** How far the jammed rack has driven down into the hull, 0..1. Nought until it jams. */
export function ratchetDrive(s: RatchetState, beat: number, beatPhase: number): number {
  if (s.phase !== "jam") return 0;
  const t = through(s, JAM_BEATS, beat, beatPhase);
  // Heavy: it starts slow and lands hard, the opposite of the climb's ease.
  return t * t;
}
