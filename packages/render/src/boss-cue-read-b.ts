import {
  type TasterState,
  tasterBladeAt,
  tasterLifted,
  tasterPhase,
  tasterPried,
  type World,
} from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { markAt } from "./boss-cue-frame.js";
import { type Layout, tileCX } from "./layout.js";
import { tasterCrestY } from "./taster-draw.js";

/**
 * **What THE TASTER is asking for** — page two of the readings,
 * on the seam `boss-draw-clocks-b.ts` draws for the same reason: this is the
 * half of the list that grows, and the file next door was written to be read
 * in one sitting.
 *
 * Every rule is `boss-cue.ts`'s. The one that does the most work in this
 * file is *a cue is drawn on the seat that can act*: both of these fights
 * alternate between the two seats beat by beat, so a cue on the wrong phone
 * is not merely noise — it is the fight telling the pilot to do the
 * navigator's job on the one beat she is waiting to be told to do it.
 *
 * **THE VANE was the third and has gone** to page twenty-four
 * (`boss-cue-read-x.ts`), on the day its two hands learnt to say a word each
 * and its reading stopped fitting beside another boss's.
 *
 * **THE BATON was the fourth and has gone** to page nine
 * (`boss-cue-read-i.ts`): it says a word in three of its four stages now, and
 * the reading of it outgrew a share of a page. **THE UNDERTOW was the second
 * and has gone the same way**, to page ten (`boss-cue-read-j.ts`), on the day
 * it learnt to say a word in each of its five phases.
 */

/**
 * THE TASTER. **The cannon's column is the question, and the answer is which
 * of three things a shot there does.**
 *
 * It shipped with `BURN` on a closed fan and `SHEAR` while one stood, and both
 * are right about the verb and silent about the lane. Every shot into this boss
 * is read off the column it leaves in (`tasterBladeAt`, `tasterStruck`), and
 * the three columns the crest has are three different fights:
 *
 * - **A standing blade**, which the colour it did *not* grow toward strikes
 *   off: `TAP` / `TO SHEAR IT`.
 * - **The soft crest where one used to be**, which takes either colour and
 *   counts nothing on the balance sheet — and `tasterCrestCuts` of them cut it
 *   through for good, after which the fan can no longer re-edge (`tasterLift`).
 *   That is the answer to the third movement and the field said nothing about
 *   it at all: `TAP` / `TO CUT IT`, the cut being the simulation's own word
 *   for it.
 * - **A blade still growing**, where the shot is simply spent — and spent is
 *   the trap, because the ledger counted the colour before the shot got here.
 *
 **Nothing stands on his cannon.** Until 5 October 2026 a `MOVE` stood on
 * it while it was in a column nothing could be answered in and some other
 * column could; then the owner, 5 October 2026: *we do not need to show helper to "move" for
 * cannon to shoot*. Her
 * `TAP` already stands only where his cannon is, so it says where the shot
 * lands.
 *
 * **The mark is on the fan and never on a blade.** Which blade is not the
 * question — any standing one falls to the colour it did not grow toward — and
 * a frame around one of them would be the field answering *which*, which is the
 * pair's own sentence (`decisions.md` #34). The cut is the one exception and it is
 * not one: it stands on his **own column**, where the crest is already open and
 * his cannon is already parked, so it names nothing he is not looking at.
 *
 * **The colour is never said here at all**: `taster-read.ts` gives each seat its
 * half of that — his the blade coming next, hers the two counts — and the
 * colour the beam has to be is shown to neither (`tasterWeak`). The word is the
 * verb alone.
 *
 * **Three of the movements say a word about a thumb rather than about a shot**
 * since 19 September 2026, because three of them are answered by one
 * (`sim/taster-hand.ts`). Each stands where its own hand goes, and each is the
 * most urgent thing its seat has in that movement:
 *
 * - `HOLD` / `TO PIN IT`, his, while the fan is `fanning` and a blade is growing
 *   unheld. On the fan's middle and not on a blade, for the rule above: *which*
 *   blade is not the question — any growing one will do — and three are out at
 *   once there. It goes the moment his thumb is down, because a word about a
 *   thing already being done teaches nothing (`gripBrakes`).
 * - `WIPE` / `CARRY`, hers, while the fan is `hurrying` and the crest can still
 *   be cut. On **the soft column itself**, which is the cut's exception and for
 *   its reason: the gap is already open on her screen and it is the one place
 *   her thumb may land, so the mark names nothing she is not looking at.
 * - `PULL` / `TO PRY IT OPEN`, his, on a `closed` fan that is not open yet. The
 *   word this fight ended on used to be hers alone; now his comes first, and
 *   `HOLD` / `TO BURN IT` waits for the interlock to be apart — a beam at a
 *   shut fan is refused, so the burn
 *   there would be the field asking for the one thing that cannot work.
 *
 * `WIPE` is the one word of the three the game did not already have. It earns
 * its place the way the cut did: the hand is a *second* way into the same gap,
 * and a seat told to cut with a thumb would reach for the trigger.
 *
 * Nothing in `out`, where the fan is unlocking outward and the wave is held
 * `tasterOutBeats` so it cannot end on the same beat.
 */
export function tasterCues(l: Layout, world: World, t: TasterState): readonly BossCue[] {
  const phase = tasterPhase(t, world.cfg);
  if (phase === "out") return [];
  const x = tileCX(l, t.col + (t.blades.length - 1) / 2);
  const y = tasterCrestY(l);
  const here = tasterBladeAt(t, world.cannonCol);
  if (phase === "closed") {
    // Shut, the fight is his carry and hers is refused; open, it is her beam
    // and his hands are back on the carriage. The interlock is over the whole
    // body and the beam reaches it from any column the crest spans, so the one
    // wrong column is one off the crest.
    if (!tasterPried(t, world.beat, world.cfg))
      return [{ ...markAt(1, "CARRY", "PULL", x, y, l, 45, 2), why: "TO PRY IT OPEN" }];
    return here < 0 ? [] : [{ ...markAt(2, "HOLD", "HOLD", x, y, l, 41, 2), why: "TO BURN IT" }];
  }
  const out: BossCue[] = [];
  const k = here < 0 ? undefined : t.blades[here];
  // Hers, the shot: the column his cannon is standing in, and what it does
  // there. A shot is the more urgent of her two, since the carry has no beat
  // it has to land on.
  if (k?.shorn === true)
    out.push({
      ...markAt(2, "PRESS", "TAP", tileCX(l, world.cannonCol), y, l, 44),
      why: "TO CUT IT",
    });
  else if (k !== undefined && k.setBeat >= 0)
    out.push({ ...markAt(2, "PRESS", "TAP", x, y, l, 42, 2), why: "TO SHEAR IT" });
  // Hers, the carry, on the leftmost soft column so the mark does not wander
  // along the crest as the fan thins. Only while the crest can still be cut.
  const soft = phase === "hurrying" && !tasterLifted(t) ? t.blades.findIndex((b) => b.shorn) : -1;
  if (soft >= 0) out.push(markAt(2, "CARRY", "WIPE", tileCX(l, t.col + soft), y, l, 46));
  // His, and the more urgent of his two: a blade about to decide is a thing
  // with a beat on it, and the carriage is not.
  const growing = t.blades.some((b) => !b.shorn && b.growBeat >= 0 && b.setBeat < 0);
  if (phase === "fanning" && t.pin < 0 && growing)
    out.push({ ...markAt(1, "HOLD", "HOLD", x, y, l, 47, 2), why: "TO PIN IT" });
  return out;
}
