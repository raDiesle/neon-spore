import { HELD_FAMILIES } from "./field-families-held.js";
import { SHAPED_FAMILIES } from "./field-families-shaped.js";

/**
 * Where every row of CONTROLS › ON THE FIELD stands: generic to every wave,
 * generic to one creature or wave, or one boss's own — and a boss's own
 * grouped by **verb family**, so that two bosses doing the same thing with
 * different words, different refusals or different pictures sit side by side
 * and the owner can say which one becomes the generic control.
 *
 * Rows are named, never re-described: the row itself is `FIELD_CONTROLS`
 * (`field-controls-page.ts`), and `test/field-page.test.ts` fails when a row
 * is in no group, in two, or a name here is not a row any more. The
 * suggestions are `field-notes.ts`.
 */

export interface FieldGroup {
  key: string;
  title: string;
  /** What every member has in common, in one or two sentences. */
  shared: string;
  /** The decision this lane would take about the family as a whole. */
  suggest: string;
  members: readonly string[];
}

/** Reached on every wave, whatever the wave is. */
export const EVERY_WAVE: FieldGroup = {
  key: "every",
  title: "GENERIC — EVERY WAVE",
  shared:
    "The ship's own lobes, the grip on a falling thing and the guide. " +
    "Nothing here is named by a wave; the muzzle swipe is the one row a " +
    "control set switches on.",
  suggest:
    "This is the vocabulary a boss should borrow first. A boss control that " +
    "is a grip, a push or a lobe press under another name is a candidate to " +
    "become this row.",
  members: [
    "GRIP",
    "THE PUSH",
    "THE CANNON",
    "THE MAW TAP",
    "THE SHIELD PLATE",
    "THE SHIELD TRIGGER",
    "THE MUZZLE SWIPE",
    "THE GUIDE'S HOLD",
  ],
};

/** Generic in that no boss owns it — but one creature or one wave brings it. */
export const ONE_CREATURE: FieldGroup = {
  key: "creature",
  title: "GENERIC — ONE CREATURE OR WAVE",
  shared:
    "Brought onto the field by one creature or one wave's rule, and reachable " +
    "on any wave that has it.",
  suggest:
    "Each is already the generic form of a boss verb somewhere below: the " +
    "cord is a pull held as a level, the gum a swipe past a distance, the " +
    "arrows the fallback for a sensor. Keep them here and point bosses at them.",
  members: [
    "THE GUM",
    "THE LID'S CORD",
    "THE CHOIR'S LEFT ARROW",
    "THE CHOIR'S RIGHT ARROW",
    "THE LIGHT",
  ],
};

/** A boss's own, by what the thumb does rather than by which boss. */
export const BOSS_FAMILIES: readonly FieldGroup[] = [...HELD_FAMILIES, ...SHAPED_FAMILIES];

/** Every group on the page, in the order it is drawn. */
export const FIELD_GROUPS: readonly FieldGroup[] = [EVERY_WAVE, ONE_CREATURE, ...BOSS_FAMILIES];
