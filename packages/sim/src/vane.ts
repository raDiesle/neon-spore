import { metColor, missedColor } from "./balance.js";
import type { VaneEntry } from "./boss-entries.js";
import type { VaneState } from "./boss-state.js";
import { isMount } from "./gyre.js";
import { type Bullet, spanOf } from "./types.js";
import { vaneFold } from "./vane-arm.js";
import { vaneColor, vaneOpening, vaneOpeningNow } from "./vane-cycle.js";
import { vaneGuarded } from "./vane-guard.js";
import { stepVanePin } from "./vane-hand.js";
import { vaneBearingOpen, vaneOpeningSpent, vaneSplitCol, vaneTipNow } from "./vane-open.js";
import { vanePhase, vaneSplitsOnCycle } from "./vane-phases.js";
import { MILLI, type World } from "./world.js";

/**
 * THE VANE's whole choreography: the boss that bends the field instead of the
 * beat.
 *
 * It is a mechanism, not a weapon. It spawns nothing, it drops nothing, and
 * nothing about it can reach the hull — the only thing it does is decide where
 * the wave's own arrivals land. **Something crossing the arm three columns to
 * its left comes out three columns to its right.** That is the fight in one
 * sentence, and it is the only sentence: once a body is below the arm its
 * column is true forever, so the field is never a lie. What the boss takes away
 * is the radar, which announces a column that the arm has not folded yet.
 *
 * **Since 30 September 2026 the arm hangs two rows down** (`cfg.vaneArmRow`),
 * the owner's *move boss around 2 tiles more down*: a body comes in on its
 * radar column, crosses the arm and slides out on the other side of it, and a
 * shot meets the bearing there rather than at the top edge (`vaneMouthAlong`).
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
 * **And since 30 September 2026 its last pin is not always its last.** The
 * bearing goes through `vaneForms` forms, each after the first carrying
 * `vaneFormPins` and one more guard arm turning round the hub across the
 * mouths (`vane-guard.ts`) — the owner's *another arm appears and rotates
 * around it … harder and harder to hit*.
 *
 * `docs/spec/bosses.md` §11.5 is the design, `vane-cycle.ts` is the
 * clock and `vane-arm.ts` is the fold in columns; this is only what moves.
 */

/** THE VANE takes the field as a mechanism hung off the top edge, not as a body. */
export function installVane(world: World, entry: VaneEntry): VaneState {
  return {
    kind: "vane",
    pins: entry.pins ?? world.cfg.vanePins,
    form: 0,
    formBeat: world.waveBeat,
    spentOpening: -1,
    throwBeat: -1,
    throwCol: -1,
    pinBeat: -1,
    pinCol: -1,
    pinSide: 0,
    hauled: false,
    spentPin: -1,
    pinPivot: -1,
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
  const arm = cfg.vaneArmRow;
  for (const c of world.creatures) {
    // A body crossing the arm's row this beat, and only then: `fromRow` is
    // where the fall started and `row` where it ended, so a body is folded
    // once, on the way down, and its column is true below. Only `col` moves —
    // `fromCol` is left where it was, so the picture slides it across the arm
    // as it falls through it rather than cutting it to the far side. The
    // three kinds `beat.ts` does not fall are left alone: a wheel's mount, a
    // worm's link and a balloon, which each wrote their own `from` fields.
    if (isMount(c) || c.kind === "crawler" || c.kind === "balloon") continue;
    if (c.fromRow >= arm || c.row < arm) continue;
    const to = vaneFold(cfg, tip, c.col, spanOf(c));
    if (to === c.col) continue;
    c.col = to;
    b.throwBeat = world.beat;
    b.throwCol = to;
  }
}

/**
 * A shot that nothing on the field stopped, leaving through the top. Since the
 * arm came down to `cfg.vaneArmRow` the bearing is not up there any more — a
 * shot at it is met on its row (`vaneMouthAlong`) — so this is only the
 * housing's armour: every bolt that gets past the arm is one the vane took,
 * and HARD's question is answered yes (`shot-out.ts`).
 */
export function vaneStruck(world: World, _bullet: Bullet): boolean {
  const b = world.boss;
  return b !== null && b.kind === "vane";
}

/**
 * Where the open bearing is in this shot's column and sweep, in thousandths of
 * a row, or -1 when there is nothing there for it to meet. Asked by
 * `bullets.ts` and `lance-burn.ts` beside the bodies, pods and THE BATON's
 * bead in the same segment, so whichever stands lowest is the one the shot
 * reaches first. Only the split column is a mouth, and only while it is open:
 * everywhere else the shot flies on to the armour at the top.
 */
export function vaneMouthAlong(world: World, bullet: Bullet, from: number, to: number): number {
  const b = world.boss;
  if (b === null || b.kind !== "vane") return -1;
  const mouth = world.cfg.vaneArmRow * MILLI;
  if (from < mouth || mouth < to) return -1;
  if (!vaneBearingOpen(world, b) || vaneOpeningSpent(world, b)) return -1;
  return bullet.col === vaneSplitCol(world, b) ? mouth : -1;
}

/**
 * A shot meeting the bearing on the arm's row, called by `bullets.ts` and
 * `lance-burn.ts` once `vaneMouthAlong` has said it is there to be met.
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
 *
 * A shot into the shut housing is not met here at all: it flies on past the
 * arm and is `vaneStruck`'s armour at the top.
 */
export function vaneMouthStruck(world: World, bullet: Bullet): void {
  const b = world.boss;
  if (b === null || b.kind !== "vane") return;
  // A guard arm across the mouth takes the shot, and the opening with it: a
  // spray fired at a guard must not be the way past it (`vane-guard.ts`).
  if (vaneGuarded(world, b, bullet.col)) {
    spendOpening(world, b);
    world.events.push({ type: "reject", col: bullet.col, row: world.cfg.vaneArmRow });
    return;
  }
  // The colour is the cycle's in every phase: the housing has worn it since
  // the arm stopped, and a pinned arm is an arm that has stopped. Under VEER
  // and SEIZE the opening number is the one the cycle would have been on, so
  // the colour goes on turning at the rate the pair already learned
  // (`vane-cycle.ts`).
  if (bullet.color !== vaneColor(world.cfg, vaneOpeningNow(world.waveBeat))) {
    missedColor(world);
    world.events.push({ type: "reject", col: bullet.col, row: world.cfg.vaneArmRow });
    return;
  }

  metColor(world);
  spendOpening(world, b);
  b.pins -= 1;
  world.events.push({ type: "vaneKnock", pins: b.pins, col: bullet.col });
  if (b.pins > 0) return;
  if (b.form < world.cfg.vaneForms - 1) reform(b, world.cfg.vaneFormPins, world.waveBeat);
  else world.boss = null;
}

/**
 * **The bearing's last pin out of a form that is not its last**: it re-forms
 * rather than going down — a fresh set of pins, one more guard arm, and the
 * arm let go, so the new form starts sweeping (`docs/spec/bosses.md` §11.5,
 * *Four forms*). The `vaneKnock` at nought pins is the re-form's own event;
 * nothing new goes on the wire or into the sound.
 */
function reform(b: VaneState, pins: number, waveBeat: number): void {
  b.form += 1;
  b.formBeat = waveBeat;
  b.pins = pins;
  b.pinBeat = -1;
  b.pinCol = -1;
  b.pinSide = 0;
  b.hauled = false;
  b.spentPin = -1;
  b.pinPivot = -1;
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
