import type { PlumbState, SimConfig } from "@neon-spore/sim";
import type { Circle, Layout } from "./layout.js";
import { plumbArrived, plumbSkew } from "./plumb-pose.js";
import { plumbBallR, plumbBeamEnd, plumbChain, plumbHook, plumbLift } from "./plumb-shape.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * **The stones on THE PLUMB** — the hands lane that makes the bob answer a
 * thumb (§11.48, `bosses-choreographed.md` §31).
 *
 * Its own page for `capstan-grip.ts`' reason: the stone a thumb is answered on
 * is the one `drawPlumb` hangs this frame, dropped in as it arrives and off
 * the end of a beam that rises as the weights settle, and all this file adds
 * is *whose* stone a press is on.
 *
 * **Geometry says whose stone is whose, on both phones.** The left is Player
 * 1's and the right Player 2's (`sim/plumb-hand.ts`); both screens hang the
 * whole bob, and a press on the other seat's stone falls through, as the
 * simulation would refuse it anyway.
 *
 * **What a pull says is how far across the thumb has carried** since it went
 * down (`touch-drag.ts`), and a lift is a pull of nought. It was the phone's
 * lean until 29 September 2026: the owner ruled on 27 September that no wave
 * may need a tilt sensor.
 */

/** How far past a stone's own radius a press still takes it, in tiles: it swings on its chain. */
const REACH = 0.6;

/** Whether the bob is there to be pulled: every phase but the one it falls away in. */
export function plumbTakesHand(s: PlumbState): boolean {
  return s.phase !== "free";
}

/**
 * Stone `side` at rest where it hangs this frame, before its swing, as the
 * circle a press is tested against — which is also where the ghost thumb goes
 * down, what `handleCircle` answers and where the cue says PULL.
 */
export function plumbStoneStanding(
  l: Layout,
  cfg: SimConfig,
  s: PlumbState,
  side: 0 | 1,
  beat: number,
  beatPhase: number,
): Circle {
  const hook = plumbHook(l, cfg);
  const lift = plumbLift(l, plumbArrived(s, { cfg }, beat, beatPhase));
  const end = plumbBeamEnd(l, side, plumbSkew(s, beatPhase));
  return {
    x: hook.x + end.x,
    y: hook.y - lift + end.y + plumbChain(l),
    r: plumbBallR(l, side) + REACH * l.tile,
  };
}

/**
 * A press on this seat's own stone: a pulling thumb, held and saying nothing
 * until it moves. `bossOf(field, "plumb")` is `null` on every wave without it.
 */
export function plumbPullUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "plumb");
  if (s === null || !plumbTakesHand(s)) return null;
  const seat = field.seat;
  const side: 0 | 1 = seat === 1 ? 0 : 1;
  const c = plumbStoneStanding(l, field.cfg, s, side, field.beat, field.beatPhase);
  if (Math.hypot(x - c.x, y - c.y) > c.r) return null;
  const target = side === 0 ? "plumbLevelLeft" : "plumbLevelRight";
  return {
    player: seat,
    command: null,
    hold: { kind: "drag", target, player: seat, originX: x, originY: y },
  };
}
