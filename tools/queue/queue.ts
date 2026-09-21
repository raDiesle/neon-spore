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

/**
 * Which kind of session may take an item: `local` when it needs a screen, and
 * `anywhere` — the absence of the line — for everything else.
 *
 * There was a `cloud` value beside `local` for eight days and the owner took
 * it out on 21 September 2026. The two were never the same kind of fact:
 * `local` says the work cannot be *proved* without eyes, which is true of a
 * wave watched at tempo whoever wishes otherwise, and `cloud` said only that
 * he would rather hand that one to a phone today. A preference spent as a
 * refusal left a local session standing in front of forty entries it could do.
 */
export type Where = "local" | "anywhere";

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
   *
   * An entry where the ask is the *whole* of what is left is passed over by
   * `next` until an `- **Answered:**` line is written under it. That line is
   * parsed by `asking.ts` rather than here, for the reason `problems.ts` is
   * not here either: this file says what the lines are, and those say what a
   * command may do with them.
   */
  readonly asks: string;
  /**
   * The `Where:` line — `local` when only a session with a screen may take the
   * item, `anywhere` when the line is absent. The owner's line, from 13
   * September 2026: some work needs eyes and a real frame budget, and nothing
   * a sandbox runs will prove it. `where.ts` says how `next` and `take`
   * honour it.
   */
  readonly where: Where;
  /** Everything under the heading, comments and blank edges removed. */
  readonly body: string;
};

/** The four line shapes both this file and `edit.ts` match — one copy, so a format change is one edit. */
export const HEADING = /^##\s+(\S.*?)\s*$/;
export const FOUND = /^-\s+\*\*Found:\*\*\s+(\d{4}-\d{2}-\d{2}\b.*)$/;
export const TAKEN = /^-\s+\*\*Taken:\*\*\s+(\S.*)$/;
export const FILES = /^-\s+\*\*Files:\*\*\s+(\S.*)$/;
const ASKS = /^-\s+\*\*Asks:\*\*\s+(\S.*)$/;
export const WHERE = /^-\s+\*\*Where:\*\*\s+(\S.*)$/;

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

export function fieldOf(body: string, re: RegExp): string {
  for (const line of body.split("\n")) {
    const m = re.exec(line.trim());
    if (m?.[1] !== undefined) return m[1];
  }
  return "";
}

/**
 * A `Where:` value as the kind it names. Anything else reads as `anywhere` and
 * is reported by `problemsIn`, so a misspelt reservation is a listed problem
 * rather than an item quietly offered to the session it was kept from.
 *
 * `cloud` is one of the things that is now anything else, which is deliberate
 * rather than an oversight: forty entries carried it until 21 September 2026,
 * and an old one copied into a new entry has to come back as a reported
 * problem rather than as a reservation nobody meant to make.
 */
function whereOf(value: string): Where {
  return value.trim().toLowerCase() === "local" ? "local" : "anywhere";
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
      where: whereOf(fieldOf(text, WHERE)),
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
 * Queue order. Parked work comes first: it is already half-done, and half-done
 * work is the only kind that gets harder the longer it sits.
 */
export function order(queue: readonly Item[], parked: readonly Item[]): Item[] {
  return [...parked, ...queue];
}

/**
 * How the CLI named an item, which is not decoration: a position is read off a
 * listing that renumbers every time an entry leaves it, so a number said out
 * loud a minute ago may mean a different entry now. A title cannot drift that
 * way, and `run.ts` lets one through a guard a number is refused by.
 */
export type How = "number" | "title";

export interface Match {
  readonly item: Item;
  readonly how: How;
}

/** Resolves what the CLI was given: a 1-based position, or part of a title. */
export function pick(items: readonly Item[], arg: string): Item {
  return match(items, arg).item;
}

/** The same resolution, saying which of the two ways it landed. */
export function match(items: readonly Item[], arg: string): Match {
  const n = Number(arg);
  const byPosition = Number.isInteger(n) && n >= 1 ? items[n - 1] : undefined;
  if (byPosition) return { item: byPosition, how: "number" };
  const needle = arg.toLowerCase();
  const hits = items.filter((i) => i.title.toLowerCase().includes(needle));
  const only = hits[0];
  if (hits.length === 1 && only) return { item: only, how: "title" };
  if (hits.length === 0) throw new Error(`nothing in the queue matches ${JSON.stringify(arg)}`);
  throw new Error(
    `${JSON.stringify(arg)} matches ${hits.length} entries: ${hits.map((h) => h.title).join(" | ")}`,
  );
}
