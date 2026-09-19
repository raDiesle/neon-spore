import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE SINEW's two handles, in a file of their own.
 *
 * The same split `field-controls-balloon.ts` made, for the same two reasons:
 * `field-controls-page.ts` is at its limit, and this is a pair that only
 * means anything as a pair. It differs from the balloon's in the one way the
 * whole boss does — the two hands do not each hold a side, they **add**: one
 * sum on one band, and the number the pair has to agree on is how hard
 * (`sim/sinew.ts`, `docs/spec/bosses.md` §11.26).
 */
export const SINEW_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE SINEW'S LEFT HANDLE",
    where:
      "hanging off the left of the mass at the end of the tendon, on both " +
      "screens, while a fibre is still whole",
    seat: "player 1 — one handle each, and the sides never change",
    gesture: "grab and drag",
    does:
      "Carried **down** it pulls, as far as sinewReachMilli — one tile — and " +
      "the pull is added to the other hand's into one sum on the strain band " +
      "at the tendon's collar. Player 1's screen shows where the zone is on " +
      "that band and never the sum; his job is to say *more* and *less*. " +
      "Held inside the zone for sinewHoldBeats the pips round the collar fill " +
      "and a fibre parts; pulled past the zone's top the tendon snaps back, " +
      "both hands are thrown off for sinewSnapBeats and the mass sheds a rock " +
      "(sim/sinew-hand.ts, sim/sinew-step.ts). A hand may land on a handle " +
      "while it is still whipping, but its pull is nought for those beats: " +
      "what it is read for there is **sideways**, and both hands carried " +
      "**apart** past sinewCatchMilli — his left, hers right — catch the " +
      "tendon and end the swing on that beat. Once the last fibre has parted " +
      "and the mass is falling, the same handle is carried **sideways** " +
      "instead, past sinewSwayMilli: both hands the same way walk the mass a " +
      "column a beat, and it has to be sinewClearCols from the middle to " +
      "land at the wall and not on the hull.",
    source: "touch.ts — sinewHandleUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "sinewLeft",
    sends: ["drag"],
    pose: "SINEW · BOTH HANDS ON THE PULL",
  },
  {
    name: "THE SINEW'S RIGHT HANDLE",
    where:
      "hanging off the right of the mass at the end of the tendon, on both " +
      "screens, while a fibre is still whole",
    seat: "player 2 — the second handle in the game that is not the pilot's",
    gesture: "grab and drag",
    does:
      "The same control on the other side, and the other half of one number. " +
      "Player 2's screen shows the sum on the band and never the zone; her " +
      "job is to say *that is where we are*. Both handles are drawn on both " +
      "screens so each seat can see the other's hand arrive, but only your " +
      "own answers your thumb, and the cord under each hand is drawn at the " +
      "pull so the depth is visible to the one who cannot feel it. From " +
      "sinewDecayFibres parted the tendon goes slack under any hand — the sum " +
      "creeps down while either is holding — and only both letting go " +
      "resets it, so the pair re-grips between fibres and says the number " +
      "again (sim/sinew-step.ts). Sideways means two different things on this " +
      "handle and never in the same beat: **apart** catches a swing, and " +
      "**the same way** walks the falling mass.",
    source: "touch.ts — sinewHandleUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "sinewRight",
    sends: ["drag"],
    pose: "SINEW · BOTH HANDS ON THE PULL",
  },
];
