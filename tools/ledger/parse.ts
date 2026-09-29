/**
 * `docs/time-log.md` read as records: one per dated `##` entry, with its five
 * rows, its bottleneck and the stamp `bun run land` wrote under it.
 *
 * `docs/lane-speed.md` is a reading of this file and said to re-read it "by
 * running the parse again" when no parse was in the tree; the one that
 * produced its 29 September 2026 section was a scratch file, and the first
 * version of that read a third of the ledger. Sessions have written the rows
 * four ways — a table, `- reading: N min`, `- reading — N min` and a bold row
 * name — and the bottleneck as `Bottleneck:` or as bold prose. All of them are
 * read here, and a test holds one entry of each.
 *
 * Pure: text in, records out.
 */

/** The five rows every entry carries, in the order the preamble names them. */
export const ROWS = ["reading", "writing", "looking", "friction", "landing"] as const;
export type Row = (typeof ROWS)[number];

/** Where a stamp's clock started, as its line says; `stamp.ts` has the words. */
export type Stamp = { minutes: number; from: "claim" | "branch" | "first commit" };

export interface Entry {
  /** `YYYY-MM-DD`, from the heading, which dates it either first or last. */
  date: string;
  title: string;
  /** The rows the entry gave; a row it left out is absent, not zero. */
  rows: Partial<Record<Row, number>>;
  /** The friction row's own words, for the causes. */
  friction: string;
  /** Which row the bottleneck sentence names first, or `none`, or `other`. */
  bottleneck: Row | "none" | "other";
  /** The measured line, when `land` wrote one with a number in it. */
  stamp?: Stamp;
}

const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

/** The heading's date and title: `2026-09-26 — title`, `title — 2026-09-26`, or `26 September 2026 — title`. */
function heading(line: string): { date: string; title: string } | undefined {
  const text = line.replace(/^## /, "").trim();
  const iso = /(\d{4}-\d{2}-\d{2})/.exec(text);
  if (iso) {
    const title = text
      .replace(iso[0], "")
      .replace(/^\s*—\s*|\s*—\s*$/g, "")
      .trim();
    return { date: iso[1] ?? "", title };
  }
  const long = /^(\d{1,2}) ([A-Za-z]+) (\d{4})\s*—\s*(.*)$/.exec(text);
  const month = long ? MONTHS.indexOf((long[2] ?? "").toLowerCase()) : -1;
  if (!long || month < 0) return undefined;
  const date = `${long[3]}-${String(month + 1).padStart(2, "0")}-${(long[1] ?? "").padStart(2, "0")}`;
  return { date, title: long[4] ?? "" };
}

/** A row's minutes, whichever of the four shapes the entry used. */
function rowOf(body: string, row: Row): { minutes: number; words: string } | undefined {
  const match = new RegExp(
    `^[-|* ]*\\**${row}\\**[ :|—-]*(\\d+)([^\\n]*(?:\\n  [^\\n]*)*)`,
    "m",
  ).exec(body);
  return match ? { minutes: Number(match[1]), words: match[2] ?? "" } : undefined;
}

/** The row the bottleneck sentence names first. */
function bottleneckOf(body: string): Entry["bottleneck"] {
  const line = /^\**(?:the )?bottleneck[^\n]*(?:\n[^\n]+)*/im.exec(body)?.[0].toLowerCase() ?? "";
  if (!line) return "other";
  let first: Entry["bottleneck"] = "other";
  let at = Number.POSITIVE_INFINITY;
  for (const word of [...ROWS, "none"] as const) {
    const i = line.search(new RegExp(`\\b${word}\\b`));
    if (i >= 0 && i < at) [first, at] = [word, i];
  }
  return first;
}

/** The stamp `bun run land` wrote, when it carries a figure. */
function stampOf(body: string): Stamp | undefined {
  const line = /^\*Measured: ([^\n]*)/m.exec(body)?.[1];
  if (!line) return undefined;
  const minutes = /^under a minute/.test(line) ? 0 : Number(/^(\d+) min from/.exec(line)?.[1]);
  if (!Number.isFinite(minutes)) return undefined;
  const from = /queue claim/.test(line)
    ? "claim"
    : /branch being made/.test(line)
      ? "branch"
      : "first commit";
  return { minutes, from };
}

/** Every dated entry in the ledger, in file order. An undated heading is skipped. */
export function parseLedger(markdown: string): Entry[] {
  const out: Entry[] = [];
  for (const block of markdown.split(/\n(?=## )/)) {
    if (!block.startsWith("## ")) continue;
    const head = heading(block.split("\n", 1)[0] ?? "");
    if (!head) continue;
    const rows: Entry["rows"] = {};
    let friction = "";
    for (const row of ROWS) {
      const found = rowOf(block, row);
      if (!found) continue;
      rows[row] = found.minutes;
      if (row === "friction") friction = found.words;
    }
    const stamp = stampOf(block);
    out.push({
      ...head,
      rows,
      friction,
      bottleneck: bottleneckOf(block),
      ...(stamp ? { stamp } : {}),
    });
  }
  return out;
}

/** An entry's logged minutes: the sum of the rows it gave. */
export function total(entry: Entry): number {
  return ROWS.reduce((sum, row) => sum + (entry.rows[row] ?? 0), 0);
}
