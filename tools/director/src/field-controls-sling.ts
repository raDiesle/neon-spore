import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE SLING's two cords, as rows of the ON THE FIELD tab: one a seat by
 * geometry, the pilot's the left and the navigator's the right, each taken by
 * a thumb anywhere on that seat's own panel while the lit step asks it, held
 * for the step's beats and then pulled toward the lit side
 * (`render/sling-grip.ts`,
 * `docs/spec/bosses-choreographed.md` §32).
 */
const DOES =
  "A **hold, then a pull in its place** (the owner, 13 October 2026): a finger " +
  "down anywhere on the seat's own screen takes the cord and counts the " +
  "beats it is held; a lift too soon springs the arm slack, the step still " +
  "lit. Once the step's beats are held the hold has counted, and a fresh " +
  "press pulls the cord slingPullMilli toward the lit side — the one generic " +
  "PULL, a true loose the moment it gets there; let go short, it is said and " +
  "waits to be taken again. Asked only while " +
  "the lit step wants this seat's draw, so a fire step's cannon answers " +
  "underneath it (sim/sling-hand.ts). While the hold is asked the cord's mark " +
  "is the HOLD LAB's drop, filling with the beats held (render/sling-pull.ts). " +
  "While the step is lit on this cord and " +
  "it is not yet loosed, the cord wears the halo on its seat's screen and the " +
  "partner's ring and clock on the other's; a true loose or a steady greens, " +
  "and a lift too soon, a draw through the cool or an arm sprung back reddens " +
  "(render/sling-verdicts.ts).";

const SOURCE =
  "handles.ts — slingDrawUnder() under handleUnder(); a lift's carry kept by touch.ts' swiped set";

const WHEN = "anywhere on the field, while the lit step asks this seat's draw";

export const SLING_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE SLING'S LEFT CORD",
    where: `${WHEN}; the ghost hand stands on the left tine's handle`,
    seat: "player 1 only — the left arm is the pilot's, by geometry, on both phones",
    gesture: "grab and drag",
    does: DOES,
    source: SOURCE,
    holdKind: "drag",
    dragTarget: "slingDrawLeft",
    sends: ["drag"],
    pose: "SLING · THE LEFT CORD DRAWN",
  },
  {
    name: "THE SLING'S RIGHT CORD",
    where: `${WHEN}; the ghost hand stands on the right tine's handle`,
    seat: "player 2 only — the right arm is the navigator's, by geometry, on both phones",
    gesture: "grab and drag",
    does: DOES,
    source: SOURCE,
    holdKind: "drag",
    dragTarget: "slingDrawRight",
    sends: ["drag"],
    pose: "SLING · THE RIGHT CORD DRAWN",
  },
];
