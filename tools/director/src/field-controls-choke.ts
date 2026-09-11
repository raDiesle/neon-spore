import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE CHOKE's one gesture, in a file of its own on `field-controls-gum.ts`'s
 * pattern — `field-controls-page.ts` is at its limit, and this row belongs
 * beside the gum's anyway: the other body on the ship with a hand on it, this
 * time the seat whose control it took. It is the one drag target that is not
 * on the field at all but on the band, which is why it is here and not among
 * the panel's buttons: the strip it is on is dead, and what the panel sends
 * from it is a grab on the body, not a column.
 */
export const CHOKE_CONTROLS: readonly FieldControlDef[] = [
  // `press` and not `grab and drag`, though the hold is a drag's: what the
  // hand does is land and lift, and the distance is never read.
  {
    name: "THE CHOKE",
    where: "the cannon strip, while a choke has the cannon — on player 1's screen",
    seat: "player 1 — the seat whose cannon it is",
    gesture: "press",
    does:
      "A choke falls straight down a lane, cannot be shot, is not stopped by " +
      "the shield, and takes the cannon when it lands, wherever the cannon " +
      "is. From then on the strip answers nobody and the cannon walks a " +
      "column every chokeSweepBeats beats, wall to wall; player 2 keeps " +
      "firing from wherever it is. Every fresh press on the dead strip — a " +
      "lift between — loosens the grip by one, and chokeTaps of them get it " +
      "off for scoreChokeFreed. A thumb held down is one tap; a slide is " +
      "nothing (sim/choke.ts).",
    source: "touch.ts — the cannon strip, while stuckChoke() finds one",
    holdKind: "drag",
    dragTarget: "choke",
    sends: ["drag"],
  },
];
