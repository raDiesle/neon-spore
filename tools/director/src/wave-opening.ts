import type { Wave } from "@neon-spore/content";

/**
 * What the wave being edited puts in front of a pair before it starts, read
 * off the store's own live entry rather than off `WAVES` on disk — an unsaved
 * edit shows here immediately, before it is saveable at all.
 *
 * This used to run `openBriefings` over the wave's queue, pods and boss to
 * work out which catalogue cards it would raise. There is nothing to derive
 * now: a wave opens on its introduction, and then on the guide it carries or
 * on nothing. The note is short because the fact is.
 */

/** The states this wave opens on, in order, as the pair meets them. */
export function waveOpeningStates(wave: Wave | undefined): string[] {
  if (!wave) return [];
  return wave.guide ? ["INTRODUCTION", "GUIDE"] : ["INTRODUCTION"];
}

/** Painted into `#waveBriefing` in the WAVE tab, beside the fields it is about. */
export function renderWaveOpening(wave: Wave | undefined): void {
  const mount = document.getElementById("waveBriefing");
  if (!mount) return;
  if (!wave) {
    mount.textContent = "";
    return;
  }
  mount.textContent = wave.guide
    ? `Opens on "WAVE n · ${wave.name}" and its sentence, then on its guide — which waits for both seats.`
    : `Opens on "WAVE n · ${wave.name}" and its sentence, then plays. No guide: this wave introduces nothing new.`;
}
