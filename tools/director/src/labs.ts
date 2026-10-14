import { bindComboLab } from "./combo-lab.js";
import { bindHoldLab } from "./hold-lab.js";
import { bindLeverLab } from "./lever-lab.js";
import { bindPressLab } from "./press-lab.js";
import { bindPullLab } from "./pull-lab.js";
import { bindRubLab } from "./rub-lab.js";
import { bindShieldLab } from "./shield-lab.js";

/**
 * **The director's labs, PULL, HOLD, PRESS, RUB, COMBO, SHIELD and LEVER**:
 * the one the URL left open, opened again (`place.ts`'s `lab`). None has a
 * door in the topbar — the owner, 14 October 2026, took them out: each lab is
 * reached as its card, on CONTROLS › ON THE FIELD beside the gesture it is the
 * bare form of (`field-lab-cards.ts`), THE SHIELD LAB on CONTROLS › HELPERS
 * (`helpers-shield.ts`).
 */
export function bindLabs(): void {
  bindPullLab();
  bindHoldLab();
  bindPressLab();
  bindRubLab();
  bindComboLab();
  bindShieldLab();
  bindLeverLab();
}
