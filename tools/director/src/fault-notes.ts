import type { MalfunctionColor, MalfunctionKind } from "@neon-spore/sim";
import { BRUSHES } from "./brushes.js";

/**
 * **What a fault is called, and the sentence an author needs while placing
 * one.** Every word the malfunction panel prints, and nothing that draws.
 *
 * It was the top half of `fault-fields.ts`, the MALFUNCTION picker that sat
 * under the control set in the WAVE column. The picker is gone — the owner
 * settled it on 18 September 2026: a malfunction is not a setting on the wave,
 * it is a pencil placed on a row, and the only place it is authored is the row
 * it is on (`fault-config.ts`). The prose outlived the picker because it is
 * the same prose wherever the fault is edited, and because it is the longest
 * thing in the director that is purely a fact about the design.
 *
 * Its own file rather than the top of `fault-config.ts` for the seam
 * `brush-lists.ts` drew off `brushes.ts`: this half grows by a paragraph per
 * fault the game invents, that half grows by a decision, and neither should
 * have to buy its room by shortening the other.
 */

/** The word the palette's button already uses, so a fault is one name
 * everywhere: on the pencil that places it and on the row it lands on. */
export function faultTitle(kind: MalfunctionKind): string {
  return BRUSHES.find((b) => b.brush === `fault:${kind}`)?.label ?? kind.toUpperCase();
}

/**
 * The one sentence an author has to hold in their head while composing the
 * arrivals: for the three faults that take a control, which seat still has a
 * strip to aim with and therefore which body the wave can be *about*; for the
 * rest, what the pair is left having to say.
 *
 * **LEAK was a seventh fault here until 15 September 2026.** A wave with no
 * lance in it is picked on the control-set row now — STANDARD 5 — because it
 * is a panel and not a fault: nothing hangs over the field, and a gesture the
 * ladder has not handed out is nothing for a seat to aim away from
 * (`content/control-sets-table.ts`).
 */
export const FAULT_NOTE: Record<MalfunctionKind, string> = {
  cannon:
    "Player 2 loses both colours and gets nothing back; player 1 still has a strip and has to point the fault somewhere harmless.",
  shield:
    "Player 1 loses the trigger and gets nothing back; player 2 still has a strip and has to park the dome somewhere harmless.",
  steer:
    "Player 1 loses the cannon strip and gets nothing back; the cannon walks a column a beat, wall to wall, and player 2 fires from wherever it is.",
  codex:
    "Both seats keep every button. While the key is over, a bolt fired red kills what cyan kills — and the bands that say which way round it is are drawn on the pilot's screen alone.",
  handover:
    "Both seats keep every button, and the two panels change screens: each phone draws and answers the other seat's half for as long as this placement holds. Nobody changes seats on the wire, so a wave with a hand on the field — a grip, a pull, a tap — is the wrong wave for it.",
  flip: "One seat's field is drawn about its own middle: a body on their left wall is really on the right one, at the same row and the same speed. Every button on both panels works and neither strip is mirrored — so that seat has to count from the other wall, and the seat with the true picture has to say every column out loud. Pick whose screen is turned below; the other one is told nothing about it.",
  leech:
    "A body is fired at the cannon and sticks there for as long as the pencil is long. Both seats keep every button; what is gone is standing still. A cannon that has not moved for harpoonStillBeats loses the round, and player 2 — who can see the count and cannot move it — is the one who has to keep saying so.",
  limpet:
    "The leech's wave with the seats swapped: the body is fired at the plate, the shield is what has to keep moving, and player 1 is the seat that can see the count and cannot move it.",
  dark: "Both screens go dark above the ship and show no body. Both players touch or swipe the field to light it for darkLitBeats; the light shows on both screens. Every button works.",
};

/** What a runaway cannon is loaded with. Nothing else reads a fault's colour. */
export const COLOUR_LABEL: Record<MalfunctionColor, string> = {
  red: "RED",
  cyan: "CYAN",
  alternating: "ALTERNATING",
};

/**
 * Whose screen THE FLIP turns. One or the other, never both: a wave with two
 * turned screens is one where the pair agrees with itself again (`sim/flip.ts`).
 */
export const SEAT_LABEL: Record<1 | 2, string> = {
  1: "P1 PILOT",
  2: "P2 NAVIGATOR",
};
