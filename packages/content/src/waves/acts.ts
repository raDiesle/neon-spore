import type { Wave } from "../wave-types.js";
import { WAVES_ACT_1 } from "./act-1.js";
import { WAVES_ACT_1_P2 } from "./act-1-p2.js";
import { WAVES_ACT_1_P3 } from "./act-1-p3.js";
import { WAVES_ACT_1B } from "./act-1b.js";
import { WAVES_ACT_2 } from "./act-2.js";
import { WAVES_ACT_3 } from "./act-3.js";
import { WAVES_ACT_4 } from "./act-4.js";
import { WAVES_ACT_5 } from "./act-5.js";
import { WAVES_ACT_6 } from "./act-6.js";
import { WAVES_ACT_7 } from "./act-7.js";
import { WAVES_ACT_8 } from "./act-8.js";
import { WAVES_ACT_9 } from "./act-9.js";
import { WAVES_ACT_10 } from "./act-10.js";
import { WAVES_ACT_11 } from "./act-11.js";
import { WAVES_ACT_12 } from "./act-12.js";
import { WAVES_ACT_13 } from "./act-13.js";
import { WAVES_ACT_14 } from "./act-14.js";
import { WAVES_ACT_15 } from "./act-15.js";
import { WAVES_ACT_16 } from "./act-16.js";
import { WAVES_ACT_17 } from "./act-17.js";
import { WAVES_ACT_18 } from "./act-18.js";
import { WAVES_ACT_19 } from "./act-19.js";
import { WAVES_ACT_20 } from "./act-20.js";
import { WAVES_ACT_21 } from "./act-21.js";
import { WAVES_ACT_22 } from "./act-22.js";
import { WAVES_ACT_23 } from "./act-23.js";
import { WAVES_ACT_24 } from "./act-24.js";
import { WAVES_ACT_25 } from "./act-25.js";
import { WAVES_ACT_26 } from "./act-26.js";
import { WAVES_ACT_27 } from "./act-27.js";
import { WAVES_ACT_28 } from "./act-28.js";
import { WAVES_ACT_29 } from "./act-29.js";
import { WAVES_ACT_30 } from "./act-30.js";
import { WAVES_ACT_31 } from "./act-31.js";
import { WAVES_ACT_32 } from "./act-32.js";
import { WAVES_ACT_33 } from "./act-33.js";
import { WAVES_ACT_34 } from "./act-34.js";
import { WAVES_ACT_35 } from "./act-35.js";
import { WAVES_ACT_36 } from "./act-36.js";
import { WAVES_ACT_37 } from "./act-37.js";
import { WAVES_ACT_38 } from "./act-38.js";
import { WAVES_ACT_39 } from "./act-39.js";
import { WAVES_ACT_40 } from "./act-40.js";
import { WAVES_ACT_41 } from "./act-41.js";
import { WAVES_ACT_42 } from "./act-42.js";
import { WAVES_ACT_43 } from "./act-43.js";
import { WAVES_ACT_44 } from "./act-44.js";
import { WAVES_ACT_45 } from "./act-45.js";
import { WAVES_ACT_46 } from "./act-46.js";
import { WAVES_ACT_47 } from "./act-47.js";
import { WAVES_ACT_48 } from "./act-48.js";
import { WAVES_ACT_49 } from "./act-49.js";
import { WAVES_ACT_50 } from "./act-50.js";
import { WAVES_ACT_51 } from "./act-51.js";
import { WAVES_ACT_52 } from "./act-52.js";
import { WAVES_ACT_53 } from "./act-53.js";
import { WAVES_ACT_54 } from "./act-54.js";
import { WAVES_ACT_55 } from "./act-55.js";
import { WAVES_ACT_56 } from "./act-56.js";
import { WAVES_ACT_57 } from "./act-57.js";
import { WAVES_ACT_58 } from "./act-58.js";

/**
 * **The act files, in the order of the game** — the one list of them.
 *
 * Written by the director's save (`tools/director/src/waves-acts.ts`), never
 * by hand: a save that fills an act past the 250-line ceiling cuts it into a
 * new file placed straight after it, and rewrites this list to say so. The
 * director reads its act table off this file too (`waves-act-files.ts`), so a
 * file cut on a save is one the next save already knows. A reorder
 * (`waves:order --write`) cuts every act after the tutorial arc again in play
 * order, one block to a file (`waves-recut.ts`). `waves.ts` flattens it into
 * `WAVES`.
 *
 * The order is this array's, not the imports' — those are sorted by name, and
 * `act-1b.ts` plays after act one's last page, whatever its name says.
 */
export const WAVE_ACTS: readonly (readonly Wave[])[] = [
  WAVES_ACT_1,
  WAVES_ACT_1_P2,
  WAVES_ACT_1_P3,
  WAVES_ACT_1B,
  WAVES_ACT_2,
  WAVES_ACT_3,
  WAVES_ACT_4,
  WAVES_ACT_5,
  WAVES_ACT_6,
  WAVES_ACT_7,
  WAVES_ACT_8,
  WAVES_ACT_9,
  WAVES_ACT_10,
  WAVES_ACT_11,
  WAVES_ACT_12,
  WAVES_ACT_13,
  WAVES_ACT_14,
  WAVES_ACT_15,
  WAVES_ACT_16,
  WAVES_ACT_17,
  WAVES_ACT_18,
  WAVES_ACT_19,
  WAVES_ACT_20,
  WAVES_ACT_21,
  WAVES_ACT_22,
  WAVES_ACT_23,
  WAVES_ACT_24,
  WAVES_ACT_25,
  WAVES_ACT_26,
  WAVES_ACT_27,
  WAVES_ACT_28,
  WAVES_ACT_29,
  WAVES_ACT_30,
  WAVES_ACT_31,
  WAVES_ACT_32,
  WAVES_ACT_33,
  WAVES_ACT_34,
  WAVES_ACT_35,
  WAVES_ACT_36,
  WAVES_ACT_37,
  WAVES_ACT_38,
  WAVES_ACT_39,
  WAVES_ACT_40,
  WAVES_ACT_41,
  WAVES_ACT_42,
  WAVES_ACT_43,
  WAVES_ACT_44,
  WAVES_ACT_45,
  WAVES_ACT_46,
  WAVES_ACT_47,
  WAVES_ACT_48,
  WAVES_ACT_49,
  WAVES_ACT_50,
  WAVES_ACT_51,
  WAVES_ACT_52,
  WAVES_ACT_53,
  WAVES_ACT_54,
  WAVES_ACT_55,
  WAVES_ACT_56,
  WAVES_ACT_57,
  WAVES_ACT_58,
];
