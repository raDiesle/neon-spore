import type { World } from "@neon-spore/sim";
import { curtainCues, queenCues } from "./boss-cue-read.js";
import { tasterCues, vaneCues } from "./boss-cue-read-b.js";
import { diastoleCues, leadCues, scuttleCues } from "./boss-cue-read-c.js";
import { spliceCues, stareCues } from "./boss-cue-read-d.js";
import { gaugeCues, mazeCues, mirrorCues } from "./boss-cue-read-e.js";
import { wardenCues } from "./boss-cue-read-f.js";
import { fleetCues, snakeCues } from "./boss-cue-read-g.js";
import { pinballCues, scoutCues } from "./boss-cue-read-h.js";
import { batonCues } from "./boss-cue-read-i.js";
import { undertowCues } from "./boss-cue-read-j.js";
import { throatCues } from "./boss-cue-read-k.js";
import { orreryCues } from "./boss-cue-read-l.js";
import { candleCues } from "./boss-cue-read-m.js";
import { gorgeCues } from "./boss-cue-read-n.js";
import { ledgerCues } from "./boss-cue-read-o.js";
import type { SurfaceY } from "./hull-frame.js";
import type { Layout } from "./layout.js";
import type { ViewRole } from "./view-role.js";
import { showsCannon, showsShield } from "./view-role.js";

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
 * is THE INSTAR's job and a different tool (`sim/instar.ts`).
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

/**
 * What kind of action it is, over the frame: #34's own list, and the only
 * words that may stand on that line.
 *
 * Four are what the gestures this game has reduce to — a press of a button on
 * the band, a hold of one, a thumb carried across the field, a turn of the
 * crank — and a fifth would be a gesture nothing in `DragTarget` or
 * `Hold["kind"]` answers, which is a wish (`.claude/skills/new-boss`). The
 * fifth here is the one the simulation *does* answer without a member: **no
 * gesture at all**. THE STARE refuses and charges for a watched press
 * (`sim/stare-step.ts`), which makes a thumb kept off the glass a thing the
 * fight asks for and a thing it can tell was done — the `RestraintGate` of
 * `bosses-choreographed.md`'s library, shipped as a boss. It is its own word
 * rather than `HOLD` over `STILL` because a player told to hold would hold
 * the trigger, which is the one press the eye is waiting for.
 */
export type CueKind = "PRESS" | "HOLD" | "CARRY" | "TURN" | "STILL";

/** One thing to do, where it is wanted. */
export interface BossCue {
  /** Whose thumb. `null` where either seat's will do. */
  seat: 1 | 2 | null;
  kind: CueKind;
  /** One word. Never a column, a colour or a count. */
  word: string;
  /** The middle of the mark, in canvas pixels. */
  x: number;
  y: number;
  /** How far the frame reaches from it. */
  halfW: number;
  halfH: number;
  /** Spreads the frame's interference, so two cues in a wave are not one
   * object blinking (`target-lock.ts`). */
  seed: number;
  /**
   * Whether the cue draws its own scan frame. `false` where the boss's own
   * picture already puts one around this place — THE SCUTTLE locks the column
   * of the next throw on the navigator's screen — because a second frame
   * around one place is exactly the four-pictures-for-one-idea mistake
   * `target-lock.ts` records the owner ending. The half-extents are still
   * read: they are what the two lines of text are hung off.
   */
  framed?: boolean;
}

/** Whether this screen is the one being asked. */
export function cueSeen(cue: BossCue, role: ViewRole): boolean {
  if (cue.seat === null) return true;
  return cue.seat === 1 ? showsCannon(role) : showsShield(role);
}

const NONE: readonly BossCue[] = [];

/**
 * Every cue this boss would give, most urgent first.
 *
 * A switch on the kind rather than the twelve `xxxBoss` narrowers next door in
 * `packages/sim`: `boss-draw-clocks.ts` reads the union exactly this way, and
 * twelve imported guards whose whole body is `boss.kind === "x"` would be the
 * same list written twice.
 */
function cuesOf(
  l: Layout,
  world: World,
  beatPhase: number,
  skinY: SurfaceY,
  clearTop: number | undefined,
): readonly BossCue[] {
  const boss = world.boss;
  if (boss === null) return NONE;
  switch (boss.kind) {
    case "candle":
      return candleCues(l, world, boss);
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
    case "diastole":
      return diastoleCues(l, world, boss);
    case "orrery":
      return orreryCues(l, world, boss);
    case "queen":
      return queenCues(l, world, boss, beatPhase);
    case "stare":
      return stareCues(l, world, boss);
    case "splice":
      return spliceCues(l, world, boss, beatPhase);
    case "mirror":
      return mirrorCues(l, world, boss);
    case "maze":
      return mazeCues(l, world, boss);
    case "gauge":
      return gaugeCues(l, world, boss, clearTop);
    case "warden":
      return wardenCues(l, world, boss, skinY);
    case "fleet":
      return fleetCues(l, world, boss, clearTop);
    case "vane":
      return vaneCues(l, world);
    case "snake":
      return snakeCues(l, world, boss, clearTop);
    case "pinball":
      return pinballCues(l, world, boss);
    case "scout":
      return scoutCues(l, world, boss);
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
  /** Where the picture starts, when a rehearsal's band stands over it
   * (`ViewState.clearTop`). One round's geometry moves with it: THE GAUGE's
   * dial gives up radius rather than its top edge (`gauge-round.ts`). */
  clearTop?: number,
): BossCue | null {
  for (const cue of cuesOf(l, world, beatPhase, skinY, clearTop)) {
    if (cueSeen(cue, l.role)) return cue;
  }
  return null;
}
