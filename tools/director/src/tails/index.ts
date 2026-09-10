import type { SkinContext } from "../skins/types.js";
import { BRAID } from "./braid.js";
import { CINDERS } from "./cinders.js";
import { EMBERS } from "./embers.js";
import { FLAME } from "./flame.js";
import { HALOES } from "./haloes.js";
import { PLUME } from "./plume.js";
import { RIBBON } from "./ribbon.js";
import { SMOKE } from "./smoke.js";
import { STREAK } from "./streak.js";
import { WAKE } from "./wake.js";
import { WEDGE } from "./wedge.js";

/**
 * Everything a falling body can leave behind it.
 *
 * The sixth axis on SHAPES, and the first that is about the *field* rather
 * than the body. `types.ts` has the argument; the short version is that every
 * creature in this game falls down a column, that is the only motion the field
 * has, and no card on this page had ever shown it.
 *
 * ## Three of these are the game, and two of them used to be
 *
 * `SMOKE` is what every living body wears today; `WEDGE` is what a torch
 * wears; `FLAME` is a dart's thrust, which SHOCK strings its knots down. They
 * carry `shipped`, the switcher marks them, and they are on the axis **as
 * controls**. A proposal judged against a memory of the shipped look
 * wins every time — CLAUDE.md's *a look is offered, never replaced* only means
 * something if the thing being offered against is on the same row.
 *
 * `HALOES` and `PLUME` are the other half of that rule. Both were the game
 * until 8 September 2026 — the halos behind a slick and a bulb, and the hard
 * tongue behind a dart — and both lost to something the owner picked instead.
 * A look that is taken out is kept where it can be seen, and this is where a
 * mark left behind a body is seen.
 *
 * `WAKE` came from somewhere else again: it was a VERSUS candidate for the
 * dart alone, and it is here because what it actually proposes — rungs rather
 * than a ribbon — is a claim about every falling body and not about one
 * creature. `BRAID` and `CINDERS` followed it on 10 September 2026, the
 * second time the dart's slot was answered: the owner took SHOCK and asked
 * for the two it beat, and the flame they were judged against, to be kept
 * where they can be browsed.
 *
 * `docs/shipped-looks.md` is the long version: what the renderer actually
 * draws for each creature, effect by effect.
 *
 * ## It stacks, like GLOW and HIT
 *
 * A wedge with embers coming off it is one tail rather than two, and it is
 * very nearly what a burning rock ought to look like. Order is this array's,
 * drawn back to front: the broad soft things first, the hard ones over them.
 */
export const TAILS = [
  SMOKE,
  WEDGE,
  FLAME,
  RIBBON,
  HALOES,
  PLUME,
  BRAID,
  WAKE,
  CINDERS,
  STREAK,
  EMBERS,
] as const;

/** The id of a tail that exists, derived from the registry and never typed. */
export type TailId = (typeof TAILS)[number]["id"];

export type { Tail, TailContext, TailFrame } from "./types.js";

/**
 * How far above the contour a tail stack reaches, as a multiple of the body's
 * height. The largest, not the sum — two tails overlap rather than queueing.
 *
 * **Upward only**, which is what makes this a different function from
 * `glowSpread` and `hitSpread` rather than a third copy of them. A tail
 * reaches behind and nothing in front, and padding the frame evenly for it
 * would waste as much room below the body as it used above.
 */
export function tailReach(ids: readonly TailId[]): number {
  let far = 0;
  for (const t of TAILS) if (ids.includes(t.id) && t.reachUp > far) far = t.reachUp;
  return far;
}

/**
 * Build every enabled tail into the figure.
 *
 * Called before the glows, so a tail sits behind everything: it is the one
 * thing on this page that is unambiguously *behind* the body rather than on it
 * or around it.
 */
export function buildTails(ids: readonly TailId[], ctx: SkinContext): void {
  for (const t of TAILS) if (ids.includes(t.id)) t.build(ctx);
}
