import type { Wave } from "@neon-spore/content";
import type { RailFolds } from "./rail-folds.js";
import { waveGroups } from "./rail-groups.js";

/**
 * **OPEN ALL and FOLD ALL**, over the wave list: every group at once.
 *
 * The owner, 15 October 2026: *give me the chance to expand or minimize all
 * waves.* Every composed block is eight variants under its intro, so the list
 * folded is the intros and the bosses — the game's order of new things — and
 * opened is every wave there is. One press each way, rather than forty-odd
 * `▸` presses; the groups a press opens are remembered like a single one
 * (`rail-folds.ts`).
 */
export function bindFoldAll(
  host: HTMLElement | null,
  folds: RailFolds,
  waves: () => readonly Wave[],
): void {
  if (!host) return;
  const heads = (): string[] => {
    const list = waves();
    const { size } = waveGroups(list);
    return list.filter((_, i) => (size[i] ?? 0) > 0).map((w) => w.id);
  };
  const press = (label: string, title: string, opening: boolean): HTMLButtonElement => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "fold-all";
    button.textContent = label;
    button.title = title;
    button.addEventListener("click", () => folds.setAll(heads(), opening));
    return button;
  };
  host.replaceChildren(
    press("▾ OPEN ALL", "Open every group: every wave in the list", true),
    press("▸ FOLD ALL", "Fold every group: only the waves that bring something new", false),
  );
}
