/**
 * Parses the bestiary and boss specs rather than holding a copy of the planned
 * creatures. A list kept beside the spec goes stale silently; the spec is where
 * names are argued about.
 *
 * The reading itself — the table, the act order's paragraph, and whether a
 * name is built — is `roster-parse.ts`; this file is what a roster is and
 * how each row gets the prose the spec argues it in.
 */

import { type PlainRow, parsePlainWords, plainWordsFor } from "./plain-words.js";
import { parseBosses, parseTable } from "./roster-parse.js";
import {
  firstParagraph,
  normalizeName,
  parseNumberedSections,
  proseBlocks,
  sectionBody,
  sectionNamed,
} from "./sections.js";

export interface Planned {
  name: string;
  /** "Form" for a creature, "Pillar" for an accepted one, "" for a boss. */
  kind: string;
  /** The table cell, or the boss heading's tail — one line, always shown. */
  note: string;
  /** True when the simulation actually has it. */
  built: boolean;
  /**
   * Everything else the spec says about it, verbatim markdown: the paragraphs
   * that follow a bestiary table and name it, or a boss's whole section. The
   * Jammer is three sentences of design and the table cell is one of them.
   */
  detail: string;
  /** Where the detail came from, e.g. "bestiary.md 10.2". */
  ref: string;
  /**
   * The plain-English rows written for it in the spec's own "In plain words"
   * section — what it does, what each seat does, what is left to decide. Empty
   * for anything nobody has written one for yet.
   */
  plain: PlainRow[];
}

export interface Roster {
  creatures: Planned[];
  accepted: Planned[];
  bosses: Planned[];
}

/**
 * The bestiary argues about a creature twice: one cell in the table, and then
 * a paragraph further down that opens by naming it in bold — "**The Jammer —
 * the danger is the strip going dark**". The paragraph is the design; the cell
 * is a label on it. So every prose block goes to the row its lead names, and a
 * block with no lead of its own goes wherever the block above it went — that
 * is how "Two requirements, unchanged from the original draft" stays with The
 * Blind One instead of floating off the page.
 *
 * A lead that names nothing in this table (the torch's, which is a rock and
 * not one of the thirteen) ends the run rather than sticking to the row
 * before it. Loose prose belongs to the file, and the SPEC tab has the file.
 */
function attachDetails(bestiary: string, headingEnd: string, rows: Planned[]): void {
  let owner: Planned | undefined;
  for (const block of proseBlocks(sectionNamed(bestiary, headingEnd))) {
    if (block.lead) owner = rowNamed(block.lead, rows);
    if (!owner) continue;
    owner.detail = owner.detail ? `${owner.detail}\n\n${block.text}` : block.text;
  }
}

/** The longest row name that appears as a whole word in the lead, if any. */
function rowNamed(lead: string, rows: Planned[]): Planned | undefined {
  const hay = lead.toLowerCase();
  return [...rows]
    .sort((a, b) => b.name.length - a.name.length)
    .find((row) => {
      const word = normalizeName(row.name).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`\\b${word}\\b`).test(hay);
    });
}

export function parseRoster(bestiary: string, bosses: string): Roster {
  const sections = parseNumberedSections(bosses);
  const creatures = parseTable(bestiary, "first thirteen", "bestiary.md 10.1");
  const accepted = parseTable(bestiary, "Newly accepted", "bestiary.md 10.2");
  attachDetails(bestiary, "first thirteen", creatures);
  attachDetails(bestiary, "Newly accepted", accepted);

  // The two "In plain words" sections, read once and handed to every row that
  // has one. A creature's is written in `bestiary.md` and a boss's in
  // `bosses.md`, and neither file knows about the other's names.
  const creatureWords = parsePlainWords(bestiary);
  const bossWords = parsePlainWords(bosses);
  for (const row of [...creatures, ...accepted]) row.plain = plainWordsFor(creatureWords, row.name);

  return {
    creatures,
    accepted,
    /**
     * Only three of the eleven bosses have a worked-out section — the rest are
     * names holding a slot. Where one exists its heading's own tail ("armoured
     * everywhere but the mark") is the fact that matters, so it is the note;
     * the opening paragraph is the fallback for a heading with none, like The
     * Vessel's, and the whole section is the detail either way.
     */
    bosses: parseBosses(bosses).map((planned) => {
      const boss = { ...planned, plain: plainWordsFor(bossWords, planned.name) };
      const section = sections.find((s) => normalizeName(s.title) === normalizeName(boss.name));
      if (!section) return boss;
      return {
        ...boss,
        note: section.tail || firstParagraph(section.lines),
        detail: sectionBody(section.lines),
        ref: `bosses.md ${section.number}`,
      };
    }),
  };
}
