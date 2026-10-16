import type { SimConfig } from "@neon-spore/sim";
import type { GroupName } from "./ship-groups.js";

/**
 * THE BLISTER's numbers, sorted into their card — cut out of `ship-fields.ts`
 * when they became one row a gesture (16 October 2026, `config-blister.ts`),
 * for `ship-fields-balloon.ts`' reason and with its `satisfies`.
 */
const G = "THE BLISTER — a body one of you knocks down where the other says" as const;

export const BLISTER_FIELDS = {
  blisterTapUpBeats: G,
  blisterHoldUpBeats: G,
  blisterSwipeUpBeats: G,
  blisterTurnUpBeats: G,
  blisterRubUpBeats: G,
  blisterComboUpBeats: G,
  blisterLeverUpBeats: G,
  blisterTapBlows: G,
  blisterHoldBlows: G,
  blisterSwipeBlows: G,
  blisterTurnBlows: G,
  blisterRubBlows: G,
  blisterComboBlows: G,
  blisterLeverBlows: G,
  blisterHoldMilli: G,
  blisterSwipeMilli: G,
  blisterComboMilli: G,
  blisterTurnMilli: G,
  blisterLeverHoldMilli: G,
  blisterDownBeats: G,
  blisterLeverMilli: G,
  blisterLeverFromMilli: G,
  blisterLeverToMilli: G,
} as const satisfies Partial<Record<keyof SimConfig, GroupName>>;
