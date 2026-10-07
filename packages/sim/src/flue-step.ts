import { bossStrikesHull } from "./boss-strike.js";
import { midCol, ticksPerBeat } from "./config.js";
import {
  type FlueLevel,
  type FlueMissWhy,
  type FlueState,
  flueBoss,
  flueLitLevel,
  flueStartDir,
  flueStartMilli,
  freshFlue,
} from "./flue.js";
import { flueEmberRun, flueEmberWait } from "./flue-lead.js";
import { chargePartTicks } from "./shot-charge.js";
import { closeSlow, openSlow } from "./slow.js";
import { MILLI, type World } from "./world.js";

/**
 * THE FLUE's clock: each level lighting, THE SLOW held open across it at the
 * level's own strength, the ember run on the tick, and the flue spent.
 *
 * The shot is judged where it reaches the ember's row (`flue-shot.ts`), and
 * what it decides comes back here: the ember met — the level cleared, or on
 * a level that asks it again, beamed home to be met once more — or a shot
 * spent and, the last one, the hull.
 *
 * **A level has no clock of its own.** It waits for its shot, the ember
 * running end to end, for as long as the pair needs to agree on when; three
 * shots are what it costs. THE SLOW is opened two beats at a time and moved
 * on every beat, a `"show"` that fails nobody — a fuse would be a clock the
 * level does not have.
 */

export function installFlue(world: World, levels: readonly FlueLevel[]): FlueState {
  const s = freshFlue(world.cfg, world.beat, levels);
  world.cannonCol = midCol(world.cfg);
  world.events.push({ type: "flueEnter", col: midCol(world.cfg) });
  return s;
}

export function stepFlue(world: World, s: FlueState): void {
  const cfg = world.cfg;
  const since = world.beat - s.phaseBeat;
  if (s.phase === "spent") {
    if (since >= cfg.flueSpentBeats) {
      world.events.push({ type: "flueOut", col: midCol(cfg) });
      world.boss = null;
    }
    return;
  }
  if (s.phase === "slack" && since >= cfg.flueSlackBeats) next(world, s);
  else if (s.phase === "rest" && since >= cfg.fluePauseBeats) next(world, s);
  const level = flueLitLevel(s);
  if (level !== null && level.slowMilli < MILLI) openSlow(world, 2, "show", level.slowMilli);
}

/**
 * **The ember run**, once a tick: where it is worked out afresh from the
 * ticks the lit level has run, so it is never carried and never drifts.
 * Between levels it waits at the next one's end, where that one starts it.
 */
export function flueRolled(world: World): void {
  const s = flueBoss(world);
  const level = s === null ? null : flueLitLevel(s);
  if (s === null || level === null) return;
  s.rollTicks += 1;
  const at = flueEmberRun(world.cfg, level, s.rollTicks);
  s.emberMilli = at.milli;
  s.emberDir = at.dir;
}

/**
 * The ember met in the level's weapon and colour. Met as often as the level
 * `needs`, it is cleared: THE SLOW lets go and the flue rests. Short of
 * that, it is beamed home and runs the level again, no shot spent — the
 * owner's *more ideas*, 7 October 2026: a level that asks for it twice.
 */
export function flueMet(world: World, s: FlueState, level: FlueLevel, col: number): void {
  s.met += 1;
  const left = Math.max(0, level.needs - s.met);
  const at = s.emberMilli;
  if (left > 0) {
    world.events.push({ type: "flueHit", hits: s.hits, left, col, emberMilli: at });
    rewind(world, s, level);
    return;
  }
  s.hits += 1;
  world.events.push({ type: "flueHit", hits: s.hits, left, col, emberMilli: at });
  closeSlow(world);
  rest(world, s, true);
}

/**
 * A shot spent: wide of the ember, or in the wrong colour or weapon. The last
 * one is the hull, and the wave is lost; until then the ember is beamed back
 * to its end and runs the level again (`rewind`). What the level has already
 * been met stands.
 */
export function flueSpentShot(world: World, s: FlueState, col: number, why: FlueMissWhy): void {
  s.shots = Math.max(0, s.shots - 1);
  const late = s.emberMilli * s.emberDir > 0;
  world.events.push({ type: "flueMiss", shots: s.shots, why, late, col, emberMilli: s.emberMilli });
  if (s.shots > 0) {
    const level = flueLitLevel(s);
    if (level !== null) rewind(world, s, level);
    return;
  }
  closeSlow(world);
  rest(world, s, false);
  bossStrikesHull(world, "flue", midCol(world.cfg), world.cfg.flueRow);
}

/** The next level lights with three shots, none met, and the ember at its end; with none left, spent. */
function next(world: World, s: FlueState): void {
  const level = s.levels[s.cursor];
  const col = midCol(world.cfg);
  if (level === undefined) {
    s.phase = "spent";
    s.phaseBeat = world.beat;
    world.events.push({ type: "flueSpent", col });
    return;
  }
  s.phase = "lit";
  s.phaseBeat = world.beat;
  s.shots = world.cfg.flueShots;
  s.met = 0;
  world.events.push({ type: "flueLight", level: s.cursor, col });
}

/**
 * **The ember beamed back to its end** after a shot spent (the owner, 6
 * October 2026) or a meeting short of what the level needs, held there
 * `flueBeamBeats` and then run again from the top.
 *
 * It sets off again on the shot grid's own phase, not the miss's: the level
 * started it so that its crossings fall on a bolt's arrival
 * (`flueEmberWait`), and a run restarted on the tick of the miss would throw
 * that away. So the ticks it is held are as many as bring the run back to
 * the same place on the grid's half beat, and never fewer than the beats it
 * is held — its run moved back by a whole number of grid points.
 */
function rewind(world: World, s: FlueState, level: FlueLevel): void {
  const cfg = world.cfg;
  const part = Math.max(1, chargePartTicks(cfg));
  const run = s.rollTicks - flueEmberWait(cfg, level.speedMilli);
  const hold = Math.ceil((cfg.flueBeamBeats * ticksPerBeat(cfg)) / part) * part;
  const back = (((-run % part) + part) % part) + hold;
  s.rollTicks = flueEmberWait(cfg, level.speedMilli) - back;
  s.emberMilli = flueStartMilli(cfg, level);
  s.emberDir = flueStartDir(level);
}

/** Between levels: the ember parked at the next one's end. */
function rest(world: World, s: FlueState, advance: boolean): void {
  s.phase = "rest";
  s.phaseBeat = world.beat;
  s.rollTicks = 0;
  if (advance) s.cursor += 1;
  s.emberMilli = flueStartMilli(world.cfg, s.levels[s.cursor]);
  s.emberDir = flueStartDir(s.levels[s.cursor]);
}
