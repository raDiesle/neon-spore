/**
 * `docs/verified.md` — what has actually been looked at, and when.
 *
 * The history says what *needs* looking at; only a person can say that they
 * looked. That second half cannot be derived from anything, so it is the one
 * thing this arrangement writes down. It is committed rather than kept in a
 * browser's storage for two reasons: it is the record the human asked for —
 * what was tested and what was not — and a later session, in the cloud and
 * with nothing but the clone, can read it and know whether a branch is spent.
 *
 * One line per decision, appended, oldest first:
 *
 * ```
 * - `2e06e07` 2026-08-28 PASS — the hole reads at 26 px on a phone
 * - `2e06e07` 2026-08-28 FAIL — the flank torches do not clip the hull
 *   - it clips at the left lobe once the queen is on the field
 * ```
 *
 * The date and the verdict come before the text because the text is prose and
 * carries em dashes of its own; put it last and nothing after it is parseable.
 */

/**
 * `PASS` and `FAIL` mean somebody looked. **`CLEARED` means nobody did, and
 * the check is closed anyway** — the owner has decided the matter is over
 * without it being answered.
 *
 * The third value exists because writing `PASS` for something unlooked-at is
 * a lie in a file whose whole job is recording answers, and a ledger that
 * lies is worth less than no ledger. Closing a check is legitimate: a backlog
 * that has grown past reading is not a to-do list, it is furniture, and
 * clearing it is a real decision an owner is allowed to make. It is simply
 * not the same decision as having looked.
 */
export type Verdict = "PASS" | "FAIL" | "CLEARED";

export interface Decision {
  /** The commit the check was written on, as the trailer had it. */
  sha: string;
  date: string;
  verdict: Verdict;
  /** The check's text, stored in full so the log reads without the history. */
  text: string;
  /** Why it failed, or why it was cleared unlooked-at. Empty for a pass. */
  note: string;
}

const ENTRY = /^- `([0-9a-f]+)` (\d{4}-\d{2}-\d{2}) (PASS|FAIL|CLEARED) — (.*)$/;
const NOTE = /^ {2}- (.*)$/;

export function parseLedger(md: string): Decision[] {
  const decisions: Decision[] = [];
  for (const line of md.split("\n")) {
    const entry = ENTRY.exec(line);
    if (entry) {
      decisions.push({
        sha: entry[1] ?? "",
        date: entry[2] ?? "",
        verdict: entry[3] as Verdict,
        text: (entry[4] ?? "").trim(),
        note: "",
      });
      continue;
    }
    const note = NOTE.exec(line);
    const last = decisions.at(-1);
    if (note && last) last.note = last.note ? `${last.note} ${note[1]}` : (note[1] ?? "");
  }
  return decisions;
}

export function ledgerLines(decision: Decision): string {
  const head = `- \`${decision.sha}\` ${decision.date} ${decision.verdict} — ${decision.text}`;
  return decision.note ? `${head}\n  - ${decision.note}` : head;
}

/**
 * Append, never rewrite. A ledger that reorders itself makes a diff nobody
 * can read, and the whole file is a log of when things were looked at.
 */
export function appendDecision(md: string, decision: Decision): string {
  const body = md.replace(/\s*$/, "");
  if (!body) return `${ledgerLines(decision)}\n`;
  // The first entry lands under prose, and a list pressed against a paragraph
  // reads as part of it. Every later one joins the list it is already in.
  const last = body.slice(body.lastIndexOf("\n") + 1);
  const inList = last.startsWith("- ") || last.startsWith("  - ");
  return `${body}${inList ? "" : "\n"}\n${ledgerLines(decision)}\n`;
}

/**
 * Two shas name the same commit when one is a prefix of the other. `%h` grows
 * a digit as a repository does, so a ledger written last year would otherwise
 * stop matching the history it was written about.
 */
export function sameCommit(a: string, b: string): boolean {
  return a.startsWith(b) || b.startsWith(a);
}
