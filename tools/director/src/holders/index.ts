import { COLLAR } from "./collar.js";
import { CRADLE } from "./cradle.js";
import { CRANE } from "./crane.js";
import type { Holder } from "./types.js";

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
 * A spread beats three variations of one idea: the question worth putting to a
 * pair of eyes is not "which collar" but "is she a creature that grew a socket
 * or a creature carrying a machine", and the answer to that decides what every
 * later boss is allowed to have.
 *
 * This list is the only place that knows which drafts exist — a fourth is one
 * file beside this one and one line here. **Nothing in this folder touches
 * `packages/render`'s draw path**, which is `skins/index.ts`'s doctrine and
 * the reason the owner can look at all three without any of them shipping.
 * The one thing it does import from render is `drawTorchRock` itself, so the
 * rock in every card is the game's own and the comparison is between holders.
 */
export const HOLDERS: readonly Holder[] = [COLLAR, CRANE, CRADLE];

export type { Holder, HolderContext, HolderFrame } from "./types.js";
export { BEAT_SECONDS, CYCLE_BEATS } from "./types.js";
