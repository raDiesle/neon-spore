import { bossStrikesHull } from "./boss-strike.js";
import { midCol } from "./config.js";
import {
  NO_BOLT,
  NO_CATCH,
  RATCHET_CLEAN,
  RATCHET_TEETH,
  type RatchetState,
  ratchetLoose,
  ratchetWindowBeats,
} from "./ratchet.js";
import { closeSlow, openSlow } from "./slow.js";
import type { World } from "./world.js";

/**
 * THE RATCHET's clock: the pawl lighting, a window running out, the rack
 * climbing, the one bolt, and the rack opening or jamming.
 *
 * **The press itself is not here.** Whether it is clean is asked the instant
 * his thumb lands, on the tick, against her hand on the same tick
 * (`ratchet-hand.ts`); what is here is everything with a beat count on it.
 *
 * **Every window is THE SLOW** — opened when the pawl lights and closed the
 * moment the tooth is spent, pressed or run out (the owner, 22 September
 * 2026): the slow is time to talk in, and a tooth is exactly the moment
 * the pair have to say `SET` across the delay.
 */

export function installRatchet(world: World): RatchetState {
  const s: RatchetState = {
    kind: "ratchet",
    phase: "still",
    phaseBeat: world.beat,
    teeth: RATCHET_TEETH,
    clean: 0,
    catchMilli: NO_CATCH,
    catchSpent: false,
    pawlDown: false,
    cleanLast: false,
    boltCol: NO_BOLT,
    boltBeat: 0,
  };
  world.events.push({ type: "ratchetEnter", col: midCol(world.cfg) });
  return s;
}

export function stepRatchet(world: World, s: RatchetState): void {
  const cfg = world.cfg;
  // The bolt, judged before anything else this beat: one left loose too long
  // reaches the ship whatever the two hands are doing.
  spendBolt(world, s);
  const since = world.beat - s.phaseBeat;
  if (s.phase === "open") {
    if (since >= cfg.ratchetOpenBeats) {
      world.events.push({ type: "ratchetOut", col: midCol(cfg) });
      world.boss = null;
    }
    return;
  }
  if (s.phase === "still") {
    if (since >= cfg.ratchetStillBeats) lightPawl(world, s);
    return;
  }
  if (s.phase === "climb") {
    if (since >= cfg.ratchetClimbBeats) lightPawl(world, s);
    return;
  }
  // A window nobody pressed in is a tooth spent for nothing: the rack does
  // not wait, or a pair could sit on their last margin for ever.
  if (s.phase === "work" && since >= ratchetWindowBeats(s, cfg)) {
    advanceRatchet(world, s, false, true);
  }
}

/** The next tooth's pawl up, and THE SLOW open for exactly its window. */
function lightPawl(world: World, s: RatchetState): void {
  s.phase = "work";
  s.phaseBeat = world.beat;
  openSlow(world, ratchetWindowBeats(s, world.cfg), "ask");
  world.events.push({ type: "ratchetLit", teeth: s.teeth, col: midCol(world.cfg) });
}

/**
 * **One tooth spent**, and never given back — the whole of §22's question.
 *
 * A clean advance spends her catch with it: the hand that set it has to lift
 * and set it again, so a thumb left resting on the catch cannot carry the
 * next five teeth on its own (`ratchet-hand.ts`). A burn leaves her hand
 * where it was, because nothing on the rack moved under it.
 *
 * **The rack jams the moment it cannot open**, rather than playing out the
 * teeth it has left: a fight already lost that asks for three more presses
 * is three windows of the pair being lied to.
 */
export function advanceRatchet(world: World, s: RatchetState, clean: boolean, late: boolean): void {
  const mid = midCol(world.cfg);
  s.teeth -= 1;
  s.cleanLast = clean;
  s.phaseBeat = world.beat;
  closeSlow(world);
  if (clean) {
    s.clean += 1;
    s.catchMilli = NO_CATCH;
    s.catchSpent = true;
    world.events.push({ type: "ratchetClick", teeth: s.teeth, clean: s.clean, col: mid });
  } else {
    world.events.push({ type: "ratchetBurn", teeth: s.teeth, late, col: mid });
  }
  if (s.clean >= RATCHET_CLEAN) {
    s.phase = "open";
    world.events.push({ type: "ratchetOpen", col: mid });
    return;
  }
  if (s.clean + s.teeth < RATCHET_CLEAN) {
    s.phase = "jam";
    world.events.push({ type: "ratchetJam", col: mid });
    bossStrikesHull(world, "ratchet", mid);
    return;
  }
  s.phase = "climb";
  if (clean && s.clean === 2) {
    s.boltCol = mid;
    s.boltBeat = world.beat;
    world.events.push({ type: "ratchetBolt", col: mid });
  }
}

/** The loose bolt, unanswered for `ratchetBoltBeats`: the hull, and the wave. */
function spendBolt(world: World, s: RatchetState): void {
  if (!ratchetLoose(s)) return;
  if (world.beat - s.boltBeat < world.cfg.ratchetBoltBeats) return;
  const col = s.boltCol;
  s.boltCol = NO_BOLT;
  world.events.push({ type: "ratchetBoltHit", col });
  bossStrikesHull(world, "ratchet", col);
}
