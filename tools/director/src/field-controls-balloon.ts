import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE BALLOON's two handles, in a file of their own.
 *
 * `field-controls-page.ts` was at its 250-line limit, and the split is the one
 * that file's own header keeps making — but there is an argument for these two
 * beyond the line count. Every other row in that list is a control **one seat**
 * has: the grip either of them may take, and four handles that are all the
 * pilot's. This pair is the first thing on the field that only exists as two
 * controls at once, so what a reader needs is to see both rows without
 * scrolling past four that are nothing like them.
 */
export const BALLOON_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE BALLOON'S LEFT HANDLE",
    where: "hanging off the left of every balloon on the field, on both screens",
    seat: "player 1 — one handle each, and the sides never change",
    gesture: "grab and drag",
    does:
      "Carried leftward past balloonTautMilli it holds this side of the skin " +
      "taut, and the body visibly gives on it. On its own that is all it " +
      "does: the skin only lets go once **both** handles have been taut on " +
      "the same body together for balloonHoldBeats — the body sits at full " +
      "stretch with its glow coming up, and a hand that slackens inside the " +
      "hold gives it back. The first time it gives the balloon splits into " +
      "two smaller ones that part, one climbing on and one sinking to burst " +
      "on the ship for the top's price; the second it pops for nothing. " +
      "Carrying it inward counts as nothing at all — a pair squeezing a " +
      "balloon is not a pair stretching one (sim/balloon-pull.ts, " +
      "sim/balloon-rub.ts).",
    source: "touch.ts — balloonHandleUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "balloonLeft",
    sends: ["drag"],
    pose: "BALLOON · BOTH HANDS TAUT",
  },
  {
    name: "THE BALLOON'S RIGHT HANDLE",
    where: "hanging off the right of every balloon on the field, on both screens",
    seat: "player 2 — the first handle in the game that is not the pilot's",
    gesture: "grab and drag",
    does:
      "The same control at the other side, carried rightward, and the other " +
      "half of one gesture. Both are drawn on both screens so each seat can " +
      "see the other's hand arrive — the moment they are both taut is a " +
      "moment neither of them can feel — but only your own answers your " +
      "thumb. A wave sends several balloons at once on purpose, so the thing " +
      "that has to be said out loud is which one (sim/balloon-pull.ts). " +
      "On the stage under TEST, and only there, one mouse works both: a drag " +
      "on either handle carries the other one the same distance the opposite " +
      "way, so a desk with one pointer can still watch a balloon give " +
      "(stage-balloon-both.ts).",
    source: "touch.ts — balloonHandleUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "balloonRight",
    sends: ["drag"],
    pose: "BALLOON · BOTH HANDS TAUT",
  },
];
