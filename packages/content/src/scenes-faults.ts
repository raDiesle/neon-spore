import type { GuideScene } from "./scene-types.js";
import { THE_CHOKE } from "./scenes/the-choke.js";
import { THE_CODEX } from "./scenes/the-codex.js";
import { THE_DARK } from "./scenes/the-dark.js";
import { THE_FLIP } from "./scenes/the-flip.js";
import { THE_HANDOVER } from "./scenes/the-handover.js";
import { THE_LEECH } from "./scenes/the-leech.js";
import { THE_LIMPET } from "./scenes/the-limpet.js";

/**
 * The rehearsals of the malfunctions — the waves whose lesson is a fault
 * placed on the beat map rather than a body on the field (`wave-faults.ts`).
 *
 * Cut out of `scenes.ts` on the day THE FLIP's film took that list past its
 * 250th line (18 September 2026), along the seam `scenes-choreographed.ts`
 * already cut: a fault is a change of *picture* — the panels traded, the field
 * folded — and its film is the one place the pair is shown the change rather
 * than told it, which is why each of these needed a line in the rehearsal's
 * stage before it could be filmed at all (`render/handover.ts`,
 * `render/guide-film.ts`'s `seatLayout`). A film for a fault is added here;
 * `scenes.ts` spreads this table into `SCENES` and widens `SceneId` by the
 * id, so nothing that asks the list for a film has to know which file it
 * came from.
 */
export type FaultSceneId =
  | "theHandover"
  | "theFlip"
  | "theDark"
  | "theChoke"
  | "theLimpet"
  | "theLeech"
  | "theCodex";

export const SCENES_FAULTS: Record<FaultSceneId, GuideScene> = {
  theHandover: THE_HANDOVER,
  theFlip: THE_FLIP,
  theDark: THE_DARK,
  theChoke: THE_CHOKE,
  theLimpet: THE_LIMPET,
  theLeech: THE_LEECH,
  theCodex: THE_CODEX,
};
