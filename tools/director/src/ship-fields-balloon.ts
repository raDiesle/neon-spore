import type { SimConfig } from "@neon-spore/sim";
import type { GroupName } from "./ship-groups.js";

/**
 * THE BALLOON's eight numbers, sorted into their card.
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
  balloonSplits: "THE BALLOON — a body that goes up, opened by two hands at once",
  balloonTautMilli: "THE BALLOON — a body that goes up, opened by two hands at once",
  balloonHandleMilli: "THE BALLOON — a body that goes up, opened by two hands at once",
  damageBalloonBurst: "THE BALLOON — a body that goes up, opened by two hands at once",
  scoreBalloonRub: "SCORE",
  scoreBalloonPop: "SCORE",
} satisfies Partial<Record<keyof SimConfig, GroupName>>;
