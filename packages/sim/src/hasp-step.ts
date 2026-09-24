import { NO_BEARING } from "./bearing.js";
import { midCol } from "./config.js";
import {
  HASP_COUNT,
  type HaspState,
  haspFuseBeats,
  haspHeld,
  haspLoose,
  haspTurning,
  haspWorking,
  NO_BOLT,
  NO_BURN,
  NO_LATCH,
} from "./hasp.js";
import { breachHull } from "./hull-damage.js";
import { closeSlow, openSlow } from "./slow.js";
import type { World } from "./world.js";

/**
 * THE HASP's clock: the latches lighting, the heat burning a hand off, the
 * wheel seizing and coming free, the one bolt, and the row swinging clear.
 *
 * **The gate itself is not here**, and that is the boss: whether the wheel
 * turns is asked the instant a hand moves it, on the tick, because a wheel
 * that waited for the beat would keep turning after the latch let go
 * (`hasp-hand.ts`). What is here is everything with a beat count on it, and
 * the *saying* of the gate — the seize and the free are announced from this
 * page, once each, so a wheel held still under a hand cannot say `haspSeize`
 * a hundred times a beat.
 *
 * **The one window in this fight is a grip's fuse.** A latch nobody takes
 * lights and waits; a wheel nobody winds stands where it was left. The whole
 * of the cost is the heat, which is the pilot's alone, and the bolt, which is
 * ordinary — §20 gives the pair no clock to race but the one his hand starts,
 * and THE SLOW spans exactly that (`haspSlow`).
 */

export function installHasp(world: World): HaspState {
  const s: HaspState = {
    kind: "hasp",
    phase: "still",
    phaseBeat: world.beat,
    hasps: HASP_COUNT,
    latchMilli: NO_LATCH,
    gripBeat: world.beat,
    burnBeat: NO_BURN,
    wheelMilli: 0,
    handMilli: NO_BEARING,
    woundMilli: 0,
    seized: false,
    boltCol: NO_BOLT,
    boltBeat: 0,
  };
  world.events.push({ type: "haspEnter", col: midCol(world.cfg) });
  return s;
}

export function stepHasp(world: World, s: HaspState): void {
  const cfg = world.cfg;
  const mid = midCol(cfg);
  // The bolt, judged before anything else this beat: one left loose too long
  // reaches the ship whatever the two hands are doing.
  spendBolt(world, s);
  if (s.phase === "clear") {
    if (world.beat - s.phaseBeat >= cfg.haspClearBeats) {
      world.events.push({ type: "haspOut", col: mid });
      world.boss = null;
    }
    return;
  }
  if (s.phase === "still") {
    if (world.beat - s.phaseBeat >= cfg.haspStillBeats) lightLatch(world, s);
    return;
  }
  if (s.phase === "swing") {
    if (world.beat - s.phaseBeat < cfg.haspSwingBeats) return;
    if (s.hasps > 0) lightLatch(world, s);
    else clearRow(world, s);
    return;
  }
  if (haspBurnt(world, s)) return;
  burnHand(world, s);
  sayGate(world, s);
}

/** The next hasp's latch up, cool, with the wheel behind it standing where
 * the last one left it. Nothing about it is shown to the navigator. */
function lightLatch(world: World, s: HaspState): void {
  s.phase = "work";
  s.phaseBeat = world.beat;
  s.burnBeat = NO_BURN;
  world.events.push({ type: "haspLit", hasps: s.hasps, col: midCol(world.cfg) });
}

/** A latch that has burned, cooling: nothing may take it until it has. True
 * while it is still too hot, which is a beat in which neither hand counts. */
function haspBurnt(world: World, s: HaspState): boolean {
  if (s.burnBeat === NO_BURN) return false;
  if (world.beat - s.burnBeat < world.cfg.haspBurnBeats) return true;
  s.burnBeat = NO_BURN;
  world.events.push({ type: "haspCool", col: midCol(world.cfg) });
  return false;
}

/**
 * **The heat spent**: a grip held past its fuse burns the pilot's hand off
 * the latch, and the wheel seizes wherever it had got to — the grip's window
 * missed, so THE SLOW that spanned it shuts on the same beat.
 */
function burnHand(world: World, s: HaspState): void {
  const cfg = world.cfg;
  if (!haspHeld(s, cfg)) return;
  if (world.beat - s.gripBeat < haspFuseBeats(s, cfg)) return;
  s.latchMilli = NO_LATCH;
  s.burnBeat = world.beat;
  world.events.push({ type: "haspBurn", col: midCol(cfg) });
  haspSlow(world, s);
}

/**
 * **THE SLOW spans a grip** (`docs/decisions.md` #33): up from the tick his
 * hand takes the latch for exactly its fuse, and shut the moment the grip
 * ends — let go, burnt off, or the clasp wound open under it. A grip is the
 * ask, because it starts the only clock in the fight and the wind has to fit
 * inside it; a latch with no hand on it asks nothing and is played at speed.
 * Read off the state, so a grip taken again after a let is a window again.
 */
export function haspSlow(world: World, s: HaspState): void {
  if (haspWorking(s) && haspHeld(s, world.cfg)) {
    openSlow(world, s.gripBeat + haspFuseBeats(s, world.cfg) - world.beat);
  } else closeSlow(world);
}

/**
 * **The gate, said once.** Whether her wheel is seized is an ordinary read
 * of both hands, and it is true for as long as it is true; what is announced
 * is the *change*, so the frame dims when the wheel goes dead under her and
 * lifts when it comes back.
 *
 * Nothing about why is announced, here or anywhere: the seize is hers and
 * the heat is his, and the sentence that joins them is the pair's to say.
 */
function sayGate(world: World, s: HaspState): void {
  const stuck = haspTurning(s) && !haspHeld(s, world.cfg);
  if (stuck === s.seized) return;
  s.seized = stuck;
  world.events.push({ type: stuck ? "haspSeize" : "haspFree", col: midCol(world.cfg) });
}

/**
 * A hasp wound open: it swings, and whichever hazard that opening owes.
 *
 * The bolt is hung off the count left rather than banked in a field of its
 * own, `partSeam`'s rule: one left is the second opening, so the row of the
 * design is read off the health and cannot drift from it.
 */
export function openHasp(world: World, s: HaspState): void {
  const mid = midCol(world.cfg);
  s.hasps -= 1;
  s.phase = "swing";
  s.phaseBeat = world.beat;
  s.woundMilli = 0;
  // Both hands come off with the hasp they were working: the next wheel is a
  // new circle and the next latch a cool one, and a hand carried across would
  // be a reference taken on a thing that is no longer there.
  s.latchMilli = NO_LATCH;
  s.handMilli = NO_BEARING;
  s.seized = false;
  world.events.push({ type: "haspOpen", hasps: s.hasps, col: mid });
  haspSlow(world, s);
  if (s.hasps === HASP_COUNT - 2) {
    s.boltCol = mid;
    s.boltBeat = world.beat;
    world.events.push({ type: "haspBolt", col: mid });
  }
}

/** All three: the row swings clear together and the passage behind it lights. */
function clearRow(world: World, s: HaspState): void {
  s.phase = "clear";
  s.phaseBeat = world.beat;
  world.events.push({ type: "haspClear", col: midCol(world.cfg) });
}

/** The loose bolt, unanswered for `haspBoltBeats`: the hull, and the wave. */
function spendBolt(world: World, s: HaspState): void {
  if (!haspLoose(s)) return;
  if (world.beat - s.boltBeat < world.cfg.haspBoltBeats) return;
  const col = s.boltCol;
  s.boltCol = NO_BOLT;
  world.events.push({ type: "haspBoltHit", col });
  breachHull(world, col, "meteorFastest", 0, "heavy");
}
