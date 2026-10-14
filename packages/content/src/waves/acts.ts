import type { Wave } from "../wave-types.js";
import { WAVES_ACT_1 } from "./act-1.js";
import { WAVES_ACT_1_P2 } from "./act-1-p2.js";
import { WAVES_ACT_1_P3 } from "./act-1-p3.js";
import { WAVES_ACT_1B } from "./act-1b.js";
import { WAVES_ACT_2 } from "./act-2.js";
import { WAVES_ACT_3 } from "./act-3.js";
import { WAVES_ACT_3_P2 } from "./act-3-p2.js";
import { WAVES_ACT_3_P3 } from "./act-3-p3.js";
import { WAVES_ACT_3_P4 } from "./act-3-p4.js";
import { WAVES_ACT_3B } from "./act-3b.js";
import { WAVES_ACT_3B_P2 } from "./act-3b-p2.js";
import { WAVES_ACT_4 } from "./act-4.js";
import { WAVES_ACT_4_P2 } from "./act-4-p2.js";
import { WAVES_ACT_4_P3 } from "./act-4-p3.js";
import { WAVES_ACT_4B } from "./act-4b.js";
import { WAVES_ACT_5 } from "./act-5.js";
import { WAVES_ACT_5_P2 } from "./act-5-p2.js";
import { WAVES_ACT_6 } from "./act-6.js";
import { WAVES_ACT_7 } from "./act-7.js";
import { WAVES_ACT_7A } from "./act-7a.js";
import { WAVES_ACT_7B } from "./act-7b.js";
import { WAVES_ACT_7C } from "./act-7c.js";
import { WAVES_ACT_7D } from "./act-7d.js";
import { WAVES_ACT_7E } from "./act-7e.js";
import { WAVES_ACT_7F } from "./act-7f.js";
import { WAVES_ACT_7G } from "./act-7g.js";
import { WAVES_ACT_8 } from "./act-8.js";
import { WAVES_ACT_8B } from "./act-8b.js";
import { WAVES_ACT_9 } from "./act-9.js";
import { WAVES_ACT_10 } from "./act-10.js";
import { WAVES_ACT_11 } from "./act-11.js";
import { WAVES_ACT_11B } from "./act-11b.js";
import { WAVES_ACT_12 } from "./act-12.js";
import { WAVES_ACT_13 } from "./act-13.js";
import { WAVES_ACT_13B } from "./act-13b.js";
import { WAVES_ACT_14 } from "./act-14.js";
import { WAVES_ACT_14B } from "./act-14b.js";

/**
 * **The act files, in the order of the game** — the one list of them.
 *
 * Written by the director's save (`tools/director/src/waves-acts.ts`), never
 * by hand: a save that fills an act past the 250-line ceiling cuts it into a
 * new file placed straight after it, and rewrites this list to say so. The
 * director reads its act table off this file too (`waves-act-files.ts`), so a
 * file cut on a save is one the next save already knows. `waves.ts` flattens
 * it into `WAVES`.
 *
 * The order is this array's, not the imports' — those are sorted by name, and
 * `act-3b.ts` plays between `act-3.ts` and `act-4.ts` whatever its name says.
 */
export const WAVE_ACTS: readonly (readonly Wave[])[] = [
  WAVES_ACT_1,
  WAVES_ACT_1_P2,
  WAVES_ACT_1_P3,
  WAVES_ACT_1B,
  WAVES_ACT_2,
  WAVES_ACT_3,
  WAVES_ACT_3_P2,
  WAVES_ACT_3_P3,
  WAVES_ACT_3_P4,
  WAVES_ACT_3B,
  WAVES_ACT_3B_P2,
  WAVES_ACT_4,
  WAVES_ACT_4_P2,
  WAVES_ACT_4_P3,
  WAVES_ACT_4B,
  WAVES_ACT_5,
  WAVES_ACT_5_P2,
  WAVES_ACT_6,
  WAVES_ACT_7,
  WAVES_ACT_7A,
  WAVES_ACT_7B,
  WAVES_ACT_7C,
  WAVES_ACT_7D,
  WAVES_ACT_7E,
  WAVES_ACT_7F,
  WAVES_ACT_7G,
  WAVES_ACT_8,
  WAVES_ACT_8B,
  WAVES_ACT_9,
  WAVES_ACT_10,
  WAVES_ACT_11,
  WAVES_ACT_11B,
  WAVES_ACT_12,
  WAVES_ACT_13,
  WAVES_ACT_13B,
  WAVES_ACT_14,
  WAVES_ACT_14B,
];
