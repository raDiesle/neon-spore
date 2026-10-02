import { bossStrikesHull } from "./boss-strike.js";
import { midCol } from "./config.js";
import { closeSlow, openSlow } from "./slow.js";
import type { StarePhase, StareState } from "./stare.js";
import {
  stareBlue,
  stareChargeLength,
  stareForbids,
  stareLashesOwed,
  stareLevelPattern,
  stareOpenLive,
} from "./stare.js";
import type { Command, TimedCommand } from "./types.js";
import type { World } from "./world.js";

/**
 * THE STARE's clock: the lead-in, a pattern played beat by beat, the charge
 * after a pass, the climb to the next level and the end — and the one press
 * that costs the hull.
 *
 * It runs on the **beat** and from `stepBoss`, because every number in it is
 * a beat of the pattern the pair is learning: an eye that opened between two
 * beats would be an eye nobody could count. The lashes are judged on the tick
 * (`stare-hand.ts`) and come back here to move the fight on.
 *
 * There is no roll. The rhythm is authored, and both seats sit still on an
 * open beat, so there is nothing for one device to know that the other does
 * not — which is the whole of what the pair learns.
 */

/** Install it from the wave's own `boss:` entry: the patterns, one a level. */
export function installStare(world: World, levels: readonly string[]): StareState {
  return {
    kind: "stare",
    phase: "rest",
    phaseBeat: world.beat,
    levels: [...levels],
    level: 0,
    turn: 0,
    open: false,
    caughtTick: -1,
    caughtPlayer: 0,
    caughtCol: -1,
    lashesUp: 0,
    lashHeld: [false, false],
    lashBaseMilli: [0, 0],
    lashMilli: [0, 0],
  };
}

/** The boss, if it is the one installed. Narrowing in one place rather than six. */
export function stareBoss(world: World): StareState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "stare" ? boss : null;
}

export function enterStare(stare: StareState, phase: StarePhase, beat: number): void {
  stare.phase = phase;
  stare.phaseBeat = beat;
  stare.open = false;
}

/** One beat of the eye. */
export function stepStare(world: World, s: StareState): void {
  const cfg = world.cfg;
  const since = world.beat - s.phaseBeat;

  if (s.phase === "rest") {
    if (since < cfg.stareRestBeats) return;
    enterStare(s, stareBlue(s) ? "teach" : "live", world.beat);
    play(world, s);
    return;
  }

  if (s.phase === "teach" || s.phase === "live") {
    play(world, s);
    return;
  }

  if (s.phase === "charge") {
    if (since < stareChargeLength(s, cfg)) return;
    blast(world, s);
    return;
  }

  if (s.phase === "rise") {
    if (since < cfg.stareRiseBeats) return;
    enterStare(s, "rest", world.beat);
    return;
  }

  // Calm: the last level survived, the eye closes for good, and a wave with
  // nothing else in it is won.
  if (since < cfg.stareCalmBeats) return;
  world.events.push({ type: "stareOut" });
  world.boss = null;
}

/**
 * The beat the pattern is on: open or shut, and a sound either way. At the
 * pattern's end, the blue pass becomes the first live one and a live pass
 * becomes a charge.
 */
function play(world: World, s: StareState): void {
  const pattern = stareLevelPattern(s);
  const step = world.beat - s.phaseBeat;
  if (step < pattern.length) {
    s.open = pattern[step] === "x";
    world.events.push({
      type: "stareBeat",
      open: s.open,
      teach: s.phase === "teach",
      step,
      level: s.level,
    });
    return;
  }
  if (s.phase === "teach") {
    enterStare(s, "live", world.beat);
    play(world, s);
    return;
  }
  enterStare(s, "charge", world.beat);
  letGo(s);
  openSlow(world, stareChargeLength(s, world.cfg), "ask");
  world.events.push({ type: "stareCharge", turn: s.turn, lashes: stareLashesOwed(s, world.cfg) });
}

/** Every lash down and no thumb on one: the top of a charge, and its end. */
function letGo(s: StareState): void {
  s.lashesUp = 0;
  s.lashHeld = [false, false];
  s.lashBaseMilli = [0, 0];
  s.lashMilli = [0, 0];
}

/** The charge ran out with lashes still down: the beam comes down the middle. */
function blast(world: World, s: StareState): void {
  const col = midCol(world.cfg);
  closeSlow(world);
  letGo(s);
  enterStare(s, "rest", world.beat);
  world.events.push({ type: "stareBlast", col });
  bossStrikesHull(world, "stare", col, 0, "beam");
}

/**
 * Every lash came up in time and the charge vents to the sides: a turn
 * survived. The `stareTurns`th is the level won, and the eye rises to the next
 * one, angrier — or, after the last, calms and the wave is won.
 */
export function stareVented(world: World, s: StareState, player: 1 | 2): void {
  closeSlow(world);
  letGo(s);
  world.events.push({ type: "stareVent", player });
  s.turn += 1;
  if (s.turn < world.cfg.stareTurns) {
    enterStare(s, "rest", world.beat);
    return;
  }
  const level = s.level;
  s.level += 1;
  s.turn = 0;
  const last = s.level >= s.levels.length;
  world.events.push({ type: "stareRise", level, last });
  enterStare(s, last ? "calm" : "rise", world.beat);
}

/**
 * **Whether this press is the one that costs the hull**, asked in
 * `applyCommand` above the switch and below `restart`.
 *
 * Either seat, on an open beat of a live pass. The press is refused *and* the
 * hull is broken, which is the wave lost (`wave-fail.ts`): the button worked
 * and the pair was told not to touch it.
 */
export function stareBreaks(world: World, timed: TimedCommand): boolean {
  const s = stareBoss(world);
  if (s === null) return false;
  if (!stareOpenLive(s)) return false;
  if (!stareForbids(timed.command)) return false;
  caught(world, s, timed.player, timed.command);
  return true;
}

/**
 * The laser strikes **where the cannon was sent**. The owner, 29 September
 * 2026: *the damaging laser hits where one of the players moved.* A slide
 * names its column; any other press is struck where the cannon stands.
 */
function caught(world: World, s: StareState, player: 1 | 2, command: Command): void {
  const col = command.kind === "cannonCol" ? command.col : world.cannonCol;
  s.caughtTick = world.tick;
  s.caughtPlayer = player;
  s.caughtCol = col;
  world.events.push({ type: "stareCaught", player, command, col });
  bossStrikesHull(world, "stare", col, 0, "laser");
}
