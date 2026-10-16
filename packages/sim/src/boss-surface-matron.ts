/**
 * **THE MATRON's names, on a page of their own** — the body, her clutches,
 * her lobes and her throws — for the picture, the sound and the director's
 * hand. Straight off `matron.ts`, THE HYDRA's way (`boss-surface-hydra.ts`).
 */

export type { MatronConfig } from "./config-matron.js";
export type { MatronEvent } from "./events-matron.js";
export {
  freshMatron,
  MATRON_PHASES,
  MATRON_THROWS,
  type MatronEntry,
  type MatronPhase,
  type MatronState,
  type MatronStep,
  type MatronThrow,
  type MatronThrowKind,
  matronBoss,
  matronDone,
  matronLeft,
  matronLitStep,
  matronLobesAll,
  matronLobesLeft,
  matronPodCol,
  matronTaken,
} from "./matron.js";
