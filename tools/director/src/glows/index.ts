import type { SkinContext } from "../skins/types.js";
import { AURA } from "./aura.js";
import { BLOOM } from "./bloom.js";
import { EMISSIVE } from "./emissive.js";
import { HALO } from "./halo.js";
import { SPARKS } from "./sparks.js";
import { SWARM } from "./swarm.js";
import { TRAIL } from "./trail.js";
import type { GlowLayer } from "./types.js";

/**
 * Every way a body can throw light — or things — into the space around it.
 *
 * The fourth axis on SHAPES, beside SKINS, MOTIONS and LIGHT. It pairs against
 * LIGHT rather than duplicating it, and the pairing is the reason the axis has
 * this name: LIGHT is a body lit from *outside*, GLOW is a body lit by being
 * the thing that emits. `docs/tower-defence.md` frames those as the two honest
 * answers to the same question, and until now only the first could be drawn.
 *
 * The array below is the **only** place that knows which glows exist, the same
 * way `skins/index.ts` is for skins and `drafts/index.ts` is for drafts. A new
 * glow is one file beside this one and one line here; the id union, the
 * switcher, the OVERVIEW grid and the lookup all follow from the array.
 *
 * ## It stacks, and that is the whole reason it is not in `SKINS`
 *
 * A skin is exclusive — a body is drawn as MEMBRANE *or* as CARAPACE, and the
 * switcher is right to be radio buttons. A glow is not: BLOOM and TRAIL and
 * AURA are all on at once in any real engine, and the combination is the thing
 * the owner opens the page to judge. Folding these into `SKINS` would have
 * made `SkinId` mean two things and would have offered BLOOM *instead of*
 * MEMBRANE, which is the one combination that makes no sense.
 *
 * So `currentSkin()` returns one id and `currentGlows()` returns a set, and
 * every consequence of that difference is downstream of this file.
 *
 * ## Order comes from here, never from the reader
 *
 * `buildGlows` walks this array, not the order somebody ticked the boxes in.
 * Two readers who enable the same three glows must see the same picture, or a
 * screenshot is not evidence about anything.
 *
 * ## Nothing here touches `packages/render`
 *
 * Rule (a) in `docs/skins.md`, inherited whole. This is the tool learning to
 * draw a look so the owner can decide by looking at it; the game learning to
 * draw it is a separate decision, and CLAUDE.md's *A look is offered, never
 * replaced* is why the two are not the same action.
 */
export const GLOWS = [
  // Order is stacking order, bottom-first, and it is a picture rather than a
  // list: the cloud a group would share sits furthest back, then the two ways
  // an edge can bleed, then the fill, then the tail the body drags, and only
  // SPARKS is in front of the skin at all.
  SWARM,
  HALO,
  BLOOM,
  EMISSIVE,
  TRAIL,
  AURA,
  SPARKS,
] as const;

/** The id of a glow that exists, derived from the registry and never typed. */
export type GlowId = (typeof GLOWS)[number]["id"];

export type { Glow, GlowContext, GlowFrame, GlowLayer } from "./types.js";

/**
 * How far past its contour a figure wearing `ids` reaches, as a fraction of
 * the body's half-extent.
 *
 * The largest rather than the sum: two glows that each reach a third of the
 * way out overlap, they do not queue up, and padding for the sum would shrink
 * every card for room nothing is using.
 *
 * This is what keeps the cards from clipping. `shape-figure.ts` pads the
 * fitted box by it before working out the scale, so turning on HALO makes
 * every body slightly smaller instead of slicing its halo off at the frame
 * edge — which reads as the effect being broken rather than as the frame being
 * small, the same failure the own-motion fit exists to prevent.
 */
export function glowSpread(ids: readonly GlowId[]): number {
  let widest = 0;
  for (const g of GLOWS) if (ids.includes(g.id) && g.spread > widest) widest = g.spread;
  return widest;
}

/**
 * Build every enabled glow on one layer into the figure `ctx` belongs to.
 *
 * Called twice by `buildSkin` — once for `under` before the skin draws and
 * once for `over` after it — rather than once with a split inside, because the
 * skin has to be able to go between the two and only its caller knows when
 * that happened.
 */
export function buildGlows(ids: readonly GlowId[], layer: GlowLayer, ctx: SkinContext): void {
  for (const g of GLOWS) if (g.layer === layer && ids.includes(g.id)) g.build(ctx);
}
