import {
  hullRow,
  podTicksToHull,
  primeTicks,
  scuttleBoss,
  scuttleWinding,
  type World,
} from "@neon-spore/sim";
import { cannonAnswers } from "./autopilot-aim.js";
import { cannonHand, shieldHand } from "./autopilot-field-hand.js";
import { catchPod } from "./autopilot-pod-hand.js";
import { scuttleHand } from "./boss-hands-field.js";
import type { Hand } from "./hand.js";

/**
 * **THE SCUTTLE's wave, played by AUTO**: the frame throws its hanging parts
 * down their columns on a clock — a rock, a slime, or a pod of its own
 * plating — and winds the last one up under the lance's fill; thrown, that
 * one goes through the hull and the wave. So the cannon has three claims on
 * it, settled the way the pair would out loud: a falling pod first, because
 * it is lost at the skin; a coloured body near the hull next; the live part
 * otherwise, while the frame is up; and the field once it is down. The
 * wind-up comes before all of them but a pod that would land before its beam.
 * The shield's half plays all the while, under the rocks the frame throws.
 *
 * Played in either order without the middle rule it lost both ways: the
 * field first never left the cannon on the frame, and the frame first left
 * the slimes to the hull (`scuttle-wave.test.ts`).
 */

/** Rows above the hull inside which a slime takes the cannon off the frame:
 * a slime falls a row a beat, and a shot needs a beat to aim and one to climb. */
const NEAR_ROWS = 5;

/** A body the cannon answers, close enough to the hull to come first. */
function near(w: World): boolean {
  const line = hullRow(w.cfg) - NEAR_ROWS;
  return w.creatures.some((c) => cannonAnswers(c) && c.row >= line);
}

/** The frame up, with a live part to shoot (`scuttleHand`'s own test). */
function frameUp(w: World): boolean {
  const s = scuttleBoss(w);
  return s !== null && s.downBeat < 0 && s.live >= 0;
}

/** The last part winding up under the lance's fill: thrown, it is the wave. */
function winding(w: World): boolean {
  const s = scuttleBoss(w);
  return s !== null && frameUp(w) && scuttleWinding(s);
}

/**
 * A pod falling while the last part winds up that lands after the beam would:
 * the fill is three of the wind-up's four beats and the cannon sliding empties
 * it, so such a pod waits — it steers into the cannon's column over its last
 * stretch, and the beam is down first. One that lands sooner is caught first.
 */
function podAfterBeam(w: World): boolean {
  const filled = w.prime === null ? primeTicks(w.cfg) : primeTicks(w.cfg) - (w.tick - w.prime.tick);
  for (const p of w.pods) if (p.loose && podTicksToHull(w, p) <= filled) return false;
  return true;
}

export const scuttleWaveHand: Hand = (w) => {
  if (winding(w) && !w.prime?.spent && podAfterBeam(w))
    return [...scuttleHand(w), ...shieldHand(w)];
  const cannon = catchPod(w) ?? (near(w) || !frameUp(w) ? cannonHand(w) : scuttleHand(w));
  return [...cannon, ...shieldHand(w)];
};
