import { bindComboLab } from "./combo-lab.js";
import { bindHoldLab } from "./hold-lab.js";
import { bindPullLab } from "./pull-lab.js";

/**
 * **The director's three labs, PULL, HOLD and COMBO**: each one's door in the topbar,
 * and the one the URL left open opened again (`place.ts`'s `lab`).
 */
export function bindLabs(): void {
  bindPullLab();
  bindHoldLab();
  bindComboLab();
}
