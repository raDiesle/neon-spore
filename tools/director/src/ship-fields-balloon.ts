import type { SimConfig } from "@neon-spore/sim";
import type { GroupName } from "./ship-groups.js";

/**
 * THE BALLOON's ten numbers, sorted into their card.
 *
 * Cut out of `ship-fields.ts` when this creature took that file over its
 * 250-line limit — the first cut it has ever needed, and the seam is the one
 * that file's own header implies: it is a lookup from a `SimConfig` key to a
 * card, so a group of keys lifts out cleanly and the parent spreads it back
 * in. Nothing reads its key order.
 *
 * `satisfies` rather than an annotation, and it has to be: an annotated
 * `Partial<…>` widens every value to `GroupName | undefined`, and the parent
 * spreading one of those is no longer total — which is the one property this
 * whole arrangement exists for. Checked here, exact there.
 */
export const BALLOON_FIELDS = {
  balloonSwellBeats: "THE BALLOON — a body that goes up, opened by two hands at once",
  balloonRiseRows: "THE BALLOON — a body that goes up, opened by two hands at once",
  balloonClimbBeats: "THE BALLOON — a body that goes up, opened by two hands at once",
  balloonSplits: "THE BALLOON — a body that goes up, opened by two hands at once",
  balloonTautMilli: "THE BALLOON — a body that goes up, opened by two hands at once",
  balloonHoldBeats: "THE BALLOON — a body that goes up, opened by two hands at once",
  balloonHandleMilli: "THE BALLOON — a body that goes up, opened by two hands at once",
  // THE GUM's three ride along here rather than in a fourth file: the same
  // seam, a creature with a handle on it that player 2 works.
  gumSwipeMilli: "THE GUM — a mass stuck to the ship, swiped off by the seat without the cannon",
  gumSpreadCols: "THE GUM — a mass stuck to the ship, swiped off by the seat without the cannon",
  // And THE CHOKE's three, on the gum's terms: a body on the ship with a
  // gesture on it, this time the seat whose control it took.
  chokeTaps: "THE CHOKE — a body on the cannon, tapped off by the seat whose cannon it was",
  chokeSweepBeats: "THE CHOKE — a body on the cannon, tapped off by the seat whose cannon it was",
  // And the clingers' four: a body on a control, shaken off by moving it.
  limpetStillBeats: "THE LIMPET — a body on the plate that goes off if the plate stands still",
  limpetShakeMoves: "THE LIMPET — a body on the plate that goes off if the plate stands still",
  leechStillBeats: "THE LEECH — a body on the cannon that goes off if the cannon stands still",
  leechShakeMoves: "THE LEECH — a body on the cannon that goes off if the cannon stands still",
} satisfies Partial<Record<keyof SimConfig, GroupName>>;
