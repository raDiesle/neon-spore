import type { FieldControlDef } from "./field-control-def.js";

/**
 * **THE UNDERTOW's two thumbs**, in a file of its own, the split every boss
 * since THE INSTAR has made.
 *
 * Two rows on two targets, and **both of them the navigator's** — the first
 * pair here that one seat owns whole. Every other boss with two handles gives
 * one to each; this fight cannot. The attack comes up through the floor, so
 * the pilot's maw and his cannon's column are the two answers to it and both
 * of his hands are on them for the whole fight. Hers is the plate, and a plate
 * stands where it is put and then waits — which is what leaves her a thumb.
 *
 * The second is also the only control in the game that **hands the other
 * player his seat back**: the floor bows under the cannon, he fails to slide
 * off it, and for `undertowUnseatedBeats` every verb of his is refused. She
 * holds his column for two beats and he has the rest of them.
 *
 * **The rules shipped first and the pictures came after.** Both gestures were
 * heard by `sim/undertow-hand.ts` with nothing on either screen to take hold
 * of, which is why there were no rows here and `on-field-controls.test.ts` had
 * `undertowPin` and `undertowFree` filed as `unbuilt`.
 */
export const UNDERTOW_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE UNDERTOW'S PIN",
    where:
      "on the hull line over a lobe standing out of the floor, one ring per " +
      "lobe, just clear of the plating and below the lobe's own two bands — " +
      "so the cyan on a tall one's top third, which is the whole of how the " +
      "pilot is told to prime the beam rather than open the maw, is never " +
      "under her thumb (render/undertow-grip.ts)",
    seat: "player 2 only — a press from the pilot falls through as if no ring were there",
    gesture: "grab and drag",
    does:
      "Pins that breach shut for as long as her thumb is down: it stops " +
      "widening and the maw stays out of it, both exactly the way her plate " +
      "does — undertowPinned is asked on the same line as world.shieldCol in " +
      "both places that number is asked (sim/undertow-step.ts, " +
      "undertow-press.ts). So it is a second plate, on a fight whose whole " +
      "second phase is two breaches and one plate. One pin only: a thumb on " +
      "a second lobe moves it off the first, and lifting off a column she is " +
      "no longer pinning says nothing (sim/undertow-hand.ts). Refused on a " +
      "plate still bowing — there is no hole yet — and through last, where a " +
      "pin could only spoil the hold the fight ends on.",
    source: "touch.ts — undertowGripUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "undertowPin",
    sends: ["drag"],
    pose: "THE UNDERTOW · TWO",
  },
  {
    name: "THE UNDERTOW'S FREE",
    where:
      "a clear tile above the hull line over the cannon's own column, and " +
      "only while the floor has the pilot stuck in it — above the plate, the " +
      "cannon and the bow rising off the skin, in air nothing else of this " +
      "fight is drawn in. Its dial is the count itself, so what fills is the " +
      "number the simulation acts on (render/undertow-grip.ts).",
    seat: "player 2 only — it is the pilot's seat she is hauling the plate off",
    gesture: "hold",
    does:
      "Gives him his seat back. A bow under the cannon he did not slide off " +
      "unseats him and refuses every verb he has for undertowUnseatedBeats; " +
      "her thumb held on that column for undertowFreeBeats ends it early, " +
      "with the beats that are left handed back on the tick rather than on " +
      "the beat after (sim/undertow-hand.ts, unseatedUntil). Lifted off, the " +
      "count keeps — the maw's rule under the last lobe, and here because a " +
      "count that reset on a slip would ask for the one thing a phone cannot " +
      "promise across a call. Held before the floor takes him it does " +
      "nothing at all: that is a thumb on the hull, and the beats it would " +
      "bank are beats she did not spend watching the bow.",
    source: "touch.ts — undertowGripUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "undertowFree",
    sends: ["drag"],
    pose: "THE UNDERTOW · SEAT",
  },
];
