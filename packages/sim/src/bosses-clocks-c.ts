/**
 * **The bosses that are a clock, the third page** — THE WARDEN's openness,
 * and whatever the second page hands across after it.
 *
 * Cut on 22 September 2026, when THE BELLOWS's names would have put
 * `bosses-clocks-b.ts` a line or two over its 250-line limit, along the seam
 * every overflowing page here uses: the **last** rows go, never the boss
 * being worked on, whose block stays under the comment that explains it. THE
 * WARDEN was last on page two alphabetically and last in nothing else, which
 * is the whole of why it is the one that moved.
 *
 * Page two re-exports this whole page, so `bosses-clocks.ts` still reaches
 * the chain with one line and nothing outside `packages/sim` knows there are
 * three.
 */

// THE WARDEN's three phases, read as one openness: the eye under the rope,
// under the rope and a thumb, and under a thrown hatch (`warden-open.ts`).
export {
  wardenEyeOpen,
  wardenHatchMilli,
  wardenLidsMilli,
  wardenThrown,
} from "./warden-open.js";
