import type { RoundKind } from "@neon-spore/sim";
import type { StrikeFrame } from "./boss-strike-look.js";
import type { Layout } from "./layout.js";
import type { Impact } from "./rock-impact-state.js";

/**
 * **What a round's own timeout hit looks like** — the slot a VERSUS candidate
 * paints into. An interlude whose meter ran out unattended breaks the hull
 * with a breach that names the round (`sim/boss-strike.ts`,
 * `roundStrikesHull`), and today that breach is still drawn as a rock
 * (`rock-impact.ts`), which is the look a candidate is offered beside.
 *
 * `ROUND_STRIKE_LOOK.paint` is null in the game, and while it is the round's
 * hit is exactly the rock it always was. Set, it is drawn *in place of* the
 * rock's body, tail, glow and roll marks — the hit's own clock is the rock's
 * replay, so the sparks, the crack and the hole still come the frame the
 * rock's fall would have touched the skin. `reach` runs 0→1 over that fall
 * and `after` 0→1 over `AFTER` seconds once it has.
 */

export interface RoundStrikeFrame extends Omit<StrikeFrame, "blow"> {
  round: RoundKind;
}

export type RoundStrikePaint = (ctx: CanvasRenderingContext2D, f: RoundStrikeFrame) => void;

/** The slot. Only a VERSUS candidate ever sets it. */
export const ROUND_STRIKE_LOOK: { paint: RoundStrikePaint | null } = { paint: null };

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
