import { antiphonExplainerOn, DEFAULT_CONFIG } from "@neon-spore/sim";
import { button, el } from "./dom.js";

/**
 * **THE ANTIPHON's levels, stepped through one at a time** (the owner,
 * 5 October 2026: *i want a stepper for every level of this wave in director
 * app of wave*).
 *
 * THE MAZE's bar with the sheet taken out (`maze-editor.ts`): nothing on the
 * rail is authored — which contour grows, beside which decoys, is the seed's,
 * and a wave that wrote it down would be a boss with its answers printed on
 * it — so the panel does not edit. What it gives is the way to a level
 * without carrying every organ before it: a tab per level, and one for the
 * ship after the last pit, each standing the field on that level through
 * `setBossRound` (`sim/antiphon-step.ts`'s `antiphonOpenLevel`).
 *
 * Under the bar, who explains and who chooses on the level chosen, because
 * the seats swap each level and that is the one thing about a level an author
 * cannot see from one screen. **The level marked is the field's answer**
 * (`StagePanel.round`), never a copy kept here.
 */
export function renderAntiphonEditor(
  panel: HTMLElement,
  onEdit: () => void,
  onStage: (level: number) => void,
  /** The level the field is being held on — `StagePanel.round`. */
  round: () => number,
): void {
  const pits = DEFAULT_CONFIG.antiphonPits;
  const at = Math.max(0, Math.min(round(), pits));

  panel.appendChild(
    el(
      "p",
      "note",
      `${pits} levels and the ship. Each level one seat is shown the organ and ` +
        "explains it, the other is shown the candidates and carries one down " +
        "its vein; a decoy carried home loses the wave. The rail is the " +
        "seed's, so this panel only steps through it.",
    ),
  );

  const bar = el("div", "snake-tabs");
  for (let i = 0; i <= pits; i++) {
    const tab = button(antiphonLevelName(i, pits), i === at ? "snake-tab on" : "snake-tab");
    tab.addEventListener("click", () => {
      // The level first, because both halves are read off it (`maze-editor.ts`).
      onStage(i);
      onEdit();
    });
    bar.appendChild(tab);
  }
  panel.appendChild(bar);
  panel.appendChild(el("p", "note", antiphonLevelSeats(at)));
}

/** A tab's word: the level's number, or SHIP for the one after the last pit. */
export function antiphonLevelName(level: number, pits: number): string {
  return level >= pits ? "SHIP" : `LEVEL ${level + 1}`;
}

/** Who does what on `level`, as the simulation swaps them (`antiphonExplainerOn`). */
export function antiphonLevelSeats(level: number): string {
  const explainer = antiphonExplainerOn(level);
  return `P${explainer} explains · P${3 - explainer} chooses`;
}
