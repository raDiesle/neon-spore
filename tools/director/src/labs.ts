import { bindComboLab } from "./combo-lab.js";
import { bindHoldLab } from "./hold-lab.js";
import { bindLabDoors } from "./lab-door.js";
import { bindPressLab } from "./press-lab.js";
import { bindPullLab } from "./pull-lab.js";
import { bindRubLab } from "./rub-lab.js";

/**
 * **The director's five labs, PULL, HOLD, PRESS, RUB and COMBO**: each one's door in the topbar,
 * to its card on ON THE FIELD (`lab-door.ts`), and the one the URL left open
 * opened again (`place.ts`'s `lab`).
 */
export function bindLabs(): void {
  bindLabDoors();
  bindPullLab();
  bindHoldLab();
  bindPressLab();
  bindRubLab();
  bindComboLab();
}
