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
 * fight is that it does not. The mark is a place, THE MAZE's knob and its
 * green channel say the ring is heard, the mark a seat sees is the partner's, and what *clockwise* means on the other phone is the sentence the
 * pair has to get wrong once (`docs/spec/bosses.md` §11.34, §18).
 */
export const GIMBAL_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE GIMBAL'S OUTER RING",
    where:
      "the knob on the lever bolted to the outer ring — THE MAZE's knob, in a channel round the rim — or anywhere on the rim, of the cradle hung over the middle of the field, on player 1's screen, while an alignment is up",
    seat: "player 1 — the outer ring is the pilot's, always, and the two pins at its top and bottom are what say so",
    gesture: "grab and drag",
    does:
      "Turns his ring to wherever his thumb is carried round it, a bearing " +
      "rather than a distance, so a finger four times round the rim is back " +
      "where it grabbed. **His own mark is not on his screen**: the wedge he " +
      "sees, over a faint track at the inner rim, is the navigator's, and it " +
      "fills when her ring stands on it (render/gimbal-partner.ts) — his own " +
      "is on her screen, and she talks him onto it. Every turn of his " +
      "carries her ring gimbalCarryPct of the way (sim/gimbal-turn.ts). " +
      "Both true makes both rims glow; a tooth shears off **both** rims only " +
      "when both thumbs come off within gimbalLetGoTicks of each other " +
      "(sim/gimbal-let-go.ts). A ring with no hand on it otherwise drifts " +
      "gimbalDriftMilli a beat back to the top, carrying hers. The knob is " +
      "THE MAZE's (render/gimbal-knob.ts): lit while held, the channel " +
      "filling green from where it rests, PULL under it and the halo on it " +
      "while no hand is; both rims wash green at true, and a slip " +
      "goes red on his only if his ring left its mark or his thumb was late " +
      "(render/gimbal-marks.ts). At a desk it is T, with shift for the other " +
      "way round (gimbalTurnPerTickMilli).",
    source: "handles.ts — gimbalRingUnder() under handleUnder(); gimbal-grip.ts on the move",
    holdKind: "drag",
    dragTarget: "gimbalOuter",
    sends: ["drag"],
    pose: "GIMBAL · THE OUTER RING UNDER A THUMB",
  },
  {
    name: "THE GIMBAL'S INNER RING",
    where:
      "the knob on the inner ring's lever, or anywhere on the inner rim, of the same cradle, on player 2's screen, while an alignment is up",
    seat: "player 2 — the inner ring is the navigator's, and its pins stand at its sides rather than at its top and bottom",
    gesture: "grab and drag",
    does:
      "The same gesture on the other ring, and **the same turn is not the " +
      "same turn**: hers is one wheel gripped from the far face, so what she " +
      "carries clockwise the wheel takes counter-clockwise, and her mark " +
      "creeps the opposite true way from his. Nothing on either screen says " +
      "so — she finds it out by turning, and neither seat is ever shown the " +
      "other's rim (sim/gimbal.ts gimbalShownMilli, render/gimbal-shape.ts " +
      "gimbalFaceMilli). The mark she sees is his, drawn on her face, so it " +
      "too is mirrored. Her turns carry nothing back to his ring. Everything " +
      "else is his row exactly: the glow when both are true, the let-go that " +
      "needs both, the drift back to rest, THE MAZE's knob and channel, the " +
      "halo while no hand is on it and the verdict of the last. At a " +
      "desk it is Y, with shift for the other way round — and the key is not " +
      "mirrored to be helpful (apps/game/src/keys-turn.ts).",
    source: "handles.ts — gimbalRingUnder() under handleUnder(); gimbal-grip.ts on the move",
    holdKind: "drag",
    dragTarget: "gimbalInner",
    sends: ["drag"],
    pose: "GIMBAL · THE INNER RING UNDER A THUMB",
  },
];
