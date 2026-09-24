import type { SimConfig } from "./config.js";
import { openSlow } from "./slow.js";
import {
  type TasterState,
  tasterBladeAt,
  tasterBoss,
  tasterLifted,
  tasterPhase,
  tasterPried,
} from "./taster.js";
import { tasterCut } from "./taster-shot.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE TASTER's three thumbs on its own fan**, off the wire, on the tick.
 *
 * The fight shipped answered entirely from the panel: a bolt of the colour a
 * blade is not, a bolt into the gap where one used to be, and a beam at the
 * end. One gesture, played eleven times, with the colour the only thing that
 * ever changed — which is the shape the §6.2 ask names and asks every shipped
 * boss to leave behind (`.claude/skills/new-boss`).
 *
 * What it had instead of a handle was the one thing that made a handle easy:
 * **the fan is on both screens whole**. No part of this boss is hidden from a
 * seat — the split is the two *numbers*, his the blade coming next and hers
 * the two counts (`render/src/taster-read.ts`) — so either thumb can point at
 * any of it, and the question was only which movement wants which hand.
 *
 * One per movement, and each is that movement's own problem:
 *
 * - `tasterBlade` — **the pilot's, while the fan is `fanning`.** Three blades
 *   grow at once there and all three read the same ledger, so all three arrive
 *   in one colour. His thumb on one holds it out of its decision for
 *   `tasterPinBeats`, which is the navigator's window to turn the ledger over
 *   before it sets. `id` is the column. Held past that the blade decides
 *   anyway and comes up **thick**, so the pin is a bet and not a pause.
 * - `tasterGap` — **the navigator's, while the fan is `hurrying`.** The crest
 *   is cut through by `tasterCrestCuts` shots into the soft columns, and every
 *   one of those shots is a colour the boss then tastes: the pair's own
 *   cutting is what keeps re-edging the fan they are cutting it to stop. Her
 *   thumb carried `tasterWipeMilli` across a soft column is the same cut made
 *   with **no colour spent at all** — the one move in this fight that costs
 *   the ledger nothing, and the answer to its central trap. `id` is the
 *   column; the carry is `fromMilli` and its sign says nothing, because a gap
 *   is wiped either way.
 * - `tasterLock` — **the pilot's, on the `closed` interlock.** It used to fall
 *   to the beam alone. It falls to two seats now: his carry hauls the last
 *   blades `tasterPryMilli` off each other and they stand open
 *   `tasterPryBeats`, and `tasterPryFills` of her beams in the colour the
 *   ledger says they are short of have to land inside that. He may let go the moment it is open —
 *   the window is a beat count and not a hold — because his hands are the
 *   cannon and she still needs him under the crest.
 *
 * **A seat's thumb on the other's handle is dropped without a sound**, as it
 * is on THE FLEET's chart and THE CANDLE's wick. On the tick rather than the
 * beat (`step.ts`): a pin is down when it lands, the cut a carry makes is
 * where the thumb is now, and the tick the interlock comes apart is the tick
 * her beam starts being worth something.
 */

/**
 * **What each of the three is offering, this tick.**
 *
 * Three predicates rather than three conditions inside the three functions
 * below, because the picture has to ask exactly the same questions: a ring
 * drawn on a gate written out a second time in `render/taster-grip.ts` is a
 * handle that goes on saying *take hold of me* after somebody changes one of
 * the two copies. All three are called from `pin`/`wipe`/`pry` themselves, so
 * there is one reading and the drawing and the rule cannot drift.
 *
 * None of them says anything about the seat, and none about a thumb already
 * down: whose hand it is belongs with the command, and a hand on a thing is
 * not a reason to stop drawing the thing.
 */

/** The pin: a blade out of the crest, still undecided, while the fan is `fanning`. */
export function tasterPinnable(t: TasterState, cfg: SimConfig, i: number): boolean {
  if (i < 0 || tasterPhase(t, cfg) !== "fanning") return false;
  const k = t.blades[i];
  return k !== undefined && !k.shorn && k.growBeat >= 0 && k.setBeat < 0;
}

/** The wipe: a column a blade was struck off in, on a crest still worth cutting. */
export function tasterWipable(t: TasterState, cfg: SimConfig, i: number): boolean {
  if (i < 0 || tasterPhase(t, cfg) !== "hurrying" || tasterLifted(t)) return false;
  return t.blades[i]?.shorn === true;
}

/** And the pry: an interlock that is `closed` and is not already standing open. */
export function tasterPryable(t: TasterState, beat: number, cfg: SimConfig): boolean {
  return tasterPhase(t, cfg) === "closed" && !tasterPried(t, beat, cfg);
}

/** All three hands at rest, for the fan's own install — their fields, in their file. */
export function tasterHandsFresh(): Pick<
  TasterState,
  "pin" | "pinBeats" | "wipe" | "wiped" | "pryMilli" | "pryBeat" | "pryFills"
> {
  return { pin: -1, pinBeats: 0, wipe: -1, wiped: false, pryMilli: 0, pryBeat: -1, pryFills: 0 };
}

export function tasterHandsHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag") return;
  const t = tasterBoss(world);
  if (t === null || t.outBeat >= 0) return;
  if (command.target === "tasterBlade" && player === 1) {
    pin(world, t, command.on, command.id ?? -1);
  } else if (command.target === "tasterGap" && player === 2) {
    wipe(world, t, command.on, command.id ?? -1, command.fromMilli);
  } else if (command.target === "tasterLock" && player === 1) {
    pry(world, t, command.on, command.fromYMilli ?? 0);
  }
}

/**
 * **The pin.** Only in `fanning`, and only on a blade that is out of the crest
 * and has not decided: a thumb on a standing blade holds nothing, and a thumb
 * on a column the crest has not opened yet would be a pin placed before the
 * fan had said where it was going.
 *
 * One pin. A thumb landing on a second growing blade moves it, and the count
 * starts again — `undertowPin`'s rule, and for its reason: the pilot has one
 * spare thumb and the fight should never be readable as two.
 */
function pin(world: World, t: TasterState, on: boolean, col: number): void {
  const i = tasterBladeAt(t, col);
  if (!on) {
    // Lifting off a blade he is no longer holding says nothing: his thumb
    // moved to another one and this is the old one letting go behind it.
    if (t.pin !== i || i < 0) return;
    t.pin = -1;
    t.pinBeats = 0;
    return;
  }
  if (t.pin === i || !tasterPinnable(t, world.cfg, i)) return;
  t.pin = i;
  t.pinBeats = 0;
  world.events.push({ type: "tasterPin", col });
}

/**
 * **The wipe.** Only in `hurrying`, only on a column a blade was struck off
 * in, and only while the crest can still be cut: a carry across a crest that
 * is already open for good is a thumb on a thing with nothing left to give.
 *
 * The cut lands the thousandth the carry passes `tasterWipeMilli` and not on
 * the lift, which is `instarSwipeMilli`'s other answer to the same question
 * and the one this fight wants: a lift that never arrived is gone for good
 * (`docs/spec/latency.md`), and the carry itself is cumulative from the grab,
 * so it heals a move that was coalesced away. One cut per grab — `wiped` is
 * what says the rest of this carry is only a thumb sliding — and the next one
 * wants the thumb up and down again.
 */
function wipe(world: World, t: TasterState, on: boolean, col: number, fromMilli: number): void {
  const i = tasterBladeAt(t, col);
  if (!on) {
    if (t.wipe !== i || i < 0) return;
    t.wipe = -1;
    t.wiped = false;
    return;
  }
  if (!tasterWipable(t, world.cfg, i)) return;
  if (t.wipe !== i) {
    t.wipe = i;
    t.wiped = false;
  }
  if (t.wiped || Math.abs(fromMilli) < world.cfg.tasterWipeMilli) return;
  t.wiped = true;
  world.events.push({ type: "tasterWipe", col });
  tasterCut(world, t, i);
}

/**
 * **The pry.** Only on a fan that is `closed` and not already open: a second
 * carry inside the window would restart a count the pair is racing, which is
 * the one thing a thumb resting on the picture must not be able to do.
 *
 * `fromYMilli` is how far *down* the thumb has come from where it grabbed, cut
 * to `tasterPryMilli`; a carry upward is no carry, which is what the
 * `Math.max(0, …)` is — THE CANDLE's wick, read the same way. The bottom is
 * the event, and the depth is left standing where it is so the picture has
 * something to draw a half-opened interlock from until he lifts.
 *
 * **THE SLOW spans the window exactly** (`docs/decisions.md` #33): opened
 * here for `tasterPryBeats`, so it runs out on the beat the interlock locks
 * again, and shut by `closeSlow` in `taster-shot.ts` when the last beam lands.
 */
function pry(world: World, t: TasterState, on: boolean, fromYMilli: number): void {
  if (!on) {
    t.pryMilli = 0;
    return;
  }
  const cfg = world.cfg;
  if (!tasterPryable(t, world.beat, cfg)) return;
  t.pryMilli = Math.max(0, Math.min(cfg.tasterPryMilli, Math.round(fromYMilli)));
  if (t.pryMilli < cfg.tasterPryMilli) return;
  t.pryBeat = world.beat;
  t.pryFills = 0;
  openSlow(world, cfg.tasterPryBeats);
  world.events.push({ type: "tasterPry", col: t.col + Math.floor(t.blades.length / 2) });
}
