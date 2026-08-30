import type { SkinContext } from "../skins/types.js";
import { DIM } from "./dim.js";
import { FLASH } from "./flash.js";
import { RING } from "./ring.js";
import { SHAKE } from "./shake.js";
import { SHARDS } from "./shards.js";
import { SQUASH } from "./squash.js";
import { TELEGRAPH } from "./telegraph.js";

/**
 * Everything a body can do at a moment: the announcement, the impact, and what
 * is left over.
 *
 * The fifth axis on SHAPES. `docs/glow.md` carries the argument for why it is
 * not seven more glows, and it is one sentence: everything on GLOW runs
 * forever on its own and can be judged by looking, everything here needs a
 * moment before there is anything to see. That difference is the *control* —
 * GLOW is a set of ticks, HITS needs a trigger, and one axis with two kinds of
 * control is two axes wearing one heading.
 *
 * Like `GLOWS` and `SKINS`, this array is the **only** place that knows which
 * hits exist. A new one is one file beside this and one line here.
 *
 * ## It stacks, like GLOW and unlike SKIN
 *
 * FLASH and SHAKE and RING together is not three effects fighting, it is one
 * impact — the received wisdom in the field is that most good effects are
 * three to five simple layers stacked, and this axis is where that is true
 * rather than a slogan. So the control is ticks, and the order is the array's.
 *
 * ## Order is the order of the event, not a stacking whim
 *
 * The array runs before, impact, after, and reads down as the thing happening.
 * That is also correct as paint order: the wind-up sits behind, the impact is
 * on the body, and the debris and the shockwave are in front of what threw
 * them.
 */
export const HITS = [TELEGRAPH, DIM, FLASH, SQUASH, SHAKE, RING, SHARDS] as const;

/** The id of a hit that exists, derived from the registry and never typed. */
export type HitId = (typeof HITS)[number]["id"];

export type { Hit, HitContext, HitFrame, HitMoment } from "./types.js";

/**
 * How far past its contour a figure wearing `ids` reaches, as a fraction of
 * the body's half-extent. The largest and never the sum, for the same reason
 * `glowSpread` takes the largest: two effects that each reach out overlap,
 * they do not queue, and padding for the sum shrinks every card to leave room
 * nothing uses.
 *
 * A twin of `glowSpread` rather than a shared helper, because the two axes
 * must be able to move apart — RING already reaches nearly twice as far as any
 * glow, and folding them into one function would be an invitation to give them
 * one number.
 */
export function hitSpread(ids: readonly HitId[]): number {
  let widest = 0;
  for (const h of HITS) if (ids.includes(h.id) && h.spread > widest) widest = h.spread;
  return widest;
}

/** Build every enabled hit into the figure `ctx` belongs to. */
export function buildHits(ids: readonly HitId[], ctx: SkinContext): void {
  for (const h of HITS) if (ids.includes(h.id)) h.build(ctx);
}
