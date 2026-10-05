import { bossStrikesHull } from "./boss-strike.js";
import { midCol } from "./config.js";
import {
  type FlueLevel,
  type FlueMissWhy,
  type FlueState,
  flueBoss,
  flueLitLevel,
  freshFlue,
} from "./flue.js";
import { flueEmberRun } from "./flue-lead.js";
import { closeSlow, openSlow } from "./slow.js";
import { MILLI, type World } from "./world.js";

/**
 * THE FLUE's clock: each level lighting, THE SLOW held open across it at the
 * level's own strength, the ember run on the tick, and the flue spent.
 *
 * The shot is judged where it reaches the ember's row (`flue-shot.ts`), and
 * what it decides comes back here: a level cleared, or a shot spent and, the
 * last one, the hull.
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
 * Between levels it waits at the left end, where the next one starts it.
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

/** The level met in its weapon and colour: THE SLOW lets go and the flue rests. */
export function flueCleared(world: World, s: FlueState, col: number): void {
  s.hits += 1;
  world.events.push({ type: "flueHit", hits: s.hits, col });
  closeSlow(world);
  rest(world, s, true);
}

/**
 * A shot spent: wide of the ember, or in the wrong colour or weapon. The last
 * one is the hull, and the wave is lost; until then the ember runs on.
 */
export function flueSpentShot(world: World, s: FlueState, col: number, why: FlueMissWhy): void {
  s.shots = Math.max(0, s.shots - 1);
  world.events.push({ type: "flueMiss", shots: s.shots, why, col });
  if (s.shots > 0) return;
  closeSlow(world);
  rest(world, s, false);
  bossStrikesHull(world, "flue", midCol(world.cfg), world.cfg.flueRow);
}

/** The next level lights with three shots and the ember at the left end; with none left, spent. */
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
  world.events.push({ type: "flueLight", level: s.cursor, col });
}

/** Between levels: the ember parked at the left end for the next one. */
function rest(world: World, s: FlueState, advance: boolean): void {
  s.phase = "rest";
  s.phaseBeat = world.beat;
  s.rollTicks = 0;
  s.emberMilli = -world.cfg.flueSpanMilli;
  s.emberDir = 1;
  if (advance) s.cursor += 1;
}
