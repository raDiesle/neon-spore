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

/**
 * The section verbatim — every line under the heading, blank edges trimmed.
 * `firstParagraph` answers "what is this in one line"; this answers "show me
 * everything the spec says about it", which is the whole reason the panels
 * stopped being a list of one-liners.
 */
export function sectionBody(lines: string[]): string {
  return lines
    .join("\n")
    .replace(/^\s*\n+/, "")
    .replace(/\s+$/, "");
}

export interface ProseBlock {
  /** The `**bold**` the block opens with, if any — the spec's way of saying what it is about. */
  lead: string;
  text: string;
}

/**
 * The blank-line-separated blocks of a section, tables left out because
 * `firstTable` already reads those. The lead is what lets a paragraph be
 * handed to the entry it argues about rather than shown as loose prose.
 */
export function proseBlocks(lines: string[]): ProseBlock[] {
  const blocks: ProseBlock[] = [];
  let current: string[] = [];

  const flush = (): void => {
    const text = current.join("\n");
    current = [];
    if (text.trim() === "" || text.trim().startsWith("|")) return;
    blocks.push({ lead: text.match(/^\*\*([^*]+)\*\*/)?.[1]?.trim() ?? "", text });
  };

  for (const line of lines) {
    if (line.trim() === "") flush();
    else current.push(line);
  }
  flush();
  return blocks;
}

/** The lines under the first `##` heading containing `needle`, up to the next one. */
export function sectionNamed(text: string, needle: string): string[] {
  const lines: string[] = [];
  let inside = false;
  for (const line of text.split(/\r?\n/)) {
    if (line.startsWith("##")) {
      if (inside) break;
      if (line.includes(needle)) inside = true;
      continue;
    }
    if (inside) lines.push(line);
  }
  return lines;
}
