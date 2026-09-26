import { metColor, missedColor } from "./balance.js";
import type { VaneEntry } from "./boss-entries.js";
import type { VaneState } from "./boss-state.js";
import { type Bullet, spanOf } from "./types.js";
import { vaneFold } from "./vane-arm.js";
import {
  vaneColor,
  vaneOpening,
  vaneOpeningNow,
  vanePhase,
  vaneSplitsOnCycle,
} from "./vane-cycle.js";
import { stepVanePin } from "./vane-hand.js";
import { vaneBearingOpen, vaneOpeningSpent, vaneSplitCol, vaneTipNow } from "./vane-open.js";
import type { World } from "./world.js";

/**
 * THE VANE's whole choreography: the boss that bends the field instead of the
 * beat.
 *
 * It is a mechanism, not a weapon. It spawns nothing, it drops nothing, and
 * nothing about it can reach the hull — the only thing it does is decide where
 * the wave's own arrivals land. **Something crossing the arm three columns to
 * its left comes out three columns to its right.** That is the fight in one
 * sentence, and it is the only sentence: once a body is on the field its column
 * is true forever, so the field is never a lie. What the boss takes away is the
 * radar, which announces a column that the arm has not folded yet.
 *
 * The pair feel that as a change of language rather than of difficulty. Every
 * announcement this game has ever asked for is `<thing> in <column>`, and under
 * the arm the column the radar shows is not the column it lands in — so the one
 * who reads the strip has to fold it before they say it, and the one who acts
 * on it never can. The beat gave them "on the three", which stays true however
 * long a sentence takes to arrive; the arm asks them to find the same trick for
 * space, and hands them the only thing that works: a column named against the
 * arm rather than against the grid.
 *
 * **And since 18 September 2026 the bearing asks for more than a shot.** Every
 * pair of pins adds a hand on the picture: under VEER the ends of the sweep
 * stop splitting the housing and the pilot's thumb on the arm does it instead,
 * which also holds the fold line still; under SEIZE the bearing jams on top of
 * that and the navigator has to haul the housing off a pinned arm before a
 * shot counts. `vane-hand.ts` hears both and `vane-open.ts` is the one place
 * that reads a phase into *where the arm is* and *whether the bearing is open*.
 *
 * `docs/spec/bosses.md` §11.5 is the design, `vane-cycle.ts` is the
 * clock and `vane-arm.ts` is the fold in columns; this is only what moves.
 */

/** THE VANE takes the field as a mechanism hung off the top edge, not as a body. */
export function installVane(world: World, entry: VaneEntry): VaneState {
  return {
    kind: "vane",
    pins: entry.pins ?? world.cfg.vanePins,
    spentOpening: -1,
    throwBeat: -1,
    throwCol: -1,
    pinBeat: -1,
    pinCol: -1,
    pinSide: 0,
    hauled: false,
    spentPin: -1,
  };
}

/**
 * One beat of the boss, dispatched from `stepBoss`.
 *
 * It runs after the beat's spawn loop and before the hull is resolved, which is
 * the only place it can: a body it throws has to be in its landing column
 * before anything else this beat looks at a column.
 */
export function stepVane(world: World, b: VaneState): void {
  const cfg = world.cfg;
  // The pin's clock first: an arm torn out of the thumb this beat folds this
  // beat's arrivals from wherever the sweep has got to, not from where it was
  // being held (`vane-hand.ts`).
  stepVanePin(world, b);
  const tip = vaneTipNow(world, b);
  for (const c of world.creatures) {
    // An arrival, and only an arrival. `fromRow` is negative for exactly the
    // one beat a body glides in from above the field, so this is the beat the
    // arm is sweeping through it — and it is also the beat before any frame is
    // drawn of it, which is why a thrown body is *born* in its landing column
    // rather than visibly jumping columns a beat later.
    if (c.fromRow >= 0) continue;
    const to = vaneFold(cfg, tip, c.col, spanOf(c));
    if (to === c.col) continue;
    c.col = to;
    b.throwBeat = world.beat;
    b.throwCol = to;
  }
}

/**
 * A shot that nothing on the field stopped, leaving through the top — where the
 * bearing hangs. Called by `bullets.ts` at the one moment a bullet has run out
 * of field, and a no-op unless THE VANE is the boss.
 *
 * Three things have to line up, and the pair holds them between them: the
 * housing has to be split, which under SWING happens at each end of the sweep
 * and from VEER on is the pair's own thumb (`vane-open.ts`); the shot has to be
 * in the column the split is on, which is the pilot's to stand in; and it has
 * to carry the housing's colour, which is the navigator's to load. A second
 * shot inside the same opening does nothing — a spray must not be allowed to
 * skip a pin, and that holds for an opening the pair made as much as for one
 * the cycle handed them.
 *
 * The column also has to be *clear*, and that is not a rule, it is the field:
 * a shot stops at the first body in its way, so the pair are firing up a lane
 * they have kept empty. The boss defends itself with what it throws.
 */
export function vaneStruck(world: World, bullet: Bullet): void {
  const b = world.boss;
  if (b === null || b.kind !== "vane") return;
  if (!vaneBearingOpen(world, b) || vaneOpeningSpent(world, b)) return;
  if (bullet.col !== vaneSplitCol(world, b)) return;
  // The colour is the cycle's in every phase: the housing has worn it since
  // the arm stopped, and a pinned arm is an arm that has stopped. Under VEER
  // and SEIZE the opening number is the one the cycle would have been on, so
  // the colour goes on alternating at the rate the pair already learned
  // (`vane-cycle.ts`).
  if (bullet.color !== vaneColor(vaneOpeningNow(world.waveBeat))) {
    missedColor(world);
    world.events.push({ type: "reject", col: bullet.col, row: 0 });
    return;
  }

  metColor(world);
  spendOpening(world, b);
  b.pins -= 1;
  world.events.push({ type: "vaneKnock", pins: b.pins, col: bullet.col });
  if (b.pins > 0) return;

  world.boss = null;
}

/** One hit per opening, whichever kind of opening this phase has. */
function spendOpening(world: World, b: VaneState): void {
  if (vaneSplitsOnCycle(vanePhase(b.pins))) {
    b.spentOpening = vaneOpening(world.waveBeat);
    return;
  }
  b.spentPin = b.pinBeat;
}

/**
 * Whether the bearing is open this instant. Read by render/ and by the tests,
 * so neither has to know that "open" is a column of the cycle table.
 */
export function vaneOpen(world: World): boolean {
  const b = world.boss;
  if (b === null || b.kind !== "vane") return false;
  return vaneBearingOpen(world, b) && !vaneOpeningSpent(world, b);
}
