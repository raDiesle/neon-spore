import type { SimConfig } from "@neon-spore/sim";
import type { GroupName } from "./ship-groups.js";

/**
 * The `BossConfig` fields of every boss that is not choreographed — the
 * queen, the warden, the cairn, the mirror, the maze, the vane, the splice,
 * the reprise and the well — sorted into their cards.
 *
 * Cut out of `ship-fields.ts` on 26 September 2026, when that file sat at its
 * line ceiling, on the seam `ship-fields-balloon.ts` names: a group of keys
 * lifts out and the parent spreads it back in, at the place the rows stood,
 * so the order `fieldsIn` returns does not move. `satisfies` for the reason
 * that file gives.
 */
export const BOSS_FIELDS = {
  queenRow: "QUEEN",
  queenEggGrowShare: "QUEEN",
  queenHoldBeats: "QUEEN",
  wardenRow: "WARDEN",
  wardenCycleBeats: "WARDEN",
  wardenHangRows: "WARDEN",
  wardenTautMilli: "WARDEN",
  wardenPlates: "WARDEN",
  wardenThrowMilli: "WARDEN",
  wardenThrowBeats: "WARDEN",
  cairnRow: "THE CAIRN — a pile of rocks taken apart by hand",
  cairnUnits: "THE CAIRN — a pile of rocks taken apart by hand",
  cairnShedBeats: "THE CAIRN — a pile of rocks taken apart by hand",
  cairnHoldBeats: "THE CAIRN — a pile of rocks taken apart by hand",
  mirrorRow: "MIRROR",
  mirrorCarryMilli: "MIRROR",
  mirrorHoldBeats: "MIRROR",
  mirrorHoldWindowBeats: "MIRROR",
  mazeRow: "MAZE",
  mazeSpanMilli: "MAZE",
  mazeTurnMilli: "MAZE",
  mazeDragMilliPerTile: "MAZE",
  mazeDragBreakMilli: "MAZE",
  mazeSnapMilli: "MAZE",
  mazeHeartPullMilli: "MAZE",
  mazeGripBeats: "MAZE",
  vanePins: "VANE",
  vanePinBeats: "VANE",
  vaneHaulMilli: "VANE",
  spliceEntranceRows: "THE SPLICE — straws fed in the order the numbers say",
  spliceTopRow: "THE SPLICE — straws fed in the order the numbers say",
  spliceFeedBeats: "THE SPLICE — straws fed in the order the numbers say",
  spliceEatBeats: "THE SPLICE — straws fed in the order the numbers say",
  repriseBeats: "THE REPRISE — the wave sent again unseen",
  // THE WELL's clock: the rest before the face starts to slip, how fast it
  // slips, how far it slips before it stops, and how long a thumb on the seam
  // can hold it still (`sim/config-well.ts`). The first dials this boss has
  // had — it shipped as a projection with nothing to turn.
  wellStillBeats: "THE WELL — the field drawn inside out on one screen",
  wellRollMilli: "THE WELL — the field drawn inside out on one screen",
  wellRollSectors: "THE WELL — the field drawn inside out on one screen",
  wellHoldBeats: "THE WELL — the field drawn inside out on one screen",
} satisfies Partial<Record<keyof SimConfig, GroupName>>;
