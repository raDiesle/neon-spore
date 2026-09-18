import type { SimEvent } from "@neon-spore/sim";

/**
 * **The bosses' half of the not-a-burst list, the second page** — from THE
 * FILAMENT on.
 *
 * Cut when THE FILAMENT's ten rows would have put
 * `effects-spark-silent-boss.ts` over its 250-line limit, the seam
 * `effects-ingest-silent-boss-b.ts` cut a boss earlier: the order the bosses
 * were built in. `SILENT` spreads this in place after the first page, so
 * `isSilent` still narrows and `burstFor`'s `assertNever` still catches an
 * event named on neither.
 *
 * Every row means what it means there — *no burst answers this event* — and
 * the reasons stay with the rows.
 */
export const SILENT_BOSS_B = [
  // THE FILAMENT's ten throw no burst from this table: they are one family
  // read above the loop, the way THE INSTAR's are, and every burst of theirs
  // — on the tile drawn, on the head that snapped, on the body a filament
  // came out of — is thrown by `filament-fx.ts` (`docs/spec/bosses.md` §11.33).
  "filamentEnter",
  "filamentArm",
  "filamentDrawn",
  "filamentFollowed",
  "filamentSnap",
  "filamentRecoil",
  "filamentDark",
  "filamentPulled",
  "filamentDown",
  "filamentOut",
  // THE MIRROR's pin throws a ring off both lobes, not a burst: `mirror-grip-fx.ts`.
  "mirrorGrip",
  // THE GORGE's two thumbs and the clench throw none until the look lane
  // draws the rings they are taken on (`sim/gorge-hand.ts`).
  "gorgePinch",
  "gorgePry",
  "gorgeClench",
] as const satisfies readonly SimEvent["type"][];
