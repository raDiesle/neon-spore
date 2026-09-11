import { LID_BEVEL, LID_IRIS, LID_PLATES } from "./lid-assets.js";
import { MOUNT_BARE, MOUNT_RASP, MOUNT_TAPROOT } from "./mount-assets.js";
import { QUEEN_ARMOUR, QUEEN_CARAPACE, QUEEN_FACET, QUEEN_SCUTES } from "./queen-assets.js";
import {
  RECOIL_CALYX,
  RECOIL_FOAM,
  RECOIL_GLOBE,
  RECOIL_MOONS,
  RECOIL_SPRINGS,
} from "./recoil-assets.js";
import { RIND_FLAKES, RIND_HUSK, RIND_POD, RIND_SLOUGH } from "./rind-assets.js";
import type { Asset } from "./types.js";
import { VEIL_ANVIL, VEIL_FOAM, VEIL_STRATA, VEIL_VORTEX } from "./veil-assets.js";
import { VOLLEY_EMBER, VOLLEY_PAINTED, VOLLEY_PITTED } from "./volley-assets.js";
import { WARDEN_MANTLE, WARDEN_ROLL, WARDEN_SURFACE, WARDEN_WHORL } from "./warden-assets.js";
import { WISP_ARMS, WISP_COMB, WISP_SKIRT, WISP_THREADS } from "./wisp-assets.js";

/**
 * Every asset the LIBRARY shows, in the order it shows them.
 *
 * This list is the only place that knows which assets exist — one more is a
 * file beside this one and one line here. Grouped by the creature the look
 * belongs to, the one the game wears first in each group, so a reader sees
 * what is shipped before what was kept beside it. `types.ts` says what an
 * asset is and why the view is a canvas.
 */
export const ASSETS: readonly Asset[] = [
  WISP_ARMS,
  WISP_THREADS,
  WISP_COMB,
  WISP_SKIRT,
  WARDEN_SURFACE,
  WARDEN_MANTLE,
  WARDEN_ROLL,
  WARDEN_WHORL,
  VOLLEY_EMBER,
  VOLLEY_PAINTED,
  VOLLEY_PITTED,
  VEIL_ANVIL,
  VEIL_FOAM,
  VEIL_STRATA,
  VEIL_VORTEX,
  LID_IRIS,
  LID_PLATES,
  LID_BEVEL,
  MOUNT_TAPROOT,
  MOUNT_RASP,
  MOUNT_BARE,
  QUEEN_SCUTES,
  QUEEN_ARMOUR,
  QUEEN_CARAPACE,
  QUEEN_FACET,
  RECOIL_GLOBE,
  RECOIL_SPRINGS,
  RECOIL_MOONS,
  RECOIL_FOAM,
  RECOIL_CALYX,
  RIND_HUSK,
  RIND_FLAKES,
  RIND_POD,
  RIND_SLOUGH,
];

export type { Asset, AssetContext, AssetFrame } from "./types.js";
export { BEAT_SECONDS } from "./types.js";
