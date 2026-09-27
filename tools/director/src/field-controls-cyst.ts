import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE CYST's freeze marks and flanks, as rows of the ON THE FIELD tab.
 *
 * **Each flank has two handles on two seats**: the partner's tap stills it
 * and its own seat's pinch shuts it. Both screens draw the whole sac, and
 * whose is whose is geometry — the pilot pinches the left flank and taps the
 * right mark, the navigator the reverse — so a seat's mark always stands on
 * the far side from its pinch (`render/cyst-grip.ts`,
 * `docs/spec/bosses-choreographed.md` §34).
 */
const MARK_DOES =
  "A **tap**: a thumb on the partner's freeze mark, taken a little wider than " +
  "it is drawn, sends the drag down at once and up as it lifts. Only the " +
  "**edge** counts — a thumb already resting on the mark when the flank " +
  "lights has to lift and come down again — and only on the lit flank's own " +
  "mark, while it waits: the flank stops shuddering for the step's beats and " +
  "a grace. Marks are tried before pinches (sim/cyst-hand.ts).";

const FLANK_DOES =
  "A **pinch**, THE VISE's lobe: two fingers of the same seat laid in that " +
  "seat's side of the sac, the field's width over the rows it stands in, and " +
  "closed. The gap between them is sent as the drag's fromMilli; a stilled " +
  "flank counts the beats it stays shut and cracks when they run out, the " +
  "gap widening starts the count again, and a lift is the flank open. **A " +
  "pinch on a flank nobody stilled counts nothing**; a swell asks both flanks " +
  "shut together (sim/cyst-hand.ts, packages/render/src/pinch.ts).";

const UNTIL = "on both screens, from the drop into frame until the sac splits";
const SOURCE =
  "handles.ts — cystUnder() under handleUnder(); the mark is tried first, then this seat's pinch zone";

export const CYST_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE CYST'S LEFT FREEZE MARK",
    where: `on the mark standing off the sac's left flank, ${UNTIL}`,
    seat: "player 2 — the left flank's mark is the navigator's, by geometry, on both phones: she stills the flank he pinches",
    gesture: "press",
    does: MARK_DOES,
    source: SOURCE,
    holdKind: "drag",
    dragTarget: "cystFreezeLeft",
    sends: ["drag"],
    pose: "CYST · THE LEFT FLANK STILLED",
  },
  {
    name: "THE CYST'S RIGHT FREEZE MARK",
    where: `on the mark standing off the sac's right flank, ${UNTIL}`,
    seat: "player 1 — the right flank's mark is the pilot's, by geometry, on both phones: he stills the flank she pinches",
    gesture: "press",
    does: MARK_DOES,
    source: SOURCE,
    holdKind: "drag",
    dragTarget: "cystFreezeRight",
    sends: ["drag"],
    pose: "CYST · THE RIGHT FLANK STILLED",
  },
  {
    name: "THE CYST'S LEFT FLANK",
    where: `in the left half of the field across the rows of the sac, ${UNTIL}`,
    seat: "player 1 — the left flank is the pilot's to pinch, by geometry, on both phones",
    gesture: "pinch",
    does: FLANK_DOES,
    source: SOURCE,
    holdKind: "drag",
    dragTarget: "cystFlankLeft",
    sends: ["drag"],
    pose: "CYST · THE LEFT FLANK PINCHED",
  },
  {
    name: "THE CYST'S RIGHT FLANK",
    where: `in the right half of the field across the rows of the sac, ${UNTIL}`,
    seat: "player 2 — the right flank is the navigator's to pinch, by geometry, on both phones",
    gesture: "pinch",
    does: FLANK_DOES,
    source: SOURCE,
    holdKind: "drag",
    dragTarget: "cystFlankRight",
    sends: ["drag"],
    pose: "CYST · THE RIGHT FLANK PINCHED",
  },
];
