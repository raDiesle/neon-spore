/**
 * THE MANTLE's four pull-together thresholds: the summed depth of both
 * handles, thousandths of a tile, that shears each plate-pair.
 *
 * Escalating, and the last is the steepest: a pair pulling near their own
 * limit on the first threshold has room to spare, and none on the last,
 * which is §23's own closing beat — the last pair sits stiffer than the
 * rest. `mantleFloorMilli` (500) is the per-handle floor every one of these
 * is checked against as well as the sum (`sim/mantle.ts` `mantleCharged`).
 */
export const MANTLE_SCRIPT: readonly number[] = [1400, 1700, 1900, 2200];
