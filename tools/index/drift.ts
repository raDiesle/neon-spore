/**
 * Whether a row in `docs/INDEX.md` still describes the file it names.
 *
 * `generateIndex` passes every existing row through byte for byte, on purpose:
 * a row's text is hand-curated after the first run and regenerating over it
 * would throw that away. The cost is that `bun run index` stays green over a
 * table that has gone wrong — five rows were repaired by hand in one week
 * (a row naming a `step` that lives in another file, one pointing at a table
 * that moved, one counting six themes where there are nine) and nothing in the
 * repository would have failed if they had not been.
 *
 * So this is the half that can fail without regenerating anything. It does not
 * read the prose, which is the point of curating it. It reads the three things
 * in a row that go stale on their own: a backticked name that moved, a count
 * of something the file's own header counts differently, and a **proper name
 * in capitals** the file has never heard of.
 *
 * The third was added on 19 September 2026, after the row for
 * `boss-cue-read-c.ts` went on naming THE ORRERY for a week after that boss
 * moved out of the file — green every run, repaired by hand, and precisely the
 * failure the paragraph above says this exists to stop. It found seven more of
 * the same across the 2,300 rows the moment it was written.
 */

const WORD_NUMBERS: Record<string, number> = {
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
};

/**
 * `one` is left out: in English prose it is nearly always an article or a
 * pronoun ("the one that", "one of the six"), and counting it finds arguments
 * where there are none.
 */
const NOT_A_SUBJECT = new Set([
  "of",
  "and",
  "or",
  "in",
  "on",
  "to",
  "the",
  "a",
  "an",
  "is",
  "are",
  "that",
  "which",
  "from",
  "for",
  "with",
  "by",
  "at",
  "as",
  "it",
  "its",
  "this",
  "these",
  "those",
  "when",
  "where",
  "than",
  "then",
  "so",
  "but",
  "if",
  "both",
  "each",
  "no",
  "not",
  "only",
  "ever",
  "more",
  "other",
  "others",
  "out",
  "up",
  "down",
  "was",
  "were",
  "has",
  "have",
  "had",
]);

/** A plural and its singular are the same subject. */
function subjectKey(word: string): string {
  return word.replace(/s$/, "");
}

/** What a piece of prose counts: the subject of each number, and the numbers it is given. */
export function countsIn(text: string): Map<string, Set<number>> {
  const counts = new Map<string, Set<number>>();
  const re = /\b(\d+|[a-z]+)[\s-]+([a-z][a-z-]*)/gi;
  for (const m of text.toLowerCase().matchAll(re)) {
    const token = m[1] ?? "";
    const value = /^\d+$/.test(token) ? Number(token) : WORD_NUMBERS[token];
    if (value === undefined) continue;
    const subject = m[2] ?? "";
    if (NOT_A_SUBJECT.has(subject)) continue;
    const key = subjectKey(subject);
    const seen = counts.get(key) ?? new Set<number>();
    seen.add(value);
    counts.set(key, seen);
  }
  return counts;
}

/** The file's header comment, whole — the block one, or the run of `//` lines it opens with. */
export function headerCommentText(source: string): string {
  const block = /\/\*\*([\s\S]*?)\*\//.exec(source);
  if (block) return (block[1] ?? "").replace(/^\s*\*\s?/gm, "");
  const lines: string[] = [];
  for (const line of source.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.length === 0 && lines.length === 0) continue;
    if (!trimmed.startsWith("//")) break;
    lines.push(trimmed.replace(/^\/\/\s?/, ""));
  }
  return lines.join(" ");
}

const CODE_FILE = /^[\w.@/-]+\.(ts|tsx|js|md|json|css|html|svg|sh)$/;
const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;

/**
 * Words this repository writes in capitals that are grammar rather than a name.
 *
 * Every boss, round and sheet is spelled in capitals here — THE ORRERY, BULB
 * QUEEN, SNAKE, NOT BUILT YET — so a run of capitals in a row is a claim about
 * *which* thing the file is, and the cheapest claim there is to check. The
 * words below are the ones that turn up inside those names and carry none of
 * the meaning.
 */
const NOT_A_NAME = new Set([
  "THE",
  "AND",
  "OR",
  "OF",
  "IT",
  "IS",
  "NOT",
  "NO",
  "IN",
  "ON",
  "TO",
  "AN",
  "AT",
  "BY",
  "UP",
  "SO",
  "IF",
  "AS",
  "BE",
  "DO",
  "GO",
  "WE",
]);

/**
 * The proper names a piece of prose claims, once each.
 *
 * Word by word rather than whole-run, because a run is a run only in the row:
 * a file wraps `THE BULB QUEEN` across two lines and would be read as not
 * having said it. Each word carries the claim on its own — a row that names
 * `QUEEN` about a file with no queen in it is wrong whatever stands beside it.
 * Backticked spans are cut out first: an identifier and a file name are
 * already checked, by their own rules, against what a *name* means.
 */
export function namesIn(text: string): string[] {
  const prose = text.replaceAll(/`[^`]*`/g, " ");
  const found = [...prose.matchAll(/\b[A-Z]{2,}\b/g)].map((m) => m[0]);
  return [...new Set(found)].filter((name) => !NOT_A_NAME.has(name));
}

export interface DriftContext {
  /** The source of the file the row names. */
  readonly source: string;
  /** True when a backticked file name is a file this repo has. */
  readonly resolvesFile: (name: string) => boolean;
}

/**
 * What the row claims that its file contradicts. Empty is the healthy answer.
 *
 * A backticked identifier has to be a word in the file — a row naming
 * something that moved out is the whole of what a rename leaves behind. A
 * backticked file name has to be a file. A count has to agree with the
 * header's own count *of the same subject*: "five bosses" against "six
 * bosses" is a disagreement, while a number the header simply never mentions
 * is prose, and prose is not this check's business. And a name in capitals
 * has to be somewhere in the file, in any case — the file's own words for a
 * boss are as often `fenceGapsOf` as *THE FENCE*, so this asks whether the
 * name is in the source at all rather than whether the header shouts it.
 */
export function driftInRow(rowText: string, context: DriftContext): string[] {
  const complaints: string[] = [];
  const { source, resolvesFile } = context;

  for (const m of rowText.matchAll(/`([^`]+)`/g)) {
    const name = m[1] ?? "";
    if (CODE_FILE.test(name)) {
      if (!resolvesFile(name) && !source.includes(name)) {
        complaints.push(`names \`${name}\`, which is not a file in this repo`);
      }
    } else if (IDENTIFIER.test(name) && !new RegExp(`\\b${name}\\b`).test(source)) {
      complaints.push(`names \`${name}\`, which the file does not mention`);
    }
  }

  const words = source.toLowerCase();
  for (const name of namesIn(rowText)) {
    if (!words.includes(name.toLowerCase())) {
      complaints.push(`names ${name}, which the file never mentions`);
    }
  }

  const header = countsIn(headerCommentText(source));
  for (const [subject, values] of countsIn(rowText)) {
    const theirs = header.get(subject);
    if (!theirs) continue;
    const disagree = [...values].filter((v) => !theirs.has(v));
    if (disagree.length > 0) {
      complaints.push(
        `says ${disagree.join("/")} ${subject} where the file's header says ${[...theirs].join("/")}`,
      );
    }
  }
  return complaints;
}
