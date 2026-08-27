/**
 * What a commit says has not been looked at yet.
 *
 * A cloud session cannot open a shape sheet, watch a wave at tempo or run the
 * relay, and `CLAUDE.md` already asks it to name those parts in its report.
 * A report is read once and then scrolled past, so the naming moves into the
 * commit itself, as a trailer:
 *
 * ```
 * Check: the hole reads at 26 px on a phone
 * Check: the flank torches do not clip the hull — `bun run shapes`
 * ```
 *
 * The list of what is outstanding is then *derived* from the history rather
 * than kept beside it, which is the same reason the backlog is parsed out of
 * the spec: a list maintained by hand goes stale silently.
 */

/** The `git log` format `parseLog` expects. Kept here so the two cannot drift. */
export const LOG_FORMAT = "%H%x1f%h%x1f%ad%x1f%s%x1f%b%x1e";

/** One thing a commit asks somebody to look at. */
export interface Check {
  /** The commit that asked, abbreviated the way git prints it. */
  sha: string;
  /** Verbatim trailer text — what to look at, and often how. */
  text: string;
  /** A repository command that would settle it, or null if only an eye can. */
  command: string | null;
}

/** A commit that carries at least one. */
export interface CheckCommit {
  sha: string;
  full: string;
  date: string;
  subject: string;
  checks: Check[];
}

/**
 * Commands the director and the CLI are allowed to run on a person's behalf.
 *
 * Nothing here is spawned through a shell — the argv is passed as an array —
 * so this is not what stops an injection. It is what stops a commit message
 * from turning a button labelled RUN into something other than one of this
 * repository's own scripts.
 */
const RUNNABLE = /^bun (?:run [a-z][\w:-]*|test(?:\s+[\w./@-]+)*)$/;

/** The first backticked span of a trailer, when it is one of ours. */
export function commandOf(text: string): string | null {
  const found = /`([^`]+)`/.exec(text);
  if (!found?.[1]) return null;
  const command = found[1].trim();
  return RUNNABLE.test(command) ? command : null;
}

/** The command split into argv, for a spawn that never sees a shell. */
export function argvOf(command: string): string[] | null {
  if (!RUNNABLE.test(command)) return null;
  return command.split(/\s+/);
}

/**
 * Trailers out of one commit body. A folded continuation — a line indented
 * under a `Check:` — belongs to the trailer above it, so a sentence that ran
 * long does not become a second check.
 */
export function checksIn(body: string, sha: string): Check[] {
  const checks: Check[] = [];
  for (const raw of body.split("\n")) {
    const opened = /^Check:\s*(.*)$/.exec(raw);
    if (opened) {
      const text = (opened[1] ?? "").trim();
      if (text) checks.push({ sha, text, command: commandOf(text) });
      continue;
    }
    const last = checks.at(-1);
    if (last && /^\s+\S/.test(raw)) {
      last.text = `${last.text} ${raw.trim()}`;
      last.command = commandOf(last.text);
    }
  }
  return checks;
}

/** `git log --format=LOG_FORMAT` in, the commits that carry a check out. */
export function parseLog(stdout: string): CheckCommit[] {
  const commits: CheckCommit[] = [];
  for (const record of stdout.split("\x1e")) {
    const trimmed = record.replace(/^\n+/, "");
    if (!trimmed) continue;
    const [full, sha, date, subject, body] = trimmed.split("\x1f");
    if (!full || !sha) continue;
    const checks = checksIn(body ?? "", sha);
    if (checks.length === 0) continue;
    commits.push({ full, sha, date: date ?? "", subject: subject ?? "", checks });
  }
  return commits;
}
