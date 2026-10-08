/**
 * **THE BASTION's names, on a page of their own** — the moon, its shells, the
 * plates, the ring and the port — for the picture, the cue, the sound and the
 * director's hand. Straight off `bastion.ts`, THE LATCH's way
 * (`boss-surface-latch.ts`).
 */

export {
  BASTION_LAYERS,
  BASTION_PHASES,
  BASTION_PLATE_WAYS,
  BASTION_PLATES_A_SIDE,
  BASTION_SPAN,
  type BastionEntry,
  type BastionLayer,
  type BastionPhase,
  type BastionState,
  type BastionStep,
  bastionBoss,
  bastionCharging,
  bastionDone,
  bastionFrontGun,
  bastionGone,
  bastionGunAngle,
  bastionLayerOn,
  bastionLeft,
  bastionLitStep,
  bastionNext,
  bastionPieceCol,
  bastionPieceCount,
  bastionPiecesAll,
  bastionPlateOf,
  bastionPlateWay,
  freshBastion,
} from "./bastion.js";
export { bastionTarget, bastionVerdict } from "./bastion-shot.js";
export type { BastionConfig } from "./config-bastion.js";
export type { BastionEvent } from "./events-bastion.js";
