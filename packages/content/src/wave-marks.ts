import { firstOnPanel } from "./control-sets.js";
import type { Wave } from "./wave-types.js";

/**
 * **Which of the four marks a wave carries** — a boss, a panel, a guide, a
 * fault. The director's rail draws them in front of a wave's name and filters
 * on them (`tools/director/src/rail-marks.ts`), and JUMP TO WAVE offers the
 * same four as pressable words (`apps/game/src/menu-wave-filter.ts`).
 *
 * It was written in both until 30 September 2026, the second a copy because
 * the game must not import a dev tool. It lives here, next to `firstOnPanel`,
 * because it is a question about content and nothing else: each side keeps
 * its own glyphs and its own words, and neither decides what a mark means.
 *
 * **The panel mark is the first wave, from the top, played on each panel** —
 * the ordinary one included: SALVAGE hands the pair the standard panel's last
 * button, and a list that marked only the unusual panels would say nothing
 * about it. Every wave on a panel that is not the ordinary one carried it
 * until the owner, 17 October 2026: *in waves list, show only icon for
 * different control set, if it is used the first time starting from top.*
 *
 * Takes its list as an argument, as `firstOnPanel` does: the director asks it
 * of a list that is not on disk yet.
 */

/** The marks, in the order a row draws them. */
export const WAVE_MARK_IDS = ["boss", "control", "card", "fault"] as const;

export type WaveMarkId = (typeof WAVE_MARK_IDS)[number];

/** Which marks the wave at `index` carries, in `WAVE_MARK_IDS` order. */
export function waveMarksOn(waves: readonly Wave[], index: number): WaveMarkId[] {
  const wave = waves[index];
  if (!wave) return [];
  const out: WaveMarkId[] = [];
  if (wave.boss) out.push("boss");
  if (firstOnPanel(waves, index)) out.push("control");
  if (wave.guide) out.push("card");
  if (wave.faults?.length) out.push("fault");
  return out;
}
