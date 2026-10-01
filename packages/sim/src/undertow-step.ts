import { midCol } from "./config-derived.js";
import { breachUnscarred, scarHull } from "./hull-damage.js";
import { nextInt } from "./rng.js";
import {
  UNDERTOW_ANSWERS,
  UNDERTOW_PHASES,
  type UndertowLobe,
  type UndertowState,
  undertowEbbing,
  undertowLobeAt,
  undertowLobesIn,
  undertowPlateBeside,
} from "./undertow.js";
import type { World } from "./world.js";

/**
 * THE UNDERTOW's clock: the bow, the lobe standing, the lobe growing, the
 * burst, and the end of each level drawing every lobe back in.
 *
 * Everything here happens **on the beat**, from `stepBoss`, and every number
 * it counts to is a config field a pair can be told (`config-undertow.ts`): a
 * lobe that stood between two beats would stand on a count nobody said. The
 * two answers and the tap are on the **tick**, next door in
 * `undertow-press.ts`, because an answer that waited for the next beat would
 * put a queue between *now* and the taking.
 */

/** Install it from the wave's own `boss:` entry. There is nothing to author. */
export function installUndertow(world: World): UndertowState {
  return {
    kind: "undertow",
    phase: "one",
    phaseBeat: world.beat,
    // The field is quiet from the first beat: the opening bow comes a rest
    // later, so the pair has the rest to read the hull before it moves.
    restBeat: world.beat,
    ebbBeat: -1,
    taken: 0,
    lobes: [],
  };
}

/**
 * One more lobe bows, if the level has room for it: a column nobody is
 * standing in, and a colour drawn from the same seeded stream, so the pair
 * hears both in one call — *yellow, four*.
 */
function bow(world: World, u: UndertowState): void {
  const cfg = world.cfg;
  if (u.lobes.length >= undertowLobesIn(cfg, u.phase)) return;
  if (world.beat - u.restBeat < cfg.undertowRestBeats) return;
  const free: number[] = [];
  for (let c = 0; c < cfg.cols; c++) if (undertowLobeAt(u, c) === null) free.push(c);
  if (free.length === 0) return;
  const col = free[nextInt(world.rng, free.length)] ?? 0;
  const answer = UNDERTOW_ANSWERS[nextInt(world.rng, UNDERTOW_ANSWERS.length)] ?? "maw";
  u.lobes.push({ col, stage: "bowing", stageBeat: world.beat, answer });
  // One bow a rest: two lobes bowing on the same beat would be two calls in
  // one breath, and the level's count goes up one lobe at a time.
  u.restBeat = world.beat;
  world.events.push({ type: "undertowBow", col });
}

/**
 * A tall lobe nobody tapped. **The burst is the one hit in this fight**: a
 * hole through the hull where it stood, the plating beside it gone with it
 * (`Scar.plate`), and the wave lost, to be played again. Scarred first and
 * then breached unscarred, so the hole is the plate taken and not a second,
 * ordinary scar drawn over it.
 */
function burst(world: World, u: UndertowState, l: UndertowLobe): void {
  const cfg = world.cfg;
  scarHull(world, l.col, "slick", null, true);
  scarHull(world, undertowPlateBeside(cfg, l.col), "slick", null, true);
  breachUnscarred(world, l.col, "slick", 0, "heavy", null, { by: "undertow", blow: "burst" });
  world.events.push({ type: "undertowBurst", col: l.col });
  u.lobes.splice(u.lobes.indexOf(l), 1);
}

/** Each lobe one beat further along: bowing to standing, standing to tall, tall to the burst. */
function stepLobes(world: World, u: UndertowState): void {
  const cfg = world.cfg;
  for (const l of [...u.lobes]) {
    const since = world.beat - l.stageBeat;
    if (l.stage === "bowing" && since >= cfg.undertowBowBeats) {
      l.stage = "standing";
      l.stageBeat = world.beat;
      world.events.push({ type: "undertowLobe", col: l.col, answer: l.answer });
    } else if (l.stage === "standing" && since >= cfg.undertowStandBeats) {
      l.stage = "tall";
      l.stageBeat = world.beat;
      world.events.push({ type: "undertowGrow", col: l.col });
    } else if (l.stage === "tall" && since >= cfg.undertowTallBeats) {
      burst(world, u, l);
    }
  }
}

/**
 * The level's clock ran out and the lobes are shrinking: nothing grows,
 * nothing bursts and nothing answers. When the shrink is over the floor is
 * clear and the next level begins, or — after the third — the boss is gone.
 * Nulled here rather than when the clock ran out, so the picture has the whole
 * of the shrink before the wave is allowed to end (`bossHoldsWave`).
 */
function stepEbb(world: World, u: UndertowState): void {
  const cfg = world.cfg;
  if (world.beat - u.ebbBeat < cfg.undertowEbbBeats) return;
  const next = UNDERTOW_PHASES[UNDERTOW_PHASES.indexOf(u.phase) + 1];
  if (next === undefined) {
    world.boss = null;
    return;
  }
  u.phase = next;
  u.phaseBeat = world.beat;
  u.restBeat = world.beat;
  u.ebbBeat = -1;
  u.lobes = [];
}

/** One beat of the floor. */
export function stepUndertow(world: World, u: UndertowState): void {
  const cfg = world.cfg;
  if (undertowEbbing(u)) {
    stepEbb(world, u);
    return;
  }
  if (world.beat - u.phaseBeat >= cfg.undertowLevelBeats) {
    u.ebbBeat = world.beat;
    world.events.push({ type: "undertowEbb", col: midCol(cfg) });
    return;
  }
  stepLobes(world, u);
  bow(world, u);
}
