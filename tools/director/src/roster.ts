/**
 * Parses the bestiary and boss specs rather than holding a copy of the planned
 * creatures. A list kept beside the spec goes stale silently; the spec is where
 * names are argued about.
 */

import { CREATURES } from "@neon-spore/content";
import { BOSS_KINDS, POD_KINDS } from "@neon-spore/sim";
import { type PlainRow, parsePlainWords, plainWordsFor } from "./plain-words.js";
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
 * Whether the simulation actually has this. A creature is looked up by its
 * own key; a boss by the last word of its name, because the spec calls her
 * "Bulb Queen" and the sim calls her `queen`, and it calls a round "THE GAUGE"
 * where the sim calls it `gauge` — the panel used to answer "not built" for a
 * boss that has been in the game since August. It once needed a third table
 * beside these two, because a round that was not the field was in neither; it
 * does not any more, and that is the whole of what `BOSS_KINDS` growing to six
 * bought this file.
 *
 * Exported because `backlog.ts` asks the same question of an idea's name that
 * this file asks of a bestiary row's — a built thing leaves every list it
 * appears on by being built, not by being told about a second time.
 */
export function isBuilt(name: string): boolean {
  const key = name.toLowerCase();
  if (key in CREATURES) return true;
  const last = key.split(/\s+/).at(-1) ?? "";
  // **The last word against the creatures too, and not only against the
  // bosses.** The act order in `bosses.md` names its slots the way a person
  // says them — "The Choir (40)" — and THE CHOIR is a creature now, so the
  // page went on listing a shipped body as something still to build. It is the
  // same allowance the line below already makes for "Bulb Queen", read one
  // table along: what a slot is called and what the simulation calls it differ
  // by the words a person puts in front.
  if (last in CREATURES) return true;
  // A pod is built and is deliberately not a `CreatureKind` — it carries no
  // colour and is never cleared, so it lives outside `CREATURES` entirely
  // (`docs/spec/systems.md` 5.7). It is in neither table this function reads,
  // and the backlog listed a shipped power-up as unbuilt until this line.
  if (POD_KINDS.some((pod) => pod === last) || last === "pod") return true;
  return BOSS_KINDS.some((kind) => kind === last);
}

function parseTable(text: string, headingEnd: string, ref: string): Planned[] {
  const lines = text.split("\n");
  let foundHeading = false;
  let inTable = false;
  let headerSeen = false;
  const rows: Planned[] = [];

  for (const line of lines) {
    if (!foundHeading && line.includes(headingEnd)) {
      foundHeading = true;
      continue;
    }
    if (!foundHeading) continue;

    if (!inTable) {
      if (line.includes("|")) {
        inTable = true;
      }
    }

    if (!inTable) continue;
    if (line.trim() === "") break;
    if (!line.includes("|")) continue;

    const cells = line.split("|").map((c) => c.trim());
    if (cells.length < 4) continue;

    if (!headerSeen) {
      headerSeen = true;
      continue;
    }

    if (cells.every((c) => c === "" || /^-+$/.test(c))) continue;

    const nameCell = cells[1] ?? "";
    const name = nameCell.replace(/\*\*/g, "").trim();
    if (!name) continue;

    const kind = cells[2] ?? "";
    const note = cells[3] ?? "";
    rows.push({ name, kind, note, built: isBuilt(name), detail: "", ref, plain: [] });
  }

  return rows;
}

function parseBosses(text: string): Planned[] {
  const lines = text.split("\n");
  const paragraphLines: string[] = [];
  let inParagraph = false;

  for (const line of lines) {
    if (line.includes("·")) {
      inParagraph = true;
      paragraphLines.push(line);
      continue;
    }
    if (inParagraph) {
      if (line.trim() === "") break;
      paragraphLines.push(line);
    }
  }

  if (paragraphLines.length === 0) return [];

  let bossLine = paragraphLines.join(" ");

  const colonIndex = bossLine.indexOf(":");
  if (colonIndex !== -1) {
    bossLine = bossLine.slice(colonIndex + 1).trim();
  }

  const parts = bossLine.split("·").map((p) => p.trim());
  const bosses: Planned[] = [];

  for (const part of parts) {
    const match = part.match(/^(.+?)\s*\(([^)]+)\)/);
    if (!match) continue;
    const name = match[1]!.trim();
    // "The Conductor (30, **THE VANE**)" — the act order writes the boss that
    // took a slot in bold, and a stamp is text rather than markdown.
    const kind = match[2]!.replace(/\*\*/g, "").trim();
    bosses.push({
      name,
      kind,
      note: "",
      built: isBuilt(name),
      detail: "",
      ref: "bosses.md",
      plain: [],
    });
  }

  return bosses;
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
