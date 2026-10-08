import {
  GALL_CLOSES,
  type GallState,
  gallClosing,
  gallLitStep,
  gallPresser,
  type SimConfig,
} from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { phaseInto } from "./phase-into.js";
import { NO_SPAN, type SlowSpan, slowHush } from "./slow-hush.js";

/**
 * **The clock THE GALL is posed off** (§38, *Animation*): the nodule rising
 * out of the seam as it settles in; swelling on its beat while a close is
 * lit; squeezed narrow by the press on it and sunk
 * into the seam by the beats it has been kept shut; a lobe fewer and smaller
 * for every close; gone once three have landed, and the seam peeled open
 * over the root; and the seam smoothed flat as the root is shot — each read
 * straight off the world, since the gap and the beats kept shut are numbers
 * the simulation keeps.
 *
 * **The jump is not posed.** The gall stands on its point until the close
 * lands and on the next point from that frame on: §38 asks for the single
 * frame, and a nodule seen sliding along the seam would be a nodule the pair
 * could follow with their eyes instead of their words.
 */

/** Lobes on a gall nobody has closed yet: NOTCH 2's own count. */
const LOBES = 5;
/** How much smaller a close leaves the nodule. */
const SPENT = 0.16;

/** The rise out of the seam: 0 still under it, 1 standing. */
export function gallArrived(s: GallState, cfg: SimConfig, beat: number, beatPhase: number): number {
  if (s.phase !== "slack" || s.cursor > 0) return 1;
  return smoothstep(phaseInto(s, beat, beatPhase) / Math.max(1, cfg.gallSlackBeats));
}

/** How far the seam has smoothed flat, the root shot: 0 standing, 1 gone. */
export function gallFlat(s: GallState, cfg: SimConfig, beat: number, beatPhase: number): number {
  if (s.phase !== "flat") return 0;
  return smoothstep(phaseInto(s, beat, beatPhase) / Math.max(1, cfg.gallFlatBeats));
}

/** How much of the lit step's window is left: 1 as it lights, 0 as it runs out. */
export function gallLeft(s: GallState, beat: number, beatPhase: number): number {
  const step = gallLitStep(s);
  if (step === null) return 0;
  return Math.max(0, 1 - phaseInto(s, beat, beatPhase) / Math.max(1, step.beats));
}

/**
 * How far the press on the gall has closed it: 0 wide open or no press on
 * it, 1 at the gap that counts as shut and under. Read on a lit close only —
 * a press at rest squeezes nothing, because nothing is asked of it.
 */
export function gallPress(s: GallState, cfg: SimConfig): number {
  if (!gallClosing(s)) return 0;
  const span = Math.max(1, cfg.gallOpenMilli - cfg.gallShutMilli);
  return Math.max(0, Math.min(1, 1 - (s.gapMilli - cfg.gallShutMilli) / span));
}

/** The share of the beats a close needs kept shut, this beat's fraction included while it is. */
export function gallHeld(s: GallState, cfg: SimConfig, beatPhase: number): number {
  if (!gallClosing(s)) return 0;
  const shut = s.gapMilli <= cfg.gallShutMilli;
  const running = shut ? beatPhase : 0;
  return Math.min(1, (s.heldBeats + running) / Math.max(1, cfg.gallShutBeats));
}

/** The nodule's lobes: NOTCH 2's five, one fewer for every close, never under two. */
export function gallLobes(s: Pick<GallState, "closes">): number {
  return Math.max(2, LOBES - s.closes);
}

/** The nodule's size: its fullest, a sixth smaller for every close. */
export function gallSpent(s: Pick<GallState, "closes">): number {
  return 1 - SPENT * Math.min(GALL_CLOSES, s.closes);
}

/**
 * How far the seam is peeled open over the root: 0 shut, 1 split wide. It
 * peels through the rest that follows the third close, stands open for the
 * shot, and closes again as the seam smooths flat.
 */
export function gallPart(s: GallState, cfg: SimConfig, beat: number, beatPhase: number): number {
  if (!s.bared) return 0;
  if (s.phase === "flat") return 1 - gallFlat(s, cfg, beat, beatPhase);
  if (s.phase === "rest")
    return smoothstep(phaseInto(s, beat, beatPhase) / Math.max(1, cfg.gallRestBeats));
  return 1;
}

/**
 * How far the nodule is gone into the peeled seam: 0 standing, 1 gone. It
 * goes as the seam peels, so the third close reads as the growth pulled
 * down into the hull and the root it was hiding coming up in its place.
 */
export function gallSunk(s: GallState, cfg: SimConfig, beat: number, beatPhase: number): number {
  if (!s.bared) return 0;
  if (s.phase === "rest") return gallPart(s, cfg, beat, beatPhase);
  return 1;
}

/**
 * How hard the seam ripples: once standing, more between closes — the rest
 * is the gall shivering on its new point — and dying away as it smooths flat.
 * It carries both rings, so it dies down under `slow` too (`slow-hush.ts`).
 */
export function gallRippling(
  s: GallState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
  slow: SlowSpan = NO_SPAN,
): number {
  return rippling(s, cfg, beat, beatPhase) * slowHush(slow, beat, beatPhase);
}

function rippling(s: GallState, cfg: SimConfig, beat: number, beatPhase: number): number {
  if (s.phase === "flat") return 1 - gallFlat(s, cfg, beat, beatPhase);
  if (s.phase === "rest") return 1.8;
  if (s.phase === "slack") return 1.3;
  return 1;
}

/** The swell on its beat while a close is lit, a breath the press presses flat. */
export function gallSwell(s: GallState, cfg: SimConfig, beatPhase: number): number {
  if (!gallClosing(s)) return 1;
  const breath = 0.5 + 0.5 * Math.cos(beatPhase * Math.PI * 2);
  return 1 + 0.08 * breath * (1 - gallPress(s, cfg));
}

/**
 * Which way the nodule heels, in radians: toward the end of the seam whose
 * seat is nearer it — π the left, the pilot's, nought the right — turned
 * over with the field under THE FLIP so it leans the way it is drawn.
 */
export function gallBearing(s: GallState, flip: boolean): number {
  const left = gallPresser(s) === 1;
  return left !== flip ? Math.PI : 0;
}
