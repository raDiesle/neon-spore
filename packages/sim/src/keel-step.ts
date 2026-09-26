import { bossStrikesHull } from "./boss-strike.js";
import { midCol } from "./config.js";
import { breachHull } from "./hull-damage.js";
import {
  type KeelState,
  keelLoose,
  keelNextJoint,
  keelSeat,
  keelSegCol,
  keelThrown,
  keelWindowBeats,
  NO_JOINT,
  NO_ROCK,
} from "./keel.js";
import {
  keelEnter as enter,
  openCool,
  openFlip,
  stepCool,
  stepFlip,
  stepMarrow,
} from "./keel-story.js";
import { openSlow } from "./slow.js";
import type { World } from "./world.js";

/**
 * THE KEEL's clock: every row of §24's beat list that is a beat's question —
 * a joint lighting, its window running out, the midpoint splitting, the
 * socket's patience, the rigid hold, the rock's fall and the end.
 *
 * The taps are judged on the tick (`keel-hand.ts`) and the two shots where a
 * bolt leaves the top (`keel-shot.ts`); both leave the spine in `rest`, and
 * the next beat here lights whatever comes after.
 */

export function installKeel(
  world: World,
  socket: KeelState["socket"],
  reprise: readonly number[],
): KeelState {
  const segments = world.cfg.keelSegments;
  const s: KeelState = {
    kind: "keel",
    socket,
    reprise: reprise.filter((i) => i >= 0 && i < segments),
    phase: "still",
    phaseBeat: world.beat,
    movement: 1,
    joint: NO_JOINT,
    locked: new Array<boolean>(segments).fill(false),
    repriseCursor: 0,
    rockCol: NO_ROCK,
    rockBeat: 0,
    held: [false, false],
    chordBeats: 0,
    marrow: [false, false],
    flares: 0,
  };
  world.events.push({ type: "keelEnter", col: midCol(world.cfg) });
  return s;
}

export function stepKeel(world: World, s: KeelState): void {
  const cfg = world.cfg;
  const since = world.beat - s.phaseBeat;
  // The rock, judged before anything else this beat: a throw left too long
  // reaches the ship whatever else the spine is doing.
  spendRock(world, s);
  if (s.phase === "straight") {
    if (since >= cfg.keelOpenBeats) {
      world.events.push({ type: "keelOut", col: midCol(cfg) });
      world.boss = null;
    }
    return;
  }
  if (s.phase === "still" && since >= cfg.keelStillBeats) advance(world, s);
  else if (s.phase === "rest" && since >= cfg.keelRestBeats) advance(world, s);
  else if (s.phase === "joint" && since >= keelWindowBeats(world.cfg, s)) miss(world, s);
  else if (s.phase === "split" && since >= cfg.keelSplitBeats) flash(world, s);
  else if (s.phase === "socket" && since >= cfg.keelSocketBeats) socketHit(world, s);
  else if (s.phase === "rigid" && since >= cfg.keelRigidBeats) throwRock(world, s);
  else if (s.phase === "flip") stepFlip(world, s, since);
  else if (s.phase === "marrow") stepMarrow(world, s, since);
  else if (s.phase === "rock" && !keelThrown(s)) openCool(world, s);
  else if (s.phase === "cool") stepCool(world, s, since);
}

/**
 * Whatever comes after a rest: the next joint, or the seam between two
 * movements. The first ends with two segments loose, which is the midpoint;
 * the second with none, the spine first rigid, which bows it the wrong way
 * (`keel-story.ts`); the third with nothing left to light, which is the rigid
 * hold.
 */
function advance(world: World, s: KeelState): void {
  const mid = midCol(world.cfg);
  if (s.movement === 1 && keelLoose(s) <= 2) {
    s.movement = 2;
    enter(world, s, "split");
    world.events.push({ type: "keelSplit", col: mid });
    return;
  }
  if (s.movement === 2 && keelLoose(s) === 0) {
    openFlip(world, s);
    return;
  }
  const seg = keelNextJoint(s);
  if (seg === NO_JOINT) {
    enter(world, s, "rigid");
    world.events.push({ type: "keelRigid", col: mid });
    return;
  }
  light(world, s, seg);
}

/** A joint lights. THE SLOW spans its window in the first two movements; the
 * third is at tempo on purpose — the rule has been taught by then. */
function light(world: World, s: KeelState, seg: number): void {
  const cfg = world.cfg;
  s.phase = "joint";
  s.phaseBeat = world.beat;
  s.joint = seg;
  if (s.movement !== 3) openSlow(world, keelWindowBeats(world.cfg, s), "ask");
  const col = keelSegCol(seg, s.locked.length, cfg.cols);
  world.events.push({ type: "keelLight", seg, seat: keelSeat(s, cfg.cols) ?? 0, col });
}

/**
 * The window ran out. Before the tempo run the joint dims and the count of
 * locked segments has not moved, so it re-lights where it was a beat later;
 * in it, the segment works loose again and the run goes on without it — it
 * comes back once the wave's own order is spent.
 */
function miss(world: World, s: KeelState): void {
  const seg = s.joint;
  const col = keelSegCol(seg, s.locked.length, world.cfg.cols);
  if (s.movement === 3) {
    s.locked[seg] = false;
    if (s.repriseCursor < s.reprise.length) s.repriseCursor += 1;
    world.events.push({ type: "keelSlip", seg, col });
  } else {
    world.events.push({ type: "keelMiss", seg, col });
  }
  enter(world, s, "rest");
}

/** The midpoint is open: the socket flashes its colour, under THE SLOW. */
function flash(world: World, s: KeelState): void {
  enter(world, s, "socket");
  openSlow(world, world.cfg.keelSocketBeats, "ask");
  world.events.push({ type: "keelSocket", col: midCol(world.cfg) });
}

/** Nobody fired the socket: an ordinary hit on the hull, and it flashes again. */
function socketHit(world: World, s: KeelState): void {
  const col = midCol(world.cfg);
  world.events.push({ type: "keelSocketHit", col });
  bossStrikesHull(world, "keel", col);
  flash(world, s);
}

/** The rigid beat is over: the tail throws one rock down its own column. */
function throwRock(world: World, s: KeelState): void {
  enter(world, s, "rock");
  s.rockCol = keelSegCol(s.locked.length - 1, s.locked.length, world.cfg.cols);
  s.rockBeat = world.beat;
  world.events.push({ type: "keelThrow", col: s.rockCol });
}

/** The rock, unanswered for `keelRockBeats`: the hull. */
function spendRock(world: World, s: KeelState): void {
  if (!keelThrown(s)) return;
  if (world.beat - s.rockBeat < world.cfg.keelRockBeats) return;
  const col = s.rockCol;
  s.rockCol = NO_ROCK;
  world.events.push({ type: "keelRockHit", col });
  breachHull(world, col, "meteorFastest", 0, "heavy");
}
