import {
  ANTIPHON_SHIP,
  type AntiphonState,
  antiphonFull,
  antiphonIsOrgan,
  antiphonOrganCol,
  antiphonOrganRow,
  antiphonSinkBeat,
  antiphonWindow,
} from "./antiphon.js";
import { growCycle } from "./antiphon-rail.js";
import { bossStrikesHull } from "./boss-strike.js";
import { midCol } from "./config.js";
import { closeSlow, openSlow } from "./slow.js";
import type { World } from "./world.js";

/**
 * THE ANTIPHON's clock — the rise, the growth, the window, the verdict, the
 * still and the ship, and the collapse. What carries a candidate down its
 * vein is `antiphon-hand.ts`, on the tick; what an organ is and what stands
 * beside it on the rail is `antiphon-rail.ts`.
 *
 * Everything here runs on the **beat** from `stepBoss`, and a level is one
 * shape: a rest of `antiphonRestBeats` with nothing standing, then the organ
 * pushes out over `antiphonGrowBeats` and stands its window, and the level
 * ends one of three ways — the organ carried to its place and a pit, a
 * decoy carried there instead, or the window run out. The last two strike
 * the hull (`bossStrikesHull`), which is the wave lost; a hull that cannot be
 * struck plays the level again after the rest, so a rehearsal goes on.
 *
 * **The window is THE SLOW** (`docs/decisions.md` #33, doubled on the owner's
 * rule of 24 September 2026): it opens on the beat the organ has pushed all
 * the way out, which is the beat a carry first counts, for the window's
 * beats, and every way a level ends shuts it. The growth and the rest are
 * not slowed: nothing is asked in them. Its meter is the one every slowed
 * boss has; the body draws no clock of its own.
 */

/** Install it from the wave's own `boss:` entry: the body risen, smooth, nothing on the rail. */
export function installAntiphon(world: World): AntiphonState {
  const s: AntiphonState = {
    kind: "antiphon",
    organ: null,
    rail: [],
    answer: -1,
    pits: [],
    cycleBeat: world.beat,
    stillBeat: -1,
    downBeat: -1,
    turnTicks: 0,
    heldP1: false,
    heldP2: false,
    carried: -1,
    carryMilli: 0,
  };
  world.events.push({ type: "antiphonEnter", col: midCol(world.cfg) });
  return s;
}

/** Nothing standing, nothing on the rail, and the rest begins. */
function endCycle(world: World, s: AntiphonState): void {
  s.organ = null;
  s.rail = [];
  s.answer = -1;
  // A thumb still carrying is let go of: what it held no longer exists.
  s.carried = -1;
  s.carryMilli = 0;
  s.cycleBeat = world.beat;
  closeSlow(world);
}

/** This level's organ pushes out, and the rail is laid. */
function grow(world: World, s: AntiphonState): void {
  s.cycleBeat = world.beat;
  // A new organ pushes out the way up its contour was drawn.
  s.turnTicks = 0;
  const o = growCycle(world, s);
  const col = antiphonOrganCol(world.cfg);
  if (o.shape === ANTIPHON_SHIP) world.events.push({ type: "antiphonShip", col });
  else world.events.push({ type: "antiphonGrow", col, shape: o.shape });
}

/** The window ran out with nothing carried home: the organ sinks, and the hull is struck. */
function sink(world: World, s: AntiphonState): void {
  const col = antiphonOrganCol(world.cfg);
  world.events.push({ type: "antiphonSink", col });
  endCycle(world, s);
  bossStrikesHull(world, "antiphon", col, antiphonOrganRow(world.cfg));
}

/**
 * Rail index `i` has been carried all the way down its vein to the organ's
 * place, and is judged. The organ shrivels to a pit — or, if it is their own
 * ship, every pit bursts; anything else hardens the organ and strikes the
 * hull. Called by `antiphon-hand.ts`.
 */
export function antiphonArrive(world: World, s: AntiphonState, i: number): void {
  const cfg = world.cfg;
  const c = s.rail[i];
  const o = s.organ;
  if (c === undefined || o === null) return;
  const col = antiphonOrganCol(cfg);
  if (!antiphonIsOrgan(s, i)) {
    world.events.push({ type: "antiphonHarden", col: c.col, shape: c.shape });
    endCycle(world, s);
    bossStrikesHull(world, "antiphon", col, antiphonOrganRow(cfg));
    return;
  }
  if (o.shape === ANTIPHON_SHIP) {
    s.downBeat = world.beat;
    world.events.push({ type: "antiphonBurst", col, pits: s.pits.length });
    endCycle(world, s);
    return;
  }
  s.pits.push(o.shape);
  world.events.push({ type: "antiphonPit", col, shape: o.shape, pits: s.pits.length });
  endCycle(world, s);
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
  if (s.organ !== null) {
    const standUp = s.organ.grownBeat + cfg.antiphonGrowBeats;
    if (beat >= antiphonSinkBeat(s, cfg)) sink(world, s);
    else if (beat === standUp) openSlow(world, antiphonWindow(s, cfg), "ask");
    return;
  }
  const rested = beat - s.cycleBeat >= cfg.antiphonRestBeats;
  if (!antiphonFull(s, cfg)) {
    if (rested) grow(world, s);
    return;
  }
  // The pits are all there: the surface goes still once, and then the ship
  // — again after a ship missed, with only the rest between.
  if (s.stillBeat < 0) {
    if (rested) {
      s.stillBeat = beat;
      world.events.push({ type: "antiphonStill", col: midCol(cfg) });
    }
    return;
  }
  if (rested && beat >= s.stillBeat + cfg.antiphonStillBeats) grow(world, s);
}

/**
 * **Stand the fight on level `level`** — the director's stepper and
 * `bun run frames --boss-round`, through `setBossRound` (`boss-round.ts`).
 * The pits a pair would have carried by then are the table's first shapes
 * in order, the rest begins now and the level grows after it; the ship is
 * `antiphonPits`, reached through its still.
 */
export function antiphonOpenLevel(world: World, s: AntiphonState, level: number): void {
  const cfg = world.cfg;
  const n = Math.max(0, Math.min(cfg.antiphonPits, level));
  s.pits = [];
  for (let i = 0; i < n; i++) s.pits.push(i % cfg.antiphonShapes);
  s.stillBeat = -1;
  s.downBeat = -1;
  s.turnTicks = 0;
  endCycle(world, s);
}
