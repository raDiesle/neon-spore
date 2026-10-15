import {
  hullRow,
  MILLI,
  type Pod,
  podTicksToHull,
  primeTicks,
  scuttleAttached,
  scuttleBoss,
  scuttleSocketCol,
  scuttleWinding,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";
import { cannonAnswers } from "./autopilot-aim.js";
import { cannonHand, shieldHand } from "./autopilot-field-hand.js";
import { catchPod } from "./autopilot-pod-hand.js";
import { scuttleHand } from "./boss-hands-field.js";
import type { Hand } from "./hand.js";

type Press = Omit<TimedCommand, "tick">;

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
 * In the frame's last cycles a pod hanging over a part still attached is shot
 * loose before any of that, and no other pod is, because a pod taken during
 * the fill spills it; the carry that keeps a column clear is
 * `scuttle-swing.ts`'.
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

/**
 * The frame's last cycles: the next part to come loose is the wind-up's, or
 * the one after is. A pod shot loose now lands inside the wind-up, and taking
 * it opens the maw — which spills the fill the beam needs (`sim/commands.ts`).
 */
function late(w: World): boolean {
  const s = scuttleBoss(w);
  return s !== null && s.downBeat < 0 && scuttleAttached(s).length <= 2;
}

/** The column pod `p` hangs in. */
const podCol = (p: Pod): number => Math.round(p.colMilli / MILLI);

/** A pod hanging in the cannon's column, which a bolt up it frees whatever the bolt was fired at. */
function podOverhead(w: World): boolean {
  return w.pods.some((p) => !p.loose && podCol(p) === w.cannonCol);
}

/**
 * A pod hanging over a part still attached, which stops the beam if that part
 * is the last (`sim/lance-burn.ts`): shot loose before the wind-up, so it is
 * taken before the fill starts. `null` while none hangs there, or once the
 * frame is winding and it is too late to.
 */
function podOverLast(w: World): Press[] | null {
  const s = scuttleBoss(w);
  if (s === null || !frameUp(w) || scuttleWinding(s) || !late(w)) return null;
  const cols = scuttleAttached(s).map((i) => scuttleSocketCol(w.cfg, i));
  const pod = w.pods.find((p) => !p.loose && cols.includes(podCol(p)));
  if (pod === undefined) return null;
  const col = podCol(pod);
  if (w.cannonCol !== col) return [{ player: 1, command: { kind: "cannonCol", col } }];
  if (w.bullets.length > 0 || w.beam !== null) return [];
  return [{ player: 2, command: { kind: "fire", color: s.parts[s.live]?.color ?? "red" } }];
}

export const scuttleWaveHand: Hand = (w) => {
  if (winding(w) && !w.prime?.spent && podAfterBeam(w))
    return [...scuttleHand(w), ...shieldHand(w)];
  const cannon = catchPod(w) ?? podOverLast(w) ?? fieldOrFrame(w);
  return [...cannon, ...shieldHand(w)];
};

/**
 * The field near the hull or with the frame down, the frame otherwise — and
 * in its last cycles, no bolt up a column a pod hangs in: it waits as long as
 * it is left, and the field takes it once the frame is down.
 */
function fieldOrFrame(w: World): Press[] {
  const out = near(w) || !frameUp(w) ? cannonHand(w) : scuttleHand(w);
  return late(w) && podOverhead(w) ? out.filter((p) => p.command.kind !== "fire") : out;
}
