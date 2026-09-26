import type { World } from "@neon-spore/sim";
import { curtainCues, queenCues } from "./boss-cue-read.js";
import { tasterCues } from "./boss-cue-read-b.js";
import { leadCues } from "./boss-cue-read-c.js";
import { spliceCues, stareCues } from "./boss-cue-read-d.js";
import { mazeCues, mirrorCues } from "./boss-cue-read-e.js";
import { wardenCues } from "./boss-cue-read-f.js";
import { fleetCues, snakeCues } from "./boss-cue-read-g.js";
import { pinballCues, scoutCues } from "./boss-cue-read-h.js";
import { batonCues } from "./boss-cue-read-i.js";
import { undertowCues } from "./boss-cue-read-j.js";
import { throatCues } from "./boss-cue-read-k.js";
import { gorgeCues } from "./boss-cue-read-n.js";
import { ledgerCues } from "./boss-cue-read-o.js";
import { antiphonCues } from "./boss-cue-read-p.js";
import { cairnCues } from "./boss-cue-read-q.js";
import { wellCues } from "./boss-cue-read-r.js";
import { repriseCues } from "./boss-cue-read-s.js";
import { scuttleCues } from "./boss-cue-read-t.js";
import { hiveCues } from "./boss-cue-read-v.js";
import { gaugeCues } from "./boss-cue-read-w.js";
import { vaneCues } from "./boss-cue-read-x.js";
import { gimbalCues } from "./boss-cue-read-y.js";
import { haspCues } from "./boss-cue-read-z.js";
import { spoolCues } from "./boss-cue-read-za.js";
import { ratchetCues } from "./boss-cue-read-zb.js";
import { mantleCues } from "./boss-cue-read-zc.js";
import { type BossCue, cueSeen } from "./boss-cue-shape.js";
import type { SurfaceY } from "./hull-frame.js";
import type { Layout } from "./layout.js";

/**
 * **THE CUE**: the one word the field says at the moment it wants something,
 * beside the mark where the action is wanted, with the kind of action over it.
 *
 * The owner asked for it in as many words and `docs/decisions.md` #34 is the
 * reversal it cost — this repository had twice written down that *nothing is
 * written for the pair to read aloud*, and both times it was arguing against
 * a **script**. A verb is not a script: `SHEAR` over a marked fan tells a
 * player what their own thumb does and nothing at all about what the other
 * seat is doing, which is the half they still have to ask for.
 *
 * **What this file is, and is not.** It is a *reading* of `World` — a pure
 * function from the state the simulation already keeps to at most one cue —
 * and it adds nothing to `packages/sim`, nothing to `hashWorld` and nothing
 * to the wire. A cue that needed a field would be an authored beat list, which
 * is THE INSTAR's job and a different tool (`sim/instar.ts`) — its marks speak
 * this file's `CueKind` too, over their own ring rather than through a `case`
 * here, THE SINEW's, THE SURGE's and THE ANTIPHON's way (`boss-cue-text.ts`).
 *
 * **Three rules it inherits, all from #34.**
 *
 * - **A cue is drawn on the seat that can act.** An instruction on the phone
 *   whose thumb the game will refuse is worse than none, so every cue carries
 *   the seat and `cueSeen` is what keeps it there. `null` is the third answer
 *   and a real one: the carry is either seat's (`grip-push.ts`).
 * - **It says the verb and never the answer.** `FIRE` is a cue; `FIRE COLUMN
 *   4` is the conversation the wave exists to cause. Nothing here formats a
 *   number, a colour or a column.
 * - **A mark stands only on something this seat is already shown.** The frame
 *   is a place, and a place is information: a cue over the curtain's core on
 *   the screen that is not drawn the shadow would hand one seat the other's
 *   half of the picture. Every reading below is written against its boss's
 *   own `showsX` split, and the comment beside it says which.
 *
 * **One at a time.** The readings return their cues most urgent first and this
 * picks the first one the seat may see, so a screen never carries two things
 * to do at once — what the pair is owed is *what to do next*, singular.
 */

// What a cue *is* lives next door, and is re-exported here so the readings and
// the drawings go on taking it from the file they always took it from
// (`boss-cue-shape.ts`, split off on line count).
export { type BossCue, type CueKind, cueSeen } from "./boss-cue-shape.js";

const NONE: readonly BossCue[] = [];

/**
 * Every cue this boss would give, most urgent first.
 *
 * A switch on the kind rather than the twelve `xxxBoss` narrowers next door in
 * `packages/sim`: `boss-draw-clocks.ts` reads the union exactly this way, and
 * twelve imported guards whose whole body is `boss.kind === "x"` would be the
 * same list written twice.
 * A screen is owed one cue and takes `bossCue` below.
 */
function bossCues(l: Layout, world: World, beatPhase: number, skinY: SurfaceY): readonly BossCue[] {
  const boss = world.boss;
  if (boss === null) return NONE;
  switch (boss.kind) {
    case "gorge":
      return gorgeCues(l, world, boss);
    case "curtain":
      return curtainCues(l, world, boss);
    case "taster":
      return tasterCues(l, world, boss);
    case "undertow":
      return undertowCues(l, world, boss, skinY);
    case "baton":
      return batonCues(l, world, boss);
    case "throat":
      return throatCues(l, world, boss, beatPhase);
    case "ledger":
      return ledgerCues(l, world, boss, beatPhase);
    case "lead":
      return leadCues(l, world, boss);
    case "scuttle":
      return scuttleCues(l, world, boss);
    case "antiphon":
      return antiphonCues(l, world, boss);
    case "queen":
      return queenCues(l, world, boss, beatPhase);
    case "stare":
      return stareCues(l, world, boss);
    case "cairn":
      return cairnCues(l, world, boss);
    case "reprise":
      return repriseCues(l, world, boss);
    case "hive":
      return hiveCues(l, world, boss);
    case "splice":
      return spliceCues(l, world, boss, beatPhase);
    case "mirror":
      return mirrorCues(l, world, boss);
    case "maze":
      return mazeCues(l, world, boss);
    case "gauge":
      return gaugeCues(l, world, boss);
    case "warden":
      return wardenCues(l, world, boss, skinY);
    case "fleet":
      return fleetCues(l, world, boss);
    case "vane":
      return vaneCues(l, world);
    case "snake":
      return snakeCues(l, world, boss);
    case "pinball":
      return pinballCues(l, world, boss);
    case "scout":
      return scoutCues(l, world, boss);
    // **The one kind that answers with two cues at once**, one per seat: both
    // rings want turning, and they never want it to the same place
    // (`boss-cue-read-y.ts`).
    case "gimbal":
      return gimbalCues(l, world, boss);
    // And THE HASP's, the same two-seat answer on a latch and a wheel (`boss-cue-read-z.ts`).
    case "hasp":
      return haspCues(l, world, boss);
    // And THE SPOOL's, one word for its one handle (`boss-cue-read-za.ts`).
    case "spool":
      return spoolCues(l, world, boss, beatPhase);
    // And THE RATCHET's, one word to each seat's hand and one over a loose bolt (`boss-cue-read-zb.ts`).
    case "ratchet":
      return ratchetCues(l, world, boss);
    // And THE MANTLE's, a word to each seat's knob, one on the core and one over a spark (`boss-cue-read-zc.ts`).
    case "mantle":
      return mantleCues(l, world, boss, beatPhase);
    // **THE WELL is read and silent, which is why it is a `case` and not a
    // fall-through.** Its answer is THE PULSE's below, but it gets a page of
    // its own (`boss-cue-read-r.ts`) because a boss sitting in the `default` is
    // a boss nobody has read yet, and this family has now been wrong three
    // times about a boss that "says nothing". It has no state, no step, no
    // clock and no gesture, so there is no moment for a word to stand on; and
    // on the clock a mark's own angle is its hour, printed beside it on the
    // numeral ring, so every word it could say would be a column.
    case "well":
      return wellCues(l, world);
    // **THE PULSE is here on purpose, and it is the only one that is.** Every
    // other kind falling through is a boss nobody has read yet; this one was
    // read on 18 September 2026 and came back with nothing the field may say.
    // Its four verbs are four lanes, both seats hold all four, and the only
    // question the round ever asks is *which lane, and now* — which is the
    // answer twice over: the lane is what a veiled seat has to be told out
    // loud, and the moment is what the judgement is made of. A `PRESS` on the
    // line would be the round played for them (`docs/spec/interludes.md`,
    // `render/test/boss-cue-pulse.test.ts`).
    default:
      return NONE;
  }
}

/** The one cue this screen is owed on this frame, or nothing. */
export function bossCue(
  l: Layout,
  world: World,
  beatPhase: number,
  skinY: SurfaceY,
): BossCue | null {
  for (const cue of bossCues(l, world, beatPhase, skinY)) {
    // The membrane under the mark, stamped once here rather than by each of
    // the twenty-nine readings: `skinY` is already this function's argument,
    // and a rule about where a word fits belongs to the one place every
    // reading passes through (`BossCue.wordFloor`).
    if (cueSeen(cue, l.role)) return { ...cue, wordFloor: cue.wordFloor ?? skinY(cue.x) };
  }
  return null;
}
