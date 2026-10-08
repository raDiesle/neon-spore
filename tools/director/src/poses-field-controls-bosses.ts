import type { Pose } from "./pose-kit.js";
import { CAPSTAN_GRIPS } from "./poses-field-controls-capstan.js";
import { GALL_GRIPS } from "./poses-field-controls-gall.js";
import { GOVERNOR_GRIPS } from "./poses-field-controls-governor.js";
import { GRINDSTONE_GRIPS } from "./poses-field-controls-grindstone.js";
import { HALTER_GRIPS } from "./poses-field-controls-halter.js";
import { HASP_GRIPS } from "./poses-field-controls-hasp.js";
import { KEEL_GRIPS } from "./poses-field-controls-keel.js";
import { LAMPREY_GRIPS } from "./poses-field-controls-lamprey.js";
import { LATCH_GRIPS } from "./poses-field-controls-latch.js";
import { MANTLE_GRIPS } from "./poses-field-controls-mantle.js";
import { OCULUS_GRIPS } from "./poses-field-controls-oculus.js";
import { PLUMB_GRIPS } from "./poses-field-controls-plumb.js";
import { RATCHET_GRIPS } from "./poses-field-controls-ratchet.js";
import { RIME_GRIPS } from "./poses-field-controls-rime.js";
import { SLING_GRIPS } from "./poses-field-controls-sling.js";
import { TRAPEZE_GRIPS } from "./poses-field-controls-trapeze.js";
import { TRIVET_GRIPS } from "./poses-field-controls-trivet.js";
import { VALVE_GRIPS } from "./poses-field-controls-valve.js";
import { VISE_GRIPS } from "./poses-field-controls-vise.js";

/**
 * Every boss's grips on the ON THE FIELD tab, in the tab's order: one file a
 * boss, listed here so `poses-field-controls.ts` keeps only the poses that
 * belong to no boss. A new boss's grips are one import and one spread.
 */
export const BOSS_GRIPS: readonly Pose[] = [
  ...HASP_GRIPS,
  ...RATCHET_GRIPS,
  ...MANTLE_GRIPS,
  ...KEEL_GRIPS,
  ...OCULUS_GRIPS,
  ...VISE_GRIPS,
  ...TRIVET_GRIPS,
  ...PLUMB_GRIPS,
  ...HALTER_GRIPS,
  ...CAPSTAN_GRIPS,
  ...GALL_GRIPS,
  ...GRINDSTONE_GRIPS,
  ...RIME_GRIPS,
  ...TRAPEZE_GRIPS,
  ...GOVERNOR_GRIPS,
  ...SLING_GRIPS,
  ...VALVE_GRIPS,
  ...LAMPREY_GRIPS,
  ...LATCH_GRIPS,
];
