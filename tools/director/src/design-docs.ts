/**
 * The worked-out design documents — `docs/versus.md`, `docs/teaching.md`,
 * `docs/alive.md` — read as backlog, one group per file.
 *
 * A parked idea (`docs/parked.md`) is an offer nobody has argued with. A
 * queue entry (`docs/queue.md`) is a commitment with a branch on it. A
 * design document is the thing that sits between those two and is neither:
 * argued out already, with column numbers and parameter values decided, but
 * not itself a lane — `docs/queue.md` is what turns one into lanes, a few
 * sections at a time. Mixing it into either of the other two would make a
 * reader re-check which kind of row they were looking at before trusting it,
 * which is the exact failure `docs/parked.md`'s own header describes.
 *
 * Each document's `##` sections are the closest thing it has to a list of
 * items — the same division `sections.ts` reads out of the numbered spec
 * files, minus the numbering these three were never given, since a design
 * document argues a case rather than cataloguing entries. None of the three
 * resisted this: every section in all three runs long — several paragraphs,
 * sometimes a page — and `detailBox` is exactly the fold built for that.
 */

import type { BacklogEntry, BacklogGroup } from "./backlog.js";
import { firstParagraph, sectionBody } from "./sections.js";

export interface DesignFile {
  /** e.g. "versus.md" — shown as the ref beside each of its entries. */
  name: string;
  text: string;
}

interface RawSection {
  title: string;
  lines: string[];
}

const STRIP = /\*\*|`/g;

function cleanTitle(raw: string): string {
  return raw.replace(STRIP, "").trim();
}

/** The file's own `##` sections. `###` sub-headings stay inside their parent. */
function splitSections(text: string): RawSection[] {
  const sections: RawSection[] = [];
  let current: RawSection | null = null;
  for (const line of text.split(/\r?\n/)) {
    if (/^##\s+/.test(line) && !line.startsWith("###")) {
      current = { title: cleanTitle(line.replace(/^##\s+/, "")), lines: [] };
      sections.push(current);
      continue;
    }
    current?.lines.push(line);
  }
  return sections;
}

/** The `# Title` line, or the file name where a document somehow lacks one. */
function h1Of(text: string, fallback: string): string {
  const line = text.split(/\r?\n/).find((l) => /^#\s+/.test(l));
  return line ? cleanTitle(line.replace(/^#\s+/, "")) : fallback;
}

/** The paragraph between the `# Title` and the first `##` — what the doc is for. */
function introOf(text: string): string {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((l) => /^#\s+/.test(l));
  const body: string[] = [];
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i] ?? "";
    if (/^##\s+/.test(line)) break;
    body.push(line);
  }
  return firstParagraph(body);
}

export function buildDesigns(files: readonly DesignFile[]): BacklogGroup[] {
  return files
    .filter((file) => file.text.trim() !== "")
    .map((file) => {
      const sections = splitSections(file.text);
      const entries: BacklogEntry[] = sections.map((s) => ({
        name: s.title,
        kind: "",
        note: firstParagraph(s.lines),
        detail: sectionBody(s.lines),
        ref: file.name,
      }));
      return {
        title: h1Of(file.text, file.name).toUpperCase(),
        note: `${introOf(file.text)} — ${file.name}`,
        entries,
        builtHidden: 0,
      };
    });
}
