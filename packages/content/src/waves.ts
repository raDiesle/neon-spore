import type { Wave } from "./wave-types.js";
import { WAVES_ACT_1 } from "./waves/act-1.js";
import { WAVES_ACT_2 } from "./waves/act-2.js";
import { WAVES_ACT_3 } from "./waves/act-3.js";

export type { Wave, WaveEntry, WaveGuide } from "./wave-types.js";

/**
 * Every wave in the game, in order. This file used to be the list itself, and
 * it grew a dozen lines a wave until it could not — `packages/sim/test/limits.test.ts`
 * carried the receipt. The list is now split by act into `waves/act-*.ts`, one
 * file per chapter of the game (`act-1.ts` is the tutorial arc ending on
 * `FINALE`, `act-2.ts` is the first five bosses back to back, `act-3.ts` is
 * everything after them); this file only concatenates them in order, so what
 * stands here stays short no matter how many waves the acts hold.
 *
 * `tools/director/src/serialize.ts` regenerates one act file at a time —
 * `serializeWaveArray` takes the export name (`WAVES_ACT_1`, `WAVES_ACT_2`,
 * `WAVES_ACT_3`) along with the array, so a save never touches this barrel.
 * A new act, once `act-3.ts` fills up in its own turn, is one more import and
 * one more spread here.
 */
export const WAVES: Wave[] = [...WAVES_ACT_1, ...WAVES_ACT_2, ...WAVES_ACT_3];
