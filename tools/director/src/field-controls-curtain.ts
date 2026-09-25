import type { FieldControlDef } from "./field-control-def.js";

/**
 * **THE CURTAIN's hem**, in a file of its own, the split every boss since
 * THE INSTAR has made.
 *
 * One row, and the only one on this page whose control exists **because the
 * other one was taken away**. This boss's gesture is the shove — both hands
 * on seven columns of cloth, carried sideways — and a hit on the core jams
 * the rail for `curtainPinBeats`, which refuses that shove whole. The hem is
 * what gives instead: one thumb, one direction, held (`sim/curtain-hand.ts`,
 * `render/curtain-grip.ts`, `docs/spec/bosses.md` §11.24).
 *
 * **It is held rather than spent**, which is what separates it from every
 * other carry here. THE TASTER's pry reaches the bottom and the interlock is
 * open whether the thumb stays or goes; this one opens the gap **while**
 * it is at the top and shuts it the tick it is not, so the shot has to be
 * fired into a hand that is still holding. Two people, two states, one word
 * each: SHOVE, FIRE, LIFT.
 */
export const CURTAIN_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE CURTAIN'S HEM",
    where:
      "in the middle of whatever part of the sheet is on the field, on both " +
      "screens, and only while a hit has jammed the rail — a ring on the " +
      "fabric's bottom edge, under the bar laid along the rail that runs " +
      "down as the jam does",
    seat: "player 1 only — the shadow's column is hers to read, so the hand goes to the seat not already being asked for it",
    gesture: "grab and drag",
    does:
      "Gathers the hem up off the floor and holds it there. While the rail " +
      "is jammed no shove moves the sheet either way, so the way back to the " +
      "core is under the cloth rather than around it: he carries the hem " +
      "curtainLiftMilli straight up and the core is bare for as long as his " +
      "thumb stays at the top (sim/curtain-hand.ts). A carry downward is no " +
      "lift, and a thumb lifted shuts the gap on the tick — there is no " +
      "bottom that spends the gesture and nothing to come back to. So the " +
      "pair fire into a hand that is still holding, which is the whole of " +
      "this state: player 2 reads the shadow's colour and puts it up the " +
      "core's column before the jam runs out (sim/curtain-step.ts). The ring " +
      "is drawn on both screens because the gauge closing is her cue; it " +
      "hangs in the middle of the sheet and never over the core, because the " +
      "core is hers to see and a handle in its column would tell him where " +
      "it is (render/curtain-grip.ts).",
    source: "touch.ts — curtainHemUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "curtainHem",
    sends: ["drag"],
    pose: "THE CURTAIN · PINNED",
  },
];
