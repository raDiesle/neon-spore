/**
 * **The clock bosses' half of the surface, the fourth page** — THE WELL's face
 * and the thumb on its seam.
 *
 * Cut when THE VALVE's window lengths took `boss-surface-clocks-c.ts` to 253
 * lines against a 250-line limit, along the seam the third page was cut on:
 * the **last** rows the full page held go across whole, with their comment.
 * Page three re-exports this one, so nothing reaching for a name through
 * `@neon-spore/sim` knows there are four.
 *
 * The rule the first page states holds here unchanged: a name on these pages
 * is one something outside `packages/sim` imports.
 */

// THE WELL's face, and the thumb on its seam: how far it has turned and which
// way it is read, for the projection that draws it (`render/well-roll.ts`),
// the hit test that answers it (`render/touch-well.ts`) and the director's
// hand. On a clocks page at all because `boss-surface.ts` is at its limit
// (`well.ts`).
export {
  NO_WELL_GRIP,
  WELL_PHASES,
  type WellPhase,
  type WellState,
  wellBoss,
  wellHeldNow,
  wellHoldLeft,
  wellMaxOffsetMilli,
} from "./well.js";
