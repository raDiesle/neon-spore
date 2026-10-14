import { HOLD_PULL, HOLD_TAP } from "./combo-hold-partner.js";
import { HOLD_THEN_PULL } from "./combo-hold-then-pull.js";
import type { ComboRule } from "./combo-kinds.js";
import { comboLoop, comboThumb } from "./combo-lab-auto.js";
import { comboState, paintComboLab } from "./combo-lab-paint.js";
import {
  COMBOS,
  type Combo,
  freshCombo,
  type LabCombo,
  liftCombo,
  moveCombo,
  pressCombo,
  tickCombo,
} from "./combo-lab-rule.js";
import { PRESS_PULL } from "./combo-press-pull.js";

/**
 * **Every combo THE COMBO LAB plays**, in the order of its COMBO choice — one
 * for each type of the ON THE FIELD sheet's one COMBO action, where the lab
 * stands once (`field-actions-combo.ts`, its `comboLab` keys):
 *
 * - `held` (`combo-kinds.ts`) — **PULL, THEN HOLD**, the pull held at its
 *   end for the partner or beats; **HOLD WHILE THE PARTNER PULLS / TAPS**,
 *   the hold first, the partner's part done only while it is down;
 * - `chain` — **PRESS, THEN PULL** and **HOLD, THEN PULL**: a press or a
 *   hold counted and gone, then a pull in its place.
 */

/** A pull-then-hold combo (`combo-lab-rule.ts`) as the lab's rule. */
function pullThenHold(c: Combo): ComboRule<LabCombo> {
  return {
    key: c.key,
    label: c.label,
    kind: "held",
    says: c.says,
    like: c.like,
    fresh: () => freshCombo(c),
    press: (s, at) => {
      pressCombo(c, s, at);
    },
    move: (s, at) => moveCombo(c, s, at),
    lift: (s) => liftCombo(c, s),
    tick: (s, dt) => tickCombo(c, s, dt),
    paint: (ctx, state, look, time) => paintComboLab(ctx, { combo: c, state, look, time }),
    state: (s) => comboState(c, s),
    tally: (s) => s,
    thumb: (t) => comboThumb(c, t),
    loop: comboLoop(c).end,
  };
}

/** Each rule's state is its own; the lab only hands back what `fresh` gave it (methods, so bivariant). */
export const COMBO_RULES: readonly ComboRule<unknown>[] = [
  ...COMBOS.map(pullThenHold),
  HOLD_PULL,
  HOLD_TAP,
  PRESS_PULL,
  HOLD_THEN_PULL,
];

/** The combo for `key`, or the first when the key names none. */
export const comboRuleOf = (key: string): ComboRule<unknown> =>
  COMBO_RULES.find((r) => r.key === key) ?? (COMBO_RULES[0] as ComboRule<unknown>);
