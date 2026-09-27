import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE CAPSTAN's rub, as a row of the ON THE FIELD tab.
 *
 * THE RIME's wipe on a drum THE PLUMB's lean rocks. **Both screens draw the
 * whole drum and either seat's thumb is taken on either end**, because which
 * seat wears is the step's and which face is bared is the other seat's lean
 * (`render/capstan-grip.ts`, `docs/spec/bosses.md` §11.54). The lean itself
 * is the phone tilted and has no row: nothing on the glass answers it.
 */
const RUB_DOES =
  "A **rub**: a thumb within a face's height of either end of the drum, held " +
  "and turned back and forth. Each drag says how many times it has turned " +
  "back since it went down, and **every fresh reversal wears the face the " +
  "other seat's lean has bared** — from the seat not steering, and nothing " +
  "while the drum sits level. A band worn to its mark cracks bright; on a " +
  "hold, a beat with a reversal on a bared face counts one. A lift sets the " +
  "count back to nought (sim/capstan-hand.ts, packages/render/src/rub.ts).";

export const CAPSTAN_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE CAPSTAN'S RUB",
    where:
      "on either end of the drum, where the cradle has rocked it, on both screens, until the cap swings open",
    seat: "either — the seat that wears is the one the step does not steer: player 2 on the left band, player 1 on the right, the one not leaning on a hold",
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
