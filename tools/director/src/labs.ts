import { bindComboLab } from "./combo-lab.js";
import { bindHoldLab } from "./hold-lab.js";
import { bindLabDoors } from "./lab-door.js";
import { bindLeverLab } from "./lever-lab.js";
import { bindPressLab } from "./press-lab.js";
import { bindPullLab } from "./pull-lab.js";
import { bindRubLab } from "./rub-lab.js";
import { bindShieldLab } from "./shield-lab.js";

/**
 * **The director's labs, PULL, HOLD, PRESS, RUB, COMBO, SHIELD and LEVER**: each one's door in the topbar,
 * to its card on ON THE FIELD (`lab-door.ts`), and the one the URL left open
 * opened again (`place.ts`'s `lab`). THE SHIELD LAB has no door: its card
 * stands on CONTROLS › HELPERS (`helpers-shield.ts`).
 */
export function bindLabs(): void {
  bindLabDoors();
  bindPullLab();
  bindHoldLab();
  bindPressLab();
  bindRubLab();
  bindComboLab();
  bindShieldLab();
  bindLeverLab();
}
