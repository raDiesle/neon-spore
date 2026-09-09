import { midCol, type SimConfig } from "./config.js";
import { NO_CRANK } from "./crank.js";
import { NO_GRIP } from "./grip.js";
import type { GripPush } from "./grip-push.js";
import type { LanceBeam, Prime } from "./lance.js";
import type { ShotCharge } from "./shot-charge.js";

/**
 * **The hull and its two hands.** Every field of `World` that is about the
 * ship rather than about what is coming at it: where the cannon and the dome
 * are standing, the ticks a press is remembered by, THE CLAW's arm and its
 * crank, THE CHOIR's half-made gesture, the grips and the carries out of them,
 * and the three things a shot passes through on its way out.
 *
 * Cut out of `world.ts` because that file had reached its 250-line ceiling
 * exactly and a paragraph could not be added to it. `World` extends this, so
 * `world.cannonCol` still reads as it always did — the split is where the
 * sentences live, not where the values do. It stays an interface rather than a
 * `ship:` struct for that reason, and because `hash.ts` walks these fields as
 * one flat list beside `tick` and `beat`.
 *
 * The readings over these fields are exported from `index-ship.ts` next door,
 * which is the same line drawn one layer up.
 */
export interface ShipState {
  cannonCol: number;
  shieldCol: number;
  /**
   * The tick the shield arrived in the column it is standing in — how long it
   * has been *still*, rather than where it is.
   *
   * One reader today and it is a picture: the current a fence throws at the
   * dome goes out once the dome has stood in one of its gaps long enough to
   * have settled there (`fenceSettleTicks`, fence.ts). That is a fact about
   * the world rather than about a canvas — both devices have to agree when the
   * arc stops, and a renderer timing it off its own frame clock would be two
   * different answers to one question.
   *
   * Set only when the column actually changes, so a seat holding the control
   * against a wall is not restarting the clock every tick.
   */
  shieldSinceTick: number;
  /** Tick of the most recent shield trigger by player 1. */
  guardTick: number;
  /** Tick of the most recent maw opening by player 1. */
  intakeTick: number;
  /** THE CLAW's arm, which is what player 1's swelling is on the `claw` panel:
   * `0` at rest on the hull, `1` reaching up its column, `-1` coming back
   * (`reach.ts`). Five loose fields, the crank's own included, rather than one
   * struct: they are ship state like `cannonCol` beside them — the arm is not
   * a boss and not a round, it is the gun replaced by a hand. */
  reachDir: -1 | 0 | 1;
  /** The column it went up, held while it is out so that sliding the strip
   * under a travelling arm cannot bend it. */
  reachCol: number;
  /** How far up from the hull the tip has got, in thousandths of a tile. */
  reachMilli: number;
  /** The id of the pod it closed on, or 0. It is an id rather than the pod
   * itself for `FleetState.sunkBeat`'s reason: the list is the truth and a
   * second reference to a member of it is a second truth. */
  reachHeld: number;
  /** Where round the crank player 1's finger last reported itself, in
   * thousandths of a turn, or `NO_CRANK` for a crank nobody is touching. The
   * *reference* the next bearing is a step from, never a total — the rope the
   * winding moves is `reachMilli` above (`crank.ts`). */
  crankAtMilli: number;
  /**
   * THE CHOIR's half-made gesture: which of the two arrows the pilot has
   * carried outward, `2` for a phone shaken once, `0` while nothing has been
   * done (`NO_CHOIR_ARM`, `CHOIR_SHAKEN`). It is ship state beside `guardTick`
   * rather than a field of any one body, because a hand belongs to a seat and
   * a wave may put two membranes on the field at once (`choir-gesture.ts`).
   */
  choirArm: -1 | 0 | 1 | 2;
  /** The tick that arm's window shuts on. Past it with only one arrow out,
   * the thing sings and the hull pays (`stepChoirWindow`). */
  choirArmTick: number;
  /** Last tick the shield still counts as armed without a trigger, set by a `ward` pod. */
  wardUntilTick: number;
  lastFireTick: number;
  /**
   * The creature each player has a hand on, or `NO_GRIP`. Read them through
   * `gripsCreature` (grip.ts) rather than by name — which field is whose is
   * that file's business.
   */
  gripP1: number;
  gripP2: number;
  /**
   * The hand each player is carrying a body sideways with, or null while they
   * are only holding one still. Read them through `gripPushOf` (grip-push.ts)
   * rather than by name, for the reason the two above are read through
   * `gripsCreature`: which field is whose is that file's business.
   *
   * They are beside the grips rather than on the body being carried because a
   * carry belongs to a *hand* — two hands may be on one rock, each of them a
   * different distance from where it grabbed — while the beat a body was last
   * carried on belongs to the body and is `Creature.pushBeat`.
   */
  pushP1: GripPush | null;
  pushP2: GripPush | null;
  /**
   * Player 2's thumb resting on a colour, filling the cannon lobe, or null.
   * Read it through `lance.ts` rather than by name — how full the lobe is,
   * which colour is in it and whether it has already gone are that file's
   * business, and render/, the band and the shot itself all ask the same
   * question from three places.
   *
   * There is no `primeCol` beside it, deliberately: a cannon that moves resets
   * the fill, so while this is filling the column *is* `cannonCol`, and a
   * second copy of it could only ever disagree.
   */
  prime: Prime | null;
  /**
   * The shot player 2 has pressed that has not left the muzzle yet, or null.
   * World state for the reason a bullet in flight is: two devices that
   * disagree about whether a shot exists have desynced. Ask `shot-charge.ts`.
   */
  charge: ShotCharge | null;
  /**
   * The beam THE LANCE leaves standing in a column after it has burnt it, or
   * null. World state for the charge's reason: two devices that disagree about
   * whether a column is on fire have desynced. Ask `lance.ts`.
   */
  beam: LanceBeam | null;
}

/**
 * A ship at rest, with both hands on the middle column. Spread into the world
 * `createWorld` builds, so the fields sit flat on it exactly as they did when
 * they were written out there.
 */
export function newShipState(cfg: SimConfig): ShipState {
  const mid = midCol(cfg);
  return {
    cannonCol: mid,
    shieldCol: mid,
    shieldSinceTick: 0,
    guardTick: -1_000_000,
    intakeTick: -1_000_000,
    reachDir: 0,
    reachCol: mid,
    reachMilli: 0,
    reachHeld: 0,
    crankAtMilli: NO_CRANK,
    choirArm: 0,
    choirArmTick: 0,
    wardUntilTick: -1_000_000,
    lastFireTick: -1_000_000,
    gripP1: NO_GRIP,
    gripP2: NO_GRIP,
    pushP1: null,
    pushP2: null,
    prime: null,
    charge: null,
    beam: null,
  };
}
