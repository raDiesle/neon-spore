import { COLLAR } from "./collar.js";
import { CRADLE } from "./cradle.js";
import { CRANE } from "./crane.js";
import { HAIRLINE } from "./hairline.js";
import type { QueenVariant } from "./queen-shared.js";
import type { Holder } from "./types.js";
import { UNDERGLOW } from "./underglow.js";
import { WITHDRAWAL } from "./withdrawal.js";

/**
 * Three answers to one question the game does not currently answer at all.
 *
 * BULB QUEEN's flanking torches are drawn by `queen-egg.ts` as a bare rock in
 * the flank column, with **nothing holding them**. The owner asked for the
 * picture to say why the rock stays there, sent a reference of a sphere seated
 * in a collar, suggested a crane arm as one way, and asked for three drafts to
 * choose between rather than one applied.
 *
 * The three are spread on one axis on purpose — **how much of the holder is
 * machine and how much is her**:
 *
 * - `COLLAR` is a socket she grew. Closest to the reference.
 * - `CRANE` is a mechanism bolted to her. The owner's own suggestion.
 * - `CRADLE` is her own body doing the holding, and nothing else.
 *
 * **CRADLE won** — decided by eye against `7ddfe14` — and it is
 * the baseline holder the three whole-body drafts below use for both flanks.
 * COLLAR and CRANE stay listed: a winner with nothing beside it is a winner
 * nobody can re-judge later.
 *
 * This list is the only place that knows which drafts exist — a fourth is one
 * file beside this one and one line here. **Nothing in this folder touches
 * `packages/render`'s draw path**, which is `skins/index.ts`'s doctrine and
 * the reason the owner can look at all three without any of them shipping.
 * The one thing it does import from render is `drawTorchRock` itself, so the
 * rock in every card is the game's own and the comparison is between holders.
 */
export const HOLDERS: readonly Holder[] = [COLLAR, CRANE, CRADLE];

/**
 * Three whole-body drafts for BULB QUEEN herself, CRADLE at both flanks in
 * all three, spread on a second axis: **how much of her condition the body
 * itself admits, before the petal row or the sink confirm it.** `HAIRLINE`
 * says all of it, permanently, in the shell. `UNDERGLOW` says it as light
 * without touching the outline. `WITHDRAWAL` says it as posture alone. Each
 * carries the five load-bearing properties `queen.ts` and `queen-egg.ts`
 * state — see `queen-shared.ts`, which every one of them calls into rather
 * than re-deriving.
 */
export const QUEEN_VARIANTS: readonly QueenVariant[] = [HAIRLINE, UNDERGLOW, WITHDRAWAL];

export { type QueenCycle, queenCycleAt } from "./queen-cycle.js";
export type { QueenVariant } from "./queen-shared.js";
export type { Holder, HolderContext, HolderFrame } from "./types.js";
export { BEAT_SECONDS, CYCLE_BEATS } from "./types.js";
