/**
 * The backlog — NOT BUILT YET on the menu: everything the design has agreed
 * to and the game does not have, arranged by what it would become rather than
 * by which file it was written in.
 *
 * **One page now, and it is the bosses.** MECHANICS was the other, and the
 * owner asked for it off on 17 September 2026. What it held was a rendering of
 * `systems.md` and `ideas.md` — one half-built system and three groups of
 * ideas — and every word of that is still in `docs/spec/`, read whole in the
 * SPEC room under DOCUMENTATION. A second rendering of a file the sheet next
 * door already shows is a page to keep in step rather than a page to read, and
 * the three parsers that fed it (`concepts.ts`'s `parseConcepts`, the idea
 * groups, the half-built remainder) went with it.
 *
 * Nothing here classifies anything. Which group a boss is in is the `##`
 * heading it stands under in `bosses.md`, so a look that lands moves it by
 * being moved in the spec.
 */

import { fromBosses } from "./backlog-bosses.js";
import { fromBossLooks } from "./backlog-looks.js";
import type { PlainRow } from "./plain-words.js";

export interface BacklogEntry {
  name: string;
  /** "Form" for a creature, "Pillar", an act number, or a section's own tail. */
  kind: string;
  note: string;
  detail: string;
  ref: string;
  /**
   * What it does, what each seat does about it and what is left to decide —
   * the spec's own "In plain words" rows (`plain-words.ts`). Absent on an
   * entry nobody has written one for, and on every idea group, whose entries
   * are a worked-out paragraph already.
   */
  plain?: PlainRow[];
}

export interface BacklogGroup {
  title: string;
  /** Where the group comes from and what it means, one line. */
  note: string;
  entries: BacklogEntry[];
  /** How many entries were left out because the simulation already has them. */
  builtHidden: number;
  /** Where a built one went, for the sentence that says so: a creature is in
   * the brush palette, a boss is a wave. Omitted, it is the palette. */
  builtWhere?: string;
  /**
   * Read rather than scanned: one column at prose width, and every entry's
   * argument open on the page instead of behind an expander. For the groups
   * whose entries *are* paragraphs — an argued-out design is several sentences,
   * and a grid of collapsed headings is the one shape it cannot be read in.
   */
  reading?: boolean;
}

export interface Backlog {
  /**
   * What is left to do on a boss — `backlog-bosses.ts`.
   *
   * A page of this name came off the sheet on 16 September 2026, and it held
   * the opposite of this one: THE ACT ORDER, which is the bosses the game
   * *has*, plus a group of boss ideas that had gone the day before with THE
   * SPLICE. Both spec pages were reordered by state on 17 September 2026 and
   * the owner asked for a page reading them, so what this draws is a boss
   * half-built and the *What is not built* paragraph at the foot of every
   * finished one. The `### Rounds` ideas stay in `ideas.md` as text.
   */
  bosses: BacklogGroup[];
  // MECHANICS was the other page until 17 September 2026 — see the file's own
  // note above. DESIGNS was a third until 12 September 2026: `docs/versus.md`,
  // `teaching.md` and `alive.md` read section by section as backlog. The owner
  // took that one off too — VERSUS is built and its file is a manual now, THE
  // CALL is one design and not a list, and `alive.md`'s numbers had been
  // overtaken.
}

export function buildBacklog(bosses: string, choreo: string, looks: string): Backlog {
  // First on the page, and first on purpose: everything under it is a report
  // of what the design owes, and this one is the one section the owner answers
  // rather than reads (`backlog-looks.ts`).
  return { bosses: [fromBossLooks(looks), ...fromBosses(bosses, choreo)] };
}
