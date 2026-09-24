import {
  ANTIPHON_SHIP,
  type AntiphonOrgan,
  type AntiphonState,
  antiphonCrossed,
  antiphonFull,
  antiphonIsOrgan,
  antiphonRailSize,
  antiphonShipUp,
  antiphonSinkBeat,
  antiphonTwins,
  antiphonWindow,
} from "./antiphon.js";
import { growCycle } from "./antiphon-rail.js";
import { midCol } from "./config.js";
import { livingKindForColor } from "./kinds.js";
import { closeSlow, openSlow } from "./slow.js";
import { spawnOne } from "./spawn.js";
import type { Color } from "./types.js";
import type { World } from "./world.js";

/**
 * THE ANTIPHON's clock — the rise, the growth, the window, the sinking,
 * the still and the ship, and the collapse. What takes an organ or hardens
 * it is `antiphon-shot.ts`, on the tick; what an organ is and what stands
 * beside it on the rail is `antiphon-rail.ts`.
 *
 * Everything here runs on the **beat** from `stepBoss`, and a cycle is one
 * shape: a rest of `antiphonRestBeats` with nothing standing, then the
 * organs push out over `antiphonGrowBeats` and stand their window, and the
 * cycle ends one of three ways — a pit, a hardening, or the window run out.
 * The rest after is the same whichever it was, so the pair's time between
 * organs is one number they can learn.
 *
 * **What falls in its wave is what the pair got wrong** (`bossFillsWave`):
 * from `antiphonSpillPits` every candidate a pit rejected arrives as a body
 * in its colour down its column, so a wrong description is also a wrong
 * field read; from `antiphonFirePits` an organ left undescribed fires one
 * down its own column before it sinks. Nothing else arrives, and in the
 * first phase nothing at all: the design's *generous time*.
 *
 * **The window is THE SLOW** (`docs/decisions.md` #33, doubled on the owner's
 * rule of 24 September 2026): it opens on the beat the organs have pushed all
 * the way out, which is the beat a bolt first counts, for the window's beats,
 * and every way a cycle ends shuts it — a pit, a hardening, the window run
 * out, the ship. The growth and the rest are not slowed: nothing is asked in
 * them.
 */

/** Install it from the wave's own `boss:` entry: the body risen, smooth, nothing on the rail. */
export function installAntiphon(world: World): AntiphonState {
  const s: AntiphonState = {
    kind: "antiphon",
    organs: [],
    rail: [],
    pits: [],
    extra: 0,
    cycleBeat: world.beat,
    stillBeat: -1,
    downBeat: -1,
    turnTicks: 0,
    heldP1: false,
    heldP2: false,
    crossed: [],
    heldRail: -1,
  };
  world.events.push({ type: "antiphonEnter", col: midCol(world.cfg) });
  return s;
}

/** A body in `color` down `col`, at the top of the field: the price of a candidate. */
function arrive(world: World, col: number, color: Color): void {
  spawnOne(world, { beat: world.beat, col, kind: livingKindForColor(color), color });
}

/** Nothing standing, nothing on the rail, and the rest begins. */
function endCycle(world: World, s: AntiphonState): void {
  s.organs = [];
  s.rail = [];
  // The crossings go with the rail they were made on: they are indices into
  // it, and the next rail is a different length. A thumb still down is let
  // go of for the same reason — what it was resting on no longer exists.
  s.crossed = [];
  s.heldRail = -1;
  s.cycleBeat = world.beat;
  closeSlow(world);
}

/** This cycle's organs push out, and the rail is laid. */
function grow(world: World, s: AntiphonState): void {
  s.cycleBeat = world.beat;
  // A new organ pushes out the way up its contour was drawn; a thumb still
  // resting from the last one goes on turning this one from there.
  s.turnTicks = 0;
  const organs = growCycle(world, s);
  for (const o of organs) {
    if (o.shape === ANTIPHON_SHIP) {
      world.events.push({ type: "antiphonShip", col: o.col });
    } else {
      world.events.push({
        type: "antiphonGrow",
        col: o.col,
        shape: o.shape,
        organs: organs.length,
      });
    }
  }
}

/** The window ran out: the organs sink back healed — and from `antiphonFirePits`, fire first. */
function sink(world: World, s: AntiphonState): void {
  const fires = s.pits.length >= world.cfg.antiphonFirePits && !antiphonShipUp(s);
  for (const o of s.organs) {
    if (fires) arrive(world, o.col, o.color);
    world.events.push({ type: "antiphonSink", col: o.col, fired: fires });
  }
  endCycle(world, s);
}

/** The right ship: every pit erupts, and the body is ending. */
function burst(world: World, s: AntiphonState, o: AntiphonOrgan): void {
  s.downBeat = world.beat;
  world.events.push({ type: "antiphonBurst", col: o.col, pits: s.pits.length });
  endCycle(world, s);
}

/** The organ's colour arrived in its column: it shrivels to a pit — and the last organ, theirs, bursts instead. Called by `antiphon-shot.ts`. */
export function antiphonPit(world: World, s: AntiphonState, o: AntiphonOrgan): void {
  if (o.shape === ANTIPHON_SHIP) {
    burst(world, s, o);
    return;
  }
  const cfg = world.cfg;
  s.pits.push(o.shape);
  // The candidates neither organ is, read before the rail goes: from
  // `antiphonSpillPits` they are what falls when the cycle ends on a pit. A
  // twin already taken this cycle is a pit and no organ, and is not rejected:
  // shapes are distinct across a rail (`antiphon-rail.ts`), so a candidate
  // whose shape is a pit is one the pair described, never one it turned down.
  // A candidate she pulled off the rail is out of the cycle altogether: it
  // does not fall on them when the cycle ends, which is what the pull buys.
  const rejected = s.rail.filter(
    (c, i) => !antiphonIsOrgan(s, c) && !s.pits.includes(c.shape) && !antiphonCrossed(s, i),
  );
  s.organs = s.organs.filter((x) => x !== o);
  world.events.push({ type: "antiphonPit", col: o.col, shape: o.shape, pits: s.pits.length });
  if (s.organs.length > 0) return;
  if (s.pits.length >= cfg.antiphonSpillPits) {
    for (const c of rejected) {
      arrive(world, c.col, c.color);
      world.events.push({ type: "antiphonSpill", col: c.col, color: c.color });
    }
  }
  endCycle(world, s);
}

/** A decoy's colour arrived in the decoy's column: the organs harden, the cycle is lost, and the next rail is one wider. Called by `antiphon-shot.ts`. */
export function antiphonHarden(world: World, s: AntiphonState, col: number): void {
  const cfg = world.cfg;
  s.extra += 1;
  endCycle(world, s);
  const next = antiphonFull(s, cfg) ? 1 : antiphonTwins(s, cfg) ? 2 : 1;
  world.events.push({ type: "antiphonHarden", col, rail: antiphonRailSize(s, cfg, next) });
}

/** One beat of the body. */
export function stepAntiphon(world: World, s: AntiphonState): void {
  const cfg = world.cfg;
  const beat = world.beat;
  if (s.downBeat >= 0) {
    // Nulled here rather than at the burst, so the pits have their beats of
    // erupting before the wave is allowed to end (`bossHoldsWave`).
    if (beat - s.downBeat >= cfg.antiphonOutBeats) {
      world.events.push({ type: "antiphonOut", col: midCol(cfg) });
      world.boss = null;
    }
    return;
  }
  if (s.organs.length > 0) {
    const standUp = (s.organs[0]?.grownBeat ?? beat) + cfg.antiphonGrowBeats;
    if (beat >= antiphonSinkBeat(s, cfg)) sink(world, s);
    else if (beat === standUp) openSlow(world, antiphonWindow(s, cfg));
    return;
  }
  const rested = beat - s.cycleBeat >= cfg.antiphonRestBeats;
  if (!antiphonFull(s, cfg)) {
    if (rested) grow(world, s);
    return;
  }
  // The pits are all there: the surface goes still once, and then the ship
  // — again after every ship hardened or sunk, with only the rest between.
  if (s.stillBeat < 0) {
    if (rested) {
      s.stillBeat = beat;
      world.events.push({ type: "antiphonStill", col: midCol(cfg) });
    }
    return;
  }
  if (rested && beat >= s.stillBeat + cfg.antiphonStillBeats) grow(world, s);
}
