import type { Color, CreatureKind } from "@neon-spore/sim";
import { isWardable } from "@neon-spore/sim";
import { PALETTE } from "./palette.js";

/**
 * **The colour a breach is drawn in**, and the one copy of it.
 *
 * An impact is painted in the colour of the thing that made it — the rule the
 * bursts in `effects-breach.ts` were written to, one branch at a time, and the
 * rule a strike (`breach-strike.ts`) has to obey as well or the two halves of
 * one hit would disagree about what hit the ship. Two copies of a mapping from
 * a kind to a hue is exactly what `purity.test.ts`'s sweep is for, so it lives
 * here and both read it.
 *
 * Four answers, and each is a fact about the creature rather than about
 * damage. A wall is a live wire and arrives in its own blue. A gum is venom
 * and arrives in it. A rock is stone, except the torch, which is carrying a
 * flame. Everything else is drawn in what it was shot with, and red for the
 * colourless — a throb, a shell nobody opened, a round that costs the hull
 * with nothing on the field at all.
 */
export function breachHue(kind: CreatureKind, color: Color | null): string {
  if (kind === "fence") return PALETTE.arc;
  if (kind === "gum") return PALETTE.venom;
  if (isWardable(kind)) return kind === "torch" ? PALETTE.ember : PALETTE.rock;
  return color === "cyan" ? PALETTE.cyan : PALETTE.red;
}
