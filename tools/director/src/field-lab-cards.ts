import { openComboLab } from "./combo-lab.js";
import type { ControlType } from "./field-actions.js";
import { openHoldLab } from "./hold-lab.js";
import { openLeverLab } from "./lever-lab.js";
import { openPressLab } from "./press-lab.js";
import { openPullLab } from "./pull-lab.js";
import { openRubLab } from "./rub-lab.js";
import { whenSeen } from "./when-seen.js";

/*
 * The lab cards CONTROLS › ON THE FIELD puts in an action's gesture grid
 * (`field-action-cards.ts`), out of that file for length when THE LEVER LAB
 * made six.
 */

/** Each lab, put up on its own key inside a card (`lab-shell.ts`). */
const LABS = {
  pull: (key: string, host: HTMLElement) => openPullLab(key, { host }),
  hold: (key: string, host: HTMLElement) => openHoldLab(key, { host }),
  press: (key: string, host: HTMLElement) => openPressLab(key, { host }),
  rub: (key: string, host: HTMLElement) => openRubLab(key, { host }),
  combo: (key: string, host: HTMLElement) => openComboLab(key, { host }),
  lever: (key: string, host: HTMLElement) => openLeverLab(key, { host }),
} as const;

/**
 * The labs a type or an action names, each a card for the gesture grid,
 * beside the generic gesture it tries — the owner, 12 October 2026: *show all
 * labs not on a separate page, but directly on the "on the field" related
 * page*. Each is put up as it comes near the screen (`when-seen.ts`).
 */
export function labCards(
  at: Pick<ControlType, "lab" | "holdLab" | "pressLab" | "rubLab" | "comboLab" | "leverLab">,
): HTMLElement[] {
  const asked = [
    ["pull", at.lab],
    ["hold", at.holdLab],
    ["press", at.pressLab],
    ["rub", at.rubLab],
    ["combo", at.comboLab],
    ["lever", at.leverLab],
  ] as const;
  return asked.flatMap(([kind, key]) => {
    if (!key) return [];
    const host = document.createElement("div");
    host.className = "field-lab";
    host.dataset.lab = kind; // what a topbar door scrolls to (`lab-door.ts`)
    whenSeen(host, () => LABS[kind](key, host));
    return [host];
  });
}

/** A type's own labs. THE COMBO LAB is not one: it stands once over the
 * COMBO action and plays every type there, so a type only names its choice. */
export const typeLabs = (t: ControlType): HTMLElement[] =>
  labCards({
    lab: t.lab,
    holdLab: t.holdLab,
    pressLab: t.pressLab,
    rubLab: t.rubLab,
    leverLab: t.leverLab,
  });
