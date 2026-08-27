/**
 * The design surface roster.ts does not cover: the couplings, the assist
 * forms, the not-yet-built systems and the idea store. Parsed on every
 * request for the same reason the bestiary is — a copy kept beside the spec
 * goes stale silently.
 */

import { firstParagraph, firstTable, parseNumberedSections, sectionBody } from "./sections.js";

export interface ConceptTable {
  headers: string[];
  rows: string[][];
}

export interface Concept {
  name: string;
  status: string;
  /** The opening line or two — what the panel shows before it is opened. */
  note: string;
  table: ConceptTable | null;
  /** The section verbatim, markdown and all. Nothing the spec says is dropped. */
  detail: string;
  /** Where it came from, e.g. "couplings.md 2." — printed beside the detail. */
  ref: string;
}

export interface Idea {
  name: string;
  note: string;
  ref: string;
  /**
   * The `###` sub-heading it sits under — "Creatures", "Mechanics",
   * "Controls" — or "" where the section has none. What an idea would become
   * is a fact about the idea, so the spec carries it and this reads it; a
   * table of names kept here instead would go stale the first time one moved.
   */
  group: string;
}

export interface ConceptSheet {
  couplings: Concept[];
  assists: Concept[];
  systems: Concept[];
  ideas: Idea[];
  deferred: Idea[];
}

function toConcepts(text: string, file: string): Concept[] {
  return parseNumberedSections(text).map((s) => {
    const table = firstTable(s.lines);
    return {
      name: s.title,
      status: s.tail,
      note: firstParagraph(s.lines),
      table: table && table.length > 1 ? { headers: table[0]!, rows: table.slice(1) } : null,
      detail: sectionBody(s.lines),
      ref: `${file} ${s.number}`,
    };
  });
}

/** `[link text](url)` becomes plain `link text` — a footnote is not a citation here. */
function stripLinks(text: string): string {
  return text.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
}

/**
 * Bullets shaped `- **Name** — note`, the format ideas.md uses throughout. A
 * few names carry no note at all, and a few notes wrap onto an indented
 * continuation line — both kept, since dropping either silently understates
 * the idea store.
 *
 * `###` sub-headings inside the section are read as the bullet's group and do
 * not end it; only the next `##` does. They do close the bullet above them,
 * though: a group's own introduction is prose about the group, and before this
 * it was swallowed by whichever bullet happened to be last — the Bosses
 * heading's "three encounters worked out far enough" arrived on the page as
 * the tail of the Wave gate.
 */
function parseBullets(text: string, headingContains: string, file: string): Idea[] {
  const ideas: Idea[] = [];
  let inSection = false;
  let group = "";
  /** The bullet a continuation line belongs to, or null under a fresh heading. */
  let open: Idea | null = null;
  for (const line of text.split(/\r?\n/)) {
    if (!inSection) {
      if (/^##\s/.test(line) && line.includes(headingContains)) inSection = true;
      continue;
    }
    if (/^###\s/.test(line)) {
      group = line.replace(/^###\s*/, "").trim();
      open = null;
      continue;
    }
    if (line.startsWith("##")) break;

    // Whatever follows the name is the note, em dash or not. Requiring the
    // dash lost the Prism, whose bullet opens `**Prism** (working name only…`:
    // the line matched nothing, so it was appended to the idea above it and
    // the store quietly showed one fewer idea than it holds.
    const bullet = line.match(/^-\s+\*\*(.+?)\*\*\s*(?:—\s*)?(.*)$/);
    if (bullet) {
      open = {
        name: bullet[1]!.trim(),
        note: stripLinks(bullet[2] ?? "").trim(),
        ref: file,
        group,
      };
      ideas.push(open);
      continue;
    }
    const trimmed = line.trim();
    if (open && trimmed !== "" && !trimmed.startsWith("-")) {
      open.note = `${open.note} ${stripLinks(trimmed)}`.trim();
    }
  }
  return ideas;
}

export function parseConcepts(
  couplings: string,
  assists: string,
  systems: string,
  ideas: string,
): ConceptSheet {
  return {
    couplings: toConcepts(couplings, "couplings.md"),
    assists: toConcepts(assists, "assists.md"),
    systems: toConcepts(systems, "systems.md"),
    ideas: parseBullets(ideas, "Accepted, not yet worked out", "ideas.md"),
    deferred: parseBullets(ideas, "Deliberately deferred", "ideas.md"),
  };
}
