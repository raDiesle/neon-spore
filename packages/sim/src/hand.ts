import type { CreatureKind } from "./creature-kinds.js";
import { isGrippable } from "./grippable.js";
import { isMeteorKind } from "./kinds.js";

/**
 * **What a hand on a body actually does**, in one answer, for every seat and
 * every kind.
 *
 * A finger on the field used to mean three things at once and mean them to
 * everything: it slowed whatever it was on, it carried that body a column, and
 * — on player 1's screen — it steered every shot into it. The owner split
 * that on 6 September 2026, and the split is a sentence:
 *
 * > **A hand on a rock is a brake and a lane. A hand on anything else is an
 * > aim, and only the pilot has one.**
 *
 * So there are exactly two things a hand can be, and this file is the only
 * place that decides which:
 *
 * - **`"brake"`** — a rock. It keeps `gripSlowPermille` of its speed per hand
 *   (`grippedFallTiles`) and steps a column when the finger is carried
 *   sideways (`carryGrips`). Either seat, because the field belongs to both.
 *   A rock is where the gesture was always pointed: it cannot be shot, so a
 *   second pair of hands could otherwise do nothing whatever about one.
 * - **`"aim"`** — anything alive. Nothing about its fall changes and it does
 *   not move a lane; while the hand is down, every shot the cannon puts out
 *   steers into it and lands (`lock.ts`). **Player 1 only**, because player 1
 *   is the seat holding the cannon, and the price of the gesture is that the
 *   thumb aiming is a thumb off the strip.
 * - **`null`** — no hand at all, and the press is refused rather than
 *   accepted and quietly wasted. That is this file's whole discipline: a hand
 *   that drags at nothing while showing every sign of working is the defect
 *   `grippable.ts` argues against ten times over, and a hand on a living body
 *   from the navigator's seat is exactly one of those now — it would slow
 *   nothing, carry nothing and aim nothing.
 *
 * **The three callers ask this instead of answering it.** `setGrip` asks
 * whether the press is allowed at all, `grippedFallTiles` and `gripPushHeard`
 * ask whether this hand is a brake, and `lockedBody` asks whether it is an
 * aim. Written out at any one of them it is the rule in two places, and the
 * day a kind changes sides one of them has it and the others do not
 * (`copies-table.ts`).
 *
 * **THE MAGNET used to be named here and no longer is.** It was the one body a
 * hand was refused on by *seat* rather than by kind — the navigator could not
 * hold one, because on that body a hand is an aim and the aim belongs to the
 * pilot. That is now what the general rule says about every living body, so
 * the special case dissolved into it rather than being deleted.
 *
 * **THE WEIGHT is the third thing, and it is the first that needs the other
 * seat.** A brake is worth something with one hand and twice as much with two;
 * an aim is one seat's and the other seat has none. A `"press"` is worth
 * *nothing at all* until both hands are on the same body — and because a hand
 * on a weight is drawn on that seat's screen alone, neither player can see
 * whether the other has arrived. That is the creature: the gesture is ordinary
 * and the only way to make it land is to say when (`weight.ts`).
 */
export type HandMeans = "brake" | "aim" | "press";

/** What one seat's hand on this kind would be, or null for a press that is
 * refused. `isGrippable` first, which is the kinds that refuse a hand for
 * reasons of their own — every one of them a paragraph in `grippable.ts`. */
export function handMeans(kind: CreatureKind, player: 1 | 2): HandMeans | null {
  if (!isGrippable(kind)) return null;
  if (isMeteorKind(kind)) return "brake";
  // Either seat, and neither seat's is worth anything alone. Above the living
  // body's rule below, because a weight *is* a living body and the rule that
  // hands the aim to the pilot would otherwise refuse the navigator the one
  // hand this creature cannot be beaten without.
  if (kind === "weight") return "press";
  return player === 1 ? "aim" : null;
}
