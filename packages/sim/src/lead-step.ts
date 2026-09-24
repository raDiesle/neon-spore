import { midCol } from "./config.js";
import {
  type LeadState,
  leadAim,
  leadAsk,
  leadCrossed,
  leadForecasts,
  leadHeading,
  leadHolding,
  leadLast,
  leadPace,
  leadPassDir,
  leadRunning,
  leadShootable,
  leadStill,
  leadTorn,
  leadWalk,
} from "./lead.js";
import { closeSlow } from "./slow.js";
import { spawnOne } from "./spawn.js";
import type { World } from "./world.js";

/**
 * THE LEAD's clock — the pace, the judgment, the run's litter, the still and
 * the pass. What puts a shot into the air above the field is `lead-shot.ts`,
 * on the tick, and what a thumb on the stalk does is `lead-hand.ts`; the
 * still is counted here, which is where her hand is felt.
 *
 * Everything here runs on the **beat** from `stepBoss`, and in one order:
 * the body **moves**, then every shot due this beat is **judged** against
 * where it now is, then the run **drops** what it drops. The move comes
 * first because that is the sum the pair is doing — a shot leaving the top
 * on beat *b* is judged on beat *b + flight*, against a body that has moved
 * *flight* times since, so the column to say is the column it will be in,
 * not the column it was.
 */

/** Install it from the wave's own `boss:` entry. There is nothing to author. */
export function installLead(world: World): LeadState {
  const cfg = world.cfg;
  const s: LeadState = {
    kind: "lead",
    col: midCol(cfg),
    dir: 1,
    lean: 0,
    segments: cfg.leadSegments,
    flights: [],
    stillBeat: -1,
    passBeat: -1,
    downBeat: -1,
    heldBeat: -1,
    freeBeat: -1,
    stillFills: 0,
  };
  world.events.push({ type: "leadEnter", col: s.col, dir: s.dir });
  return s;
}

/**
 * The stalk, read off where the body will go: nothing while it stands, the
 * pass's way on the still's last beat, otherwise the heading one or two beats
 * out.
 *
 * **A held stalk leans from the beat it is taken**, which is the hold's whole
 * bargain with the other seat. Left alone the still gives the pass away on
 * its last beat and no sooner; a hold that never reaches a last beat would
 * tell the pilot — the only seat shown the lean — nothing at all, and he is
 * the one who has to have the cannon standing where the pass comes through.
 * So her hand buys the beam its time and spends the surprise to do it.
 */
function settleLean(world: World, s: LeadState): void {
  const cfg = world.cfg;
  if (leadStill(s)) {
    const says = leadHolding(s) || world.beat - s.stillBeat === cfg.leadStillBeats;
    s.lean = says ? leadPassDir(s.col, cfg) : 0;
    return;
  }
  if (s.downBeat >= 0) {
    s.lean = 0;
    return;
  }
  s.lean = leadHeading(s, cfg, leadForecasts(s, cfg) ? 1 : 0);
}

/** One beat's travel, walls and all: the pace, the turn if it met one. */
function pace(world: World, s: LeadState): void {
  const cfg = world.cfg;
  const was = s.dir;
  const at = leadWalk(s.col, s.dir, leadPace(s, cfg), cfg);
  s.col = at.col;
  s.dir = at.dir;
  settleLean(world, s);
  world.events.push({ type: "leadPace", col: s.col, dir: was, lean: s.lean });
  if (s.dir !== was) world.events.push({ type: "leadTurn", col: s.col, dir: s.dir });
}

/**
 * Every shot due this beat, against the column the body is in now. One
 * segment a beat at most, however many arrived; a beat on which every one
 * missed turns it round — the design's step 4, and the reason a wrong sum
 * costs the pair the next one as well.
 */
function judge(world: World, s: LeadState): void {
  const cfg = world.cfg;
  const due = s.flights.filter((f) => f.dueBeat <= world.beat);
  if (due.length === 0) return;
  s.flights = s.flights.filter((f) => f.dueBeat > world.beat);
  let hit = false;
  for (const f of due) {
    if (f.col === s.col) hit = true;
    else world.events.push({ type: "leadMiss", col: f.col });
  }
  if (!hit) {
    s.dir = s.dir === 1 ? -1 : 1;
    settleLean(world, s);
    world.events.push({ type: "leadReverse", col: s.col, dir: s.dir });
    return;
  }
  s.segments -= 1;
  world.events.push({ type: "leadHit", col: s.col, segments: s.segments });
  if (leadLast(s)) {
    // The last segment is the beam's: it stops dead where it was hit, the
    // shots still in the air are nothing, and the stalk stands upright.
    s.stillBeat = world.beat;
    s.flights = [];
    leadAsk(world, cfg.leadStillBeats);
    world.events.push({ type: "leadStill", col: s.col });
  }
  settleLean(world, s);
}

/** What a run leaves on the field: a torch in the column it just left, a rock in the column a shot has to be put in — each on its own cadence. */
function litter(world: World, s: LeadState, from: number): void {
  const cfg = world.cfg;
  if (!leadRunning(s, cfg)) return;
  if (cfg.leadTorchEveryBeats > 0 && world.beat % cfg.leadTorchEveryBeats === 0 && from !== s.col) {
    spawnOne(world, { beat: world.beat, col: from, kind: "torch", color: null });
    world.events.push({ type: "leadTorch", col: from });
  }
  if (cfg.leadRockEveryBeats > 0 && world.beat % cfg.leadRockEveryBeats === 0) {
    const col = leadAim(s, cfg);
    spawnOne(world, { beat: world.beat, col, kind: "meteor", color: null });
    world.events.push({ type: "leadRock", col });
  }
}

/** The last movement: the still runs out, the pass goes, the wall is another still, the beam standing in its way is the end. */
function last(world: World, s: LeadState): void {
  const cfg = world.cfg;
  if (leadStill(s)) {
    if (leadHolding(s)) {
      if (!leadTorn(s, world.beat, cfg)) {
        // Her thumb is the fuse: it does not burn while she is on it.
        settleLean(world, s);
        return;
      }
      s.heldBeat = -1;
      s.freeBeat = world.beat;
      world.events.push({ type: "leadTear", col: s.col });
    } else if (s.freeBeat < 0 && world.beat - s.stillBeat <= cfg.leadStillBeats) {
      settleLean(world, s);
      return;
    }
    s.passBeat = world.beat;
    s.dir = leadPassDir(s.col, cfg);
    world.events.push({ type: "leadPass", col: s.col, dir: s.dir });
  }
  const from = s.col;
  const way = s.dir;
  const at = leadWalk(s.col, s.dir, cfg.leadPassCols, cfg);
  s.col = at.col;
  if (world.beam !== null && beamAcross(world, from, s.col)) {
    leadMet(world, s, world.beam.col);
    return;
  }
  s.dir = at.dir;
  settleLean(world, s);
  world.events.push({ type: "leadPace", col: s.col, dir: way, lean: s.lean });
  if (s.col === 0 || s.col === cfg.cols - 1) {
    // A wall is a whole new still, and the stalk is there to be taken again.
    restill(world, s);
    world.events.push({ type: "leadWall", col: s.col });
  }
}

/** A still begun here, at a wall or a beam short of the last: the fuse from the top, the stalk on offer, THE SLOW open again. */
function restill(world: World, s: LeadState): void {
  s.stillBeat = world.beat;
  s.passBeat = -1;
  s.heldBeat = -1;
  s.freeBeat = -1;
  leadAsk(world, world.cfg.leadStillBeats);
  settleLean(world, s);
}

/** A beam met the pass at `col`: down on the last of `leadStillFills`, and before it stopped dead there, a whole new still. */
export function leadMet(world: World, s: LeadState, col: number): void {
  s.stillFills += 1;
  if (s.stillFills >= world.cfg.leadStillFills) {
    closeSlow(world);
    leadDown(world, s);
    return;
  }
  s.col = col;
  restill(world, s);
  world.events.push({ type: "leadStill", col: s.col });
}

/** Whether the beam is standing the whole way up a column the body went through this beat. */
function beamAcross(world: World, from: number, to: number): boolean {
  const beam = world.beam;
  return beam !== null && beam.topMilli === 0 && leadCrossed(from, to, beam.col);
}

/** The beam took the last segment: the body is down where it stands. */
export function leadDown(world: World, s: LeadState): void {
  s.segments = 0;
  s.downBeat = world.beat;
  s.passBeat = -1;
  s.stillBeat = -1;
  s.heldBeat = -1;
  s.freeBeat = -1;
  s.lean = 0;
  world.events.push({ type: "leadDown", col: s.col });
}

/** One beat of the body. */
export function stepLead(world: World, s: LeadState): void {
  const cfg = world.cfg;
  if (s.downBeat >= 0) {
    // Nulled here rather than at the beam, so the frame has its beats of
    // the stalkless body before the wave is allowed to end (`bossHoldsWave`).
    if (world.beat - s.downBeat >= cfg.leadOutBeats) {
      world.events.push({ type: "leadOut", col: s.col });
      world.boss = null;
    }
    return;
  }
  if (leadLast(s)) {
    last(world, s);
    return;
  }
  const from = s.col;
  pace(world, s);
  judge(world, s);
  if (leadShootable(s)) litter(world, s, from);
}
