/**
 * The technical queue: what a session found and did not do, written in a shape
 * a fresh session can pick up cold. Parsing lives here rather than in the CLI
 * so the format is a test instead of a convention — an entry a later session
 * cannot act on without asking is not an entry, it is a note.
 *
 * `docs/parked.md` is read through the same parser on purpose. Work somebody
 * set aside half-done is the same kind of thing as work nobody started: a
 * session with nothing else in it can finish either, and only one of the two
 * rots while it waits.
 *
 * **An entry may open with a question for the owner** (`Asks:`), and the
 * sentence at the top of this file used to say it may not. The owner changed
 * that rule on 6 September 2026 and the reason is the one the old rule was
 * built to protect: a decision the owner has not made was going into
 * `docs/spec/`, which nobody opens on the way to work, so it was read the day
 * it was written and never again. Here it is in front of whoever runs
 * `bun run queue`, and the session that picks it up asks before it builds.
 */

export type Source = "queue" | "parked";

export type Item = {
  readonly source: Source;
  readonly title: string;
  /** The `Found:` line's text — a date, and whatever the finder said after it. */
  readonly found: string;
  /**
   * The `Taken:` line's text, or "" when nobody has claimed it. Written on
   * `main` by `bun run queue next` and pushed, so a session that only ever sees
   * `origin` knows the item is already somebody's.
   */
  readonly taken: string;
  /** Paths the next session should open first. */
  readonly files: readonly string[];
  /**
   * The `Asks:` line's text, or "" when the item needs nobody's answer.
   *
   * An entry carrying one is work whose **first step is a question**: the
   * session that picks it up puts it to the owner, waits, and builds what comes
   * back. Everything else about such an entry is ordinary — it is claimed the
   * same way, worked in its own lane and removed by `queue done` — so the body
   * still has to say what to change, and still has to name the options the
   * answer picks between, or the question is one nobody can answer quickly.
   *
   * A field rather than a word in the title, which is where it started: the
   * title is capped at 80 characters and an `ANSWER NEEDED —` prefix spent a
   * fifth of them on saying what a field says once.
   */
  readonly asks: string;
  /** Everything under the heading, comments and blank edges removed. */
  readonly body: string;
};

/** The four line shapes both this file and `edit.ts` match — one copy, so a format change is one edit. */
export const HEADING = /^##\s+(\S.*?)\s*$/;
export const FOUND = /^-\s+\*\*Found:\*\*\s+(\d{4}-\d{2}-\d{2}\b.*)$/;
export const TAKEN = /^-\s+\*\*Taken:\*\*\s+(\S.*)$/;
export const FILES = /^-\s+\*\*Files:\*\*\s+(\S.*)$/;
const ASKS = /^-\s+\*\*Asks:\*\*\s+(\S.*)$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}/;

/**
 * Both files carry their own instructions — in an HTML comment, and in a fenced
 * block showing the format. A heading inside either is prose about an entry,
 * not an entry, and the queue must not offer it to somebody as work.
 *
 * A fence nobody closed is a corrupt file, not a long example, and it is
 * refused rather than obeyed: obeying it erases every line from that fence to
 * the end. That is how a rebase resolution duplicating this file's own `Asks:`
 * example hid fifteen entries under a listing reading "3 in the queue" — no
 * problem reported and `bun run check` green. Throwing costs the whole
 * command, which is the point.
 */
function stripProse(md: string, source: Source): string {
  let openedAt = 0;
  let line = 0;
  const stripped = md.replace(/<!--[\s\S]*?-->/g, "").replace(/^.*$/gm, (text) => {
    line++;
    if (/^\s*```/.test(text)) {
      openedAt = openedAt === 0 ? line : 0;
      return "";
    }
    return openedAt === 0 ? text : "";
  });
  if (openedAt !== 0) {
    throw new Error(
      `docs/${source}.md: the code fence opened on line ${openedAt} is never closed, ` +
        "so every entry under it would be silently dropped — close it or delete it",
    );
  }
  return stripped;
}

function fieldOf(body: string, re: RegExp): string {
  for (const line of body.split("\n")) {
    const m = re.exec(line.trim());
    if (m?.[1] !== undefined) return m[1];
  }
  return "";
}

/** Splits a `Files:` value — a comma-separated list, backticks optional. */
export function splitFiles(value: string): string[] {
  return value
    .split(",")
    .map((p) => p.replace(/`/g, "").trim())
    .filter(Boolean);
}

/** Every `##` section of one file, in the order they are written. */
export function parseItems(md: string, source: Source): Item[] {
  const lines = stripProse(md, source).split("\n");
  const items: Item[] = [];
  let title: string | null = null;
  let body: string[] = [];

  const flush = (): void => {
    if (title === null) return;
    const text = body.join("\n").trim();
    items.push({
      source,
      title,
      found: fieldOf(text, FOUND),
      taken: fieldOf(text, TAKEN),
      files: splitFiles(fieldOf(text, FILES)),
      asks: fieldOf(text, ASKS),
      body: text,
    });
  };

  for (const line of lines) {
    const m = HEADING.exec(line);
    if (m) {
      flush();
      title = m[1] ?? "";
      body = [];
    } else if (title !== null) {
      body.push(line);
    }
  }
  flush();
  return items;
}

/**
 * What is wrong with an entry, in the words a session would need to fix it.
 * Empty means the entry can be handed to somebody who has read nothing else.
 */
export function problemsIn(items: readonly Item[]): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    const where = `${item.source}: "${item.title}"`;
    if (seen.has(item.title)) problems.push(`${where} — a second entry has this title`);
    seen.add(item.title);
    if (item.title.length > 80) problems.push(`${where} — title over 80 characters`);
    if (!ISO_DATE.test(item.found)) {
      problems.push(`${where} — no "- **Found:** YYYY-MM-DD, <branch>" line`);
    }
    if (item.files.length === 0) {
      problems.push(`${where} — no "- **Files:** <paths>" line`);
    }
    const prose = item.body
      .split("\n")
      .filter((l) => l.trim() && !l.trim().startsWith("- **"))
      .join("");
    if (!prose.trim()) problems.push(`${where} — nothing but fields; say what to change and why`);
    // An `Asks:` line is a question somebody has to be able to answer in a
    // sentence, which means the body has to have laid the choice out. Prose is
    // already required above; what this adds is that the question is a
    // question — an `Asks:` reading like a task is an entry whose owner will
    // read it, agree, and still not know what was wanted from them.
    if (item.asks && !item.asks.includes("?")) {
      problems.push(`${where} — the Asks: line is not a question`);
    }
  }
  return problems;
}

/**
 * Queue order. Parked work comes first: it is already half-done, and half-done
 * work is the only kind that gets harder the longer it sits.
 */
export function order(queue: readonly Item[], parked: readonly Item[]): Item[] {
  return [...parked, ...queue];
}

/** Resolves what the CLI was given: a 1-based position, or part of a title. */
export function pick(items: readonly Item[], arg: string): Item {
  const n = Number(arg);
  const byPosition = Number.isInteger(n) && n >= 1 ? items[n - 1] : undefined;
  if (byPosition) return byPosition;
  const needle = arg.toLowerCase();
  const hits = items.filter((i) => i.title.toLowerCase().includes(needle));
  const only = hits[0];
  if (hits.length === 1 && only) return only;
  if (hits.length === 0) throw new Error(`nothing in the queue matches ${JSON.stringify(arg)}`);
  throw new Error(
    `${JSON.stringify(arg)} matches ${hits.length} entries: ${hits.map((h) => h.title).join(" | ")}`,
  );
}
