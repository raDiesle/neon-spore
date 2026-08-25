/**
 * Splits a spec file into its "## <number> Title — tail" sections — the shape
 * shared by couplings.md, systems.md, assists.md and bosses.md. Parsed rather
 * than copied, for the same reason roster.ts parses the bestiary: a second
 * copy of a paragraph drifts from the one the design actually argues over.
 */

export interface Section {
  number: string;
  title: string;
  /** Text after the em dash in the heading, e.g. "built", "not built". */
  tail: string;
  /** Every line between this heading and the next, unfiltered. */
  lines: string[];
}

const HEADING_RE = /^##\s+([\d.]+)\s+(.+?)(?:\s+—\s+(.*))?$/;

export function parseNumberedSections(text: string): Section[] {
  const sections: Section[] = [];
  let current: Section | null = null;

  for (const line of text.split(/\r?\n/)) {
    const match = line.match(HEADING_RE);
    if (match) {
      current = {
        number: match[1]!,
        title: match[2]!.trim(),
        tail: (match[3] ?? "").trim(),
        lines: [],
      };
      sections.push(current);
      continue;
    }
    current?.lines.push(line);
  }
  return sections;
}

/**
 * The first block of prose after a heading: blockquotes, tables, lists and
 * sub-headings skipped, so what remains reads as one plain sentence or two.
 */
export function firstParagraph(lines: string[]): string {
  const paragraph: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "") {
      if (paragraph.length > 0) break;
      continue;
    }
    if (trimmed.startsWith(">") || trimmed.startsWith("|") || trimmed.startsWith("#")) continue;
    paragraph.push(trimmed);
  }
  return paragraph
    .join(" ")
    .replace(/\*\*/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
}

/** The first markdown table in the section, header row included, or null. */
export function firstTable(lines: string[]): string[][] | null {
  const rows: string[][] = [];
  let inTable = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|")) {
      if (inTable) break;
      continue;
    }
    inTable = true;
    const cells = trimmed
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());
    if (cells.every((c) => /^-*$/.test(c))) continue;
    rows.push(cells.map((c) => c.replace(/\*\*/g, "")));
  }
  return rows.length > 0 ? rows : null;
}
