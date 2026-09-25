import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE GIMBAL's two rings, as rows of the ON THE FIELD tab.
 *
 * Two rows rather than one: there are two targets, two seats and two rims — and the pair are only ever offered *together*, one on each
 * phone, which no other entry on this tab is. THE SINEW's pair is the
 * nearest, and its two add into one number; these two have to agree about a
 * direction instead.
 *
 * **Neither row says which way to turn**, because the game does not and the
 * fight is that it does not. The mark is a place, the knurl says the rim is
 * heard, and what *clockwise* means on the other phone is the sentence the
 * pair has to get wrong once (`docs/spec/bosses.md` §11.34, §18).
 */
export const GIMBAL_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE GIMBAL'S OUTER RING",
    where:
      "anywhere on the outer rim of the cradle hung over the middle of the field, on player 1's screen, while an alignment is up",
    seat: "player 1 — the outer ring is the pilot's, always, and the two pins at its top and bottom are what say so",
    gesture: "grab and drag",
    does:
      "Turns his ring to wherever his thumb is carried round it, a bearing " +
      "rather than a distance, so a finger four times round the rim is back " +
      "where it grabbed. The wedge outside the rim is the mark it has to be " +
      "brought to; standing on it makes the ring glow, and a tooth shears off " +
      "**both** rims only while both rings sit true together for " +
      "gimbalHoldBeats. Letting go is what costs: a ring with no hand on it " +
      "drifts gimbalDriftMilli a beat back to the top, which is the price of " +
      "taking a thumb off to talk (sim/gimbal-hand.ts, sim/gimbal-step.ts). " +
      "The knurl across the rim lights while it is held. At a desk it is T, " +
      "with shift for the other way round (gimbalTurnPerTickMilli).",
    source: "handles.ts — gimbalRingUnder() under handleUnder(); gimbal-grip.ts on the move",
    holdKind: "drag",
    dragTarget: "gimbalOuter",
    sends: ["drag"],
    pose: "GIMBAL · THE OUTER RING UNDER A THUMB",
  },
  {
    name: "THE GIMBAL'S INNER RING",
    where:
      "anywhere on the inner rim of the same cradle, on player 2's screen, while an alignment is up",
    seat: "player 2 — the inner ring is the navigator's, and its pins stand at its sides rather than at its top and bottom",
    gesture: "grab and drag",
    does:
      "The same gesture on the other ring, and **the same turn is not the " +
      "same turn**: hers is one wheel gripped from the far face, so what she " +
      "carries clockwise the wheel takes counter-clockwise, and her mark " +
      "creeps the opposite true way from his. Nothing on either screen says " +
      "so — she finds it out by turning, and neither seat is ever shown the " +
      "other's rim (sim/gimbal.ts gimbalShownMilli, render/gimbal-shape.ts " +
      "gimbalFaceMilli). Everything else is his row exactly: the mark, the " +
      "glow at true, the shear that needs both, the drift back to rest. At a " +
      "desk it is Y, with shift for the other way round — and the key is not " +
      "mirrored to be helpful (apps/game/src/keys-turn.ts).",
    source: "handles.ts — gimbalRingUnder() under handleUnder(); gimbal-grip.ts on the move",
    holdKind: "drag",
    dragTarget: "gimbalInner",
    sends: ["drag"],
    pose: "GIMBAL · THE INNER RING UNDER A THUMB",
  },
];
