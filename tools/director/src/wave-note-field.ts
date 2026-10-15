import type { Wave } from "@neon-spore/content";
import { currentWave, type Store } from "./state.js";

/**
 * WAVE SETTINGS › NOTE: the author's note on a wave — the owner, 15 October
 * 2026: *some note column, about recommendations or plans or like status quo
 * what should be checked on that wave or is todo or unusual and should be
 * fixed or improved.* Kept on the wave (`Wave.note`), saved with it, and read
 * first in DOCUMENTATION › WAVES' Notes column (`waves-table.ts`).
 *
 * Typing it is prose, like the name: it marks the list unsaved and restarts
 * nothing. An emptied note leaves no field behind.
 */
export interface WaveNoteField {
  render(wave: Wave | undefined): void;
}

export function bindWaveNoteField(store: Store, onEdit: () => void): WaveNoteField {
  const field = document.getElementById("fNote") as HTMLTextAreaElement | null;
  field?.addEventListener("input", () => {
    const wave = currentWave(store);
    if (!wave || !field) return;
    const text = field.value.trim();
    if (text) wave.note = field.value;
    else delete wave.note;
    store.dirty = true;
    onEdit();
  });
  return {
    render(wave) {
      if (field && document.activeElement !== field) field.value = wave?.note ?? "";
    },
  };
}
