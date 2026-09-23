import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE RATCHET's catch and pawl, as rows of the ON THE FIELD tab.
 *
 * Two rows, one seat each, and the only pair here where **one is a hold and
 * the other a press judged by it**. THE HASP's latch is a level too, and her
 * wheel asks it every tick. His pawl asks her catch once, on the tick it goes
 * down, and never again for that tooth (`sim/ratchet-hand.ts`).
 *
 * **Neither row says the other seat's state**, because neither screen shows
 * it: the catch is drawn on hers and the pawl on his, and the word between
 * them is SET (`docs/spec/bosses.md` §11.38).
 */
export const RATCHET_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE RATCHET'S CATCH",
    where:
      "on the bar of the rail beside the rack stood on the middle of the field, on player 2's screen, in every phase but the open and the jam",
    seat: "player 2 — the catch is the navigator's, fixed by the target's name, and it is drawn on her screen alone",
    gesture: "grab and drag",
    does:
      "Carries the bar **down** its rail, and it stands at the depth the " +
      "thumb has it. The act is a **level**: past ratchetGripMilli of " +
      "ratchetReachMilli she is holding, short of it she is not, and the " +
      "pawl asks that one question on the tick it is pressed. **A clean " +
      "tooth spends the catch**: a hand still down holds nothing until it " +
      "has come back up past the notch, or let go, and been carried down " +
      "again (sim/ratchet-hand.ts). She says SET when she holds. No desk " +
      "key: the rail is a carry, not a turn.",
    source: "handles.ts — ratchetCatchUnder() under handleUnder(); ratchet-grip.ts on the move",
    holdKind: "drag",
    dragTarget: "ratchetCatch",
    sends: ["drag"],
    pose: "RATCHET · THE CATCH UNDER A THUMB",
  },
  {
    name: "THE RATCHET'S PAWL",
    where:
      "on the pad at the pawl's pivot beside the rack, on player 1's screen, in every phase but the open and the jam",
    seat: "player 1 — the pawl is the pilot's, and he is never shown her catch",
    gesture: "press",
    does:
      "A **press**, read on the tick the thumb goes down and on no tick " +
      "after it: a thumb left on the pad presses nothing more until it has " +
      "lifted. In a lit window every press spends a tooth. **Her catch " +
      "decides only whether it was clean**: held, the rack climbs a tooth; " +
      "not held, the tooth burns, and the third burn jams the rack. Outside " +
      "a window a press does nothing, and it is taken here rather than " +
      "falling through to the cannon behind the pad. A loose bolt in the " +
      "middle column is shot with either colour; ratchetBoltBeats unanswered " +
      "is the hull.",
    source: "handles.ts — ratchetPawlUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "ratchetPawl",
    sends: ["drag"],
    pose: "RATCHET · THE PAWL UNDER A THUMB",
  },
];
