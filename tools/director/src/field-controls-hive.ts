import type { FieldControlDef } from "./field-control-def.js";

/**
 * **THE HIVE's underside**, in a file of its own, the split every boss since
 * THE INSTAR has made.
 *
 * One target, `hiveLobe`, read two ways by the state the mass is in — as THE
 * WELL reads its seam one file over — and the first of those **split between
 * the two seats**: clenched, the whole underside is the handle and it is the
 * pilot's; swelling, one lobe is the handle and it is the navigator's
 * (`sim/hive-hand.ts`).
 *
 * The two rings are never up at once because the two states never are: a lobe
 * stops swelling the moment the mass clenches, and a clench relaxed leaves
 * the swell where it was. So which seat is offered the handle is decided by
 * the state rather than by a rule of `render/hive-grip.ts` — the departure
 * from THE SCUTTLE's rings, which had to be given to one seat and withheld
 * from the other.
 */
export const HIVE_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE HIVE'S HAUL",
    where:
      "a wide circle in the middle of the clenched underside, at the height " +
      "the mass has drawn itself up to this frame — a palm's worth rather " +
      "than a thumb's, because the handle is the whole underside — on " +
      "player 1's screen, while the mass is clenched",
    seat: "player 1 only — the seat shown the mass with every breach in its colour, so the underside going out of reach is his to pull back",
    gesture: "grab and drag",
    does:
      "Drags the clenched mass back down within reach. hiveHaulMilli " +
      "thousandths of a tile carried downward and it relaxes early, with " +
      "none of the backlog a clench that runs out owes (sim/hive-step.ts). " +
      "What counts is the deepest the carry has reached in this clench and " +
      "not where the thumb rests: the mass is heavy enough that it does not " +
      "follow a hand home. It is the only answer there is to a state that " +
      "puts every breach out of a bolt's reach too, so the sentence is his: " +
      "it is clenched.",
    source: "touch.ts — hiveLobeUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "hiveLobe",
    sends: ["drag"],
    pose: "THE HIVE · CLENCH",
  },
  {
    name: "THE HIVE'S WRING",
    where:
      "a ring on each lobe that is swelling, on its own site and lifted with " +
      "the mass if the mass is up, on player 2's screen only — the nearest " +
      "of the two wins a thumb that covers both",
    seat: "player 2 only — the only seat a swell is drawn for at all, so the lobe about to open is hers to squeeze",
    gesture: "hold",
    does:
      "Holds the swelling lobe until the colour is wrung out of it. " +
      "hivePinchBeats later it opens colourless, and a breach with no colour " +
      "is one either colour seals — which is the whole of what this hand " +
      "buys, because a breach that opens in its own colour is a column the " +
      "pair have to agree on first (sim/hive-hand.ts). What it is worth is " +
      "counted at the opening and not while she holds, so a thumb that " +
      "arrives late is worth nothing and one that drifts to another lobe " +
      "starts again there. A thumb on a lobe that is not swelling is not " +
      "refused with a sound; it is a hand on a part of the picture that is " +
      "not doing anything.",
    source: "touch.ts — hiveLobeUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "hiveLobe",
    sends: ["drag"],
    pose: "THE HIVE · WRUNG",
  },
];
