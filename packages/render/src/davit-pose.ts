import type { SimConfig, World } from "@neon-spore/sim";
import {
  type DavitState,
  davitHalf,
  davitLitStep,
  davitOnTarget,
  davitSteering,
} from "@neon-spore/sim";
import { smoothstep } from "./ease.js";

/**
 * THE DAVIT's timing: how far the boom has stood up out of stowed, how far a
 * lit step's window has run, whether the pivot glows, and whether a seat's
 * own loose hand is worth drawing as asking.
 */

function into(s: DavitState, beat: number, beatPhase: number): number {
  return Math.max(0, beat - s.phaseBeat + beatPhase);
}

/** How far the boom stands out of its stowed socket: 0 just settled, 1 fully up. */
export function davitStood(
  s: DavitState,
  beat: number,
  beatPhase: number,
  stillBeats: number,
): number {
  if (s.phase === "spent") return 1;
  return smoothstep(into(s, beat, beatPhase) / Math.max(1, stillBeats));
}

/**
 * **The angle the boom is drawn at**, in radians: the live `aimMilli` while a
 * lean steers it, and with nobody steering, eased from there toward where
 * the next beat's swing back leaves it.
 *
 * The simulation swings the boom back a whole `davitDriftMilli` once a beat
 * (`davit-step.ts` `swing`), and drawn as it stood, the hook a fire step asks
 * for jumped about an eighth of a tile each beat of its window. Eased, the
 * beat lands where the drawing already is, as `sinewMassRowNow` eases THE
 * SINEW's fall a row a beat. What is left is the instant a steer lets go in
 * the middle of a beat, a loose landing or a lean leaving its target, when
 * the boom takes up the part of the beat's swing already gone.
 */
export function davitAngle(s: DavitState, cfg: SimConfig, beatPhase: number): number {
  const aim = davitSteering(s) === null ? swungBack(s.aimMilli, cfg, beatPhase) : s.aimMilli;
  return (aim / 1000) * (Math.PI / 180);
}

/** `aimMilli` taken `beatPhase` of the way through one beat's swing back toward hanging, never past it. */
function swungBack(aimMilli: number, cfg: SimConfig, beatPhase: number): number {
  const drift = cfg.davitDriftMilli * Math.max(0, Math.min(1, beatPhase));
  return aimMilli > 0 ? Math.max(0, aimMilli - drift) : Math.min(0, aimMilli + drift);
}

/**
 * How much of the lit step's window is left, 1 fresh down to 0 run out — or 1
 * when nothing is lit. A fire step's window is its own beats; any other
 * step's is its beats plus the grace, `davitWindowBeats`'s own rule
 * (`davit-step.ts`) read here off `world.cfg` rather than re-imported, since
 * that function is `sim`'s internal clock rather than a name the surface
 * exports.
 */
export function davitWindowLeft(
  world: World,
  s: DavitState,
  beat: number,
  beatPhase: number,
): number {
  const step = davitLitStep(s);
  if (step === null) return 1;
  const window = step.ask === "fire" ? step.beats : step.beats + world.cfg.davitGraceBeats;
  return Math.max(0, 1 - into(s, beat, beatPhase) / Math.max(1, window));
}

/** How lit the hook/pivot is drawn: bright once `pivotLit`, dim otherwise. */
export function davitPivotGlow(s: DavitState): number {
  return s.pivotLit ? 1 : 0.35;
}

/** Whether this seat's lean is steering the boom onto the lit step's target right now. */
export function davitSteeredBy(s: DavitState, side: 0 | 1): boolean {
  return davitSteering(s) === side && davitOnTarget(s, side);
}

/** The half the lit step's target lean falls in, or null with nothing lit. */
export function davitLitHalf(s: DavitState): "left" | "right" | null {
  const step = davitLitStep(s);
  return step === null ? null : davitHalf(step.leanMilli);
}
