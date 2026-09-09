/**
 * The plain-English half of an unbuilt entry: what the thing does, what each
 * seat does about it, and what is still undecided.
 *
 * It exists because the NOT BUILT YET page was a list of names with a table
 * cell under them. "facets, breaks into two halves — fast switching" is a
 * label, not an explanation, and a reader deciding what to build next got
 * nothing from it about who talks to whom or about what is actually missing.
 *
 * Parsed out of `## 10.5 In plain words` in `bestiary.md` and `## 11.10 In
 * plain words` in `bosses.md`, for the reason `roster.ts` parses the tables
 * rather than copying them: a second copy of a paragraph drifts from the one
 * the design argues over. The shape it reads is deliberately dull —
 *
 *     ### Crystal
 *
 *     - **What it does:** ...
 *     - **Player 1:** ...
 *     - **Player 2:** ...
 *     - **To finish it:** ...
 *
 * — a `###` name and then any number of `- **Label:** text` rows, kept in the
 * order they were written. Nothing here knows the four labels above, so an
 * entry that needs a fifth row gets one by being typed.
 */

import { normalizeName } from "./sections.js";

export interface PlainRow {
  /** The bold lead, without its colon — "What it does", "Player 1". */
  label: string;
  text: string;
}

/** Entry name, normalised by `normalizeName`, to its rows in written order. */
export type PlainWords = Map<string, PlainRow[]>;

const NAME_RE = /^###\s+(.+?)\s*$/;
/** A `##` heading and not a `###` one — the section this file reads is full of those. */
const END_RE = /^##(?!#)/;
const ROW_RE = /^-\s+\*\*([^*]+?):?\*\*\s*(.*)$/;
const NEWLINE = /\r?\n/;

/**
 * The lines under `## … In plain words`, up to the next `##`. Not
 * `sectionNamed`, which ends a section at any line opening with two hashes —
 * every entry here is a `###`, so that reader stops at the first one.
 */
function sectionLines(text: string): string[] {
  const lines: string[] = [];
  let inside = false;
  for (const line of text.split(NEWLINE)) {
    if (END_RE.test(line)) {
      if (inside) break;
      inside = line.includes("In plain words");
      continue;
    }
    if (inside) lines.push(line);
  }
  return lines;
}

export function parsePlainWords(text: string): PlainWords {
  const words: PlainWords = new Map();
  let rows: PlainRow[] | null = null;

  for (const line of sectionLines(text)) {
    const name = line.match(NAME_RE);
    if (name) {
      rows = [];
      words.set(normalizeName(name[1]!), rows);
      continue;
    }
    if (!rows) continue;
    const row = line.match(ROW_RE);
    if (row) {
      rows.push({ label: row[1]!.trim(), text: row[2]!.trim() });
      continue;
    }
    // A row wrapped over two lines is joined onto the one above it, so the
    // spec can stay inside its own margin without the page reading a hanging
    // half-sentence as a row of its own.
    const last = rows[rows.length - 1];
    if (last && line.trim() !== "") last.text = `${last.text} ${line.trim()}`.trim();
  }
  return words;
}

/** The rows written for this name, or an empty list. */
export function plainWordsFor(words: PlainWords, name: string): PlainRow[] {
  return words.get(normalizeName(name)) ?? [];
}
