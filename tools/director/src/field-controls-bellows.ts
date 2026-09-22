import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE BELLOWS's two handles, as rows of the ON THE FIELD tab.
 *
 * Two rows, one seat each, and they are the only pair here **that may never
 * be used at the same time**. THE GIMBAL's next door are offered together and
 * have to agree; THE SINEW's two add into one number. These two take turns,
 * and a thumb that works its bar in the other seat's beat jams both of them
 * and spends the exchange — so the thing the rows have to carry is not what
 * the gesture does but *when it is allowed*, which is the whole boss
 * (`docs/spec/bosses.md` §11.35, §19).
 *
 * **Neither row says whose beat it is**, because no row could: the beat turns
 * on the field, several times a fight, and what the director can write down
 * is that it turns. The lung says it in the picture — a lit cap and a lit bar
 * on the seat being waited on — and the pair says it out loud, which is the
 * sentence this boss exists to make them say.
 */
export const BELLOWS_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE BELLOWS'S PULL HANDLE",
    where:
      "on the bar hanging under his own chamber of the lung slung across the top of the field, on player 1's screen, in every phase but a jam, the opening still and the vent",
    seat: "player 1 — the pull handle is the pilot's, fixed by the target's name and never negotiated, and his screen is the only one it is drawn on",
    gesture: "grab and drag",
    does:
      "Carries his bar **down** its rail, and the chamber it hangs off is " +
      "drawn out as far as the thumb has taken it — how far along the answer " +
      "is, read off the body. The act is an **edge**: the bar crossing " +
      "bellowsWorkMilli on the way down is the stroke, a thumb resting past " +
      "it is nothing at all, and a second stroke needs the hand lifted and " +
      "brought down again. A stroke in his beat draws the chamber open and " +
      "hands the beat to her; a stroke in hers jams both handles and spends " +
      "the exchange, which is the one fault in the fight and the thing the " +
      "pair has to hear and name (sim/bellows-hand.ts). A drag upward is no " +
      "stroke: a chamber already shut has nowhere shut to go. **On the last " +
      "seam it is the other gesture** — both seats take hold and both let go " +
      "within a beat of each other, and the bar says LIFT rather than PULL " +
      "(render/bellows-word.ts). No desk key: the rail is a carry, not a turn.",
    source: "handles.ts — bellowsHandleUnder() under handleUnder(); bellows-grip.ts on the move",
    holdKind: "drag",
    dragTarget: "bellowsPull",
    sends: ["drag"],
    pose: "BELLOWS · THE PULL HANDLE UNDER A THUMB",
  },
  {
    name: "THE BELLOWS'S PUSH HANDLE",
    where:
      "on the bar under her own chamber, the far side of the waist from his — and which side that is is read off the column the chamber stands in, so THE FLIP turns the pair over — on player 2's screen, under the same three refusals",
    seat: "player 2 — the push handle is the navigator's, and she is never shown his bar nor he hers",
    gesture: "grab and drag",
    does:
      "The same carry on the other bar, and **the same stroke is not the same " +
      "stroke**: hers presses her chamber shut and parts a seam of the waist, " +
      "which is this boss's health and the only thing that ever goes down. A " +
      "clean pull-then-push is one seam; four of them and the waist is a " +
      "thread. Everything else is his row exactly — the edge at " +
      "bellowsWorkMilli, the jam out of turn, the lift on the last seam. Both " +
      "seats are shown the whole lung and neither is shown the other's " +
      "handle: how far each chamber stands drawn out is what *now* and *not " +
      "yet* are said about, and a seat that could not see the other's chamber " +
      "could not take its turn (render/view-role-clocks-b.ts).",
    source: "handles.ts — bellowsHandleUnder() under handleUnder(); bellows-grip.ts on the move",
    holdKind: "drag",
    dragTarget: "bellowsPush",
    sends: ["drag"],
    pose: "BELLOWS · THE PUSH HANDLE UNDER A THUMB",
  },
];
