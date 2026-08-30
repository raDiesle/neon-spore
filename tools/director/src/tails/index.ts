import type { SkinContext } from "../skins/types.js";
import { EMBERS } from "./embers.js";
import { HALOES } from "./haloes.js";
import { RIBBON } from "./ribbon.js";
import { SMOKE } from "./smoke.js";
import { STREAK } from "./streak.js";
import { WEDGE } from "./wedge.js";

/**
 * Everything a falling body can leave behind it.
 *
 * The sixth axis on SHAPES, and the first that is about the *field* rather
 * than the body. `types.ts` has the argument; the short version is that every
 * creature in this game falls down a column, that is the only motion the field
 * has, and no card on this page had ever shown it.
 *
 * ## Two of these are the game
 *
 * `HALOES` is what a slick and a bulb wear today; `WEDGE` is what a torch
 * wears. They carry `shipped`, the switcher marks them, and they are on the
 * axis **as controls**. A proposal judged against a memory of the shipped look
 * wins every time — CLAUDE.md's *a look is offered, never replaced* only means
 * something if the thing being offered against is on the same row.
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
export const TAILS = [SMOKE, WEDGE, RIBBON, HALOES, STREAK, EMBERS] as const;

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
