import type { ControlDef } from "./controls.js";

/**
 * **THE PULSE's eight**: four lanes, a slick, a bulb, a meteor and a pod, on
 * each seat's half of the band (`render/pulse-button.ts`).
 *
 * Cut out of `controls-round.ts` when THE THROAT's rework left it at 246
 * lines, along the one seam it had that was a set and not a row: these are
 * the only controls in the game written twice. `ROUND_CONTROLS` spreads them
 * in place.
 *
 * **THE PULSE's eight are the one place a control is written twice**, once for
 * each seat, and it is not a mistake in the model. A `ControlDef` belongs to a
 * seat — that is what makes a panel two halves — and this is the first round
 * where both halves are the same four buttons. The alternative was a control
 * that belongs to *both*, which would be a third value on a field that is
 * `1 | 2` in forty places, to save writing four labels out twice.
 */
export const PULSE_CONTROLS: readonly ControlDef[] = [
  {
    id: "pulse1Slick",
    player: 1,
    form: "lobe",
    label: "SLICK",
    does: "Player 1's slick lane in THE PULSE. Both seats carry all four, and both press the same chart.",
  },
  {
    id: "pulse1Bulb",
    player: 1,
    form: "lobe",
    label: "BULB",
    does: "Player 1's bulb lane in THE PULSE. Both seats carry all four, and both press the same chart.",
  },
  {
    id: "pulse1Meteor",
    player: 1,
    form: "lobe",
    label: "ROCK",
    does: "Player 1's meteor lane in THE PULSE. Both seats carry all four, and both press the same chart.",
  },
  {
    id: "pulse1Pod",
    player: 1,
    form: "lobe",
    label: "POD",
    does: "Player 1's pod lane in THE PULSE. Both seats carry all four, and both press the same chart.",
  },
  {
    id: "pulse2Slick",
    player: 2,
    form: "lobe",
    label: "SLICK",
    does: "Player 2's slick lane in THE PULSE. Both seats carry all four, and both press the same chart.",
  },
  {
    id: "pulse2Bulb",
    player: 2,
    form: "lobe",
    label: "BULB",
    does: "Player 2's bulb lane in THE PULSE. Both seats carry all four, and both press the same chart.",
  },
  {
    id: "pulse2Meteor",
    player: 2,
    form: "lobe",
    label: "ROCK",
    does: "Player 2's meteor lane in THE PULSE. Both seats carry all four, and both press the same chart.",
  },
  {
    id: "pulse2Pod",
    player: 2,
    form: "lobe",
    label: "POD",
    does: "Player 2's pod lane in THE PULSE. Both seats carry all four, and both press the same chart.",
  },
];
