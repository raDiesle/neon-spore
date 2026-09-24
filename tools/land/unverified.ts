/**
 * `--unverified` — what a landing could not check, written into
 * `docs/queue.md` at the moment the trunk moves.
 *
 * **This is a reversal, and a narrow one.** `notes.ts` explains why the
 * `Check:` trailer and the ledger under `docs/checks/` were taken out: they
 * asked the owner for a verdict on every row, and a list you owe answers to
 * stops being read. Nothing here brings that back. `docs/release-notes.md`
 * stays read-only and stays a record.
 *
 * What it noticed, and what the owner changed on 9 September 2026, is that the
 * two halves of a cloud session's report were treated differently for no
 * reason a reader could see. A *technical finding* — a refactor stepped
 * around, a slow path — goes into `docs/queue.md` and is drained by a session
 * that has nothing else in it. An *unverified look* — a wave whose timing was
 * never watched at tempo, a shape whose motion was never seen, a `bun run perf`
 * the sandbox is too slow to take — went into the report and nowhere else, and
 * the report ends when the session does. Both are work nobody has started. One
 * of them had a list and one of them had a sentence in a transcript.
 *
 * So an unverified item is queued like any finding, and it is a queue entry in
 * the full sense: a session claims it with `bun run queue next`, opens the
 * thing on a machine that can look, and removes it with `bun run queue done`.
 * It is not a debt owed to the owner — the difference that killed the ledger —
 * because the thing that clears it is another session, not a verdict typed
 * back in.
 *
 * Pure on purpose, like `notes.ts`: the entry's shape is what is worth
 * testing, and `note-commit.ts` is the half that talks to git.
 */

/** One landing that could not be fully checked. */
export interface Unverified {
  /** The lane it landed from, for the `Found:` line. */
  branch: string;
  /** `--date=short`, so `2026-09-09`. */
  date: string;
  /** The newest landed commit, abbreviated — what makes the title unique. */
  sha: string;
  /** What could not be checked: one string per `--unverified`. */
  items: readonly string[];
  /** Paths the landing touched. */
  files: readonly string[];
  /** The subjects of the commits that landed. */
  subjects: readonly string[];
}

/** `problemsIn` refuses a title over this, and refuses two entries alike. */
const TITLE_MAX = 80;

/** More paths than this on a `Files:` line is a list nobody reads. */
const FILES_SHOWN = 8;

/**
 * `--unverified <what>`, repeatable, also accepted as `--unverified=<what>`.
 *
 * Repeatable because a lane that adds a creature has usually left two or three
 * different things unlooked-at — the shape sheet, the wave at tempo, the frame
 * cost — and folding them into one sentence makes an entry a session has to
 * take apart again before it can do any of it.
 */
export function parseUnverified(argv: readonly string[]): string[] {
  const items: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i] ?? "";
    if (arg.startsWith("--unverified=")) {
      const value = arg.slice("--unverified=".length).trim();
      if (value) items.push(value);
      continue;
    }
    if (arg !== "--unverified") continue;
    const value = (argv[i + 1] ?? "").trim();
    // A bare `--unverified` at the end of the line, or one followed by the
    // next flag, is a session that meant to say something and said nothing.
    // Dropping it silently would land the work with no entry at all, so it is
    // the caller's job to notice an empty result and say so.
    if (!value || value.startsWith("--")) continue;
    items.push(value);
    i++;
  }
  return items;
}

/**
 * The heading, which has to be unique and has to fit in `TITLE_MAX`.
 *
 * The sha carries the uniqueness: two lanes can easily be unable to watch "the
 * wave at tempo", and `problemsIn` rejects the second one as a duplicate
 * title. It is also the most useful thing to put there — it is what a session
 * picking the entry up needs in order to see what landed unlooked-at.
 */
export function titleFor(sha: string, items: readonly string[]): string {
  const head = `Unverified at ${sha}: `;
  const first = (items[0] ?? "something this landing changed").replace(/\s+/g, " ").trim();
  const room = TITLE_MAX - head.length;
  const tail = first.length <= room ? first : `${first.slice(0, Math.max(room - 1, 1)).trimEnd()}…`;
  return `${head}${tail}`;
}

/**
 * `- **Files:**` — the paths, capped, and **nothing but paths**.
 *
 * The count of what was left out used to ride on the end of this line as ", and
 * 46 more", and that was a small lie with two readers. `splitFiles` in
 * `tools/queue/queue.ts` splits this line on commas and strips the backticks, so
 * the phrase arrived at `staleness` as a path called *and 46 more* — which is
 * not on the trunk, so every truncated entry this file wrote was marked **stale**
 * in `bun run queue` from the moment it was written, and a session reading the
 * listing was told to re-read files that had not moved.
 * `tools/test/doc-drift.test.ts` is what found it: it holds every `Files:` path
 * in the queue to being a file the tree has. The count is in the body now, where
 * prose is prose.
 */
export function filesLine(files: readonly string[]): string {
  const shown = files.slice(0, FILES_SHOWN).map((f) => `\`${f}\``);
  if (shown.length === 0) return "- **Files:** the commits named above";
  return `- **Files:** ${shown.join(", ")}`;
}

/** How the body says what the capped list left out, or "" when it left nothing. */
export function restLine(files: readonly string[]): string {
  const rest = files.length - Math.min(files.length, FILES_SHOWN);
  return rest === 0 ? "" : ` The commit touched ${rest} more file${rest === 1 ? "" : "s"}.`;
}

/**
 * An item no agent can finish, because what it names is only on a phone.
 *
 * `- **Where:** phone` keeps an entry from `bun run queue next`
 * (`tools/queue/where.ts`), and until 24 September 2026 only a hand wrote it:
 * two entries this flag wrote — the svh cap under a real address bar, and
 * `?lag=1`'s figures on a real phone — sat unmarked, and `next` handed the
 * first of them to a lane with nothing on its desk but a Mac and no Xcode.
 * The words are the ones every such item has used, and a false positive
 * costs nothing a caller cannot undo: the entry is still taken by name.
 */
const HARDWARE = /\breal (?:phone|device)\b|\bphone in (?:a|the|somebody's) hand\b|\bon glass\b/i;

/** `- **Where:** phone` when any item needs one in a hand, or "" when none does. */
export function whereLine(items: readonly string[]): string {
  return items.some((item) => HARDWARE.test(item)) ? "- **Where:** phone" : "";
}

/** One entry, as it appears in `docs/queue.md`. */
export function renderUnverified(u: Unverified): string {
  const landed =
    u.subjects.length === 1
      ? `*${u.subjects[0]}* landed`
      : `${u.subjects.length} commits landed, ending in *${u.subjects.at(-1)}*,`;
  const list = u.items.map((item) => `- ${item}`).join("\n");
  const where = whereLine(u.items);
  return [
    `## ${titleFor(u.sha, u.items)}`,
    "",
    `- **Found:** ${u.date}, ${u.branch}`,
    filesLine(u.files),
    ...(where ? [where] : []),
    "",
    `${landed} from a session that could not look at it.${restLine(u.files)} What went unchecked:`,
    "",
    list,
    "",
    "Open each one on a machine that can, and then either take this entry out",
    "with `bun run queue done` or write what you found as an entry of its own.",
    "Nothing here is owed to anybody: it is work nobody has started, which is",
    "what the rest of this file holds.",
    "",
  ].join("\n");
}

/**
 * Put the entry at the end, which is where a lane appends one by hand.
 *
 * Newest last, unlike `docs/release-notes.md`. The queue is read from the top
 * by `bun run queue next`, so appending is what keeps the oldest waiting work
 * in front of the newest — the opposite of what a record wants and the right
 * way round for a list somebody is draining.
 */
export function appendEntry(existing: string, entry: string): string {
  const body = existing.trimEnd();
  return body ? `${body}\n\n${entry}` : entry;
}
