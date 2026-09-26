import { midCol } from "./config.js";
import { breachHull } from "./hull-damage.js";
import {
  type MantleState,
  mantleCharged,
  mantleFinale,
  mantleLeaking,
  NO_SPARK,
} from "./mantle.js";
import { openSlow } from "./slow.js";
import type { World } from "./world.js";

/**
 * THE MANTLE's clock: the handles lighting, the sum judged every beat, the
 * shear, the spark, and the alternating finish.
 *
 * **Nothing closes a window on a pull movement.** There is no strike for a
 * slow pull: handles that never cross the threshold just stay lit, and a
 * thumb that lets go resets its own handle to nought at once
 * (`mantle-hand.ts`) — the whole cost of letting go is starting that pull
 * over. The one thing that reaches the hull is the bared core's spark, which
 * is a hazard and not a window.
 */

export function installMantle(world: World, thresholds: readonly number[]): MantleState {
  const s: MantleState = {
    kind: "mantle",
    thresholds: [...thresholds],
    cursor: 0,
    phase: "still",
    phaseBeat: world.beat,
    depthMilli: [0, 0],
    sparkCol: NO_SPARK,
    sparkBeat: 0,
    heartbeatNext: 0,
    heartbeatDone: 0,
  };
  world.events.push({ type: "mantleEnter", col: midCol(world.cfg) });
  return s;
}

export function stepMantle(world: World, s: MantleState): void {
  const cfg = world.cfg;
  const mid = midCol(cfg);
  // The one hazard, judged before anything else this beat: a spark that has
  // been leaking too long reaches the ship whatever the handles are doing.
  spendSpark(world, s);
  if (s.phase === "dark") {
    if (world.beat - s.phaseBeat >= cfg.mantleOpenBeats) {
      world.events.push({ type: "mantleOut", col: mid });
      world.boss = null;
    }
    return;
  }
  if (s.phase === "still") {
    if (world.beat - s.phaseBeat >= cfg.mantleStillBeats) light(world, s);
    return;
  }
  if (mantleFinale(s)) return; // the taps are judged in mantle-hand.ts, on the tick
  if (mantleCharged(s, cfg.mantleFloorMilli)) shear(world, s);
}

/** The next movement's handles light, both handles reset to nought. */
function light(world: World, s: MantleState): void {
  s.phase = "pull";
  s.phaseBeat = world.beat;
  s.depthMilli = [0, 0];
  world.events.push({ type: "mantleLight", col: midCol(world.cfg) });
}

/** The summed pull crossed the threshold: a plate-pair off, under THE SLOW. */
function shear(world: World, s: MantleState): void {
  const cfg = world.cfg;
  s.cursor += 1;
  const left = s.thresholds.length - s.cursor;
  openSlow(world, cfg.mantleSlowBeats);
  world.events.push({ type: "mantleShear", left, col: midCol(cfg) });
  if (left === 0) {
    // The shell is fully split: the bare core shows, and the alternating
    // finish begins rather than another pull movement.
    world.events.push({ type: "mantleSplit", col: midCol(cfg) });
    s.phase = "heartbeat";
    s.phaseBeat = world.beat;
    s.heartbeatNext = 0;
    s.heartbeatDone = 0;
    return;
  }
  // A spark leaks from the open gap the instant the second pair shears — the
  // fight's one ordinary hazard, between the second and third movements.
  if (s.cursor === 2) {
    s.sparkCol = midCol(cfg);
    s.sparkBeat = world.beat;
    world.events.push({ type: "mantleLeak", col: s.sparkCol });
  }
  light(world, s);
}

/** The leaking spark, unanswered for `mantleSparkBeats`: the hull, and the wave. */
function spendSpark(world: World, s: MantleState): void {
  if (!mantleLeaking(s)) return;
  if (world.beat - s.sparkBeat < world.cfg.mantleSparkBeats) return;
  const col = s.sparkCol;
  s.sparkCol = NO_SPARK;
  world.events.push({ type: "mantleSparkHit", col });
  breachHull(world, col, "meteorFastest", 0, "heavy");
}
