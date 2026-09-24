import type { FieldControlDef } from "./field-control-def.js";

/**
 * **THE CANDLE's wick**, in a file of its own, the split every boss since
 * THE INSTAR has made.
 *
 * One row, and the only one on this page whose control is taken hold of **in
 * the dark**: every other handle here hangs off something the seat can see,
 * and this one is the light itself. It is also the only one that stops a
 * trigger working — from the last step on, no shot takes anything off the
 * glow, so the fight cannot end without it (`sim/candle-hand.ts`,
 * `render/candle-grip.ts`, `docs/spec/bosses.md` §11.22).
 *
 * **Its other half is not a handle at all.** The pull is the pilot's; what
 * finishes the boss is the navigator's beam standing in the column inside
 * `candleSmokeBeats`, which is the ordinary trigger on her ordinary panel and
 * has no row here. The pair of gestures is the design; only one of them is on
 * the field.
 */
export const CANDLE_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE CANDLE'S WICK",
    where:
      "on the glow itself, on both screens, and only at the last step — a " +
      "ring round the flame, on a stem hanging candlePinchMilli down the " +
      "column the light is over",
    seat: "player 1 only — his hands are otherwise the carriage, hers the trigger and the lobe",
    gesture: "grab and drag",
    does:
      "Pulls the flame off the wick. From the last step on no shot counts at " +
      "all, so nobody is sent anywhere and the column stops mattering: he " +
      "carries the flame candlePinchMilli — three tiles — straight down " +
      "and the tick it reaches the bottom the wick is smoking " +
      "(sim/candle-hand.ts). A thumb lifted short springs it back to the top " +
      "and the pull has to be made again; a pull upward is no pull. Then the " +
      "count: player 2 has candleSmokeBeats to stand the beam in the glow's " +
      "column, and late the wick lights again a step brighter than the pair " +
      "left it, eating and drifting, with the pull to make a second time " +
      "(sim/candle-step.ts). The ring is drawn on both screens because the " +
      "gauge closing round the flame is her cue to fire; the word on it, " +
      "PULL, is his alone (render/boss-cue-read-m.ts).",
    source: "touch.ts — candleWickUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "candleWick",
    sends: ["drag"],
    pose: "THE CANDLE · LAST",
  },
];
