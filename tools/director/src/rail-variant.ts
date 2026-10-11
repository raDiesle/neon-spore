import type { Wave } from "@neon-spore/content";
import { isVariant, waveGroups } from "./rail-groups.js";
import { currentWave, type Store } from "./state.js";

/**
 * THE ONE SWITCH THAT PUTS A WAVE IN A GROUP: *fold this wave under the one
 * above it* (`Wave.variant`, `rail-groups.ts`).
 *
 * Under NAME, because it is about where the wave stands in the list and
 * nothing the stage draws — so a press goes through the caller's `onEdit`, the
 * way a rename does, and never restarts the field.
 *
 * It names the head it would join, checked or not, because that is the whole
 * question a person has before pressing it: *under which wave?* A boss wave
 * and the first wave are refused, and the line says why rather than hiding.
 */
export interface VariantField {
  render(): void;
}

export function bindVariantField(store: Store, onEdit: () => void): VariantField {
  const box = document.getElementById("fVariant") as HTMLInputElement | null;
  const why = document.getElementById("fVariantWhy");

  const render = (): void => {
    const wave = currentWave(store);
    if (!box || !why || !wave) return;
    const refused = refusal(store.index, wave);
    box.disabled = refused !== null;
    box.checked = isVariant(store.waves, store.index);
    why.textContent = refused ?? `FOLDED UNDER ${headLabel(store.waves, store.index)}`;
  };

  box?.addEventListener("change", () => {
    const wave = currentWave(store);
    if (!wave || !box || refusal(store.index, wave) !== null) return;
    if (box.checked) wave.variant = true;
    else delete wave.variant;
    store.dirty = true;
    render();
    onEdit();
  });

  return { render };
}

function refusal(i: number, wave: Wave): string | null {
  if (wave.boss) return "A boss wave always stands on its own in the list.";
  if (i === 0) return "The first wave has nothing above it to fold under.";
  return null;
}

/** The head the wave at `i` is folded under, or would be if it were: the
 * nearest wave above it that is not itself a variant. */
function headLabel(waves: readonly Wave[], i: number): string {
  const above = waveGroups(waves).head[i - 1] ?? -1;
  const head = above === -1 ? i - 1 : above;
  return `${String(head + 1).padStart(2, "0")} ${waves[head]?.name || "— unnamed —"}`;
}
