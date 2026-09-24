import { nextInt } from "./rng.js";
import { NO_SHELL } from "./shell.js";
import { openSlow } from "./slow.js";
import {
  NO_BRAKE,
  SPOOL_RIBS,
  type SpoolState,
  spoolCol,
  spoolGone,
  spoolGrace,
  spoolInZone,
  spoolLegs,
  spoolPayRateMilli,
} from "./spool.js";
import type { World } from "./world.js";

/**
 * THE SPOOL's clock: the line running out under the brake, the zone moving
 * under a correction, the slip that sends a movement back to its head, and
 * the rib that eases when a whole movement was held inside its zone.
 *
 * **Nearly the whole fight is here**, which is the opposite of a handle boss
 * and for the opposite reason. A stroke is an edge and so it is judged the
 * instant it lands; a brake is a *level*, and what it is worth is only ever
 * known a beat at a time. So the hand does almost nothing (`spool-hand.ts`) and
 * this page is where the line pays out, where it is measured against the zone,
 * and where every phase of the fight is decided.
 *
 * **The target is rolled, not authored.** A movement's leg gets its rate off
 * `world.rng` inside `spoolRateSlowMilli`…`spoolRateFastMilli`, which is the
 * whole of the reach read back (`spoolBrakeForRateMilli`), so every rate the
 * navigator can be shown is one the pilot's thumb can reach. Rolled rather
 * than authored for `sinew.ts`' reason: a pair that learned the four rates by
 * heart would stop saying them to each other, and the sentence is the fight.
 */

export function installSpool(world: World): SpoolState {
  const s: SpoolState = {
    kind: "spool",
    phase: "taut",
    phaseBeat: world.beat,
    ribs: SPOOL_RIBS,
    brakeMilli: NO_BRAKE,
    paidMilli: 0,
    wantMilli: 0,
    leg: 0,
    legBeat: world.beat,
    wantRateMilli: world.cfg.spoolRateSlowMilli,
  };
  world.events.push({ type: "spoolEnter", col: spoolCol(world.cfg) });
  return s;
}

export function stepSpool(world: World, s: SpoolState): void {
  const cfg = world.cfg;
  if (s.phase === "slack") {
    if (world.beat - s.phaseBeat >= cfg.spoolSlackBeats) {
      world.events.push({ type: "spoolOut", col: spoolCol(cfg) });
      world.boss = null;
    }
    return;
  }
  if (s.phase === "taut") {
    if (world.beat - s.phaseBeat >= cfg.spoolTautBeats) openMovement(world, s);
    return;
  }
  if (s.phase === "slip") {
    if (world.beat - s.phaseBeat >= cfg.spoolSlipBeats) openMovement(world, s);
    return;
  }
  if (s.phase === "ease") {
    if (world.beat - s.phaseBeat >= cfg.spoolEaseBeats) openMovement(world, s);
    return;
  }
  payOut(world, s);
}

/**
 * One beat of line: what the brake let out, and where the zone moved to.
 *
 * The two climb separately and the whole fight is the gap between them. The
 * zone is judged after both have moved, so a beat is in or out on what it
 * left behind rather than on what it started from — and never during the
 * grace at the head of a movement, which is the pair's time to say the first
 * depth to each other.
 */
function payOut(world: World, s: SpoolState): void {
  const cfg = world.cfg;
  s.paidMilli += spoolPayRateMilli(s, cfg);
  s.wantMilli += s.wantRateMilli;
  if (!spoolGrace(s, cfg, world.beat) && !spoolInZone(s, cfg)) {
    slipLine(world, s);
    return;
  }
  if (world.beat - s.legBeat < cfg.spoolLegBeats) return;
  if (s.leg + 1 < spoolLegs(s)) {
    s.leg += 1;
    s.legBeat = world.beat;
    s.wantRateMilli = rollRate(world);
    world.events.push({ type: "spoolLeg", leg: s.leg, col: spoolCol(cfg) });
    return;
  }
  easeRib(world, s);
}

/** A movement's zone open, its first rate rolled, and the line back at its head. */
function openMovement(world: World, s: SpoolState): void {
  s.phase = "pay";
  s.phaseBeat = world.beat;
  s.paidMilli = 0;
  s.wantMilli = 0;
  s.leg = 0;
  s.legBeat = world.beat;
  s.wantRateMilli = rollRate(world);
  world.events.push({ type: "spoolZone", ribs: s.ribs, col: spoolCol(world.cfg) });
}

/** A rate inside the brake's own reach, so every zone is one a thumb can hold. */
function rollRate(world: World): number {
  const cfg = world.cfg;
  const span = Math.max(1, cfg.spoolRateFastMilli - cfg.spoolRateSlowMilli + 1);
  return cfg.spoolRateSlowMilli + nextInt(world.rng, span);
}

/**
 * **The line outside its zone**: the movement goes back to its head, and from
 * the second movement on the slack it threw flings a rock down the pilot's
 * own column.
 *
 * The design gives the rock to one row of one movement. It is thrown on every
 * slip after the first movement instead, and the departure is argued in
 * `docs/spec/bosses.md`: a hazard that happened once would be a rule the pair
 * met, learned and never met again, and a rule with an exception in it is the
 * one thing §2 of `.claude/skills/new-boss` will not have. The first movement
 * is spared because that movement is where the gesture is discovered.
 */
function slipLine(world: World, s: SpoolState): void {
  s.phase = "slip";
  s.phaseBeat = world.beat;
  world.events.push({ type: "spoolSlip", col: spoolCol(world.cfg) });
  if (spoolGone(s) >= 1) throwRock(world);
}

/**
 * A rock down the column the cannon is standing in — the fight's one ordinary
 * hazard, and an ordinary body from the moment it is thrown.
 *
 * The answer the design asks for is the shield, the shield is what turns a
 * body, and a bespoke hazard with a bespoke ward would be a second rule the
 * pair cannot discover by trying it.
 */
function throwRock(world: World): void {
  const col = world.cannonCol;
  world.creatures.push({
    id: world.nextId++,
    kind: "meteor",
    span: 1,
    col,
    row: 0,
    fromRow: 0,
    color: null,
    holes: 0,
    petals: 0,
    dragMilli: 0,
    shell: NO_SHELL,
  });
  world.events.push({ type: "spoolRock", col });
}

/**
 * **A whole movement held inside the zone**: one rib eases open.
 *
 * Eases, and the word is the design's — nothing on this boss cracks. The
 * fourth takes the tension out of the casing altogether, and that is the one
 * place THE SLOW opens (§21): the payoff is calm rather than a break, because
 * the whole fight has been training the pair toward exactly this stillness.
 */
function easeRib(world: World, s: SpoolState): void {
  const col = spoolCol(world.cfg);
  s.ribs -= 1;
  world.events.push({ type: "spoolRib", ribs: s.ribs, col });
  if (s.ribs > 0) {
    s.phase = "ease";
    s.phaseBeat = world.beat;
    return;
  }
  s.phase = "slack";
  s.phaseBeat = world.beat;
  openSlow(world, world.cfg.spoolSlowBeats);
  world.events.push({ type: "spoolSlack", col });
  world.events.push({ type: "spoolDrift", col });
}
