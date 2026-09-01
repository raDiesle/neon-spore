/**
 * `docs/release-notes.md` — what each landing changed, written at the moment
 * `main` moves.
 *
 * This replaces the `Check:` trailer and the ledger that went with it. That
 * arrangement asked the owner for something: a list of obligations, each one
 * waiting on an eye, each one needing a verdict typed back in. It was accurate
 * and it was work, and the work is what killed it — a list you owe answers to
 * stops being read at about the length this one reached.
 *
 * So the same information is kept and the obligation is dropped. Nothing here
 * is ticked, answered, or deleted; there is no outstanding count and no state
 * to fall out of date, because every entry is a record of something that
 * already happened rather than a request for something that has not. Reading it
 * is optional, which is the only reason it will be read.
 *
 * Pure on purpose: the file's shape is the thing worth testing, and it should
 * not need a repository behind it. `run.ts` is the half that talks to git.
 */

/** The `git log` format `parseLanded` expects. Kept here so the two cannot drift. */
export const LOG_FORMAT = "%H%x1f%h%x1f%ad%x1f%s%x1f%b%x1e";

/** One commit that landed on the trunk. */
export interface Landed {
  /** The full sha, for anything that needs to look the commit up again. */
  full: string;
  /** Abbreviated the way git prints it — what an entry is headed with. */
  sha: string;
  /** `--date=short`, so `2026-09-01`. */
  date: string;
  /** The commit subject: this repository writes them as sentences. */
  subject: string;
  /** The first paragraph of the body, or "" when the message is a subject alone. */
  summary: string;
}

/**
 * Any trailer line: `Co-Authored-By:`, `Signed-off-by:`, and whatever else a
 * tool appends. Capitalised key, which is what separates a trailer from a
 * sentence that happens to contain a colon.
 */
const TRAILER = /^[A-Z][A-Za-z-]*:\s/;

/**
 * The first paragraph of a commit body, which is where this repository puts
 * the sentence explaining what changed.
 *
 * Not the whole body. The messages here run to several paragraphs of reasoning
 * — that is deliberate and it belongs in the history, not in a file somebody
 * skims to answer "what moved this week". The paragraph after the subject is
 * the part that answers it.
 */
export function summaryOf(body: string): string {
  const lines: string[] = [];
  for (const raw of body.split("\n")) {
    const line = raw.trimEnd();
    if (TRAILER.test(line)) break;
    if (!line.trim()) {
      if (lines.length > 0) break;
      continue;
    }
    lines.push(line.trim());
  }
  return lines.join(" ").trim();
}

/** `git log --format=LOG_FORMAT --date=short` in, the commits out, oldest first. */
export function parseLanded(stdout: string): Landed[] {
  const landed: Landed[] = [];
  for (const record of stdout.split("\x1e")) {
    const trimmed = record.replace(/^\n+/, "");
    if (!trimmed) continue;
    const [full, sha, date, subject, body] = trimmed.split("\x1f");
    if (!full || !sha) continue;
    landed.push({
      full,
      sha,
      date: date ?? "",
      subject: subject ?? "",
      summary: summaryOf(body ?? ""),
    });
  }
  return landed;
}

/** One entry, as it appears in the file. */
export function renderEntry(commit: Landed): string {
  const head = `## ${commit.date} · ${commit.sha} — ${commit.subject}`;
  return commit.summary ? `${head}\n\n${commit.summary}\n` : `${head}\n`;
}

/** The preamble a new file opens with, above every entry. */
export const PREAMBLE = `# Release notes

What each landing changed, newest first. \`bun run land\` writes an entry here
the moment \`main\` moves, one per commit, from the commit's own subject and its
first paragraph.

**Read-only.** Nothing in this file is ticked, answered or deleted, and nothing
is waiting on anybody — it is a record of what happened, not a list of what is
owed. Entries are never edited by hand either: an entry that reads wrong is a
commit message that read wrong, and the history is where that lives.
`;

/**
 * Put new entries at the top, under the preamble.
 *
 * Newest first, because the question this file answers is almost always about
 * the last few days. `commits` arrives oldest-first the way `git log --reverse`
 * gives it, so it is reversed here rather than at every call site.
 */
export function prepend(existing: string, commits: readonly Landed[]): string {
  const entries = [...commits].reverse().map(renderEntry);
  if (entries.length === 0) return existing || PREAMBLE;

  const body = entries.join("\n");
  const current = existing.trim() ? existing : PREAMBLE;
  const firstEntry = current.indexOf("\n## ");
  if (firstEntry < 0) return `${current.trimEnd()}\n\n${body}`;
  return `${current.slice(0, firstEntry).trimEnd()}\n\n${body}\n${current.slice(firstEntry + 1)}`;
}
