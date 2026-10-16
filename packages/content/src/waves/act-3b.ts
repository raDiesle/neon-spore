import type { Wave } from "../wave-types.js";

/**
 * The second half of act three, cut off `act-3.ts` when that file reached the
 * 250-line ceiling on `THE VEIL`.
 *
 * **`3b` and not `6`, because the order of the waves is the order of the
 * game.** An act file is a page rather than a chapter — the cut is where the
 * file filled up, not where the game changes subject — so this one is spread
 * between act three and act four in `waves.ts`, and a name that sorted after
 * act five would say the opposite of where it stands. `THE VANE` is a boss and
 * the three after it are the mechanics that follow it, in the order they
 * always read in.
 *
 * Adding one `scene:` line to a wave in act three had cost two rounds of
 * shaving a sentence out of a comment to stay under the limit, which is the
 * warning `packages/sim/test/limits.test.ts` exists to give. New waves still
 * land in the newest act rather than here — the director's save splits an
 * incoming list across the act files at each one's current length and gives
 * the last of them whatever is left (`tools/director/src/waves-acts.ts`).
 *
 * **THE VANE carries no guide**, THE INSTAR's way: the owner, 30 September
 * 2026, *remove the tutorial, not required*. The mouth of the split says
 * `FIRE` in the colour it takes, and the cannon says `MOVE`, so the field
 * already says what the film did. The comment is up here because the
 * director writes this file back and keeps nothing between a wave's braces.
 */
export const WAVES_ACT_3B: Wave[] = [];
