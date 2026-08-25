/**
 * The design surface roster.ts does not cover: the couplings, the assist
 * forms, the not-yet-built systems and the idea store. Parsed on every
 * request for the same reason the bestiary is — a copy kept beside the spec
 * goes stale silently.
 */

import { firstParagraph, firstTable, parseNumberedSections } from "./sections.js";

export interface ConceptTable {
  headers: string[];
  rows: string[][];
}

export interface Concept {
  name: string;
  status: string;
  note: string;
  table: ConceptTable | null;
}

export interface Idea {
  name: string;
  note: string;
}

export interface ConceptSheet {
  couplings: Concept[];
  assists: Concept[];
  systems: Concept[];
  ideas: Idea[];
  deferred: Idea[];
}

function toConcepts(text: string): Concept[] {
  return parseNumberedSections(text).map((s) => {
    const table = firstTable(s.lines);
    return {
      name: s.title,
      status: s.tail,
      note: firstParagraph(s.lines),
      table: table && table.length > 1 ? { headers: table[0]!, rows: table.slice(1) } : null,
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
 */
function parseBullets(text: string, headingContains: string): Idea[] {
  const ideas: Idea[] = [];
  let inSection = false;
  for (const line of text.split(/\r?\n/)) {
    if (!inSection) {
      if (line.startsWith("##") && line.includes(headingContains)) inSection = true;
      continue;
    }
    if (line.startsWith("##")) break;

    const bullet = line.match(/^-\s+\*\*(.+?)\*\*(?:\s*—\s*(.*))?$/);
    if (bullet) {
      ideas.push({ name: bullet[1]!.trim(), note: stripLinks(bullet[2] ?? "").trim() });
      continue;
    }
    const trimmed = line.trim();
    const last = ideas.at(-1);
    if (last && trimmed !== "" && !trimmed.startsWith("-")) {
      last.note = `${last.note} ${stripLinks(trimmed)}`.trim();
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
    couplings: toConcepts(couplings),
    assists: toConcepts(assists),
    systems: toConcepts(systems),
    ideas: parseBullets(ideas, "Accepted, not yet worked out"),
    deferred: parseBullets(ideas, "Deliberately deferred"),
  };
}
