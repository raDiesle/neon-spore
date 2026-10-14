/**
 * **THE BASTION's names, on a page of their own** — the moon, its shells, the
 * plates, the ring and the port — for the picture, the cue, the sound and the
 * director's hand. Straight off `bastion.ts`, THE LATCH's way
 * (`boss-surface-latch.ts`).
 */

export {
  BASTION_LAYERS,
  BASTION_PHASES,
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
  freshBastion,
} from "./bastion.js";
export { bastionTarget, bastionVerdict } from "./bastion-shot.js";
export {
  BASTION_PLATE_WAYS,
  BASTION_PLATES_A_SIDE,
  BASTION_TRACKS,
  type BastionTrack,
  bastionPlateWay,
  bastionTrackAt,
  bastionTrackLen,
  bastionTrackOf,
  bastionTrackPoints,
} from "./bastion-track.js";
export type { BastionConfig } from "./config-bastion.js";
export type { BastionEvent } from "./events-bastion.js";
