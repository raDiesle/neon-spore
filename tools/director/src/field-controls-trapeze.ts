import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE TRAPEZE's controls, as rows of the ON THE FIELD tab: the two zones,
 * each swiped toward the middle by the seat that pushes there, and the
 * alien, the pilot's tap that locks the cannon (`render/trapeze-grip.ts`,
 * `docs/spec/bosses-choreographed.md` §39).
 */
const SOURCE =
  "handles.ts — trapezePushUnder() and trapezeLockUnder() under handleUnder(); the swipe's run carried on the lift by touch.ts' swiped set";

const ZONE_DOES =
  "A **swipe toward the middle**, THE SLING's lift: the finger goes down in the " +
  "zone and the lift carries its sideways run. It pushes the swing " +
  "`trapezePushMilli` higher if the swing is coming back over this side and " +
  "this seat pushes here, once a half swing; while the swing goes out it " +
  "brakes it `trapezeBrakeMilli` instead. Any other swipe does nothing and " +
  "says why in the zone — NOT YOUR SIDE, WAIT FOR IT, TOWARD THE MIDDLE " +
  "(sim/trapeze-hand.ts, render/trapeze-fx.ts). The zone lights with chevrons " +
  "while it is open, loud on its seat's screen and faint on the partner's; a " +
  "push greens it, and a brake or a refused swipe reddens it.";

export const TRAPEZE_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE TRAPEZE'S LEFT ZONE",
    where:
      "the left half of the field under the swing, down to a row above the hull, in a swipe level",
    seat: "player 1 in the first level; in a call level whoever the field badges, drawn by chance",
    gesture: "grab and drag",
    does: ZONE_DOES,
    source: SOURCE,
    holdKind: "drag",
    dragTarget: "trapezePushLeft",
    sends: ["drag"],
    pose: "TRAPEZE · THE LEFT ZONE OPEN",
  },
  {
    name: "THE TRAPEZE'S RIGHT ZONE",
    where:
      "the right half of the field under the swing, down to a row above the hull, in a swipe level",
    seat: "player 2 in the first level; in a call level whoever the field badges, drawn by chance",
    gesture: "grab and drag",
    does: ZONE_DOES,
    source: SOURCE,
    holdKind: "drag",
    dragTarget: "trapezePushRight",
    sends: ["drag"],
    pose: "TRAPEZE · THE RIGHT ZONE OPEN",
  },
  {
    name: "THE TRAPEZE'S ALIEN",
    where: "the alien on the swing, wherever it swings, in the lock level",
    seat: "player 1",
    gesture: "press",
    does:
      "An **edge**: the press locks the cannon on the alien for `trapezeLockBeats`, " +
      "so the navigator's next shot climbs, turns and hits it from the side " +
      "(sim/lock.ts, sim/trapeze-shot.ts). A shot with the swing pushes it; one " +
      "against it slows it. While it asks, the alien wears the halo on the " +
      "pilot's screen; the lock draws a sight round it.",
    source: SOURCE,
    holdKind: "drag",
    dragTarget: "trapezeLock",
    sends: ["drag"],
    pose: "TRAPEZE · THE ALIEN TO TAP",
  },
];
