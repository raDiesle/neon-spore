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

/**
 * Used to paint a sentence into `#waveBriefing` describing what a wave opens
 * on. Its guide-branch and no-guide-branch differed by one clause and read as
 * the same sentence twice — reasoning that belonged in the spec, not a label
 * repeated for whoever opens this panel every day. Left in place, rather than
 * deleted along with the call, because `main.ts` still runs it on every wave
 * switch and is outside what this task may touch.
 */
export function renderWaveOpening(_wave: Wave | undefined): void {
  document.getElementById("waveBriefing")?.replaceChildren();
}
