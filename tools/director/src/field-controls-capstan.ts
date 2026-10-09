import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE CAPSTAN's pull and rub, as two rows of the ON THE FIELD tab.
 *
 * A wipe on a drum a thumb pulls round. **Both screens draw the
 * whole drum and either seat's thumb is taken on its middle and on either
 * end**, because which seat steers and wears is the step's and which face is
 * bared is the other seat's pull (`render/capstan-grip.ts`,
 * `docs/spec/bosses.md` §11.54). The pull was the phone tilted, with no row,
 * until 27 September 2026.
 */
const STEER_DOES =
  "A **pull**: a thumb on the drum's middle or its cradle, held and carried " +
  "left or right. Each drag says how far across it has come since it went " +
  "down, and a carry past capstanPullMilli rocks the cradle to bare that " +
  "side's face for as long as it is held. A lift lets the cradle drift back " +
  "level, which pauses the rub and never resets it (sim/capstan-hand.ts). While it " +
  "asks, the middle wears the halo on the steerer's screen and the partner's " +
  "ring and clock on the other's; a band worn bright or a hold kept greens " +
  "it, and a band or a hold run out reddens it (render/capstan-verdicts.ts).";

const RUB_DOES =
  "A **rub**: a thumb within a face's height of either end of the drum, held " +
  "and turned back and forth. Each drag says how many times it has turned " +
  "back since it went down, and **every fresh reversal wears the face the " +
  "other seat's pull has bared** — from the seat not steering, and nothing " +
  "while the drum sits level. A band worn to its mark cracks bright; on a " +
  "hold, a beat with a reversal on a bared face counts one. A lift sets the " +
  "count back to nought (sim/capstan-hand.ts, packages/render/src/rub.ts). " +
  "While it asks, the end wears the halo on the wearer's screen and the " +
  "partner's ring and clock on the steerer's, greened and reddened with the " +
  "middle (render/capstan-verdicts.ts).";

export const CAPSTAN_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE CAPSTAN'S PULL",
    where:
      "on the drum's middle or its cradle, between the two ends, on both screens, until the cap swings open",
    seat: "either — the seat that steers is the step's: player 1 on the left band, player 2 on the right, either on a hold",
    gesture: "grab and drag",
    does: STEER_DOES,
    source: "handles.ts — capstanSteerUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "capstanSteer",
    sends: ["drag"],
    pose: "CAPSTAN · THE LEFT BAND RUBBED",
  },
  {
    name: "THE CAPSTAN'S RUB",
    where:
      "on either end of the drum, where the cradle has rocked it, on both screens, until the cap swings open",
    seat: "either — the seat that wears is the one the step does not steer: player 2 on the left band, player 1 on the right, the one not pulling on a hold",
    gesture: "grab and drag",
    does: RUB_DOES,
    source:
      "handles.ts — capstanRubUnder() under handleUnder(); the reversals counted in packages/render/src/rub.ts",
    holdKind: "drag",
    dragTarget: "capstanRub",
    sends: ["drag"],
    pose: "CAPSTAN · THE LEFT BAND RUBBED",
  },
];
