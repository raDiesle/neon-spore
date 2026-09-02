import type { Wave } from "./wave-types.js";
import { WAVES_ACT_1 } from "./waves/act-1.js";
import { WAVES_ACT_2 } from "./waves/act-2.js";
import { WAVES_ACT_3 } from "./waves/act-3.js";
import { WAVES_ACT_4 } from "./waves/act-4.js";

export type { Wave, WaveEntry, WaveGuide } from "./wave-types.js";

/**
 * Every wave in the game, in order. This file used to be the list itself, and
 * it grew a dozen lines a wave until it could not — `packages/sim/test/limits.test.ts`
 * carried the receipt. The list is now split by act into `waves/act-*.ts`, one
 * file per chapter of the game (`act-1.ts` is the tutorial arc ending on
 * `FINALE`, `act-2.ts` is the first five bosses back to back, `act-3.ts` is
 * everything after them, `act-4.ts` is where new waves land now); this file
 * only concatenates them in order, so what stands here stays short no matter
 * how many waves the acts hold.
 *
 * `tools/director/src/serialize.ts` regenerates one act file at a time —
 * `serializeWaveArray` takes the export name (`WAVES_ACT_1`, `WAVES_ACT_2`,
 * …) along with the array, so a save never touches this barrel. A new act,
 * once the newest one fills up in its own turn, is one more import and one
 * more spread here — which is exactly what `act-4.ts` cost.
 */
export const WAVES: Wave[] = [...WAVES_ACT_1, ...WAVES_ACT_2, ...WAVES_ACT_3, ...WAVES_ACT_4];
