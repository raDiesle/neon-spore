import type { SimConfig } from "./config.js";
import { breachHull, scarHull } from "./hull-damage.js";
import { mawOpen } from "./pod-intake.js";
import { nextInt } from "./rng.js";
import { openSlow } from "./slow.js";
import {
  type UndertowBreach,
  type UndertowPhase,
  type UndertowState,
  undertowLastCol,
} from "./undertow.js";
import { undertowTake } from "./undertow-press.js";
import type { World } from "./world.js";

/**
 * THE UNDERTOW's clock: the push, the bow, the lobe coming through, the
 * widening, the withdrawal, and the body taken in.
 *
 * Everything here happens **on the beat**, from `stepBoss`, and every one of
 * the numbers it counts to is a config field a pair can be told (`config-
 * undertow.ts`): a lobe that came through between two beats would come
 * through on a count nobody said. The two things that happen on the **tick**
 * are the two answers — the maw opening and the beam going off — and they
 * are next door in `undertow-press.ts`, because an answer that waited for
 * the next beat would put a queue between *now* and the taking.
 */

/** Install it from the wave's own `boss:` entry. There is nothing to author. */
export function installUndertow(world: World): UndertowState {
  return {
    kind: "undertow",
    phase: "one",
    phaseBeat: world.beat,
    push: 0,
    // The field is quiet from the first beat: the opening push comes a rest
    // later, so the pair has the rest to read the hull before it moves.
    restBeat: world.beat,
    breaches: [],
    taken: 0,
    scars: 0,
    unseatedUntil: -1,
    hold: 0,
  };
}

/** Pushes a phase makes before the next one begins. */
function pushesIn(cfg: SimConfig, phase: UndertowPhase): number {
  switch (phase) {
    case "one":
      return cfg.undertowSingles;
    case "two":
      return cfg.undertowPairs;
    case "hard":
      return cfg.undertowTalls;
    case "seat":
    case "last":
      return 1;
    case "taken":
      return 0;
  }
}

/** Beats the floor bows in this phase before the lobe is through. */
function bowBeats(cfg: SimConfig, phase: UndertowPhase): number {
  if (phase === "seat") return cfg.undertowUnseatBeats;
  if (phase === "last") return cfg.undertowRiseBeats;
  return cfg.undertowBowBeats;
}

function bow(world: World, u: UndertowState, col: number, tall: boolean): void {
  u.breaches.push({
    col,
    stage: "bowing",
    stageBeat: world.beat,
    tall,
    widthMilli: 0,
    widened: false,
  });
  world.events.push({ type: "undertowBow", col });
}

/** The next push of the current phase, or the first of the next one. */
function push(world: World, u: UndertowState): void {
  const cfg = world.cfg;
  if (u.push >= pushesIn(cfg, u.phase)) {
    const next: UndertowPhase[] = ["one", "two", "hard", "seat", "last", "taken"];
    u.phase = next[next.indexOf(u.phase) + 1] ?? "taken";
    u.phaseBeat = world.beat;
    u.push = 0;
  }
  u.push += 1;
  u.restBeat = -1;
  switch (u.phase) {
    case "one":
      bow(world, u, nextInt(world.rng, cfg.cols), false);
      return;
    case "two": {
      // Four apart, so the maw cannot reach one from the other and the plate
      // has to stand on the one it does not: the pair decides which is which.
      const gap = Math.min(cfg.undertowPairGap, cfg.cols - 1);
      const left = nextInt(world.rng, cfg.cols - gap);
      bow(world, u, left, false);
      bow(world, u, left + gap, false);
      return;
    }
    case "hard":
      bow(world, u, nextInt(world.rng, cfg.cols), true);
      return;
    case "seat":
      // Under the cannon itself, wherever it is standing: the one push that
      // is aimed rather than drawn, because the point of it is the slide off.
      bow(world, u, world.cannonCol, false);
      return;
    case "last":
      bow(world, u, undertowLastCol(cfg), false);
      world.events.push({ type: "undertowRise", col: undertowLastCol(cfg) });
      openSlow(world, cfg.undertowSlowBeats);
      return;
    case "taken":
      return;
  }
}

function remove(u: UndertowState, b: UndertowBreach): void {
  const i = u.breaches.indexOf(b);
  if (i >= 0) u.breaches.splice(i, 1);
}

/**
 * The plate parts. In the `seat` phase a cannon still standing on the bow is
 * unseated and no lobe comes through — the push was at the seat, not the
 * hull; slid off in time, the lobe stands where the cannon was and the maw
 * answers it like any other.
 */
function through(world: World, u: UndertowState, b: UndertowBreach): void {
  const cfg = world.cfg;
  if (u.phase === "seat" && world.cannonCol === b.col) {
    u.unseatedUntil = world.beat + cfg.undertowUnseatedBeats;
    world.events.push({ type: "undertowUnseated", col: b.col });
    remove(u, b);
    return;
  }
  b.stage = "standing";
  b.stageBeat = world.beat;
  world.events.push({ type: "undertowLobe", col: b.col, tall: b.tall });
  // A maw already open over the bow takes the lobe the beat it stands.
  undertowTake(world, u, b, false);
}

/**
 * A lobe withdraws untaken. **A scar and not a lost wave**: nothing reached
 * the ship, something left it and took plating with it (`undertow.ts`). A
 * tall one takes the plating next door as well — it was too big for the
 * column it came up.
 */
function withdraw(world: World, u: UndertowState, b: UndertowBreach): void {
  scarHull(world, b.col, "slick");
  if (b.tall) scarHull(world, b.col + 1 < world.cfg.cols ? b.col + 1 : b.col - 1, "slick");
  u.scars += 1;
  world.events.push({ type: "undertowScar", col: b.col });
  remove(u, b);
}

/** A breach no plate stands on spreads, and wide enough lets a second lobe through beside it. */
function widen(world: World, u: UndertowState, b: UndertowBreach): void {
  const cfg = world.cfg;
  if (world.shieldCol === b.col) return;
  b.widthMilli += cfg.undertowWidenMilli;
  if (b.widthMilli < cfg.undertowWideMilli || b.widened) return;
  b.widened = true;
  const side = b.col + 1 < cfg.cols ? b.col + 1 : b.col - 1;
  if (u.breaches.some((o) => o.col === side)) return;
  u.breaches.push({
    col: side,
    stage: "standing",
    stageBeat: world.beat,
    tall: false,
    widthMilli: 0,
    // Never widens again itself: a breach that bred breaches would fill the
    // hull from one miss, and the sentence is *the plate stops it*, not *the
    // plate is the only thing between you and the whole floor*.
    widened: true,
  });
  world.events.push({ type: "undertowWidened", col: side });
}

/**
 * The last lobe, standing: the maw held open under it for enough beats, the
 * body follows it in and the boss is beaten. Not held for long enough, it
 * comes through — the one miss in the fight that is a hit, and the wave.
 *
 * **Closed for a beat, the count keeps.** The sentence is *hold it open*, and
 * a hold that reset on a slip would ask for the one thing a phone cannot
 * promise across a call (`docs/spec/latency.md`).
 */
function last(world: World, u: UndertowState, b: UndertowBreach): void {
  const cfg = world.cfg;
  if (world.cannonCol === b.col && mawOpen(world)) u.hold += 1;
  if (world.beat - b.stageBeat >= cfg.undertowLastBeats) {
    breachHull(world, b.col, "slick", 0, "heavy");
    world.events.push({ type: "undertowThrough", col: b.col });
    u.breaches = [];
    u.phase = "taken";
    u.phaseBeat = world.beat;
    return;
  }
  if (u.hold >= cfg.undertowHoldBeats) {
    u.taken += 1;
    world.events.push({ type: "undertowSwallowed", col: b.col });
    openSlow(world, cfg.undertowSlowBeats);
    u.breaches = [];
    u.phase = "taken";
    u.phaseBeat = world.beat;
  }
}

/** One beat of the floor. */
export function stepUndertow(world: World, u: UndertowState): void {
  const cfg = world.cfg;
  if (u.phase === "taken") {
    // Nulled here rather than at the swallow, so the picture has the whole of
    // the body going in before the wave is allowed to end (`bossHoldsWave`).
    if (world.beat - u.phaseBeat >= cfg.undertowDownBeats) world.boss = null;
    return;
  }
  for (const b of [...u.breaches]) {
    const since = world.beat - b.stageBeat;
    if (b.stage === "bowing") {
      if (since >= bowBeats(cfg, u.phase)) through(world, u, b);
    } else if (u.phase === "last") {
      last(world, u, b);
    } else if (since >= cfg.undertowStandBeats) {
      withdraw(world, u, b);
    } else {
      widen(world, u, b);
    }
  }
  // `last` and `through` may have just ended the fight: a taken boss rests.
  if (u.breaches.length > 0 || (u.phase as UndertowPhase) === "taken") return;
  if (u.restBeat < 0) u.restBeat = world.beat;
  else if (world.beat - u.restBeat >= cfg.undertowRestBeats) push(world, u);
}
