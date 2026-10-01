import type { RoundKind } from "@neon-spore/sim";
import type { StrikeFrame } from "./boss-strike-look.js";
import type { Layout } from "./layout.js";
import type { Impact } from "./rock-impact-state.js";
import { paintWindow } from "./round-strike-window.js";

/**
 * **What a round's own timeout hit looks like** — the slot the round's
 * window is painted through. An interlude whose meter ran out unattended breaks the hull
 * with a breach that names the round (`sim/boss-strike.ts`,
 * `roundStrikesHull`). The game paints it as the round's own window closing
 * on the struck column (`round-strike-window.ts`, taken from VERSUS on 1
 * October 2026) rather than as a rock (`rock-impact.ts`).
 *
 * While `ROUND_STRIKE_LOOK.paint` is null the round's hit is exactly the rock
 * it always was, which a test and a later candidate can still ask for. Set, it is drawn *in place of* the
 * rock's body, tail, glow and roll marks — the hit's own clock is the rock's
 * replay, so the sparks, the crack and the hole still come the frame the
 * rock's fall would have touched the skin. `reach` runs 0→1 over that fall
 * and `after` 0→1 over `AFTER` seconds once it has.
 */

export interface RoundStrikeFrame extends Omit<StrikeFrame, "blow"> {
  round: RoundKind;
}

export type RoundStrikePaint = (ctx: CanvasRenderingContext2D, f: RoundStrikeFrame) => void;

/** The slot, filled with the round's window. */
export const ROUND_STRIKE_LOOK: { paint: RoundStrikePaint | null } = { paint: paintWindow };

/** How long the hit's afterglow runs once it has reached the skin: a boss
 * blow's withdrawal (`boss-strike-fx.ts`). */
const AFTER = 0.4;

/**
 * Paints a round's hit in the rock's place and says so, or does nothing and
 * says it did not — a rock that names no round, or no paint in the slot.
 * `x` is where the rock is, `skinY` the skin under it.
 */
export function drewRoundStrike(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  im: Impact,
  x: number,
  skinY: number,
  time: number,
): boolean {
  const paint = ROUND_STRIKE_LOOK.paint;
  if (im.round === undefined || paint === null) return false;
  const after = Math.min(1, Math.max(0, (im.t - im.fallLife) / AFTER));
  if (after >= 1) return true;
  paint(ctx, {
    l,
    round: im.round,
    from: { x, y: im.y0 },
    to: { x, y: skinY },
    reach: Math.min(1, im.t / im.fallLife),
    after,
    tile: l.tile,
    time,
  });
  return true;
}
