import { midCol } from "./config.js";
import { breachHull } from "./hull-damage.js";
import {
  type MantlePhase,
  type MantleState,
  mantleCharged,
  mantleFinale,
  mantleLastPull,
  mantleLeaking,
  NO_SPARK,
} from "./mantle.js";
import {
  buckleMantle,
  stepBuckle,
  stepCross,
  stepTurn,
  stepVent,
  turnMantle,
} from "./mantle-story.js";
import { closeSlow, openSlow } from "./slow.js";
import type { World } from "./world.js";

/**
 * THE MANTLE's clock: the handles lighting, the sum judged every beat, the
 * shear, the spark, the brace, and the alternating finish.
 *
 * **No window on a pull reaches the hull.** Handles that never cross the
 * threshold just stay lit, and a thumb that lets go resets its own handle to
 * nought at once (`mantle-hand.ts`) — the whole cost of letting go is
 * starting that pull over. The one thing that reaches the hull is the bared
 * core's spark, which is a hazard and not a window.
 *
 * **The last pair is braced for, then pulled against a window** (§23 rows 7
 * and 8). Before it the shell shudders and asks for both handles held, not
 * pulled, for `mantleBraceBeats` under THE SLOW; a lift starts the hold over.
 * Held, the last pull lights with `mantleLastBeats`, and a window run out
 * resets rather than strikes — the only window on the body, and it costs
 * time, never the wave.
 *
 * **The shell fights back before it braces, and turns before it bares the
 * core** (§23 rows 7 to 12): the buckle, the vent and the crosswise crack
 * come between the third shear and the brace, and the guided turn between
 * the last shear and the heartbeat — `mantle-story.ts`, all four.
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
    held: [false, false],
    braceBeats: 0,
  };
  world.events.push({ type: "mantleEnter", col: midCol(world.cfg) });
  return s;
}

/** The shell's four story beats, each stepped by `mantle-story.ts`. */
const STORY: Partial<Record<MantlePhase, (world: World, s: MantleState) => void>> = {
  buckle: stepBuckle,
  vent: stepVent,
  cross: stepCross,
  turn: stepTurn,
};

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
  if (s.phase === "brace") {
    stepBrace(world, s);
    return;
  }
  const story = STORY[s.phase];
  if (story !== undefined) {
    story(world, s);
    return;
  }
  if (mantleCharged(s, cfg.mantleFloorMilli)) shear(world, s);
  else if (mantleLastPull(s) && world.beat - s.phaseBeat >= cfg.mantleLastBeats) lapse(world, s);
}

/** A beat of the brace: counted while both thumbs are down, steadied at the count. */
function stepBrace(world: World, s: MantleState): void {
  if (!s.held[0] || !s.held[1]) return;
  s.braceBeats += 1;
  if (s.braceBeats < world.cfg.mantleBraceBeats) return;
  closeSlow(world);
  world.events.push({ type: "mantleSteady", col: midCol(world.cfg) });
  light(world, s);
  openSlow(world, world.cfg.mantleLastBeats, "ask");
}

/** The last pair's window ran out: it resets, the thumbs where they are. */
function lapse(world: World, s: MantleState): void {
  s.phaseBeat = world.beat;
  openSlow(world, world.cfg.mantleLastBeats, "ask");
  world.events.push({ type: "mantleLapse", col: midCol(world.cfg) });
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
  openSlow(world, cfg.mantleSlowBeats, "show");
  world.events.push({ type: "mantleShear", left, col: midCol(cfg) });
  if (left === 0) {
    // The shell is fully split: the halves swing on their hinges, and the
    // pair guide them open before the core's alternating finish (row 12).
    world.events.push({ type: "mantleSplit", col: midCol(cfg) });
    turnMantle(world, s);
    return;
  }
  // A spark leaks from the open gap the instant the second pair shears — the
  // fight's one ordinary hazard, between the second and third movements.
  if (s.cursor === 2) {
    s.sparkCol = midCol(cfg);
    s.sparkBeat = world.beat;
    world.events.push({ type: "mantleLeak", col: s.sparkCol });
  }
  // The shell fights back before the last pair is braced for and pulled
  // (§23 rows 7 to 10): the buckle first, and the brace at the end of it.
  if (left === 1 && s.thresholds.length > 1) buckleMantle(world, s);
  else light(world, s);
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
