import type { GuideScene } from "./scene-types.js";
import { COMBO_BLISTERS } from "./scenes/combo-blisters.js";
import { HOLD_BLISTERS } from "./scenes/hold-blisters.js";
import { LEVER_BLISTERS } from "./scenes/lever-blisters.js";
import { RUB_BLISTERS } from "./scenes/rub-blisters.js";
import { SWIPE_BLISTERS } from "./scenes/swipe-blisters.js";
import { TAP_BLISTERS } from "./scenes/tap-blisters.js";
import { TURN_BLISTERS } from "./scenes/turn-blisters.js";

/**
 * **The controls' films**: one per on-screen control, for the wave that
 * brings it — the owner, 17 October 2026: *for every single "controls" brush
 * introduced wave, we need to have individual tutorial. create it. a hand
 * should show the finger movement action the player needs to do. It should
 * also show all visuals the control can have in the game.*
 *
 * Every one has the same four pages, because every control is the same
 * lesson with a different hand: the seat that cannot knock it down sees the
 * pore swell and says where, the other knocks it down — then the seats the
 * other way round. Every body the control is drawn as, and every way its
 * stroke or turn can point, is on the field in one of them. A family of its
 * own for `scenes-owed.ts`' reason; `scenes.ts` spreads it into `SCENES`.
 */
export type ControlSceneId =
  | "tapBlisters"
  | "holdBlisters"
  | "swipeBlisters"
  | "turnBlisters"
  | "rubBlisters"
  | "comboBlisters"
  | "leverBlisters";

export const SCENES_CONTROLS: Record<ControlSceneId, GuideScene> = {
  tapBlisters: TAP_BLISTERS,
  holdBlisters: HOLD_BLISTERS,
  swipeBlisters: SWIPE_BLISTERS,
  turnBlisters: TURN_BLISTERS,
  rubBlisters: RUB_BLISTERS,
  comboBlisters: COMBO_BLISTERS,
  leverBlisters: LEVER_BLISTERS,
};
