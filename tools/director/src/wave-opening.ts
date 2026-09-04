import { guideSteps, type Wave } from "@neon-spore/content";

/**
 * What the wave being edited puts in front of a pair before it starts, read
 * off the store's own live entry rather than off `WAVES` on disk — an unsaved
 * edit shows here immediately, before it is saveable at all.
 *
 * This used to run `openBriefings` over the wave's queue, pods and boss to
 * work out which catalogue cards it would raise. There is nothing to derive
 * now: a wave opens on the guide it carries, page by page, and on its own name
 * — which is the guide's last page where there is one and a screen of its own
 * where there is not (`packages/sim/src/guide-steps.ts`). The note is short
 * because the fact is.
 */

/** The screens this wave opens on, in order, as the pair meets them. */
export function waveOpeningStates(wave: Wave | undefined): string[] {
  if (!wave) return [];
  const pages = guideSteps(wave.guide);
  if (pages === 0) return ["INTRODUCTION"];
  const out: string[] = [];
  for (let i = 0; i < pages; i++) out.push(`GUIDE ${i + 1}`);
  out.push("INTRODUCTION + READY");
  return out;
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
