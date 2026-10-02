import { isGlyph } from "./glyphs.js";
import { mimicBoss, mimicDraws } from "./mimic.js";
import { mimicPeeled, mimicWrong } from "./mimic-step.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * THE MIMIC's one hand: a sign drawn on the glass, heard as the `glyph`
 * command the drawing phone recognised.
 *
 * **Only a seat with a sign to draw is heard** (`mimicDraws`): the reader has
 * no pad, and a half already peeled has nothing left to answer, so a glyph
 * from either is dropped. The sign is judged the instant it lands — the
 * one it names is the one the skin wears now, so a sign drawn after a change
 * has to be the new one.
 */
export function mimicHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "glyph") return;
  const s = mimicBoss(world);
  if (s === null || !mimicDraws(s, player) || !isGlyph(command.sign)) return;
  const side: 0 | 1 = player === 1 ? 0 : 1;
  if (command.sign === s.signs[side]) mimicPeeled(world, s, side);
  else mimicWrong(world, s, side, command.sign);
}
