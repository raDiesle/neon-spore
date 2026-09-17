import type { World } from "@neon-spore/sim";
import {
  batonBoss,
  candleBoss,
  curtainBoss,
  gorgeBoss,
  tasterBoss,
  undertowBoss,
} from "@neon-spore/sim";
import { candleCues, curtainCues, gorgeCues } from "./boss-cue-read.js";
import { batonCues, tasterCues, undertowCues } from "./boss-cue-read-b.js";
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
 * Four, because four is what the gestures this game has reduce to — a press of
 * a button on the band, a hold of one, a thumb carried across the field, a
 * turn of the crank — and a fifth would be a gesture nothing in
 * `DragTarget` or `Hold["kind"]` answers, which is a wish (`.claude/skills/new-boss`).
 */
export type CueKind = "PRESS" | "HOLD" | "CARRY" | "TURN";

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
}

/** Whether this screen is the one being asked. */
export function cueSeen(cue: BossCue, role: ViewRole): boolean {
  if (cue.seat === null) return true;
  return cue.seat === 1 ? showsCannon(role) : showsShield(role);
}

const NONE: readonly BossCue[] = [];

/** Every cue this boss would give, most urgent first. */
function cuesOf(l: Layout, world: World, skinY: SurfaceY): readonly BossCue[] {
  if (world.boss === null) return NONE;
  const candle = candleBoss(world);
  if (candle !== null) return candleCues(l, world, candle);
  const gorge = gorgeBoss(world);
  if (gorge !== null) return gorgeCues(l, world, gorge);
  const curtain = curtainBoss(world);
  if (curtain !== null) return curtainCues(l, world, curtain);
  const taster = tasterBoss(world);
  if (taster !== null) return tasterCues(l, world, taster);
  const undertow = undertowBoss(world);
  if (undertow !== null) return undertowCues(l, world, undertow, skinY);
  const baton = batonBoss(world);
  if (baton !== null) return batonCues(l, world, baton);
  return NONE;
}

/** The one cue this screen is owed on this frame, or nothing. */
export function bossCue(l: Layout, world: World, skinY: SurfaceY): BossCue | null {
  for (const cue of cuesOf(l, world, skinY)) {
    if (cueSeen(cue, l.role)) return cue;
  }
  return null;
}
