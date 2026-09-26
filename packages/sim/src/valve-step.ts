import { TURN } from "./bearing.js";
import { bossStrikesHull } from "./boss-strike.js";
import { midCol } from "./config.js";
import { NO_SPARK } from "./mantle.js";
import { closeSlow, openSlow } from "./slow.js";
import { freshValve, type ValveState, valveLeaking, valveOnMark } from "./valve.js";
import { stepBrace, stepJet, stepSeal, stepWipe } from "./valve-story.js";
import type { World } from "./world.js";

/**
 * THE VALVE's clock: every row of §25's beat list that is a beat's question —
 * the drum settling, a mark lighting, the freeze window and the pull window
 * running out, the list between pins, the spark's fall and the end — and the
 * story between the pins, whose beats are `valve-story.ts`'s.
 *
 * The wheel and the pin are judged on the tick (`valve-hand.ts`) and the spark
 * where a bolt leaves the top (`valve-shot.ts`).
 *
 * **A window opened mid-beat is counted from the beat after it.** The wheel
 * comes onto its mark and the pin is tapped whenever a thumb gets there, not
 * on a beat, so a one-beat window judged from the beat it opened in could be a
 * handful of ticks. Both windows therefore close once `since` is *past* their
 * beats, and THE SLOW is opened one beat longer to span the same stretch.
 */

export function installValve(world: World, marks: readonly number[]): ValveState {
  const s = freshValve(world.beat, marks);
  world.events.push({ type: "valveEnter", col: midCol(world.cfg) });
  return s;
}

export function stepValve(world: World, s: ValveState): void {
  const cfg = world.cfg;
  const since = world.beat - s.phaseBeat;
  // The spark, judged before anything else this beat: a leak left too long
  // reaches the ship whatever else the drum is doing.
  spendSpark(world, s);
  if (s.phase === "open") {
    if (since >= cfg.valveOpenBeats) {
      world.events.push({ type: "valveOut", col: midCol(cfg) });
      world.boss = null;
    }
    return;
  }
  if (s.phase === "still" && since >= cfg.valveStillBeats) light(world, s);
  else if (s.phase === "list" && since >= cfg.valveListBeats) light(world, s);
  else if (s.phase === "hold" && since > valveFreezeBeats(world, s)) kick(world, s, "valveLapse");
  else if (s.phase === "frozen" && since > valvePullBeats(world, s)) kick(world, s, "valveThaw");
  else if (s.phase === "turn") valveCheckMark(world, s);
  else if (s.phase === "jet") stepJet(world, s, since);
  else if (s.phase === "brace") stepBrace(world, s, since);
  else if (s.phase === "wipe") stepWipe(world, s, since);
  else if (s.phase === "seal") stepSeal(world, s, since);
}

/** The freeze window, by movement: long in the first, short after. */
export function valveFreezeBeats(world: World, s: ValveState): number {
  return s.movement === 1 ? world.cfg.valveFreezeBeats : world.cfg.valveFreezeFastBeats;
}

/** The pull window, by movement: long in the first, short after. */
export function valvePullBeats(world: World, s: ValveState): number {
  return s.movement === 1 ? world.cfg.valvePullBeats : world.cfg.valvePullFastBeats;
}

/**
 * Whether the wheel has come onto its mark, and if it has, the freeze window
 * opens under THE SLOW. Asked by the hand after every turn and by the beat, so
 * a wheel already standing on the next movement's mark is caught too.
 */
export function valveCheckMark(world: World, s: ValveState): void {
  if (s.phase !== "turn" || !valveOnMark(s, world.cfg)) return;
  s.phase = "hold";
  s.phaseBeat = world.beat;
  openSlow(world, valveFreezeBeats(world, s) + 1, "ask");
  world.events.push({ type: "valveHold", col: midCol(world.cfg) });
}

/** A movement's mark lights: the wheel is the pilot's, with no window on it. */
function light(world: World, s: ValveState): void {
  s.phase = "turn";
  s.phaseBeat = world.beat;
  s.travelMilli = 0;
  world.events.push({ type: "valveLight", movement: s.movement, col: midCol(world.cfg) });
  valveCheckMark(world, s);
}

/**
 * A window ran out — the freeze untapped, or the pull undrawn. The wheel is
 * kicked off its mark and this movement's turning starts again from nothing,
 * so the third movement's lap is owed in full once more.
 */
function kick(world: World, s: ValveState, type: "valveLapse" | "valveThaw"): void {
  s.wheelMilli = (s.wheelMilli + world.cfg.valveKickMilli) % TURN;
  s.travelMilli = 0;
  s.phase = "turn";
  s.phaseBeat = world.beat;
  closeSlow(world);
  world.events.push({ type, col: midCol(world.cfg) });
}

/** The first pin's jet capped: a spark leaks down the drum's own column. */
export function valveLeak(world: World, s: ValveState): void {
  s.sparkCol = midCol(world.cfg);
  s.sparkBeat = world.beat;
  world.events.push({ type: "valveSpark", col: s.sparkCol });
}

/** The spark, unanswered for `valveSparkBeats`: the hull. */
function spendSpark(world: World, s: ValveState): void {
  if (!valveLeaking(s)) return;
  if (world.beat - s.sparkBeat < world.cfg.valveSparkBeats) return;
  const col = s.sparkCol;
  s.sparkCol = NO_SPARK;
  world.events.push({ type: "valveSparkHit", col });
  bossStrikesHull(world, "valve", col);
}
