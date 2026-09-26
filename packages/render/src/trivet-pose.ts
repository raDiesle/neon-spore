import {
  chording,
  type SimConfig,
  TRIVET_PLANTS_PER_FOOT,
  type TrivetState,
  trivetClosed,
  trivetLitStep,
  trivetTipSide,
  trivetWindowBeats,
  type World,
} from "@neon-spore/sim";
import { smoothstep } from "./ease.js";

/**
 * **The clock THE TRIVET is posed off** (§30, *Animation*): both feet up;
 * the front planted; both planted and the hub lit; the hub held with the feet
 * creeping loose; and collapsed — each read straight off the world, since the
 * plants on each foot and the beats a chord has been held are numbers the
 * simulation already keeps.
 *
 * **The hold is the swing.** A lit chord step on a lifted foot swings it down
 * by the share of its beats the chord has been held, so the count is read off
 * the leg rather than off a number, and a pad lifting drops the count to
 * nought and the foot springs back up — the spec's *swinging down and locking
 * rather than fading in*. The second plant is the same figure spent on the
 * clamp: it shuts over the ankle as the chord holds. A `both` step turns it
 * round, THE VISE's creep: the feet work loose as its window runs out, and the
 * share held presses them back down.
 */

/** How far a `both` step lets the outer feet creep up, as a share of the way lifted. */
const CREEP = 0.3;
/** How far the lit hub sits pressed down onto its legs, in tiles. */
const PRESSED = 0.16;

/** How far into its phase the stand is, in beats, the fraction of this one included. */
export function into(s: TrivetState, beat: number, beatPhase: number): number {
  return Math.max(0, beat - s.phaseBeat + beatPhase);
}

/** The drop into frame: 0 still above the field, 1 standing. */
export function trivetArrived(
  s: TrivetState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  if (s.phase !== "still") return 1;
  return smoothstep(into(s, beat, beatPhase) / Math.max(1, cfg.trivetStillBeats));
}

/** How far the stand has buckled: 0 standing, 1 down. */
export function trivetBuckle(
  s: TrivetState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  if (s.phase !== "collapse") return 0;
  return smoothstep(into(s, beat, beatPhase) / Math.max(1, cfg.trivetCollapseBeats));
}

/** How much of the lit step's window is left: 1 as it lights, 0 as it runs out. */
export function trivetLeft(world: World, s: TrivetState, beat: number, beatPhase: number): number {
  const step = trivetLitStep(s);
  if (step === null) return 0;
  const window = Math.max(1, trivetWindowBeats(world, step));
  return Math.max(0, 1 - into(s, beat, beatPhase) / window);
}

/** The share of the lit chord step's beats its chord has been held, this beat's fraction included while it still is. */
export function trivetHeldShare(s: TrivetState, beatPhase: number): number {
  const step = trivetLitStep(s);
  if (step === null || !chording(s)) return 0;
  const running = trivetClosed(s) ? beatPhase : 0;
  return Math.min(1, (s.heldBeats + running) / Math.max(1, step.beats));
}

/** Whether the lit step wants foot `side`'s own sockets: its own chord, both, or the lurch leaning on it. */
export function trivetAsksFoot(s: TrivetState, side: 0 | 1): boolean {
  const step = trivetLitStep(s);
  const ask = step?.ask;
  if (step !== null && ask === "tip") return trivetTipSide(step) === side;
  return ask === "both" || ask === (side === 0 ? "front" : "rear");
}

/** How far outer foot `side` is swung up: 0 planted, 1 lifted clear. */
export function trivetFootLift(
  world: World,
  s: TrivetState,
  side: 0 | 1,
  beat: number,
  beatPhase: number,
): number {
  const step = trivetLitStep(s);
  const held = trivetHeldShare(s, beatPhase);
  if (s.feet[side] === 0)
    return step !== null && step.ask !== "both" && trivetAsksFoot(s, side) ? 1 - held : 1;
  if (step?.ask !== "both") return 0;
  const run = 1 - trivetLeft(world, s, beat, beatPhase);
  return CREEP * run * (1 - held);
}

/** How far the clamp over foot `side`'s ankle is shut: 0 open, 1 locked home. */
export function trivetClamp(s: TrivetState, side: 0 | 1, beatPhase: number): number {
  if (s.feet[side] >= TRIVET_PLANTS_PER_FOOT) return 1;
  if (s.feet[side] === 0) return 0;
  const step = trivetLitStep(s);
  return step !== null && step.ask !== "both" && trivetAsksFoot(s, side)
    ? trivetHeldShare(s, beatPhase)
    : 0;
}

/** How far the hub sits pressed down, in tiles: down while it is lit, riding up off its legs while it is not. */
export function trivetHubPress(s: TrivetState): number {
  return s.hubLit ? PRESSED : 0;
}
