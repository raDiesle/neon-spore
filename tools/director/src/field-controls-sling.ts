import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE SLING's two cords, as rows of the ON THE FIELD tab: one a seat by
 * geometry, the pilot's the left and the navigator's the right, each taken by
 * a thumb anywhere on that seat's own panel while the lit step asks it, and
 * loosed by the way the thumb leaves (`render/sling-grip.ts`,
 * `docs/spec/bosses-choreographed.md` §32).
 */
const DOES =
  "A **draw and swipe**, `DrawRelease`: a finger down anywhere on the seat's " +
  "own screen takes the cord and counts the beats it is held, and the lift " +
  "carries the swipe's side. A lift that has held the step's beats and " +
  "swipes toward the lit side is a true loose; one too soon, the wrong way or " +
  "with no swipe springs the arm slack, the step still lit. Asked only while " +
  "the lit step wants this seat's draw, so a fire step's cannon answers " +
  "underneath it (sim/sling-hand.ts). While the step is lit on this cord and " +
  "it is not yet loosed, the cord wears the halo on its seat's screen and the " +
  "partner's ring and clock on the other's; a true loose or a steady greens, " +
  "and a lift too soon, a draw through the cool or an arm sprung back reddens " +
  "(render/sling-verdicts.ts).";

const SOURCE =
  "handles.ts — slingDrawUnder() under handleUnder(); the swipe's side carried on the lift by touch.ts' swiped set";

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
