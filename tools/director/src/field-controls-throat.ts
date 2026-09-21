import type { FieldControlDef } from "./field-control-def.js";

/**
 * **THE THROAT's two hands**, in a file of its own, the split every boss since
 * THE INSTAR has made.
 *
 * Two rows on two targets, and what makes them this boss rather than any other
 * is **where they come from**: there is nothing to pinch until the pair has
 * choked a ring, and nothing to haul until four are slack and the mouth has
 * stopped travelling. The gullet hands out its own controls as it loses them,
 * so these are the first rows on this tab for handles a fight *grows* — a
 * pose with both of them on it is a pose of a boss most of the way down.
 *
 * **The rules shipped first and the pictures came after.** Both gestures were
 * heard by `sim/throat-hand.ts` with nothing on either screen to take hold of,
 * and the field's own cue has been saying `CINCH` and `HAUL` over bare tube
 * the whole time — which is why there were no rows here and
 * `on-field-controls.test.ts` had `throatRing` and `throatTube` filed as
 * `unbuilt`.
 */
export const THROAT_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE THROAT'S RING",
    where:
      "on the lowest ring muscle of the gullet, which is always a slack one " +
      "— the damage climbs from the mouth upward, so the bottom of the tube " +
      "is the one place a ring is certain to have gone (render/throat-grip.ts)",
    seat: "player 2 only — the navigator, and nothing at all from the pilot",
    gesture: "hold",
    does:
      "Pinches a ring that has already gone slack, and while her thumb is on " +
      "it the gullet does not breathe: no swallow, no lift. It is a bargain " +
      "and not a pause — every inhale she takes off the grid is owed back " +
      "one a beat the moment she lifts, so what she is buying is real time " +
      "for the pilot to get a gum onto the mouth's row, at the worst rate in " +
      "the fight (sim/throat-hand.ts). Held past throatCinchBeats the ring " +
      "tears out of her thumb and the bill arrives anyway, and nothing may " +
      "be pinched again until the debt is paid in full — which is what stops " +
      "a thumb that never lifts from freezing the fight for nothing.",
    source: "touch.ts — throatGripUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "throatRing",
    sends: ["drag"],
    pose: "THE THROAT · SLIDE",
  },
  {
    name: "THE THROAT'S TUBE",
    where:
      "on a ring hanging a tile below the mouth, travelling with it, and only " +
      "while the gullet is open — below the lip rather than over it, so the " +
      "handle never covers the body standing in the mouth on the beat it is " +
      "about to be swallowed (render/throat-grip.ts)",
    seat: "player 1 only — the pilot, and nothing at all from the navigator",
    gesture: "grab and drag",
    does:
      "Drags the tube itself a column sideways — a carry of at least " +
      "throatHaulMilli, whose sign is the direction — so the mouth is " +
      "somewhere else when the inhale lands. It is the only way in this " +
      "fight to take something back out of the throat's mouth, and it exists " +
      "because open is the one phase where the old answer is worth nothing: " +
      "the mouth has stopped travelling and inhales every beat, so the pair " +
      "can no longer wait for it to come to them and a body standing in it " +
      "has one beat (sim/throat-hand.ts). A tap does nothing — the mouth's " +
      "column is the one thing in this fight player 2 has already said out " +
      "loud, and a fingertip's jitter is not a decision.",
    source: "touch.ts — throatGripUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "throatTube",
    sends: ["drag"],
    pose: "THE THROAT · OPEN",
  },
];
